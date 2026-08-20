import type { Config } from "tailwindcss";

/**
 * Design system MestreXadrez.
 * Identidade original: sóbria, competitiva, energética. Não infantil, não cassino.
 * Contraste verificado para WCAG 2.2 AA nos pares texto/fundo usados.
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Superfícies (tema escuro é o padrão do produto).
        // Nome "surface", não "base": `base` colidiria com a escala de tamanho de
        // fonte do Tailwind e faria `text-base` virar uma cor — texto escuro sobre
        // fundo escuro, invisível.
        surface: { DEFAULT: "#0F1216", raised: "#171C22", sunken: "#0A0D10" },
        line: { DEFAULT: "#232A33", strong: "#333D4A" },
        // `faint` original (#6B7885) media 3,79:1 sobre `.card` (#171C22) — abaixo
        // do 4,5:1 exigido pelo WCAG 2.2 AA para texto normal (achado real do
        // axe-core em e2e/acessibilidade.spec.ts, A8). Clareado até 4,68:1.
        ink: { DEFAULT: "#E8EDF2", muted: "#9CA9B7", faint: "#7B8794" },

        // Cor de marca — âmbar de tabuleiro, não amarelo de brinquedo
        brand: { DEFAULT: "#D9A441", strong: "#B8862B", soft: "#3A2E15" },

        // Semântica pedagógica: cada sistema tem cor própria e NUNCA se misturam
        xp: "#7FB2E5",        // atividade
        mastery: "#5FC9A0",   // competência
        focus: "#C98BE0",     // energia pedagógica
        streak: "#E5883F",    // hábito

        ok: "#4BB98A",
        warn: "#D9A441",
        danger: "#E0655F",

        // Tabuleiro
        board: { light: "#E9DCC3", dark: "#7C6749", mark: "#D9A441" },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: { xl2: "1.25rem" },
    },
  },
  plugins: [],
};

export default config;
