import { notFound } from "next/navigation";
import { formatRating, tmdbImage } from "@/lib/format";
import { shareCard, shareSize } from "@/lib/share-card";
import { getMovie } from "@/lib/tmdb/movie";

export const alt = "Título, pôster e nota do filme no Digno de Pipoca";
export const size = shareSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movie = /^\d+$/.test(id) ? await getMovie(Number(id)) : null;
  if (!movie) notFound();

  return shareCard({
    title: movie.title,
    line: [movie.year, movie.genres.slice(0, 2).join(", ")].filter(Boolean).join(" · "),
    badge: movie.voteCount ? formatRating(movie.voteAverage, movie.voteCount).split(" ")[0] : "Sem nota",
    voteAverage: movie.voteAverage,
    voteCount: movie.voteCount,
    poster: tmdbImage(movie.posterPath, "w342"),
    cache: "public, max-age=3600, s-maxage=86400",
  });
}
