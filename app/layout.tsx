import type { Metadata } from "next";
import "./globals.css";
import "./polish.css";

export const metadata: Metadata = {
  title: "ERP Sirlepan",
  description: "ERP de gestão interna da Sirlepan para financeiro, compras, estoque, produção, pessoas, encomendas e relatórios."
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
