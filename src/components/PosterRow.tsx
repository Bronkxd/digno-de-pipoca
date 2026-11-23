import Link from "next/link";
import type { MovieSummary } from "@/lib/tmdb/types";
import { MovieCard } from "./MovieCard";
import { RowScroller } from "./RowScroller";

export function PosterRow({ title, href, movies, highlight = false }: {
  title: string;
  href: string;
  movies: MovieSummary[];
  highlight?: boolean;
}) {
  if (movies.length === 0) return null;
  const headingId = `row-${title.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}`;

  return (
    <section aria-labelledby={headingId} className={`space-y-3 ${highlight ? "faixa bg-candy py-10" : ""}`}>
      <div className="flex items-baseline justify-between gap-4">
        <h2 id={headingId} className="text-2xl sm:text-3xl">
          {title}
        </h2>
        <Link href={href} className="shrink-0 font-semibold text-accent-dark underline-offset-4 hover:underline">
          Ver tudo
        </Link>
      </div>
      <RowScroller label={title}>
        {movies.map((m) => (
          <li key={m.id} className="w-36 shrink-0 snap-start sm:w-44">
            <MovieCard movie={m} />
          </li>
        ))}
      </RowScroller>
    </section>
  );
}
