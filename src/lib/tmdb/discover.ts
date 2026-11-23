import { tmdbFetch, REVALIDATE } from "./client";
import type { DiscoverFilters, DiscoverPage, MovieSummary, TmdbMovieListItem, TmdbPagedResponse } from "./types";

/** Ordenar por nota sem mínimo de votos enche a lista de filmes com 1 voto. */
export const MIN_VOTES_FOR_RATING_SORT = 200;
/** Teto da API do TMDB para /discover. */
export const MAX_PAGES = 500;

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function buildDiscoverParams(f: DiscoverFilters, today: Date): Record<string, string> {
  const todayIso = isoDate(today);
  const params: Record<string, string> = {
    watch_region: "BR",
    with_watch_monetization_types: "flatrate",
    with_watch_providers: f.providerIds.join("|"),
    include_adult: "false",
    sort_by: f.sortBy,
    "primary_release_date.lte": f.releasedTo && f.releasedTo < todayIso ? f.releasedTo : todayIso,
  };
  if (f.genreIds?.length) params.with_genres = f.genreIds.join(",");
  if (f.releasedFrom) params["primary_release_date.gte"] = f.releasedFrom;
  if (f.minRating !== undefined) params["vote_average.gte"] = String(f.minRating);

  const minVotes =
    f.sortBy === "vote_average.desc" ? Math.max(f.minVotes ?? 0, MIN_VOTES_FOR_RATING_SORT) : f.minVotes;
  if (minVotes !== undefined) params["vote_count.gte"] = String(minVotes);

  return params;
}

export function toMovieSummary(m: TmdbMovieListItem): MovieSummary {
  return {
    id: m.id,
    title: m.title,
    posterPath: m.poster_path,
    releaseDate: m.release_date || null,
    voteAverage: m.vote_average,
    voteCount: m.vote_count,
  };
}

export function withPosterOnly(items: TmdbMovieListItem[]): MovieSummary[] {
  return items.filter((m) => m.poster_path).map(toMovieSummary);
}

export function clampPage(page: number): number {
  if (!Number.isFinite(page)) return 1;
  return Math.min(Math.max(Math.trunc(page), 1), MAX_PAGES);
}

export async function discoverMovies(f: DiscoverFilters, page = 1): Promise<DiscoverPage> {
  const safePage = clampPage(page);
  const data = await tmdbFetch<TmdbPagedResponse<TmdbMovieListItem>>(
    "/discover/movie",
    { ...buildDiscoverParams(f, new Date()), page: safePage },
    REVALIDATE.lists,
  );
  return {
    results: withPosterOnly(data.results),
    page: data.page,
    totalPages: Math.min(data.total_pages, MAX_PAGES),
  };
}
