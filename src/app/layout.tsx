import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blackbird Honduras",
  description: "Plataforma empresarial modular para MiPyMEs hondureñas.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-HN">
      <body>{children}</body>
    </html>
  );
}
