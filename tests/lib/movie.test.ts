import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/tmdb/client", async () => {
  class TmdbError extends Error {
    status: number;
    constructor(status: number) {
      super(String(status));
      this.name = "TmdbError";
      this.status = status;
    }
  }
  return { tmdbFetch: vi.fn(), TmdbError, REVALIDATE: { lists: 21600, movie: 43200, static: 604800 } };
});

import { tmdbFetch, TmdbError } from "@/lib/tmdb/client";
import { pickTrailer, pickBrCertification, mapCredits, toReviewExcerpts, getMovie } from "@/lib/tmdb/movie";
import type { TmdbMovieDetailsResponse, TmdbVideo } from "@/lib/tmdb/types";

const v = (key: string, type: string, lang: string, official = true): TmdbVideo => ({
  key, type, iso_639_1: lang, site: "YouTube", official, name: key,
});

describe("pickTrailer", () => {
  it("prefere trailer em pt", () =>
    expect(pickTrailer([v("en1", "Trailer", "en"), v("pt-teaser", "Teaser", "pt"), v("pt1", "Trailer", "pt")])).toBe("pt1"));
  it("cai para en", () => expect(pickTrailer([v("es1", "Trailer", "es"), v("en1", "Trailer", "en")])).toBe("en1"));
  it("depois oficial de qualquer idioma", () =>
    expect(pickTrailer([v("x", "Trailer", "fr", false), v("y", "Trailer", "de", true)])).toBe("y"));
  it("ignora fora do YouTube", () => expect(pickTrailer([{ ...v("vim", "Trailer", "pt"), site: "Vimeo" }])).toBeNull());
  it("sem trailer devolve null", () => expect(pickTrailer([v("t", "Teaser", "pt")])).toBeNull());
});

describe("pickBrCertification", () => {
  it("primeira certificação não vazia do BR", () =>
    expect(
      pickBrCertification({
        results: [
          { iso_3166_1: "US", release_dates: [{ certification: "PG-13", type: 3 }] },
          { iso_3166_1: "BR", release_dates: [{ certification: "", type: 3 }, { certification: "14", type: 4 }] },
        ],
      }),
    ).toBe("14"));
  it("sem BR devolve null", () => expect(pickBrCertification({ results: [] })).toBeNull());
});

describe("mapCredits", () => {
  it("diretor e 10 do elenco por order", () => {
    const cast = Array.from({ length: 12 }, (_, i) => ({ name: `A${i}`, character: `C${i}`, profile_path: null, order: 11 - i }));
    const r = mapCredits({ cast, crew: [{ name: "Prod", job: "Producer" }, { name: "Dir", job: "Director" }] });
    expect(r.director).toBe("Dir");
    expect(r.cast).toHaveLength(10);
    expect(r.cast[0]).toEqual({ name: "A11", character: "C11", profilePath: null });
  });
  it("sem diretor", () => expect(mapCredits({ cast: [], crew: [] }).director).toBeNull());
});

describe("toReviewExcerpts", () => {
  it("no máximo 3, corta em 400 numa fronteira de palavra com …", () => {
    const long = "palavra ".repeat(100);
    const r = toReviewExcerpts(Array.from({ length: 5 }, (_, i) => ({ author: `a${i}`, content: long, url: `u${i}` })), "en");
    expect(r).toHaveLength(3);
    expect(r[0].excerpt.length).toBeLessThanOrEqual(401);
    expect(r[0].excerpt.endsWith("palavra…")).toBe(true);
    expect(r[0]).toMatchObject({ author: "a0", url: "u0", language: "en" });
  });
  it("texto curto fica inteiro", () =>
    expect(toReviewExcerpts([{ author: "a", content: "Ótimo.", url: "u" }], "pt-BR")[0].excerpt).toBe("Ótimo."));
});

// ---- getMovie ----
const base = (over: Partial<TmdbMovieDetailsResponse> = {}): TmdbMovieDetailsResponse => ({
  id: 603, title: "Matrix", overview: "Sinopse PT", poster_path: "/p.jpg", backdrop_path: "/b.jpg",
  release_date: "1999-03-31", runtime: 136, genres: [{ id: 28, name: "Ação" }], vote_average: 8.2, vote_count: 25000,
  videos: { results: [v("tr", "Trailer", "pt")] },
  credits: { cast: [], crew: [{ name: "Lana", job: "Director" }] },
  release_dates: { results: [{ iso_3166_1: "BR", release_dates: [{ certification: "14", type: 3 }] }] },
  "watch/providers": {
    results: { BR: { link: "L", flatrate: [{ provider_id: 8, provider_name: "Netflix", logo_path: "/n.png", display_priority: 1 }] } },
  },
  recommendations: { page: 1, total_pages: 1, total_results: 0, results: [] },
  ...over,
});

type Route = (path: string, params: Record<string, unknown>) => unknown;
function route(fn: Route) {
  vi.mocked(tmdbFetch).mockImplementation(async (path: string, params: Record<string, unknown>) => {
    const r = fn(path, params);
    if (r instanceof Error) throw r;
    return r as never;
  });
}
const noReviews = { page: 1, results: [], total_pages: 0, total_results: 0 };
const netflix = { provider_id: 8, provider_name: "Netflix", logo_path: null, display_priority: 1 };
const available = { results: { BR: { flatrate: [netflix] } } };
const unavailable = { results: { BR: { rent: [netflix] } } };

