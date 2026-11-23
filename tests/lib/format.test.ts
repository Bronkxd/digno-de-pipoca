import { describe, it, expect } from "vitest";
import { formatRating, formatRuntime, tmdbImage } from "@/lib/format";

describe("formatRating", () => {
  it("formata nota e votos em pt-BR", () => expect(formatRating(7.83, 12400)).toBe("7,8 · 12.400 votos"));
  it("usa singular para 1 voto", () => expect(formatRating(6, 1)).toBe("6,0 · 1 voto"));
  it("mostra 'Sem avaliações' quando não há votos", () => expect(formatRating(0, 0)).toBe("Sem avaliações"));
});

describe("formatRuntime", () => {
  it("horas e minutos", () => expect(formatRuntime(135)).toBe("2h 15min"));
  it("menos de 1h", () => expect(formatRuntime(48)).toBe("48min"));
  it("hora cheia", () => expect(formatRuntime(120)).toBe("2h"));
  it("nulo ou zero", () => {
    expect(formatRuntime(null)).toBeNull();
    expect(formatRuntime(0)).toBeNull();
  });
});

describe("tmdbImage", () => {
  it("monta URL do CDN", () => expect(tmdbImage("/a.jpg", "w342")).toBe("https://image.tmdb.org/t/p/w342/a.jpg"));
  it("caminho nulo devolve null", () => expect(tmdbImage(null, "w342")).toBeNull());
});
