import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Modelo de cache clássico (fetch + next.revalidate), conforme o plano.
  cacheComponents: false,
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
