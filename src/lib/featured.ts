import type { MovieSummary } from "@/lib/tmdb/types";

const DAY_MS = 86_400_000;
const FEATURED = { minRating: 7, minVotes: 200, max: 12 };

/** Filmes do destaque: alterna as listas, sem repetir, e começa por um diferente a cada dia. */
export function pickFeatured(lists: MovieSummary[][], today: Date): MovieSummary[] {
  const seen = new Set<number>();
  const pool: MovieSummary[] = [];
  const longest = Math.max(0, ...lists.map((l) => l.length));
  for (let i = 0; i < longest; i++) {
    for (const list of lists) {
      const m = list[i];
      if (!m || seen.has(m.id) || m.voteAverage < FEATURED.minRating || m.voteCount < FEATURED.minVotes) continue;
      seen.add(m.id);
      pool.push(m);
    }
  }
  const picked = pool.slice(0, FEATURED.max);
  if (picked.length === 0) return [];
  const start = Math.floor(today.getTime() / DAY_MS) % picked.length;
  return [...picked.slice(start), ...picked.slice(0, start)];
}
