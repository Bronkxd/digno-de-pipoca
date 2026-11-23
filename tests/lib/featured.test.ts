import { describe, it, expect } from "vitest";
import { pickFeatured } from "@/lib/featured";
import type { MovieSummary } from "@/lib/tmdb/types";

const m = (id: number, voteAverage = 8, voteCount = 1000): MovieSummary => ({ id, title: `F${id}`, posterPath: "/p.jpg", releaseDate: null, voteAverage, voteCount });
const day = (n: number) => new Date(n * 86_400_000);

describe("pickFeatured", () => {
  it("alterna listas, sem repetir, e descarta nota baixa ou poucos votos", () => {
    const r = pickFeatured([[m(1), m(2, 5), m(3)], [m(1), m(4), m(5, 9, 10)]], day(0));
    expect(r.map((x) => x.id)).toEqual([1, 4, 3]);
  });
  it("começa por outro filme no dia seguinte", () => {
    expect(pickFeatured([[m(1), m(2)]], day(1)).map((x) => x.id)).toEqual([2, 1]);
  });
  it("vazio quando nada serve", () => {
    expect(pickFeatured([[], []], day(3))).toEqual([]);
  });
});
