import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Modelo de cache clássico (fetch + next.revalidate), conforme o plano.
  cacheComponents: false,
  images: {
    remotePatterns: [new URL("https://image.tmdb.org/t/p/**")],
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
