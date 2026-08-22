import type { Config } from "tailwindcss";

/**
 * Design system MestreXadrez.
 * Referência visual: chess.com — verde de marca, tema escuro quente, tabuleiro
 * clássico verde/creme. Contraste verificado para WCAG 2.2 AA nos pares
 * texto/fundo usados (script de luminância relativa, mesmo método do A8).
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Superfícies (tema escuro é o padrão do produto) — cinza quente,
        // não azulado, pra casar com o verde de marca.
        surface: { DEFAULT: "#262421", raised: "#302E2B", sunken: "#1A1917" },
        line: { DEFAULT: "#3C3936", strong: "#4A4642" },
        ink: { DEFAULT: "#FFFFFF", muted: "#B9B4AB", faint: "#9C978D" },

        // Cor de marca — o verde do chess.com, não o âmbar original.
        brand: { DEFAULT: "#81B64C", strong: "#6FA23D", soft: "#2B3A1E" },

        // Semântica pedagógica: cada sistema tem cor própria e NUNCA se misturam
        xp: "#7FB2E5",        // atividade
        mastery: "#5FC9A0",   // competência
        focus: "#C98BE0",     // energia pedagógica
        streak: "#E5883F",    // hábito

        // `ok` original (#4BB98A) media 4,28:1 em bg-ok/15 sobre a nova
        // `.card` (#302E2B) — abaixo do 4,5:1 do WCAG 2.2 AA. Clareado.
        ok: "#54C494",
        warn: "#D9A441",
        // `danger` original (#E0655F) media 3,99:1 sobre a nova `.card`
        // (#302E2B) — abaixo do 4,5:1 do WCAG 2.2 AA. Clareado até 4,70:1.
        danger: "#E67872",

        // Tabuleiro — tema clássico verde do chess.com.
        board: { light: "#EEEED2", dark: "#769656", mark: "#F6F669" },
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