beforeEach(() => {
  vi.mocked(tmdbFetch).mockReset();
});

describe("getMovie", () => {
  it("mapeia os detalhes", async () => {
    route((path) => (path.endsWith("/reviews") ? noReviews : base()));
    const m = (await getMovie(603))!;
    expect(m).toMatchObject({
      id: 603, title: "Matrix", year: 1999, runtime: 136, genres: ["Ação"], overview: "Sinopse PT",
      certification: "14", trailerKey: "tr", director: "Lana", voteAverage: 8.2, voteCount: 25000,
      posterPath: "/p.jpg", backdropPath: "/b.jpg",
    });
    expect(m.watch.providers[0].name).toBe("Netflix");
    const [path, params, revalidate] = vi.mocked(tmdbFetch).mock.calls[0];
    expect(path).toBe("/movie/603");
    expect(params).toMatchObject({
      append_to_response: "videos,credits,release_dates,watch/providers,recommendations",
      include_video_language: "pt,en",
    });
    expect(revalidate).toBe(43200);
  });

  it("sinopse cai para inglês", async () => {
    route((path, params) =>
      path.endsWith("/reviews") ? noReviews : params.language === "en-US" ? base({ overview: "An overview" }) : base({ overview: "" }),
    );
    expect((await getMovie(603))!.overview).toBe("An overview");
  });

  it("sem sinopse nenhuma", async () => {
    route((path) => (path.endsWith("/reviews") ? noReviews : base({ overview: "" })));
    expect((await getMovie(603))!.overview).toBe("Sinopse indisponível.");
  });

  it("falha na sinopse em inglês não derruba a página", async () => {
    route((path, params) =>
      path.endsWith("/reviews") ? noReviews : params.language === "en-US" ? new TmdbError(429) : base({ overview: "" }),
    );
    expect((await getMovie(603))!.overview).toBe("Sinopse indisponível.");
  });

  it("404 devolve null", async () => {
    route(() => new TmdbError(404));
    expect(await getMovie(999999999)).toBeNull();
  });

  it("outros erros propagam", async () => {
    route(() => new TmdbError(500));
    await expect(getMovie(1)).rejects.toMatchObject({ status: 500 });
  });

  it("veja também: só disponíveis com pôster, no máximo 12", async () => {
    const recs = Array.from({ length: 20 }, (_, i) => ({
      id: 1000 + i, title: `R${i}`, poster_path: i === 0 ? null : "/r.jpg", vote_average: 7, vote_count: 9,
    }));
    route((path) => {
      if (path.endsWith("/reviews")) return noReviews;
      if (path.endsWith("/watch/providers")) return Number(path.split("/")[2]) % 2 === 0 ? available : unavailable;
      return base({ recommendations: { page: 1, total_pages: 1, total_results: 20, results: recs } });
    });
    const m = (await getMovie(603))!;
    expect(m.recommendations.map((r) => r.id)).toEqual([1002, 1004, 1006, 1008, 1010, 1012, 1014, 1016, 1018]);
  });

  it("veja também corta em 12", async () => {
    const recs = Array.from({ length: 20 }, (_, i) => ({ id: 2000 + i, title: `R${i}`, poster_path: "/r.jpg", vote_average: 7, vote_count: 9 }));
    route((path) => {
      if (path.endsWith("/reviews")) return noReviews;
      if (path.endsWith("/watch/providers")) return available;
      return base({ recommendations: { page: 1, total_pages: 1, total_results: 20, results: recs } });
    });
    expect((await getMovie(603))!.recommendations).toHaveLength(12);
  });

  it("falha em uma recomendação não derruba a página", async () => {
    const recs = [1, 2].map((id) => ({ id, title: `R${id}`, poster_path: "/r.jpg", vote_average: 7, vote_count: 9 }));
    route((path) => {
      if (path.endsWith("/reviews")) return noReviews;
      if (path === "/movie/1/watch/providers") return new TmdbError(500);
      if (path.endsWith("/watch/providers")) return available;
      return base({ recommendations: { page: 1, total_pages: 1, total_results: 2, results: recs } });
    });
    expect((await getMovie(603))!.recommendations.map((r) => r.id)).toEqual([2]);
  });

  it("resenhas caem para inglês e marcam o idioma", async () => {
    route((path, params) => {
      if (path.endsWith("/reviews"))
        return params.language === "pt-BR" ? noReviews : { ...noReviews, results: [{ author: "Bob", content: "Great", url: "u" }] };
      return base();
    });
    expect((await getMovie(603))!.reviews).toEqual([{ author: "Bob", excerpt: "Great", url: "u", language: "en" }]);
  });

  it("resenhas em português ficam com pt-BR", async () => {
    route((path) => (path.endsWith("/reviews") ? { ...noReviews, results: [{ author: "Ana", content: "Bom", url: "u" }] } : base()));
    expect((await getMovie(603))!.reviews[0].language).toBe("pt-BR");
  });

  it("falha nas resenhas não derruba a página", async () => {
    route((path) => (path.endsWith("/reviews") ? new TmdbError(500) : base()));
    expect((await getMovie(603))!.reviews).toEqual([]);
  });
});
