import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import Link from "next/link";
import { LayoutDashboard, Tag, CalendarDays } from "lucide-react";
import AuthProvider from "@/components/AuthProvider/AuthProvider";
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
        <AuthProvider>
          {/* ── Global Navigation ──────────────────────────────────────────── */}
          <nav
            id="global-nav"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              padding: "var(--space-3) var(--space-6)",
              background: "var(--color-bg-surface)",
              borderBottom: "1px solid var(--color-border)",
              position: "sticky",
              top: 0,
              zIndex: "var(--z-header)",
            }}
            aria-label="Navegação principal"
          >
            <Link
              href="/"
              id="nav-home"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                padding: "var(--space-2) var(--space-3)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-text-secondary)",
                fontSize: "var(--text-sm)",
                fontWeight: "var(--font-medium)",
                transition: "color var(--transition-fast), background var(--transition-fast)",
              }}
              aria-label="Painel principal"
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
            <Link
              href="/calendar"
              id="nav-calendar"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                padding: "var(--space-2) var(--space-3)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-text-secondary)",
                fontSize: "var(--text-sm)",
                fontWeight: "var(--font-medium)",
                transition: "color var(--transition-fast), background var(--transition-fast)",
              }}
              aria-label="Calendário de vencimentos"
            >
              <CalendarDays size={16} />
              Calendário
            </Link>
            <Link
              href="/categories"
              id="nav-categories"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                padding: "var(--space-2) var(--space-3)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-text-secondary)",
                fontSize: "var(--text-sm)",
                fontWeight: "var(--font-medium)",
                transition: "color var(--transition-fast), background var(--transition-fast)",
              }}
              aria-label="Gerenciar categorias"
            >
              <Tag size={16} />
              Categorias
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

