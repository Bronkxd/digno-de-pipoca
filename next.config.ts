import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Modelo de cache clássico (fetch + next.revalidate), conforme o plano.
  cacheComponents: false,
  images: {
    // As imagens já vêm no tamanho certo do CDN do TMDB (tmdbImage); sem otimizador da Vercel,
    // que tem cota mensal no plano gratuito.
    unoptimized: true,
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
