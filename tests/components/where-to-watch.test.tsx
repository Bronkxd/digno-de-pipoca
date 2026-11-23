import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WhereToWatch } from "@/components/WhereToWatch";
import type { WatchInfo } from "@/lib/tmdb/types";

const watch: WatchInfo = {
  link: "https://www.themoviedb.org/movie/603/watch?locale=BR",
  providers: [
    { id: 8, name: "Netflix", logoPath: "/n.png", isCovered: true, isChannel: false },
    { id: 227, name: "Telecine", logoPath: null, isCovered: false, isChannel: false },
    { id: 1825, name: "Max Amazon Channel", logoPath: "/m.png", isCovered: false, isChannel: true },
  ],
};

describe("WhereToWatch", () => {
  it("lista os provedores e o crédito do JustWatch", () => {
    render(<WhereToWatch watch={watch} />);
    expect(screen.getByAltText("Netflix")).toBeInTheDocument();
    expect(screen.getByText("Telecine")).toBeInTheDocument();
    expect(screen.getByText("Dados de disponibilidade: JustWatch")).toBeInTheDocument();
  });

  it("marca canal pago à parte", () => {
    render(<WhereToWatch watch={watch} />);
    expect(screen.getByText("canal pago à parte")).toBeInTheDocument();
    expect(screen.getAllByText("canal pago à parte")).toHaveLength(1);
  });

  it("o bloco leva ao link do TMDB", () => {
    render(<WhereToWatch watch={watch} />);
    expect(screen.getByRole("link", { name: /onde assistir/i })).toHaveAttribute("href", watch.link);
  });

  it("leitor de tela ouve os nomes dos serviços (link não esconde a lista)", () => {
    render(<WhereToWatch watch={watch} />);
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getByRole("list").closest("a")).toBeNull();
  });

  it("sem link não cria âncora", () => {
    render(<WhereToWatch watch={{ ...watch, link: null }} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("vazio mostra a mensagem exata", () => {
    render(<WhereToWatch watch={{ link: null, providers: [] }} />);
    expect(
      screen.getByText("No momento, este filme não está em nenhum streaming por assinatura no Brasil."),
    ).toBeInTheDocument();
  });
});
