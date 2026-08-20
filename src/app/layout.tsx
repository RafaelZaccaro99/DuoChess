import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ProgressProvider } from "@/components/ProgressProvider";
import { RegistroServiceWorker } from "@/components/RegistroServiceWorker";

export const metadata: Metadata = {
  title: "MestreXadrez — do primeiro lance ao xadrez competitivo",
  description:
    "Plataforma de formação enxadrística: aprenda a pensar como um enxadrista, treine como um atleta e evolua por um caminho verificável.",
  applicationName: "MestreXadrez",
  icons: {
    icon: ["/icon-192.png", "/icon-512.png"],
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F1216",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh">
        <RegistroServiceWorker />
        <a
          href="#conteudo"
          className="sr-only-focusable absolute left-4 top-4 z-50 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-surface-sunken"
        >
          Pular para o conteúdo
        </a>
        <ProgressProvider>
          <div id="conteudo">{children}</div>
        </ProgressProvider>
      </body>
    </html>
  );
}
