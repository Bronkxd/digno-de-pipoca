import Image from "next/image";
import Link from "next/link";
import { tmdbImage } from "@/lib/format";
import type { MovieSummary } from "@/lib/tmdb/types";
import { RatingBadge } from "./RatingBadge";

export function MovieCard({ movie }: { movie: MovieSummary }) {
  const poster = tmdbImage(movie.posterPath, "w342");
  const year = movie.releaseDate?.slice(0, 4);

  return (
    <Link href={`/filme/${movie.id}`} className="group block w-full">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-surface transition duration-200 group-hover:-translate-y-1.5 group-hover:-rotate-1 motion-reduce:transform-none">
        {poster ? (
          <Image
            src={poster}
            alt={`Pôster de ${movie.title}`}
            fill
            sizes="(max-width: 640px) 45vw, 210px"
            className="object-cover"
          />
        ) : (
          <div aria-hidden className="flex h-full items-center justify-center p-3 text-center text-sm text-muted">
            {movie.title}
          </div>
        )}
      </div>
      <div className="mt-2 space-y-0.5">
        <p className="line-clamp-2 font-semibold leading-snug group-hover:text-accent">{movie.title}</p>
        {year && <p className="text-sm text-muted">{year}</p>}
        <RatingBadge voteAverage={movie.voteAverage} voteCount={movie.voteCount} />
      </div>
    </Link>
  );
}
