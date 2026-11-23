import Link from "next/link";
import type { MovieSummary } from "@/lib/tmdb/types";
import { MovieCard } from "./MovieCard";

export function PosterRow({ title, href, movies }: { title: string; href: string; movies: MovieSummary[] }) {
  if (movies.length === 0) return null;
  const headingId = `row-${title.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}`;

  return (
    <section aria-labelledby={headingId} className="space-y-3">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id={headingId} className="text-lg font-semibold sm:text-xl">
          {title}
        </h2>
        <Link href={href} className="shrink-0 text-sm text-accent hover:underline">
          Ver tudo →
        </Link>
      </div>
      <ul className="-mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:scroll-px-0 sm:px-0">
        {movies.map((m) => (
          <li key={m.id} className="w-32 shrink-0 snap-start sm:w-40">
            <MovieCard movie={m} />
          </li>
        ))}
      </ul>
    </section>
  );
}
