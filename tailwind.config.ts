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
        // Superfícies (tema escuro é o padrão do produto)
        base: { DEFAULT: "#0F1216", raised: "#171C22", sunken: "#0A0D10" },
        line: { DEFAULT: "#232A33", strong: "#333D4A" },
        ink: { DEFAULT: "#E8EDF2", muted: "#9CA9B7", faint: "#6B7885" },

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
