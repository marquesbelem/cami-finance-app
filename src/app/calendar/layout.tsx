import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendário de Vencimentos – Capivara Poupadora",
  description:
    "Visualize todas as suas despesas organizadas por data de vencimento em um calendário mensal interativo. Navegue entre meses, inspecione dias e gerencie o status dos seus pagamentos.",
};

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
