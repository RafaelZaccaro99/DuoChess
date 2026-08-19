/**
 * Gate ENGINE_REVIEW — a parte que julga.
 *
 * Recebe avaliações já calculadas e decide se o exercício afirma a verdade.
 * Puro de propósito: as regras de aprovação e reprovação precisam ser testáveis
 * sem subir uma engine, e auditáveis por quem não confia nelas.
 *
 * Sem revisor humano titulado no fluxo, este arquivo é o que separa "solução
 * conferida" de "solução plausível". Ele é o revisor.
 */

export interface EngineLine {
  /** Lance em notação longa (e2e4). */
  moveUci: string;
  cp?: number;
  mate?: number;
}

/** Escala única para comparar mates e centipawns. */
export function scoreOf(line: EngineLine): number {
  if (line.mate !== undefined) {
    return line.mate > 0 ? 1_000_000 - line.mate : -1_000_000 - line.mate;
  }
  return line.cp ?? 0;
}

export type FindingSeverity = "BLOQUEIA" | "AVISA";

export interface Finding {
  severity: FindingSeverity;
  code: string;
  message: string;
}

/**
 * Margem, em centipawns, para considerar um lance "claramente melhor".
 *
 * 100 = um peão. Abaixo disso, dizer que uma solução é única seria afirmar mais
 * do que a engine sustenta em profundidade moderada.
 */
export const MARGEM_UNICIDADE = 100;

/** Margem para afirmar que um erro previsível é de fato pior. */
export const MARGEM_ERRO = 100;

export interface VerificationInput {
  /** Lances aceitos pelo conteúdo, em notação longa. */
  acceptedUci: readonly string[];
  /** Erros previsíveis que são LEGais na posição, em notação longa. */
  predictableUci: readonly string[];
  /** Linhas da engine, uma por lance de topo, já com multiPV. */
  lines: readonly EngineLine[];
  /** O enunciado afirma mate em N? */
  claimsMateIn?: number;
  /**
   * Lances que respondem à pergunta do exercício.
   *
   * O escopo da verificação precisa corresponder à pergunta. Um item que pede
   * "qual captura ganha material" não pode ser reprovado porque existe um lance
   * QUIETO mais forte — esse lance não é uma resposta possível à pergunta feita.
   * Quando ausente, todos os lances analisados são candidatos.
   */
  candidateUci?: readonly string[];
}

/**
 * Julga um exercício de lance.
 *
 * Regras que BLOQUEIAM a publicação:
 *  - a solução aceita não é a melhor da posição;
 *  - o item declara solução única, mas existe outra igualmente boa;
 *  - o enunciado promete mate em N e a engine não vê mate em N;
 *  - um erro previsível é tão bom quanto a solução — aí quem erra é o conteúdo.
 *
 * O que apenas AVISA:
 *  - erro previsível que continua ganhando. É preferência, não erro objetivo, e
 *    o texto do item precisa dizer isso ao aluno.
 */
