import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Trailer } from "@/components/Trailer";

describe("Trailer", () => {
  it("só carrega o YouTube depois do clique e leva o foco ao vídeo", async () => {
    const { container } = render(<Trailer trailerKey="abc" title="Matrix" backdrop={null} />);
    expect(container.querySelector("iframe")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Assistir ao trailer de Matrix" }));
    const frame = screen.getByTitle("Trailer de Matrix");
    expect(frame).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/abc?autoplay=1");
    expect(frame).toHaveFocus();
  });
});
