import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ATR Lot Sizer",
    short_name: "Lot Sizer",
    description: "Lot size for forex pairs, metals, oil and indices from a risk percentage and an ATR-based stop.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0a0f16",
    theme_color: "#0a0f16",
    categories: ["finance", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