export function verifyMoveExercise(input: VerificationInput): Finding[] {
  const findings: Finding[] = [];

  const candidatos = input.candidateUci ? new Set(input.candidateUci) : null;
  const linhas = candidatos
    ? input.lines.filter((l) => candidatos.has(l.moveUci))
    : input.lines;

  const porLance = new Map(linhas.map((l) => [l.moveUci, l]));

  const melhor = [...linhas].sort((a, b) => scoreOf(b) - scoreOf(a))[0];
  if (!melhor) {
    return [{ severity: "BLOQUEIA", code: "SEM_ANALISE", message: "a engine não devolveu nenhuma linha." }];
  }

  const aceitas = input.acceptedUci
    .map((uci) => porLance.get(uci))
    .filter((l): l is EngineLine => l !== undefined);

  if (aceitas.length === 0) {
    findings.push({
      severity: "BLOQUEIA",
      code: "ACEITA_FORA_DO_TOPO",
      message: `nenhum lance aceito (${input.acceptedUci.join(", ")}) apareceu entre as linhas analisadas; a melhor da engine é ${melhor.moveUci}.`,
    });
    return findings;
  }

  const melhorAceita = aceitas.sort((a, b) => scoreOf(b) - scoreOf(a))[0]!;
  const diferencaParaAMelhor = scoreOf(melhor) - scoreOf(melhorAceita);

  if (diferencaParaAMelhor > MARGEM_UNICIDADE) {
    findings.push({
      severity: "BLOQUEIA",
      code: "SOLUCAO_NAO_E_A_MELHOR",
      message: `o gabarito indica ${melhorAceita.moveUci}, mas ${melhor.moveUci} é melhor por ${diferencaParaAMelhor} centipawns.`,
    });
  }

  // Unicidade só é exigida quando o conteúdo declara uma resposta só.
  if (input.acceptedUci.length === 1) {
    const alternativas = linhas
      .filter((l) => l.moveUci !== melhorAceita.moveUci)
      .sort((a, b) => scoreOf(b) - scoreOf(a));
    const segunda = alternativas[0];

    if (segunda) {
      const ambosDaoMate =
        melhorAceita.mate !== undefined &&
        melhorAceita.mate > 0 &&
        segunda.mate !== undefined &&
        segunda.mate > 0;

      if (ambosDaoMate) {
        // Mesma armadilha de escala do bloco de erros previsíveis: mate em 4 e
        // mate em 12 distam 8 pontos, o que passaria por "praticamente igual".
        // Objetivamente as duas ganham; o item ensina PREFERÊNCIA, não solução
        // única, e o enunciado precisa dizer isso.
        if (segunda.mate! < melhorAceita.mate!) {
          findings.push({
            severity: "BLOQUEIA",
            code: "SOLUCAO_NAO_E_A_MELHOR",
            message: `o gabarito dá mate em ${melhorAceita.mate}, mas ${segunda.moveUci} dá mate em ${segunda.mate}.`,
          });
        } else {
          findings.push({
            severity: "AVISA",
            code: "SOLUCAO_UNICA_E_PREFERENCIA",
            message: `o item aceita só ${melhorAceita.moveUci} (mate em ${melhorAceita.mate}), mas ${segunda.moveUci} também ganha (mate em ${segunda.mate}). O enunciado precisa pedir o lance mais forte, não "o único".`,
          });
        }
      } else if (scoreOf(melhorAceita) - scoreOf(segunda) < MARGEM_UNICIDADE) {
        findings.push({
          severity: "BLOQUEIA",
          code: "SOLUCAO_NAO_E_UNICA",
          message: `o item aceita só ${melhorAceita.moveUci}, mas ${segunda.moveUci} é praticamente igual (diferença de ${scoreOf(melhorAceita) - scoreOf(segunda)} centipawns).`,
        });
      }
    }
  }

  if (input.claimsMateIn !== undefined) {
    if (melhorAceita.mate !== input.claimsMateIn) {
      findings.push({
        severity: "BLOQUEIA",
        code: "MATE_PROMETIDO_NAO_CONFERE",
        message: `o item promete mate em ${input.claimsMateIn}, mas a engine vê ${melhorAceita.mate ?? `${melhorAceita.cp} centipawns`}.`,
      });
    }
  }

  for (const uci of input.predictableUci) {
    const erro = porLance.get(uci);
    if (!erro) continue; // não apareceu na análise: cai fora das linhas de topo, então é ruim mesmo

    const solucaoGanhaPorMate = melhorAceita.mate !== undefined && melhorAceita.mate > 0;
    const erroGanhaPorMate = erro.mate !== undefined && erro.mate > 0;

    // Dois mates a favor: comparar centipawns não diz nada, porque a escala
    // comprime a distância entre mate em 4 e mate em 12 em 8 pontos. Aqui quem
    // decide é a distância até o mate.
    if (solucaoGanhaPorMate && erroGanhaPorMate) {
      if (erro.mate! <= melhorAceita.mate!) {
        findings.push({
          severity: "BLOQUEIA",
          code: "ERRO_PREVISIVEL_NAO_E_ERRO",
          message: `o item chama ${uci} de erro, mas ele dá mate em ${erro.mate} contra ${melhorAceita.mate} da solução — não é pior.`,
        });
      } else {
        findings.push({
          severity: "AVISA",
          code: "ERRO_PREVISIVEL_AINDA_GANHA",
          message: `${uci} dá mate em ${erro.mate} contra ${melhorAceita.mate} da solução: é mais lento, mas ainda ganha. É preferência, não erro objetivo — o texto do item precisa dizer isso ao aluno.`,
        });
      }
      continue;
    }

    const perda = scoreOf(melhorAceita) - scoreOf(erro);

    if (perda < 0) {
      findings.push({
        severity: "BLOQUEIA",
        code: "ERRO_PREVISIVEL_E_MELHOR",
        message: `o item chama ${uci} de erro, mas ele é MELHOR que a solução por ${-perda} centipawns.`,
      });
    } else if (perda < MARGEM_ERRO) {
      findings.push({
        severity: "BLOQUEIA",
        code: "ERRO_PREVISIVEL_NAO_E_ERRO",
        message: `o item chama ${uci} de erro, mas ele é equivalente à solução (diferença de ${perda} centipawns).`,
      });
    } else if (erro.cp !== undefined && erro.cp > 300) {
      findings.push({
        severity: "AVISA",
        code: "ERRO_PREVISIVEL_AINDA_GANHA",
        message: `${uci} é mais fraco, mas ainda deixa a posição ganha (${erro.cp} centipawns). É preferência, não erro objetivo.`,
      });
    }
  }

  return findings;
}

/**
 * Calibra a dificuldade declarada contra a profundidade em que a engine acha a
 * solução. Só avisa: dificuldade para humano e para engine não são a mesma coisa,
 * e tratar isto como bloqueio produziria falso positivo em item posicional.
 */
export function checkDifficulty(input: {
  declared: number;
  depthFound: number | null;
}): Finding[] {
  if (input.depthFound === null) return [];

  // Só uma direção informa alguma coisa.
  //
  // Engine achar na profundidade 1 e o item ser difícil é o caso NORMAL: mate em
  // um e defesa forçada são triviais para busca e não para gente. Avisar nesses
  // casos produziria ruído em quase todo item tático.
  //
  // O contrário, sim, é sinal: se a engine precisa de profundidade alta, nenhum
  // aluno da faixa vai encontrar aquilo, e a dificuldade declarada está baixa.
  const PROFUNDIDADE_ALTA = 10;
  if (input.depthFound >= PROFUNDIDADE_ALTA && input.declared <= 5) {
    return [
      {
        severity: "AVISA",
        code: "DIFICULDADE_SUBESTIMADA",
        message: `dificuldade declarada ${input.declared}, mas a engine só encontra a solução na profundidade ${input.depthFound}. Para um humano da faixa, isto é mais difícil do que o item admite.`,
      },
    ];
  }
  return [];
}

export function blocks(findings: readonly Finding[]): boolean {
  return findings.some((f) => f.severity === "BLOQUEIA");
}
