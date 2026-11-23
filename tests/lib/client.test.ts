import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { tmdbFetch, REVALIDATE, TmdbError } from "@/lib/tmdb/client";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockImplementation(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("TMDB_READ_TOKEN", "tok");
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("tmdbFetch", () => {
  it("monta URL com pt-BR, sem parâmetros undefined, com token e revalidate", async () => {
    await tmdbFetch("/discover/movie", { page: 2, with_genres: undefined }, REVALIDATE.lists);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/^https:\/\/api\.themoviedb\.org\/3\/discover\/movie\?page=2&language=pt-BR&cb=\d+$/);
    expect(init.headers.Authorization).toBe("Bearer tok");
    expect(init.next).toEqual({ revalidate: 21600 });
  });

  it("inclui faixa de tempo do cache na URL para não servir dados mais velhos que o revalidate", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(43200 * 1000 * 5 + 1000));
    await tmdbFetch("/movie/1", {}, REVALIDATE.movie);
    vi.setSystemTime(new Date(43200 * 1000 * 6 + 1000));
    await tmdbFetch("/movie/1", {}, REVALIDATE.movie);
    vi.useRealTimers();
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.themoviedb.org/3/movie/1?language=pt-BR&cb=5");
    expect(fetchMock.mock.calls[1][0]).toBe("https://api.themoviedb.org/3/movie/1?language=pt-BR&cb=6");
  });

  it("respeita language explícito", async () => {
    await tmdbFetch("/movie/1", { language: "en-US" }, REVALIDATE.movie);
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/movie\/1\?language=en-US&cb=\d+$/);
  });

  it("devolve o JSON", async () => expect(await tmdbFetch("/x", {}, 1)).toEqual({ ok: true }));

  it("resposta 404 vira TmdbError com status", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 404 }));
    const err = await tmdbFetch("/movie/1", {}, 1).catch((e) => e);
    expect(err).toBeInstanceOf(TmdbError);
    expect(err).toMatchObject({ name: "TmdbError", status: 404 });
  });

  it("sem token falha com mensagem clara", async () => {
    vi.stubEnv("TMDB_READ_TOKEN", "");
    await expect(tmdbFetch("/x", {}, 1)).rejects.toThrow("TMDB_READ_TOKEN não configurado");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("valores de cache do spec", () => expect(REVALIDATE).toEqual({ lists: 21600, movie: 43200, static: 604800 }));
});
