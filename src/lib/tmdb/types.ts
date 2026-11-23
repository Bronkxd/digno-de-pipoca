// ---- Tipos do app ----

export type MovieSummary = {
  id: number;
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  overview?: string;
  voteAverage: number;
  voteCount: number;
};

export type SortBy = "popularity.desc" | "vote_average.desc" | "primary_release_date.desc";

export type DiscoverFilters = {
  providerIds: number[];
  genreIds?: number[]; // todos (E)
  anyGenreIds?: number[]; // qualquer um (OU)
  withoutGenreIds?: number[];
  minRuntime?: number;
  maxRuntime?: number;
  maxAge?: number; // classificação brasileira
  releasedFrom?: string; // "YYYY-MM-DD"
  releasedTo?: string; // "YYYY-MM-DD"
  minRating?: number;
  minVotes?: number;
  sortBy: SortBy;
};

export type DiscoverPage = { results: MovieSummary[]; page: number; totalPages: number };

export type ProviderBadge = {
  id: number;
  name: string;
  logoPath: string | null;
  isCovered: boolean;
  isChannel: boolean;
};

export type WatchInfo = { link: string | null; providers: ProviderBadge[] };

export type ReviewExcerpt = { author: string; excerpt: string; url: string; language: "pt-BR" | "en" };

export type CastMember = { name: string; character: string; profilePath: string | null };

export type MovieDetails = {
  id: number;
  title: string;
  year: number | null;
  posterPath: string | null;
  backdropPath: string | null;
  runtime: number | null;
  genres: string[];
  overview: string;
  certification: string | null;
  voteAverage: number;
  voteCount: number;
  trailerKey: string | null;
  director: string | null;
  cast: CastMember[];
  watch: WatchInfo;
  reviews: ReviewExcerpt[];
  recommendations: MovieSummary[];
};

// ---- Tipos crus do TMDB (campos como na documentação) ----

export type TmdbMovieListItem = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date?: string;
  overview?: string;
  vote_average: number;
  vote_count: number;
};

export type TmdbPagedResponse<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
};

export type TmdbProvider = {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority: number;
};

export type TmdbCountryProviders = {
  link?: string;
  flatrate?: TmdbProvider[];
  rent?: TmdbProvider[];
  buy?: TmdbProvider[];
  ads?: TmdbProvider[];
  free?: TmdbProvider[];
};

export type TmdbWatchProvidersResult = {
  id?: number;
  results: Record<string, TmdbCountryProviders | undefined>;
};

export type TmdbVideo = {
  key: string;
  site: string;
  type: string;
  official: boolean;
  iso_639_1: string;
  name: string;
};

export type TmdbReleaseDates = {
  results: { iso_3166_1: string; release_dates: { certification: string; type: number }[] }[];
};

export type TmdbCredits = {
  cast: { name: string; character: string; profile_path: string | null; order: number }[];
  crew: { name: string; job: string }[];
};

export type TmdbReview = {
  author: string;
  content: string;
  url: string;
};

export type TmdbMovieDetailsResponse = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number | null;
  genres: { id: number; name: string }[];
  vote_average: number;
  vote_count: number;
  videos?: { results: TmdbVideo[] };
  credits?: TmdbCredits;
  release_dates?: TmdbReleaseDates;
  "watch/providers"?: TmdbWatchProvidersResult;
  recommendations?: TmdbPagedResponse<TmdbMovieListItem>;
};
