import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Blackbird",
    template: "%s · Blackbird",
  },
  description: "Plataforma empresarial modular para MiPyMEs hondureñas.",
  applicationName: "Blackbird",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-64.png", sizes: "64x64", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "Blackbird",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f6f4",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-HN">
      <body>{children}</body>
    </html>
  );
}
