import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

// ── Self-hosted Google Fonts via next/font ─────────────────────────────────
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-display-loaded",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body-loaded",
  display: "swap",
});

// ── SEO Metadata ───────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Cami Finance – Gerenciador Financeiro Gamificado",
  description:
    "Controle seus boletos, acompanhe seus gastos por mês e desbloqueie conquistas para economizar mais. O seu painel financeiro pessoal, moderno e interativo.",
  keywords: ["finanças pessoais", "boletos", "conquistas", "dashboard", "economias"],
  authors: [{ name: "Cami Finance" }],
  robots: "index, follow",
};

// ── Root Layout ────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${outfit.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0d0f1a" />
      </head>
      <body>
        <div id="app-root">
          {children}
        </div>
        {/* Portal anchor for modals and toasts */}
        <div id="portal-root" />
      </body>
    </html>
  );
}
