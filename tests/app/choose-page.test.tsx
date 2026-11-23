import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/tmdb/choose", () => ({ findMovies: vi.fn() }));
import { findMovies } from "@/lib/tmdb/choose";
import ChoosePage from "@/app/escolher/page";

const open = async (sp: Record<string, string>) =>
  render(await ChoosePage({ params: Promise.resolve({}), searchParams: Promise.resolve(sp) }));
const answers = { clima: "rir", tempo: "90", companhia: "familia" };
const movie = { id: 1, title: "Filme 1", posterPath: "/p.jpg", releaseDate: "2020-01-01", voteAverage: 8, voteCount: 900 };

beforeEach(() => {
  vi.mocked(findMovies).mockReset().mockResolvedValue([movie]);
});

describe("/escolher", () => {
  it("sem respostas mostra as perguntas e não consulta", async () => {
    await open({});
    expect(screen.getAllByRole("group").map((g) => g.querySelector("legend")?.textContent)).toEqual([
      "Qual é o clima?", "Quanto tempo você tem?", "Quem vai assistir?",
    ]);
    expect(screen.getByRole("radio", { name: "Família com crianças" })).toBeRequired();
    expect(screen.getByRole("button", { name: "Estourar meu filme" })).toBeInTheDocument();
    expect(findMovies).not.toHaveBeenCalled();
  });

  it("com respostas mostra o filme e mantém as escolhas marcadas", async () => {
    await open(answers);
    expect(screen.getByRole("heading", { level: 1, name: "A pipoca escolheu" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Filme 1" })).toBeInTheDocument();
    expect(screen.getByText("Rir, até 1h30, família com crianças")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Rir" })).toBeChecked();
  });

  it("nenhum filme mostra aviso e as perguntas", async () => {
    vi.mocked(findMovies).mockResolvedValue([]);
    await open(answers);
    expect(screen.getByText("Nenhum filme passou por essas respostas. Tente dar mais tempo ou mudar o clima.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Estourar meu filme" })).toBeInTheDocument();
  });

  it("resposta inválida volta para as perguntas", async () => {
    await open({ ...answers, clima: "xyz" });
    expect(findMovies).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { level: 1, name: "Me ajude a escolher" })).toBeInTheDocument();
  });
});
