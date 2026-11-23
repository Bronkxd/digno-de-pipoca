// "Me ajude a escolher": respostas <-> URL <-> filtros. Sem dependências de servidor.
import { ALL_COVERED_PROVIDER_IDS } from "@/config/services";
import type { DiscoverFilters } from "@/lib/tmdb/types";

type Option<K extends string> = { key: K; label: string };

export const MOODS = [
  { key: "rir", label: "Rir" },
  { key: "chorar", label: "Chorar" },
  { key: "medo", label: "Sentir medo" },
  { key: "adrenalina", label: "Adrenalina" },
  { key: "pensar", label: "Pensar" },
] as const satisfies Option<string>[];

export const TIMES = [
  { key: "90", label: "Até 1h30" },
  { key: "120", label: "Até 2h" },
  { key: "livre", label: "Sem pressa" },
] as const satisfies Option<string>[];

export const COMPANIES = [
  { key: "eu", label: "Só eu" },
  { key: "casal", label: "Casal" },
  { key: "familia", label: "Família com crianças" },
  { key: "amigos", label: "Amigos" },
] as const satisfies Option<string>[];

export type Mood = (typeof MOODS)[number]["key"];
export type Time = (typeof TIMES)[number]["key"];
export type Company = (typeof COMPANIES)[number]["key"];
export type Choice = { mood: Mood; time: Time; company: Company };

/** Idade máxima (classificação brasileira) quando há crianças. */
export const FAMILY_MAX_AGE = 10;
const HORROR = 27;
const FAMILY = 10751;
const ANIMATION = 16;
const MIN_RUNTIME = 60;

// Gêneros do TMDB: 35 comédia, 18 drama, 28 ação, 12 aventura, 53 thriller, 878 ficção, 9648 mistério, 36 história, 14 fantasia.
const MOOD_GENRES: Record<Mood, { any: number[]; without: number[] }> = {
  rir: { any: [35], without: [HORROR] },
  chorar: { any: [18], without: [35, 28, HORROR] },
  medo: { any: [HORROR], without: [ANIMATION, FAMILY] },
  adrenalina: { any: [28, 12, 53], without: [ANIMATION, FAMILY] },
  pensar: { any: [878, 9648, 36], without: [HORROR, ANIMATION, FAMILY] },
};

type RawParams = Record<string, string | string[] | undefined>;

function pick<K extends string>(options: readonly Option<K>[], raw: string | string[] | undefined): K | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return options.find((o) => o.key === value)?.key;
}

export function parseChoice(sp: RawParams): Choice | null {
  const mood = pick<Mood>(MOODS, sp.clima);
  const time = pick<Time>(TIMES, sp.tempo);
  const company = pick<Company>(COMPANIES, sp.companhia);
  return mood && time && company ? { mood, time, company } : null;
}

export function maxRuntime(c: Choice): number | undefined {
  return c.time === "livre" ? undefined : Number(c.time);
}

export function choiceFilters(c: Choice): DiscoverFilters {
  const genres = MOOD_GENRES[c.mood];
  const f: DiscoverFilters = {
    providerIds: ALL_COVERED_PROVIDER_IDS,
    anyGenreIds: genres.any,
    withoutGenreIds: genres.without,
    minRuntime: MIN_RUNTIME,
    maxRuntime: maxRuntime(c),
    minRating: 6.8,
    minVotes: 300,
    sortBy: "popularity.desc",
  };
  if (c.company === "eu") return { ...f, sortBy: "vote_average.desc", minVotes: 1000 };
  if (c.company === "amigos") return { ...f, minVotes: 1000 };
  if (c.company === "casal") return { ...f, withoutGenreIds: [...new Set([...genres.without, FAMILY])] };
  return {
    ...f,
    anyGenreIds: c.mood === "medo" ? [9648, 14] : genres.any,
    withoutGenreIds: c.mood === "chorar" ? [28, HORROR] : [HORROR],
    maxAge: FAMILY_MAX_AGE,
  };
}

export function choiceLabel(c: Choice): string {
  const label = <K extends string>(options: readonly Option<K>[], key: K) => options.find((o) => o.key === key)!.label;
  const lower = (s: string) => s[0].toLowerCase() + s.slice(1);
  return [label<Mood>(MOODS, c.mood), lower(label<Time>(TIMES, c.time)), lower(label<Company>(COMPANIES, c.company))].join(", ");
}
