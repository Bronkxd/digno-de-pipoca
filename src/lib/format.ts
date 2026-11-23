const ratingFormat = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const countFormat = new Intl.NumberFormat("pt-BR");

export function formatRating(voteAverage: number, voteCount: number): string {
  if (!voteCount) return "Sem avaliações";
  const votes = voteCount === 1 ? "1 voto" : `${countFormat.format(voteCount)} votos`;
  return `${ratingFormat.format(voteAverage)} · ${votes}`;
}

export function formatRuntime(minutes: number | null): string | null {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

export type TmdbImageSize = "w92" | "w185" | "w342" | "w500" | "w780" | "w1280" | "original";

export function tmdbImage(path: string | null, size: TmdbImageSize): string | null {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}
