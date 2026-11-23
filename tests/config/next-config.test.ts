import { describe, it, expect } from "vitest";
import nextConfig from "../../next.config";

describe("next.config", () => {
  it("serve imagens direto do CDN do TMDB, sem o otimizador da Vercel", () => {
    expect(nextConfig.images?.unoptimized).toBe(true);
  });
});
