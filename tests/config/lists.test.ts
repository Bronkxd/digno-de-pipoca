import { describe, it, expect } from "vitest";
import { getHomeLists, getServiceLists } from "@/config/lists";
import { getServiceBySlug, ALL_COVERED_PROVIDER_IDS } from "@/config/services";

const today = new Date("2026-11-23T12:00:00Z");

describe("getHomeLists", () => {
  const ls = getHomeLists(today);

  it("listas na ordem do spec", () =>
    expect(ls.map((l) => l.id)).toEqual([
      "lancamentos", "em-alta", "mais-bem-avaliados",
      "servico-netflix", "servico-prime-video", "servico-disney-plus", "servico-max", "servico-globoplay",
      "servico-apple-tv-plus", "servico-paramount-plus",
      "genero-comedia", "genero-terror", "genero-animacao",
    ]));

  it("regras de cada lista", () => {
    expect(ls[0].filters).toMatchObject({ providerIds: ALL_COVERED_PROVIDER_IDS, releasedFrom: "2025-11-23", minVotes: 20, sortBy: "primary_release_date.desc" });
    expect(ls[1].filters).toEqual({ providerIds: ALL_COVERED_PROVIDER_IDS, sortBy: "popularity.desc" });
    expect(ls[2].filters).toMatchObject({ minRating: 7.5, minVotes: 1000, sortBy: "vote_average.desc" });
    expect(ls[3].filters).toEqual({ providerIds: [8, 1796], minRating: 7, minVotes: 300, sortBy: "popularity.desc" });
    expect(ls[10].filters).toMatchObject({ genreIds: [35], minRating: 6.5, minVotes: 200, sortBy: "popularity.desc" });
    expect(ls[11].filters.genreIds).toEqual([27]);
    expect(ls[12].filters.genreIds).toEqual([16]);
  });

  it("títulos e links", () => {
    expect(ls[3]).toMatchObject({ title: "Destaques na Netflix", href: "/servico/netflix" });
    expect(ls.slice(3, 10).map((l) => l.title)).toEqual([
      "Destaques na Netflix", "Destaques no Prime Video", "Destaques no Disney+", "Destaques na HBO Max",
      "Destaques no Globoplay", "Destaques no Apple TV", "Destaques no Paramount+",
    ]);
    expect(ls[0].href).toBe("/explorar?de=2025&ordem=lancamento");
    expect(ls[2].href).toBe("/explorar?nota=7.5&ordem=nota");
    expect(ls[10].href).toBe("/explorar?genero=35&nota=6.5");
  });
});

describe("getServiceLists", () => {
  it("em alta, mais bem avaliados e lançamentos do serviço", () => {
    const ls = getServiceLists(getServiceBySlug("max")!, today);
    expect(ls.map((l) => l.title)).toEqual(["Em alta", "Mais bem avaliados", "Lançamentos"]);
    expect(ls.every((l) => l.filters.providerIds.join() === "1899")).toBe(true);
    expect(ls[0].href).toBe("/explorar?servico=max");
  });
});
