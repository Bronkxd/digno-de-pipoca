import type { HomeList } from "@/config/lists";
import { discoverMovies } from "@/lib/tmdb/discover";
import { toDiscoverFilters, type ExploreQuery } from "@/lib/explore-params";
import type { DiscoverPage } from "@/lib/tmdb/types";

export type Catalog = { rows: { list: HomeList; page: DiscoverPage }[]; grid: DiscoverPage | null };

/** Faixas + grade de uma página de serviço ou gênero. Falhas parciais são toleradas; se tudo falhar, lança o erro. */
export async function loadCatalog(lists: HomeList[], q: ExploreQuery): Promise<Catalog> {
  const [rows, [grid]] = await Promise.all([
    Promise.allSettled(lists.map((l) => discoverMovies(l.filters, 1))),
    Promise.allSettled([discoverMovies(toDiscoverFilters(q), 1)]),
  ]);
  if (grid.status === "rejected" && rows.every((r) => r.status === "rejected")) throw grid.reason;
  return {
    rows: rows.flatMap((r, i) => (r.status === "fulfilled" ? [{ list: lists[i], page: r.value }] : [])),
    grid: grid.status === "fulfilled" ? grid.value : null,
  };
}
