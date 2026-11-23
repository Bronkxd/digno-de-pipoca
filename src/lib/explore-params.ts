// Filtros do explorar <-> parâmetros de URL (servico, genero, de, ate, nota, ordem, pagina).
// Sem dependências de servidor: pode ser usado em qualquer lugar.
import { ALL_COVERED_PROVIDER_IDS, getServiceBySlug } from "@/config/services";
import type { DiscoverFilters, SortBy } from "@/lib/tmdb/types";

export type ExploreSort = "popularidade" | "nota" | "lancamento";

export type ExploreQuery = {
  services: string[];
  genre?: number;
  from?: number;
  to?: number;
  minRating?: number;
  sort: ExploreSort;
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

const SORTS: Record<ExploreSort, SortBy> = {
  popularidade: "popularity.desc",
  nota: "vote_average.desc",
  lancamento: "primary_release_date.desc",
};
const MAX_PAGES = 500;
const MIN_YEAR = 1880;
const MAX_YEAR = 2100;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function int(v: string | undefined): number | undefined {
  if (!v || !/^-?\d+$/.test(v.trim())) return undefined;
  return Number(v);
}

function year(v: string | undefined): number | undefined {
  const n = int(v);
  return n !== undefined && n >= MIN_YEAR && n <= MAX_YEAR ? n : undefined;
}

export function parseExploreParams(sp: RawParams): ExploreQuery {
  const services = [
    ...new Set(
      [sp.servico ?? []]
        .flat()
        .flatMap((v) => v.split(","))
        .map((s) => s.trim())
        .filter((s) => getServiceBySlug(s)),
    ),
  ];

  const genreNum = int(first(sp.genero));
  const ratingRaw = first(sp.nota);
  const rating = ratingRaw && /^\d+(\.\d+)?$/.test(ratingRaw.trim()) ? Number(ratingRaw) : undefined;
  const sortRaw = first(sp.ordem);
  const pageNum = int(first(sp.pagina)) ?? 1;

  const q: ExploreQuery = {
    services,
    sort: sortRaw && sortRaw in SORTS ? (sortRaw as ExploreSort) : "popularidade",
    page: Math.min(Math.max(pageNum, 1), MAX_PAGES),
  };
  if (genreNum !== undefined && genreNum > 0) q.genre = genreNum;
  const from = year(first(sp.de));
  if (from !== undefined) q.from = from;
  const to = year(first(sp.ate));
  if (to !== undefined) q.to = to;
  if (rating !== undefined && rating >= 0 && rating <= 10) q.minRating = rating;
  return q;
}

export function toDiscoverFilters(q: ExploreQuery): DiscoverFilters {
  const providerIds = q.services.length
    ? q.services.flatMap((s) => getServiceBySlug(s)?.tmdbProviderIds ?? [])
    : ALL_COVERED_PROVIDER_IDS;

  const f: DiscoverFilters = { providerIds, sortBy: SORTS[q.sort] };
  if (q.genre !== undefined) f.genreIds = [q.genre];
  if (q.from !== undefined) f.releasedFrom = `${q.from}-01-01`;
  if (q.to !== undefined) f.releasedTo = `${q.to}-12-31`;
  if (q.minRating !== undefined) f.minRating = q.minRating;
  return f;
}

export function toSearchString(q: ExploreQuery): string {
  const sp = new URLSearchParams();
  if (q.services.length) sp.set("servico", q.services.join(","));
  if (q.genre !== undefined) sp.set("genero", String(q.genre));
  if (q.from !== undefined) sp.set("de", String(q.from));
  if (q.to !== undefined) sp.set("ate", String(q.to));
  if (q.minRating !== undefined) sp.set("nota", String(q.minRating));
  if (q.sort !== "popularidade") sp.set("ordem", q.sort);
  return sp.toString();
}
