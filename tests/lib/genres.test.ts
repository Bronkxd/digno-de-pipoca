import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/tmdb/client", () => ({
  tmdbFetch: vi.fn(),
  REVALIDATE: { lists: 21600, movie: 43200, static: 604800 },
}));

import { tmdbFetch } from "@/lib/tmdb/client";
import { getGenres, genreSlug, genreTitle } from "@/lib/tmdb/genres";

describe("genreSlug", () => {
  it.each([["Ficção científica", "ficcao-cientifica"], ["Comédia", "comedia"], ["Cinema TV", "cinema-tv"]])("%s", (n, s) =>
    expect(genreSlug(n)).toBe(s));
});

describe("genreTitle", () => {
  it.each([
    [27, "Terror", "Filmes de terror"],
    [99, "Documentário", "Documentários"],
    [10751, "Família", "Filmes para a família"],
    [10770, "Cinema TV", "Filmes feitos para TV"],
  ])("%s", (id, name, title) => expect(genreTitle({ id, name })).toBe(title));
});

describe("getGenres", () => {
  it("busca a lista de gêneros com cache estático e ordena por nome", async () => {
    vi.mocked(tmdbFetch).mockResolvedValue({ genres: [{ id: 27, name: "Terror" }, { id: 28, name: "Ação" }] });
    expect(await getGenres()).toEqual([{ id: 28, name: "Ação" }, { id: 27, name: "Terror" }]);
    expect(vi.mocked(tmdbFetch).mock.calls[0]).toEqual(["/genre/movie/list", {}, 604800]);
  });
});
