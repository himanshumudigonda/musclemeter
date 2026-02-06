import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MuscleMeter",
    short_name: "MuscleMeter",
    description: "Discover and book premium gyms near you. Zero platform fees.",
    start_url: "/",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#C9A962",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["fitness", "health", "lifestyle"],
    screenshots: [
      {
        src: "/screenshots/landing.png",
        sizes: "1280x720",
        type: "image/png",
      },
    ],
  };
}
