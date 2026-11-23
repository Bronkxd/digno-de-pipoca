import { describe, it, expect } from "vitest";
import { parseExploreParams, toDiscoverFilters, toSearchString, type ExploreQuery } from "@/lib/explore-params";
import { ALL_COVERED_PROVIDER_IDS } from "@/config/services";

describe("parseExploreParams", () => {
  it("padrões", () => expect(parseExploreParams({})).toEqual({ services: [], sort: "popularidade", page: 1 }));

  it("lê tudo", () =>
    expect(parseExploreParams({ servico: "netflix,max", genero: "35", de: "2010", ate: "2019", nota: "7", ordem: "nota", pagina: "3" })).toEqual({
      services: ["netflix", "max"], genre: 35, from: 2010, to: 2019, minRating: 7, sort: "nota", page: 3,
    }));

  it("ignora inválidos", () =>
    expect(parseExploreParams({ servico: "xyz,netflix", genero: "abc", nota: "abc", ordem: "foo", de: "19x" })).toEqual({
      services: ["netflix"], sort: "popularidade", page: 1,
    }));

  it("nota fora de 0..10 é ignorada", () => {
    expect(parseExploreParams({ nota: "11" }).minRating).toBeUndefined();
    expect(parseExploreParams({ nota: "-1" }).minRating).toBeUndefined();
    expect(parseExploreParams({ nota: "6.5" }).minRating).toBe(6.5);
  });

  it("ano fora de 1880..2100 é ignorado", () => {
    expect(parseExploreParams({ de: "1500" }).from).toBeUndefined();
    expect(parseExploreParams({ ate: "99999" }).to).toBeUndefined();
  });

  it("página limitada a 1..500", () => {
    expect(parseExploreParams({ pagina: "-3" }).page).toBe(1);
    expect(parseExploreParams({ pagina: "900" }).page).toBe(500);
    expect(parseExploreParams({ pagina: "x" }).page).toBe(1);
  });

  it("parâmetro repetido usa o primeiro", () => expect(parseExploreParams({ genero: ["27", "35"] }).genre).toBe(27));

  it("serviço vindo de várias caixas do formulário soma todos", () =>
    expect(parseExploreParams({ servico: ["netflix", "max,globoplay"] }).services).toEqual(["netflix", "max", "globoplay"]));

  it("serviço repetido não duplica", () => expect(parseExploreParams({ servico: "netflix,netflix" }).services).toEqual(["netflix"]));
});

describe("toDiscoverFilters", () => {
  it("sem serviço usa todos os IDs cobertos", () =>
    expect(toDiscoverFilters(parseExploreParams({})).providerIds).toEqual(ALL_COVERED_PROVIDER_IDS));

  it("serviços viram seus IDs", () =>
    expect(toDiscoverFilters(parseExploreParams({ servico: "netflix,max" })).providerIds).toEqual([8, 1796, 1899]));

  it("anos viram datas, ordem vira sort_by", () =>
    expect(toDiscoverFilters({ services: [], from: 2010, to: 2019, sort: "lancamento", page: 1 })).toEqual({
      providerIds: ALL_COVERED_PROVIDER_IDS, releasedFrom: "2010-01-01", releasedTo: "2019-12-31", sortBy: "primary_release_date.desc",
    }));

  it("gênero e nota", () =>
    expect(toDiscoverFilters({ services: [], genre: 27, minRating: 7, sort: "nota", page: 1 })).toMatchObject({
      genreIds: [27], minRating: 7, sortBy: "vote_average.desc",
    }));
});

describe("toSearchString", () => {
  it("omite padrões e página", () => expect(toSearchString({ services: [], sort: "popularidade", page: 4 })).toBe(""));

  it("ordem fixa dos parâmetros", () =>
    expect(toSearchString({ services: ["netflix", "max"], genre: 35, from: 2010, to: 2019, minRating: 7, sort: "nota", page: 1 })).toBe(
      "servico=netflix%2Cmax&genero=35&de=2010&ate=2019&nota=7&ordem=nota",
    ));

  it("ida e volta pela URL", () => {
    const q: ExploreQuery = { services: ["globoplay"], genre: 16, from: 2000, minRating: 6.5, sort: "lancamento", page: 1 };
    const back = parseExploreParams(Object.fromEntries(new URLSearchParams(toSearchString(q))));
    expect(back).toEqual(q);
  });
});
