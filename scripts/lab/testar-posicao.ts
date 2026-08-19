/** Bancada: confere uma posição candidata antes de virar conteúdo. */
import { Chess } from "chess.js";
import { startEngine } from "../../src/lib/engine/uci";

const fen = process.argv[2] ?? "";
const lances = process.argv.slice(3);

async function main(): Promise<void> {
  const c = new Chess(fen);
  console.log(`legais: ${c.moves().length} | quem joga: ${c.turn()} | em xeque: ${c.isCheck()}`);

  for (const san of lances) {
    const t = new Chess(fen);
    try {
      t.move(san);
      const recapturas = t.moves().filter((m) => m.includes("x"));
      console.log(`${san}: legal · respostas com captura: ${recapturas.join(", ") || "NENHUMA"}`);
    } catch {
      console.log(`${san}: ILEGAL`);
    }
  }

  const e = await startEngine();
  const linhas = await e.analyse(fen, { depth: 14, multiPv: 5 });
  console.log(
    "engine:",
    linhas.slice(0, 5).map((x) => `${x.moveUci}=${x.mate !== undefined ? `M${x.mate}` : x.cp}`).join("  "),
  );
  await e.quit();
}

void main();
