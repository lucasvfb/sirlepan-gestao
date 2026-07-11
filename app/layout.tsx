import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sirlepan Gestão",
  description: "Controle de compras, custos e fornecedores da Sirlepan"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
