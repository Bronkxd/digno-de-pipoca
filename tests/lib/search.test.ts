import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/tmdb/client", () => ({
  tmdbFetch: vi.fn(),
  REVALIDATE: { lists: 21600, movie: 43200, static: 604800 },
}));

import { tmdbFetch } from "@/lib/tmdb/client";
import { searchMovies } from "@/lib/tmdb/search";

beforeEach(() => {
  vi.mocked(tmdbFetch).mockReset();
});

describe("searchMovies", () => {
  it("vazio ou só espaços não chama o TMDB", async () => {
    expect(await searchMovies("   ")).toEqual({ results: [], page: 1, totalPages: 0 });
    expect(await searchMovies("")).toEqual({ results: [], page: 1, totalPages: 0 });
    expect(tmdbFetch).not.toHaveBeenCalled();
  });

  it("passa a busca, região, adulto, página e cache de listas", async () => {
    vi.mocked(tmdbFetch).mockResolvedValue({ page: 2, results: [], total_pages: 3, total_results: 50 });
    await searchMovies("  matrix ", 2);
    expect(vi.mocked(tmdbFetch).mock.calls[0]).toEqual([
      "/search/movie",
      { query: "matrix", region: "BR", include_adult: "false", page: 2 },
      21600,
    ]);
  });

  it("mantém filmes sem pôster e limita páginas", async () => {
    vi.mocked(tmdbFetch).mockResolvedValue({
      page: 1,
      results: [{ id: 1, title: "Sem pôster", poster_path: null, vote_average: 0, vote_count: 0 }],
      total_pages: 900,
      total_results: 1,
    });
    const r = await searchMovies("x");
    expect(r.results).toEqual([{ id: 1, title: "Sem pôster", posterPath: null, releaseDate: null, voteAverage: 0, voteCount: 0 }]);
    expect(r.totalPages).toBe(500);
  });
});
