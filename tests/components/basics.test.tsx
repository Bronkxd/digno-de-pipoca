import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RatingBadge } from "@/components/RatingBadge";
import { MovieCard } from "@/components/MovieCard";
import { PosterRow } from "@/components/PosterRow";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import type { MovieSummary } from "@/lib/tmdb/types";

const movie: MovieSummary = { id: 603, title: "Matrix", posterPath: "/p.jpg", releaseDate: "1999-03-31", voteAverage: 8.2, voteCount: 25000 };

describe("RatingBadge", () => {
  it("mostra nota e votos", () => {
    render(<RatingBadge voteAverage={7.83} voteCount={12400} />);
    expect(screen.getByText("7,8 · 12.400 votos")).toBeInTheDocument();
  });
  it("sem votos", () => {
    render(<RatingBadge voteAverage={0} voteCount={0} />);
    expect(screen.getByText("Sem avaliações")).toBeInTheDocument();
  });
});

describe("MovieCard", () => {
  it("leva à página do filme e mostra título, ano e nota", () => {
    render(<MovieCard movie={movie} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/filme/603");
    expect(screen.getByText("Matrix")).toBeInTheDocument();
    expect(screen.getByText("1999")).toBeInTheDocument();
    expect(screen.getByText("8,2 · 25.000 votos")).toBeInTheDocument();
    expect(screen.getByAltText("Pôster de Matrix")).toBeInTheDocument();
  });
  it("sem pôster mostra espaço reservado com o título", () => {
    render(<MovieCard movie={{ ...movie, posterPath: null }} />);
    expect(screen.queryByAltText("Pôster de Matrix")).not.toBeInTheDocument();
    expect(screen.getAllByText("Matrix").length).toBeGreaterThanOrEqual(1);
  });
});

describe("PosterRow", () => {
  it("mostra título, link Ver tudo e cards", () => {
    render(<PosterRow title="Em alta" href="/explorar" movies={[movie]} />);
    expect(screen.getByRole("heading", { name: "Em alta" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ver tudo/ })).toHaveAttribute("href", "/explorar");
    expect(screen.getByText("Matrix")).toBeInTheDocument();
  });
  it("vazia não renderiza nada", () => {
    const { container } = render(<PosterRow title="Em alta" href="/explorar" movies={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("Footer", () => {
  it("tem as atribuições exatas", () => {
    render(<Footer />);
    expect(screen.getByText("This product uses the TMDB API but is not endorsed or certified by TMDB.")).toBeInTheDocument();
    expect(screen.getByText("Dados de disponibilidade: JustWatch")).toBeInTheDocument();
    expect(screen.getByAltText("TMDB")).toBeInTheDocument();
  });
});

describe("Header", () => {
  it("tem busca por GET em /busca e links de navegação", () => {
    render(<Header />);
    const input = screen.getByRole("searchbox");
    expect(input).toHaveAttribute("name", "q");
    expect(input.closest("form")).toHaveAttribute("action", "/busca");
    expect(screen.getByRole("link", { name: "Vale a Pena?" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Explorar" })).toHaveAttribute("href", "/explorar");
    expect(screen.getByRole("link", { name: "Netflix" })).toHaveAttribute("href", "/servico/netflix");
  });
});
