import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorPage from "@/app/error";
import NotFound from "@/app/not-found";

describe("error.tsx", () => {
  it("mostra mensagem amigável e tenta de novo", async () => {
    const retry = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<ErrorPage error={new Error("x")} retry={retry} />);
    expect(screen.getByText("Não foi possível carregar os filmes agora. Tente de novo em alguns minutos.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Tentar de novo" }));
    expect(retry).toHaveBeenCalledOnce();
  });
});

describe("not-found.tsx", () => {
  it("mostra página não encontrada com link para o início", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { name: "Página não encontrada" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /página inicial/i })).toHaveAttribute("href", "/");
  });
});
