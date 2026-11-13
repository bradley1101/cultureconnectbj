import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    experimental: {
    agentFeedback: true,
    // Taille maximale d'un envoi de formulaire (photos jusqu'à 5 Mo + texte).
    serverActions: { bodySizeLimit: "6mb" },
  },
    // Mode développement uniquement : autorise le téléphone (même Wi-Fi)
  // à charger le JavaScript du site via l'adresse IP du PC.
  // Sans ça, sur téléphone, les boutons (menu ☰…) ne réagissent pas.
    // Toutes les adresses d'un réseau Wi-Fi local (l'IP du PC peut changer
  // d'un jour à l'autre, ces motifs les couvrent toutes).
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*"],
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tauadrjwmuvgwcttqlzk.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
