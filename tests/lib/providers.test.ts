import { describe, it, expect } from "vitest";
import { mapWatchProviders, isAvailableOnCovered } from "@/lib/tmdb/providers";
import { getServiceBySlug, ALL_COVERED_PROVIDER_IDS } from "@/config/services";
import type { TmdbProvider, TmdbWatchProvidersResult } from "@/lib/tmdb/types";

const p = (provider_id: number, provider_name: string, display_priority: number): TmdbProvider => ({
  provider_id, provider_name, display_priority, logo_path: `/${provider_id}.png`,
});

const fixture: TmdbWatchProvidersResult = {
  id: 1,
  results: {
    BR: {
      link: "https://www.themoviedb.org/movie/1/watch?locale=BR",
      flatrate: [p(227, "Telecine", 20), p(8, "Netflix", 5), p(1825, "Max Amazon Channel", 40), p(307, "Globoplay", 10)],
      rent: [p(2, "Apple TV", 1)],
    },
    US: { flatrate: [p(15, "Hulu", 1)] },
  },
};

describe("mapWatchProviders", () => {
  it("só flatrate do BR, cobertos primeiro, cada grupo por prioridade", () =>
    expect(mapWatchProviders(fixture).providers.map((x) => x.id)).toEqual([8, 307, 227, 1825]));
  it("marca canal e cobertura", () => {
    const ch = mapWatchProviders(fixture).providers.find((x) => x.id === 1825)!;
    expect(ch).toMatchObject({ isChannel: true, isCovered: false, name: "Max Amazon Channel", logoPath: "/1825.png" });
    expect(mapWatchProviders(fixture).providers[0]).toMatchObject({ isCovered: true, isChannel: false });
  });
  it("usa o link do BR", () => expect(mapWatchProviders(fixture).link).toBe(fixture.results.BR!.link));
  it("sem BR devolve vazio", () => expect(mapWatchProviders({ id: 1, results: {} })).toEqual({ link: null, providers: [] }));
  it("indefinido devolve vazio", () => expect(mapWatchProviders(undefined)).toEqual({ link: null, providers: [] }));
});

describe("isAvailableOnCovered", () => {
  it("disponível se algum flatrate coberto", () => expect(isAvailableOnCovered(fixture)).toBe(true));
  it("só canal ou aluguel é indisponível", () =>
    expect(isAvailableOnCovered({ results: { BR: { flatrate: [p(1825, "Max Amazon Channel", 1)], rent: [p(8, "Netflix", 1)] } } })).toBe(false));
  it("plano com anúncios conta", () =>
    expect(isAvailableOnCovered({ results: { BR: { flatrate: [p(1796, "Netflix basic with Ads", 1)] } } })).toBe(true));
  it("indefinido é indisponível", () => expect(isAvailableOnCovered(undefined)).toBe(false));
});

describe("services config", () => {
  it("getServiceBySlug", () => {
    expect(getServiceBySlug("netflix")?.name).toBe("Netflix");
    expect(getServiceBySlug("xyz")).toBeUndefined();
  });
  it("ALL_COVERED_PROVIDER_IDS junta todos os IDs", () => expect(ALL_COVERED_PROVIDER_IDS).toEqual([8, 1796, 119, 2100, 337, 1899, 307, 350, 531, 2303]));
});
