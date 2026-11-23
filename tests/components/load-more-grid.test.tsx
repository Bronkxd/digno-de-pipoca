import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoadMoreGrid } from "@/components/LoadMoreGrid";
import type { DiscoverPage, MovieSummary } from "@/lib/tmdb/types";

const m = (id: number): MovieSummary => ({ id, title: `Filme ${id}`, posterPath: "/p.jpg", releaseDate: "2020-01-01", voteAverage: 7, voteCount: 100 });
const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("LoadMoreGrid", () => {
  it("mostra a primeira página e acrescenta a próxima", async () => {
    const page2: DiscoverPage = { results: [m(3)], page: 2, totalPages: 2 };
    fetchMock.mockResolvedValue(new Response(JSON.stringify(page2), { status: 200 }));
    render(<LoadMoreGrid initial={{ results: [m(1), m(2)], page: 1, totalPages: 2 }} searchString="servico=netflix" />);

    expect(screen.getByText("Filme 1")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Carregar mais" }));

    await waitFor(() => expect(screen.getByText("Filme 3")).toBeInTheDocument());
    expect(fetchMock.mock.calls[0][0]).toBe("/api/descobrir?servico=netflix&pagina=2");
    expect(screen.queryByRole("button", { name: "Carregar mais" })).not.toBeInTheDocument();
  });

  it("sem busca usa só a página", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ results: [], page: 2, totalPages: 5 }), { status: 200 }));
    render(<LoadMoreGrid initial={{ results: [m(1)], page: 1, totalPages: 5 }} searchString="" />);
    await userEvent.click(screen.getByRole("button", { name: "Carregar mais" }));
    expect(fetchMock.mock.calls[0][0]).toBe("/api/descobrir?pagina=2");
  });

  it("última página não tem botão", () => {
    render(<LoadMoreGrid initial={{ results: [m(1)], page: 1, totalPages: 1 }} searchString="" />);
    expect(screen.queryByRole("button", { name: "Carregar mais" })).not.toBeInTheDocument();
  });

  it("não duplica filmes que reaparecem na página seguinte", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ results: [m(2), m(3)], page: 2, totalPages: 3 }), { status: 200 }));
    render(<LoadMoreGrid initial={{ results: [m(1), m(2)], page: 1, totalPages: 3 }} searchString="" />);
    await userEvent.click(screen.getByRole("button", { name: "Carregar mais" }));
    await waitFor(() => expect(screen.getByText("Filme 3")).toBeInTheDocument());
    expect(screen.getAllByText("Filme 2")).toHaveLength(1);
  });

  it("erro mostra mensagem e mantém o botão", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 500 }));
    render(<LoadMoreGrid initial={{ results: [m(1)], page: 1, totalPages: 3 }} searchString="" />);
    await userEvent.click(screen.getByRole("button", { name: "Carregar mais" }));
    await waitFor(() => expect(screen.getByText("Não foi possível carregar mais filmes. Tente de novo.")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Carregar mais" })).toBeEnabled();
  });

  it("nenhum resultado mostra a mensagem", () => {
    render(<LoadMoreGrid initial={{ results: [], page: 1, totalPages: 0 }} searchString="" />);
    expect(screen.getByText("Nenhum filme encontrado com esses filtros.")).toBeInTheDocument();
  });
});
