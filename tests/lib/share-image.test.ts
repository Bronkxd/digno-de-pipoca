import { describe, it, expect } from "vitest";
import { bagSvg, titleSize } from "@/lib/share-image";

describe("bagSvg", () => {
  const kernels = (s: string) => s.split("<g ").length - 1;
  it("enche conforme a nota", () => expect(kernels(bagSvg(8.5, 100))).toBeGreaterThan(kernels(bagSvg(5, 100))));
  it("sem votos fica vazio", () => expect(kernels(bagSvg(0, 0))).toBe(0));
});

describe("titleSize", () => {
  it("títulos longos usam letra menor", () => {
    expect(titleSize("Matrix")).toBe(84);
    expect(titleSize("O Senhor dos Anéis: A Sociedade do Anel")).toBeLessThan(84);
    expect(titleSize("x".repeat(120))).toBe(40);
  });
});
