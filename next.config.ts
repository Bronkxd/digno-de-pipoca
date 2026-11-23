import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Modelo de cache clássico (fetch + next.revalidate), conforme o plano.
  cacheComponents: false,
  images: {
    // O navegador escolhe entre os tamanhos do CDN do TMDB; sem otimizador da Vercel,
    // que tem cota mensal no plano gratuito.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    imageSizes: [92, 154, 185, 342],
    deviceSizes: [500, 780, 1280],
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
