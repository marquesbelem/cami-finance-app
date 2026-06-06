import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gerenciar Categorias – Cami Finance",
  description:
    "Crie, edite e organize as categorias de gastos dos seus boletos. Mantenha suas finanças organizadas por tipo de despesa.",
};

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
