/**
 * Guarda de arquitetura (ADR-004).
 *
 * A tese do produto é que atividade e competência são coisas diferentes. Uma
 * convenção de code review não sobrevive à pressa; um teste que falha o build, sim.
 */

import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

function filesUnder(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...filesUnder(full));
    else if (full.endsWith(".ts") || full.endsWith(".tsx")) out.push(full);
  }
  return out;
}

function importsOf(file: string): string[] {
  const source = readFileSync(file, "utf8");
  return [...source.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]!);
}

describe("separação entre gamificação e competência", () => {
  it("gamificação não importa domínio nem Chess Score", () => {
    for (const file of filesUnder("src/domain/gamification")) {
      for (const imported of importsOf(file)) {
        expect(
          imported.includes("mastery") || imported.includes("score"),
          `${file} importa "${imported}" — XP não pode tocar em competência (ADR-004)`,
        ).toBe(false);
      }
    }
  });

  it("o modelo de domínio não importa gamificação", () => {
    for (const file of [...filesUnder("src/domain/mastery"), ...filesUnder("src/domain/score")]) {
      for (const imported of importsOf(file)) {
        expect(
          imported.includes("gamification"),
          `${file} importa "${imported}" — competência não pode depender de XP (ADR-004)`,
        ).toBe(false);
      }
    }
  });
});

describe("pureza da camada de domínio", () => {
  it("nenhum módulo de domínio faz I/O ou toca no browser", () => {
    const forbidden = [/\bfetch\s*\(/, /\bwindow\./, /\blocalStorage\b/, /\bdocument\./, /from ["']@prisma/];

    for (const file of filesUnder("src/domain")) {
      const source = readFileSync(file, "utf8");
      for (const pattern of forbidden) {
        expect(pattern.test(source), `${file} viola a pureza da camada: ${pattern}`).toBe(false);
      }
    }
  });
});
