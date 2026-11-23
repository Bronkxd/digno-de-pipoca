import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/tmdb/client", () => ({
  tmdbFetch: vi.fn(),
  REVALIDATE: { lists: 21600, movie: 43200, static: 604800 },
}));

import { tmdbFetch } from "@/lib/tmdb/client";
import { buildDiscoverParams, withPosterOnly, discoverMovies, MIN_VOTES_FOR_RATING_SORT } from "@/lib/tmdb/discover";

const today = new Date("2026-11-23T12:00:00Z");
const item = (id: number, poster: string | null) => ({
  id, title: `F${id}`, poster_path: poster, release_date: "2020-01-02", vote_average: 7, vote_count: 10,
});

beforeEach(() => vi.mocked(tmdbFetch).mockReset());

describe("buildDiscoverParams", () => {
  it("parâmetros fixos de disponibilidade", () =>
    expect(buildDiscoverParams({ providerIds: [8, 1796], sortBy: "popularity.desc" }, today)).toEqual({
      watch_region: "BR",
      with_watch_monetization_types: "flatrate",
      with_watch_providers: "8|1796",
      include_adult: "false",
      sort_by: "popularity.desc",
      "primary_release_date.lte": "2026-11-23",
    }));

  it("filtros opcionais", () =>
    expect(
      buildDiscoverParams(
        { providerIds: [8], genreIds: [35, 27], releasedFrom: "2025-01-01", minRating: 7.5, minVotes: 1000, sortBy: "vote_average.desc" },
        today,
      ),
    ).toMatchObject({
      with_genres: "35,27",
      "primary_release_date.gte": "2025-01-01",
      "vote_average.gte": "7.5",
      "vote_count.gte": "1000",
    }));

  it("ordenar por nota impõe mínimo de votos", () => {
    expect(MIN_VOTES_FOR_RATING_SORT).toBe(200);
    expect(buildDiscoverParams({ providerIds: [8], sortBy: "vote_average.desc" }, today)["vote_count.gte"]).toBe("200");
    expect(buildDiscoverParams({ providerIds: [8], minVotes: 50, sortBy: "vote_average.desc" }, today)["vote_count.gte"]).toBe("200");
  });

  it("releasedTo anterior a hoje prevalece", () =>
    expect(buildDiscoverParams({ providerIds: [8], releasedTo: "2019-12-31", sortBy: "popularity.desc" }, today)["primary_release_date.lte"]).toBe("2019-12-31"));

  it("releasedTo no futuro é limitado a hoje", () =>
    expect(buildDiscoverParams({ providerIds: [8], releasedTo: "2030-12-31", sortBy: "popularity.desc" }, today)["primary_release_date.lte"]).toBe("2026-11-23"));
});

describe("withPosterOnly", () => {
  it("descarta sem pôster e converte", () =>
    expect(withPosterOnly([item(1, "/a.jpg"), item(2, null)])).toEqual([
      { id: 1, title: "F1", posterPath: "/a.jpg", releaseDate: "2020-01-02", voteAverage: 7, voteCount: 10 },
    ]));
});

describe("discoverMovies", () => {
  it("limita totalPages a 500 e usa cache de listas", async () => {
    vi.mocked(tmdbFetch).mockResolvedValue({ page: 3, results: [item(1, "/a.jpg")], total_pages: 812, total_results: 9999 });
    const r = await discoverMovies({ providerIds: [8], sortBy: "popularity.desc" }, 3);
    expect(r).toMatchObject({ page: 3, totalPages: 500 });
    expect(r.results).toHaveLength(1);
    const [path, params, revalidate] = vi.mocked(tmdbFetch).mock.calls[0];
    expect(path).toBe("/discover/movie");
    expect(params).toMatchObject({ page: 3, with_watch_providers: "8" });
    expect(revalidate).toBe(21600);
  });

  it("página fora de 1..500 é limitada", async () => {
    vi.mocked(tmdbFetch).mockResolvedValue({ page: 500, results: [], total_pages: 900, total_results: 1 });
    await discoverMovies({ providerIds: [8], sortBy: "popularity.desc" }, 900);
    await discoverMovies({ providerIds: [8], sortBy: "popularity.desc" }, -2);
    expect(vi.mocked(tmdbFetch).mock.calls[0][1]).toMatchObject({ page: 500 });
    expect(vi.mocked(tmdbFetch).mock.calls[1][1]).toMatchObject({ page: 1 });
  });
});
