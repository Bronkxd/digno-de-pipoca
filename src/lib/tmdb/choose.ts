import { choiceFilters, FAMILY_MAX_AGE, maxRuntime, type Choice } from "@/lib/choose";
import { tmdbFetch, REVALIDATE } from "./client";
import { discoverMovies } from "./discover";
import type { MovieSummary, TmdbReleaseDates } from "./types";

const DAY_MS = 86_400_000;
const MAX_SUGGESTIONS = 12;

type Details = { runtime?: number | null; release_dates?: TmdbReleaseDates };

/** Todas as classificações brasileiras conhecidas precisam caber na idade; sem nenhuma, não passa. */
function fitsAge(rd: TmdbReleaseDates | undefined, maxAge: number): boolean {
  const known = (rd?.results ?? [])
    .filter((r) => r.iso_3166_1 === "BR")
    .flatMap((r) => r.release_dates.map((d) => d.certification.trim()))
    .filter(Boolean);
  return known.length > 0 && known.every((c) => c === "L" || (/^A?\d+$/.test(c) && Number(c.replace("A", "")) <= maxAge));
}

/** Os filtros de duração e idade do TMDB são aproximados: aqui vale o que está nos detalhes do filme. */
async function confirmed(m: MovieSummary, c: Choice): Promise<boolean> {
  try {
    const d = await tmdbFetch<Details>(`/movie/${m.id}`, { append_to_response: "release_dates" }, REVALIDATE.movie);
    const limit = maxRuntime(c);
    if (limit !== undefined && !(d.runtime && d.runtime <= limit)) return false;
    return c.company !== "familia" || fitsAge(d.release_dates, FAMILY_MAX_AGE);
  } catch {
    return false;
  }
}

export async function findMovies(c: Choice, today: Date): Promise<MovieSummary[]> {
  const filters = choiceFilters(c);
  const needsCheck = c.time !== "livre" || c.company === "familia";

  const found: MovieSummary[] = [];
  for (let page = 1; page <= 2; page++) {
    const result = await discoverMovies(filters, page);
    const ok = needsCheck ? await Promise.all(result.results.map((m) => confirmed(m, c))) : null;
    const seen = new Set(found.map((m) => m.id));
    found.push(...result.results.filter((m, i) => !seen.has(m.id) && (ok?.[i] ?? true)));
    if (found.length >= MAX_SUGGESTIONS || page >= result.totalPages) break;
  }

  const picked = found.slice(0, MAX_SUGGESTIONS);
  if (picked.length === 0) return [];
  const start = Math.floor(today.getTime() / DAY_MS) % picked.length;
  return [...picked.slice(start), ...picked.slice(0, start)];
}
