import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Blackbird",
    short_name: "Blackbird",
    description: "Plataforma empresarial modular para MiPyMEs hondureñas.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f6f6f4",
    theme_color: "#f6f6f4",
    orientation: "any",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
