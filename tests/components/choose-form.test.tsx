import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
import { BURST_MS, ChooseForm } from "@/components/ChooseForm";

const kernels = () => document.querySelectorAll("[data-estouro] svg").length;
const answer = () => {
  for (const name of ["Rir", "Até 1h30", "Casal"]) fireEvent.click(screen.getByRole("radio", { name }));
  fireEvent.click(screen.getByRole("button", { name: "Estourar meu filme" }));
};

beforeEach(() => {
  push.mockReset();
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe("ChooseForm", () => {
  it("ao enviar estoura pipocas na tela e vai para o resultado", () => {
    render(<ChooseForm choice={null} />);
    expect(kernels()).toBe(0);
    answer();
    expect(kernels()).toBeGreaterThan(30);
    expect(document.querySelector("[data-estouro]")).toHaveAttribute("aria-hidden", "true");
    expect(push).toHaveBeenCalledExactlyOnceWith("/escolher?clima=rir&tempo=90&companhia=casal");
  });

  it("as pipocas somem no fim e voltam no próximo envio", () => {
    render(<ChooseForm choice={null} />);
    answer();
    act(() => vi.advanceTimersByTime(BURST_MS));
    expect(kernels()).toBe(0);
    answer();
    expect(kernels()).toBeGreaterThan(30);
  });

  it("faltando resposta não estoura nem navega", () => {
    render(<ChooseForm choice={null} />);
    fireEvent.click(screen.getByRole("radio", { name: "Rir" }));
    fireEvent.click(screen.getByRole("button", { name: "Estourar meu filme" }));
    expect(kernels()).toBe(0);
    expect(push).not.toHaveBeenCalled();
  });

  it("acompanha as respostas do endereço ao voltar, sem cortar as pipocas", () => {
    const { rerender } = render(<ChooseForm choice={{ mood: "rir", time: "90", company: "casal" }} />);
    answer();
    rerender(<ChooseForm choice={{ mood: "medo", time: "90", company: "casal" }} />);
    expect(screen.getByRole("radio", { name: "Sentir medo" })).toBeChecked();
    expect(kernels()).toBeGreaterThan(30);
  });

  it("continua um formulário comum para quem está sem JavaScript", () => {
    const { container } = render(<ChooseForm choice={null} />);
    expect(container.querySelector("form")).toHaveAttribute("action", "/escolher");
    expect(container.querySelector("form")).toHaveAttribute("method", "get");
  });
});
