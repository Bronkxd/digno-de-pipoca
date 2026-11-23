import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AboutPage from "@/app/sobre/page";
import { Footer } from "@/components/Footer";

describe("/sobre", () => {
  it("mostra autoria, contato e ajuda de IA", () => {
    render(<AboutPage />);
    expect(screen.getByRole("heading", { level: 1, name: "Sobre o projeto" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "bronkxdev@gmail.com" })).toHaveAttribute("href", "mailto:bronkxdev@gmail.com");
    expect(screen.getByText(/Me chamo Caio Maia./)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver o código no GitHub" })).toHaveAttribute("href", "https://github.com/Bronkxd/digno-de-pipoca");
    expect(screen.getByText(/ajuda de IA/)).toBeInTheDocument();
  });

  it("o rodapé leva à página", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Sobre o projeto" })).toHaveAttribute("href", "/sobre");
    expect(screen.getByText(/Criado por Caio Maia/)).toBeInTheDocument();
  });
});
