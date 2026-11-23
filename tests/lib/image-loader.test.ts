import { describe, it, expect } from "vitest";
import imageLoader from "@/lib/image-loader";

const base = "https://image.tmdb.org/t/p";

describe("imageLoader", () => {
  it("escolhe o menor tamanho do TMDB que cobre a largura", () => {
    expect(imageLoader({ src: `${base}/w1280/a.jpg`, width: 780 })).toBe(`${base}/w780/a.jpg`);
    expect(imageLoader({ src: `${base}/w500/a.jpg`, width: 200 })).toBe(`${base}/w342/a.jpg`);
  });
  it("nunca passa do tamanho pedido pelo componente", () =>
    expect(imageLoader({ src: `${base}/w342/a.jpg`, width: 1280 })).toBe(`${base}/w342/a.jpg`));
  it("não mexe em imagens de fora do TMDB", () => expect(imageLoader({ src: "/tmdb-logo.svg", width: 154 })).toBe("/tmdb-logo.svg"));
});
