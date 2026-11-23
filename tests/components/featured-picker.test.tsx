import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FeaturedPicker } from "@/components/FeaturedPicker";
import { kernelCount } from "@/components/PopcornBag";

const m = (id: number) => ({ id, title: `Filme ${id}`, posterPath: "/p.jpg", releaseDate: "2020-01-01", voteAverage: 8, voteCount: 500 });

describe("FeaturedPicker", () => {
  it("troca o filme e volta ao primeiro no fim", async () => {
    render(<FeaturedPicker movies={[m(1), m(2)]} />);
    const button = screen.getByRole("button", { name: "Estourar outro filme" });
    await userEvent.click(button);
    expect(screen.getByRole("heading", { name: "Filme 2" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver onde assistir" })).toHaveAttribute("href", "/filme/2");
    await userEvent.click(button);
    expect(screen.getByRole("heading", { name: "Filme 1" })).toBeInTheDocument();
  });
});

describe("ajuda para escolher", () => {
  it("é um botão como os outros e leva a /escolher", () => {
    render(<FeaturedPicker movies={[m(1), m(2)]} helpLink />);
    const link = screen.getByRole("link", { name: "Me ajude a escolher" });
    expect(link).toHaveAttribute("href", "/escolher");
    expect(link).toHaveClass("botao", "botao-claro");
  });
});

describe("kernelCount", () => {
  it("enche conforme a nota", () => {
    expect(kernelCount(9, 10, 27)).toBe(27);
    expect(kernelCount(2, 10, 27)).toBe(1);
    expect(kernelCount(0, 0, 27)).toBe(0);
    expect(kernelCount(8, 10, 27)).toBeGreaterThan(kernelCount(6, 10, 27));
  });
});
