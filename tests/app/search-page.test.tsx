import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/tmdb/search", () => ({ searchMovies: vi.fn() }));
import { searchMovies } from "@/lib/tmdb/search";
import SearchPage from "@/app/busca/page";

const open = async (sp: Record<string, string>) =>
  render(await SearchPage({ params: Promise.resolve({}), searchParams: Promise.resolve(sp) }));

describe("busca", () => {
  it("além da última página leva à última em vez de dizer que nada foi encontrado", async () => {
    vi.mocked(searchMovies).mockResolvedValue({ results: [], page: 400, totalPages: 5 });
    await open({ q: "matrix", pagina: "400" });
    expect(screen.getByText("Esta página não existe. A busca tem 5 páginas.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir para a última página" })).toHaveAttribute("href", "/busca?q=matrix&pagina=5");
    expect(screen.queryByText(/Nenhum filme encontrado/)).not.toBeInTheDocument();
  });

  it("uma única página usa o singular", async () => {
    vi.mocked(searchMovies).mockResolvedValue({ results: [], page: 2, totalPages: 1 });
    await open({ q: "matrix", pagina: "2" });
    expect(screen.getByText("Esta página não existe. A busca tem 1 página.")).toBeInTheDocument();
  });

  it("sem nenhum resultado continua dizendo que nada foi encontrado", async () => {
    vi.mocked(searchMovies).mockResolvedValue({ results: [], page: 1, totalPages: 0 });
    await open({ q: "zzzz" });
    expect(screen.getByText('Nenhum filme encontrado para "zzzz".')).toBeInTheDocument();
  });
});
