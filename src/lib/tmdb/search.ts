import { tmdbFetch, REVALIDATE } from "./client";
import { clampPage, MAX_PAGES, toMovieSummary } from "./discover";
import type { DiscoverPage, TmdbMovieListItem, TmdbPagedResponse } from "./types";

export async function searchMovies(query: string, page = 1): Promise<DiscoverPage> {
  const q = query.trim();
  if (!q) return { results: [], page: 1, totalPages: 0 };

  const data = await tmdbFetch<TmdbPagedResponse<TmdbMovieListItem>>(
    "/search/movie",
    { query: q, region: "BR", include_adult: "false", page: clampPage(page) },
    REVALIDATE.lists,
  );
  return {
    results: data.results.map(toMovieSummary),
    page: data.page,
    totalPages: Math.min(data.total_pages, MAX_PAGES),
  };
}
