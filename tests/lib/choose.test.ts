import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/tmdb/client", () => ({ tmdbFetch: vi.fn(), REVALIDATE: { lists: 1, movie: 2 } }));
import { tmdbFetch } from "@/lib/tmdb/client";
import { parseChoice, choiceFilters, choiceLabel, type Choice } from "@/lib/choose";
import { buildDiscoverParams } from "@/lib/tmdb/discover";
import { findMovies } from "@/lib/tmdb/choose";

const today = new Date("2026-11-23T12:00:00Z");
const choice = (over: Partial<Choice> = {}): Choice => ({ mood: "rir", time: "livre", company: "eu", ...over });

describe("parseChoice", () => {
  it("lê as três respostas", () =>
    expect(parseChoice({ clima: "medo", tempo: "90", companhia: "familia" })).toEqual({ mood: "medo", time: "90", company: "familia" }));
  it("faltando ou inválida devolve null", () => {
    expect(parseChoice({ clima: "medo", tempo: "90" })).toBeNull();
    expect(parseChoice({ clima: "xyz", tempo: "90", companhia: "eu" })).toBeNull();
    expect(parseChoice({ clima: "toString", tempo: "90", companhia: "eu" })).toBeNull();
    expect(parseChoice({})).toBeNull();
  });
  it("repetida usa a primeira", () =>
    expect(parseChoice({ clima: ["rir", "medo"], tempo: "120", companhia: "eu" })?.mood).toBe("rir"));
});

describe("choiceFilters", () => {
  it("clima vira gêneros combinados por OU e a nota mínima sempre vale", () => {
    const p = buildDiscoverParams(choiceFilters(choice({ mood: "adrenalina" })), today);
    expect(p.with_genres).toBe("28|12|53");
    expect(p["vote_average.gte"]).toBe("6.8");
    expect(Number(p["vote_count.gte"])).toBeGreaterThanOrEqual(300);
  });
  it("tempo vira duração", () => {
    const p = buildDiscoverParams(choiceFilters(choice({ time: "90" })), today);
    expect(p).toMatchObject({ "with_runtime.gte": "60", "with_runtime.lte": "90" });
    expect(buildDiscoverParams(choiceFilters(choice()), today)["with_runtime.lte"]).toBeUndefined();
  });
  it("família: até 10 anos e nunca terror, em qualquer clima", () => {
    for (const mood of ["rir", "chorar", "medo", "adrenalina", "pensar"] as const) {
      const p = buildDiscoverParams(choiceFilters(choice({ mood, company: "familia" })), today);
      expect(p).toMatchObject({ certification_country: "BR", "certification.lte": "10" });
      expect(p.without_genres.split(",")).toContain("27");
      expect(p.with_genres.split("|")).not.toContain("27");
    }
  });
  it("casal deixa de fora filmes infantis", () =>
    expect(buildDiscoverParams(choiceFilters(choice({ company: "casal" })), today).without_genres.split(",")).toContain("10751"));
});

describe("choiceLabel", () => {
  it("resume as respostas", () =>
    expect(choiceLabel(choice({ time: "90", company: "familia" }))).toBe("Rir, até 1h30, família com crianças"));
});

describe("findMovies", () => {
  const item = (id: number) => ({ id, title: `F${id}`, poster_path: "/p.jpg", release_date: "2020-01-01", vote_average: 8, vote_count: 900 });
  const details: Record<number, unknown> = {};
  const cert = (...c: string[]) => ({ results: [{ iso_3166_1: "BR", release_dates: c.map((certification) => ({ certification, type: 3 })) }] });
  let items = [1, 2, 3];

  beforeEach(() => {
    vi.mocked(tmdbFetch).mockReset().mockImplementation(async (path: string) => {
      if (path === "/discover/movie") return { page: 1, total_pages: 1, total_results: 3, results: items.map(item) } as never;
      const d = details[Number(path.split("/")[2])];
      if (!d) throw new Error("falhou");
      return d as never;
    });
  });

  const ids = async (c: Choice) => (await findMovies(c, today)).map((m) => m.id).sort();

  it("confere a duração real e descarta quem passa, não informa ou falha", async () => {
    items = [1, 2, 3, 4];
    Object.assign(details, { 1: { runtime: 90 }, 2: { runtime: 101 }, 3: { runtime: 0 } });
    expect(await ids(choice({ time: "90" }))).toEqual([1]);
  });

  it("família: basta uma classificação acima de 10, ou nenhuma, para ficar de fora", async () => {
    items = [5, 6, 7, 8];
    Object.assign(details, {
      5: { runtime: 100, release_dates: cert("L", "") },
      6: { runtime: 100, release_dates: cert("10", "12") },
      7: { runtime: 100, release_dates: cert("") },
      8: { runtime: 100, release_dates: cert("10") },
    });
    expect(await ids(choice({ company: "familia" }))).toEqual([5, 8]);
  });

  it("sem limite não gasta chamadas de detalhe", async () => {
    items = [1, 2, 3];
    await findMovies(choice(), today);
    expect(vi.mocked(tmdbFetch).mock.calls.every(([p]) => p === "/discover/movie")).toBe(true);
  });

  it("no máximo 12 e começa por outro a cada dia", async () => {
    items = Array.from({ length: 20 }, (_, i) => i + 100);
    const a = await findMovies(choice(), today);
    const b = await findMovies(choice(), new Date(today.getTime() + 86_400_000));
    expect(a).toHaveLength(12);
    expect(a[0].id).not.toBe(b[0].id);
  });
});
