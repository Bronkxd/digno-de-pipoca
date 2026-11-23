import { plainText } from "@/lib/plain-text";
import { tmdbFetch, TmdbError, REVALIDATE } from "./client";
import { withPosterOnly } from "./discover";
import { isAvailableOnCovered, mapWatchProviders } from "./providers";
import type {
  CastMember,
  MovieDetails,
  MovieSummary,
  ReviewExcerpt,
  TmdbCredits,
  TmdbMovieDetailsResponse,
  TmdbPagedResponse,
  TmdbReleaseDates,
  TmdbReview,
  TmdbVideo,
  TmdbWatchProvidersResult,
} from "./types";

const NO_OVERVIEW = "Sinopse indisponível.";
const MAX_RECS_CHECKED = 20;
const MAX_RECS_SHOWN = 12;
const MAX_REVIEWS = 3;
const EXCERPT_LENGTH = 400;
/** Só o começo da resenha interessa; evita processar textos enormes. */
const MAX_REVIEW_SOURCE = 4000;
const MAX_CAST = 10;

export function pickTrailer(videos: TmdbVideo[]): string | null {
  const trailers = videos.filter((v) => v.site === "YouTube" && v.type === "Trailer");
  const found =
    trailers.find((v) => v.iso_639_1 === "pt") ??
    trailers.find((v) => v.iso_639_1 === "en") ??
    trailers.find((v) => v.official);
  return found?.key ?? null;
}

export function pickBrCertification(rd: TmdbReleaseDates): string | null {
  const br = rd.results.find((r) => r.iso_3166_1 === "BR");
  return br?.release_dates.find((d) => d.certification.trim())?.certification.trim() ?? null;
}

export function mapCredits(c: TmdbCredits): { director: string | null; cast: CastMember[] } {
  return {
    director: c.crew.find((p) => p.job === "Director")?.name ?? null,
    cast: [...c.cast]
      .sort((a, b) => a.order - b.order)
      .slice(0, MAX_CAST)
      .map((p) => ({ name: p.name, character: p.character, profilePath: p.profile_path })),
  };
}

function excerpt(text: string): string {
  const clean = plainText(text.slice(0, MAX_REVIEW_SOURCE));
  if (clean.length <= EXCERPT_LENGTH) return clean;
  const cut = clean.slice(0, EXCERPT_LENGTH);
  const lastSpace = Math.max(cut.lastIndexOf(" "), cut.lastIndexOf("\n"));
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

export function toReviewExcerpts(reviews: TmdbReview[], language: "pt-BR" | "en"): ReviewExcerpt[] {
  return reviews
    .map((r) => ({ author: r.author, excerpt: excerpt(r.content), url: r.url, language }))
    .filter((r) => r.excerpt)
    .slice(0, MAX_REVIEWS);
}

async function getOverview(id: number, overview: string): Promise<string> {
  if (overview.trim()) return overview;
  try {
    const en = await tmdbFetch<TmdbMovieDetailsResponse>(`/movie/${id}`, { language: "en-US" }, REVALIDATE.movie);
    return en.overview?.trim() ? en.overview : NO_OVERVIEW;
  } catch {
    return NO_OVERVIEW;
  }
}

async function getReviews(id: number): Promise<ReviewExcerpt[]> {
  try {
    const pt = await tmdbFetch<TmdbPagedResponse<TmdbReview>>(`/movie/${id}/reviews`, { language: "pt-BR" }, REVALIDATE.movie);
    if (pt.results.length) return toReviewExcerpts(pt.results, "pt-BR");
    const en = await tmdbFetch<TmdbPagedResponse<TmdbReview>>(`/movie/${id}/reviews`, { language: "en-US" }, REVALIDATE.movie);
    return toReviewExcerpts(en.results, "en");
  } catch {
    return [];
  }
}

async function availableRecommendations(recs: MovieSummary[]): Promise<MovieSummary[]> {
  const checked = await Promise.all(
    recs.slice(0, MAX_RECS_CHECKED).map(async (m) => {
      try {
        const providers = await tmdbFetch<TmdbWatchProvidersResult>(`/movie/${m.id}/watch/providers`, {}, REVALIDATE.movie);
        return isAvailableOnCovered(providers) ? m : null;
      } catch {
        return null;
      }
    }),
  );
  return checked.filter((m): m is MovieSummary => m !== null).slice(0, MAX_RECS_SHOWN);
}

export async function getMovie(id: number): Promise<MovieDetails | null> {
  let data: TmdbMovieDetailsResponse;
  try {
    data = await tmdbFetch<TmdbMovieDetailsResponse>(
      `/movie/${id}`,
      {
        append_to_response: "videos,credits,release_dates,watch/providers,recommendations",
        include_video_language: "pt,en",
      },
      REVALIDATE.movie,
    );
  } catch (e) {
    if (e instanceof TmdbError && e.status === 404) return null;
    throw e;
  }

  const [overview, reviews, recommendations] = await Promise.all([
    getOverview(id, data.overview ?? ""),
    getReviews(id),
    availableRecommendations(withPosterOnly(data.recommendations?.results ?? [])),
  ]);
  const credits = mapCredits(data.credits ?? { cast: [], crew: [] });
  const year = Number.parseInt(data.release_date?.slice(0, 4) ?? "", 10);

  return {
    id: data.id,
    title: data.title,
    year: Number.isFinite(year) ? year : null,
    posterPath: data.poster_path,
    backdropPath: data.backdrop_path,
    runtime: data.runtime,
    genres: data.genres.map((g) => g.name),
    overview,
    certification: pickBrCertification(data.release_dates ?? { results: [] }),
    voteAverage: data.vote_average,
    voteCount: data.vote_count,
    trailerKey: pickTrailer(data.videos?.results ?? []),
    director: credits.director,
    cast: credits.cast,
    watch: mapWatchProviders(data["watch/providers"]),
    reviews,
    recommendations,
  };
}
