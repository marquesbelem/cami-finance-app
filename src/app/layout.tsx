import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import Link from "next/link";
import { LayoutDashboard, Tag, CalendarDays } from "lucide-react";
import AuthProvider from "@/components/AuthProvider/AuthProvider";
import styles from "./layout.module.css";
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
  title: "Capivara Poupadora – Gerenciador Financeiro Gamificado",
  description:
    "Controle suas despesas, acompanhe seus gastos por mês e desbloqueie conquistas para economizar mais. O seu painel financeiro pessoal, moderno e interativo.",
  keywords: ["finanças pessoais", "despesas", "conquistas", "dashboard", "economias"],
  authors: [{ name: "Capivara Poupadora" }],
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
        {/* viewport-fit=cover enables edge-to-edge layout with safe-area-inset support */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0d0f1a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <AuthProvider>
          {/* ── Global Navigation ──────────────────────────────────────────── */}
          <nav
            id="global-nav"
            className={styles.nav}
            aria-label="Navegação principal"
          >
            <Link
              href="/"
              id="nav-home"
              className={styles.navLink}
              aria-label="Painel principal"
            >
              <LayoutDashboard size={18} aria-hidden="true" />
              <span className={styles.navLinkLabel}>Dashboard</span>
            </Link>
            <Link
              href="/calendar"
              id="nav-calendar"
              className={styles.navLink}
              aria-label="Calendário de vencimentos"
            >
              <CalendarDays size={18} aria-hidden="true" />
              <span className={styles.navLinkLabel}>Calendário</span>
            </Link>
            <Link
              href="/categories"
              id="nav-categories"
              className={styles.navLink}
              aria-label="Gerenciar categorias"
            >
              <Tag size={18} aria-hidden="true" />
              <span className={styles.navLinkLabel}>Categorias</span>
            </Link>
          </nav>

          <div id="app-root">
            {children}
          </div>
          {/* Portal anchor for modals and toasts */}
          <div id="portal-root" />
        </AuthProvider>
      </body>
    </html>
  );
}

