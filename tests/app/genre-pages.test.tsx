import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/server", () => ({ connection: vi.fn() }));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));
vi.mock("@/lib/tmdb/discover", () => ({ discoverMovies: vi.fn() }));
vi.mock("@/lib/tmdb/client", () => ({ tmdbFetch: vi.fn(), REVALIDATE: { static: 1 } }));
import { tmdbFetch } from "@/lib/tmdb/client";
import { discoverMovies } from "@/lib/tmdb/discover";
import GenresPage from "@/app/generos/page";
import GenrePage from "@/app/genero/[slug]/page";

const page = {
  results: [{ id: 1, title: "Filme 1", posterPath: "/p.jpg", releaseDate: "2020-01-01", voteAverage: 7, voteCount: 100 }],
  page: 1,
  totalPages: 1,
};
const open = async (slug: string, sp: Record<string, string> = {}) =>
  render(await GenrePage({ params: Promise.resolve({ slug }), searchParams: Promise.resolve(sp) }));

beforeEach(() => {
  vi.mocked(discoverMovies).mockReset().mockResolvedValue(page);
  vi.mocked(tmdbFetch).mockResolvedValue({ genres: [{ id: 27, name: "Terror" }, { id: 878, name: "Ficção científica" }] });
});

describe("/generos", () => {
  it("lista os gêneros com link", async () => {
    render(await GenresPage());
    expect(screen.getByRole("link", { name: "Ficção científica" })).toHaveAttribute("href", "/genero/ficcao-cientifica");
  });
});

describe("/genero/[slug]", () => {
  it("mostra título, faixas e grade", async () => {
    await open("terror");
    expect(screen.getByRole("heading", { level: 1, name: "Filmes de terror" })).toBeInTheDocument();
    for (const n of ["Em alta", "Mais bem avaliados", "Lançamentos", "Todos: filmes de terror"])
      expect(screen.getByRole("heading", { name: n })).toBeInTheDocument();
  });

  it("o streaming escolhido vale para todas as consultas e os links alternam", async () => {
    await open("terror", { servico: "netflix" });
    for (const [f] of vi.mocked(discoverMovies).mock.calls) expect(f).toMatchObject({ providerIds: [8, 1796], genreIds: [27] });
    expect(vi.mocked(discoverMovies)).toHaveBeenCalledTimes(4);
    const netflix = screen.getByRole("link", { name: "Netflix" });
    expect(netflix).toHaveAttribute("aria-current", "true");
    expect(netflix).toHaveAttribute("href", "/genero/terror");
    expect(screen.getByRole("link", { name: "HBO Max" })).toHaveAttribute("href", "/genero/terror?servico=netflix%2Cmax");
    expect(screen.getByRole("link", { name: "Todos" })).toHaveAttribute("href", "/genero/terror");
  });

  it("parâmetros inválidos são ignorados", async () => {
    await open("terror", { servico: "xyz", genero: "35", nota: "9" });
    for (const [f] of vi.mocked(discoverMovies).mock.calls) expect(f.genreIds).toEqual([27]);
    expect(screen.getByRole("link", { name: "Todos" })).toHaveAttribute("aria-current", "true");
  });

  it("gênero desconhecido é 404", async () => {
    await expect(open("xyz")).rejects.toThrow("NOT_FOUND");
  });

  it("falha só na grade mantém as faixas", async () => {
    let n = 0;
    vi.mocked(discoverMovies).mockImplementation(async () => {
      if (++n === 4) throw new Error("x");
      return page;
    });
    await open("terror");
    expect(screen.getByRole("heading", { name: "Em alta" })).toBeInTheDocument();
    expect(screen.getByText(/Não foi possível carregar esta lista/)).toBeInTheDocument();
  });
});
