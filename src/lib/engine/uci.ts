/**
 * Cliente UCI sobre o Stockfish.
 *
 * Camada de I/O: fala o protocolo, não julga nada. O julgamento —
 * "esta solução é única?", "este erro previsível realmente perde?" — mora em
 * `src/domain/chess/verification.ts`, que é puro e testável sem subir engine.
 *
 * ADR-006: a engine roda fora do thread da interface e nunca decide legalidade
 * (isso é do motor de regras, ADR-001). Aqui ela avalia.
 */

import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";

/** Avaliação de uma linha, sempre do ponto de vista de quem está para jogar. */
export interface LineEval {
  /** Lance em notação longa da engine (e2e4, e7e8q). */
  moveUci: string;
  /** Centipawns; ausente quando a linha termina em mate. */
  cp?: number;
  /** Lances até o mate; positivo = quem joga dá mate, negativo = leva mate. */
  mate?: number;
  pv: string[];
  depth: number;
}

export interface AnalysisOptions {
  depth?: number;
  /** Quantas linhas alternativas. Precisa de ≥ 2 para julgar unicidade. */
  multiPv?: number;
  timeoutMs?: number;
}

export interface Engine {
  analyse(fen: string, options?: AnalysisOptions): Promise<LineEval[]>;
  quit(): Promise<void>;
  readonly name: string;
}

function resolveBinary(): string {
  const require = createRequire(import.meta.url);
  const pkg = require.resolve("stockfish/package.json");
  // "lite-single" não exige SharedArrayBuffer nem threads: é o que roda igual em
  // CI, em container e no navegador sem cabeçalhos de isolamento cruzado.
  return path.join(path.dirname(pkg), "bin", "stockfish-18-lite-single.js");
}

/** Converte a saída bruta de `info` numa avaliação. */
function parseInfo(line: string): LineEval | null {
  if (!line.startsWith("info ") || !line.includes(" pv ")) return null;

  const depth = Number(/ depth (\d+)/.exec(line)?.[1] ?? 0);
  const pv = line.slice(line.indexOf(" pv ") + 4).trim().split(/\s+/);
  const first = pv[0];
  if (!first || depth === 0) return null;

  const cp = /score cp (-?\d+)/.exec(line)?.[1];
  const mate = /score mate (-?\d+)/.exec(line)?.[1];

  return {
    moveUci: first,
    cp: cp !== undefined ? Number(cp) : undefined,
    mate: mate !== undefined ? Number(mate) : undefined,
    pv,
    depth,
  };
}

export async function startEngine(): Promise<Engine> {
  const child: ChildProcessWithoutNullStreams = spawn(process.execPath, [resolveBinary()], {
    stdio: ["pipe", "pipe", "pipe"],
  });

  let pendente = "";
  const ouvintes = new Set<(line: string) => void>();

  child.stdout.on("data", (chunk: Buffer) => {
    pendente += chunk.toString();
    const linhas = pendente.split("\n");
    pendente = linhas.pop() ?? "";
    for (const linha of linhas) {
      const limpa = linha.trim();
      if (limpa) for (const ouvinte of ouvintes) ouvinte(limpa);
    }
  });

  const send = (cmd: string): void => {
    child.stdin.write(`${cmd}\n`);
  };

  /** Envia e resolve quando `until` casar com alguma linha da resposta. */
  const ask = (cmd: string, until: RegExp, timeoutMs: number): Promise<string[]> =>
    new Promise((resolve, reject) => {
      const coletadas: string[] = [];
      const timer = setTimeout(() => {
        ouvintes.delete(ouvinte);
        reject(new Error(`engine não respondeu a "${cmd}" em ${timeoutMs}ms`));
      }, timeoutMs);

      const ouvinte = (line: string): void => {
        coletadas.push(line);
        if (until.test(line)) {
          clearTimeout(timer);
          ouvintes.delete(ouvinte);
          resolve(coletadas);
        }
      };

      ouvintes.add(ouvinte);
      send(cmd);
    });

  const cabecalho = await ask("uci", /^uciok$/, 20_000);
  const name = /^id name (.+)$/m.exec(cabecalho.join("\n"))?.[1] ?? "Stockfish";
  await ask("isready", /^readyok$/, 20_000);

  return {
    name,

    async analyse(fen, options = {}) {
      const depth = options.depth ?? 16;
      const multiPv = options.multiPv ?? 1;
      const timeoutMs = options.timeoutMs ?? 30_000;

      await ask(`setoption name MultiPV value ${multiPv}`, /.*/, 5_000).catch(() => []);
      send("ucinewgame");
      await ask("isready", /^readyok$/, 10_000);
      send(`position fen ${fen}`);

      const linhas = await ask(`go depth ${depth}`, /^bestmove /, timeoutMs);

      // A última leitura de cada linha (multipv) é a mais profunda.
      const porLance = new Map<string, LineEval>();
      for (const linha of linhas) {
        const info = parseInfo(linha);
        if (!info) continue;
        const anterior = porLance.get(info.moveUci);
        if (!anterior || info.depth >= anterior.depth) porLance.set(info.moveUci, info);
      }

      const bestmove = /^bestmove (\S+)/m.exec(linhas.join("\n"))?.[1];
      const avaliacoes = [...porLance.values()].sort(ordenarPorForca);

      // A engine escolheu um lance que não apareceu nas linhas lidas? Confie nela.
      if (bestmove && bestmove !== "(none)" && !porLance.has(bestmove)) {
        avaliacoes.unshift({ moveUci: bestmove, pv: [bestmove], depth });
      }
      return avaliacoes;
    },

    async quit() {
      send("quit");
      await new Promise<void>((resolve) => {
        child.once("exit", () => resolve());
        setTimeout(() => {
          child.kill();
          resolve();
        }, 3_000);
      });
    },
  };
}

/** Mais forte primeiro, do ponto de vista de quem joga. */
export function ordenarPorForca(a: LineEval, b: LineEval): number {
  return valorRelativo(b) - valorRelativo(a);
}

/**
 * Ordena mates e centipawns numa escala só.
 *
 * Mate a favor vale mais que qualquer vantagem material, e mate mais curto vale
 * mais que mate mais longo. Mate contra vale menos que qualquer desvantagem.
 */
export function valorRelativo(linha: LineEval): number {
  if (linha.mate !== undefined) {
    return linha.mate > 0 ? 1_000_000 - linha.mate : -1_000_000 - linha.mate;
  }
  return linha.cp ?? 0;
}
