import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/server", () => ({ connection: vi.fn() }));
vi.mock("@/lib/tmdb/discover", () => ({ discoverMovies: vi.fn() }));
import { discoverMovies } from "@/lib/tmdb/discover";
import ServicePage from "@/app/servico/[slug]/page";
import type { DiscoverFilters } from "@/lib/tmdb/types";

const page = {
  results: [{ id: 1, title: "Filme 1", posterPath: "/p.jpg", releaseDate: "2020-01-01", voteAverage: 7, voteCount: 100 }],
  page: 1,
  totalPages: 1,
};
// A grade e a faixa "Em alta" usam a mesma consulta; a grade é a última chamada.
const call = { n: 0 };
const open = async () =>
  render(await ServicePage({ params: Promise.resolve({ slug: "netflix" }), searchParams: Promise.resolve({}) }));

beforeEach(() => {
  call.n = 0;
  vi.mocked(discoverMovies).mockReset();
});

describe("página do serviço", () => {
  it("se só a grade falhar, as faixas continuam e aparece um aviso", async () => {
    vi.mocked(discoverMovies).mockImplementation(async (f: DiscoverFilters) => {
      void f;
      if (++call.n === 4) throw new Error("x");
      return page;
    });
    await open();
    expect(screen.getByRole("heading", { name: "Em alta" })).toBeInTheDocument();
    expect(screen.getByText("Não foi possível carregar esta lista agora. Tente de novo em alguns minutos.")).toBeInTheDocument();
  });

  it("se tudo falhar, vai para a tela de erro", async () => {
    vi.mocked(discoverMovies).mockRejectedValue(new Error("fora do ar"));
    await expect(open()).rejects.toThrow("fora do ar");
  });

  it("sem falhas mostra a grade", async () => {
    vi.mocked(discoverMovies).mockResolvedValue(page);
    await open();
    expect(screen.getByRole("heading", { name: "Todos os filmes na Netflix" })).toBeInTheDocument();
    expect(screen.queryByText(/Não foi possível/)).not.toBeInTheDocument();
  });
});
