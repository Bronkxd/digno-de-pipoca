import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getMovie } from "@/lib/tmdb/movie";
import { formatRuntime, tmdbImage } from "@/lib/format";
import { RatingBadge } from "@/components/RatingBadge";
import { PosterRow } from "@/components/PosterRow";
import { WhereToWatch } from "@/components/WhereToWatch";

const loadMovie = cache(async (rawId: string) => {
  if (!/^\d+$/.test(rawId)) return null;
  return getMovie(Number(rawId));
});

export async function generateMetadata({ params }: PageProps<"/filme/[id]">): Promise<Metadata> {
  const { id } = await params;
  const movie = await loadMovie(id);
  if (!movie) return { title: "Filme não encontrado" };
  return {
    title: movie.year ? `${movie.title} (${movie.year})` : movie.title,
    description: movie.overview,
  };
}

export default async function MoviePage({ params }: PageProps<"/filme/[id]">) {
  const { id } = await params;
  const movie = await loadMovie(id);
  if (!movie) notFound();

  const backdrop = tmdbImage(movie.backdropPath, "w1280");
  const poster = tmdbImage(movie.posterPath, "w500");
  const runtime = formatRuntime(movie.runtime);

  return (
    <article className="space-y-10">
      <header className="relative -mx-4 -mt-6 overflow-hidden px-4 pt-6 pb-2 sm:rounded-b-2xl">
        {backdrop && (
          <Image src={backdrop} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-25" />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="flex flex-col gap-6 sm:flex-row">
          {poster && (
            <div className="relative aspect-[2/3] w-40 shrink-0 overflow-hidden rounded-xl shadow-2xl sm:w-56">
              <Image src={poster} alt={`Pôster de ${movie.title}`} fill sizes="224px" className="object-cover" />
            </div>
          )}
          <div className="space-y-3 sm:self-end">
            <h1 className="text-3xl font-bold sm:text-4xl">
              {movie.title} {movie.year && <span className="font-normal text-muted">({movie.year})</span>}
            </h1>
            <div className="text-base">
              <RatingBadge voteAverage={movie.voteAverage} voteCount={movie.voteCount} />
            </div>
            <ul className="flex flex-wrap items-center gap-2 text-sm text-muted">
              {movie.certification && (
                <li className="rounded border border-white/30 px-1.5 py-0.5 text-xs font-semibold text-foreground">
                  {movie.certification}
                </li>
              )}
              {runtime && <li>{runtime}</li>}
              {movie.genres.length > 0 && <li>{movie.genres.join(", ")}</li>}
            </ul>
            <p className="max-w-3xl leading-relaxed">{movie.overview}</p>
          </div>
        </div>
      </header>

      <WhereToWatch watch={movie.watch} />

      {movie.trailerKey && (
        <section aria-labelledby="trailer" className="space-y-3">
          <h2 id="trailer" className="text-lg font-semibold">Trailer</h2>
          <div className="aspect-video w-full max-w-3xl overflow-hidden rounded-xl bg-surface">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${movie.trailerKey}`}
              title={`Trailer de ${movie.title}`}
              className="h-full w-full"
              loading="lazy"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      )}

      {(movie.director || movie.cast.length > 0) && (
        <section aria-labelledby="elenco" className="space-y-3">
          <h2 id="elenco" className="text-lg font-semibold">Direção e elenco</h2>
          {movie.director && (
            <p>
              <span className="text-muted">Direção:</span> {movie.director}
            </p>
          )}
          {movie.cast.length > 0 && (
            <ul className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3 lg:grid-cols-5">
              {movie.cast.map((c) => (
                <li key={`${c.name}-${c.character}`}>
                  {c.name}
                  {c.character && <span className="block text-muted">{c.character}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {movie.reviews.length > 0 && (
        <section aria-labelledby="resenhas" className="space-y-3">
          <h2 id="resenhas" className="text-lg font-semibold">Resenhas</h2>
          <ul className="grid gap-4 md:grid-cols-3">
            {movie.reviews.map((r) => (
              <li key={r.url} className="space-y-2 rounded-xl bg-surface p-4 text-sm">
                <p className="flex items-center gap-2 font-medium">
                  {r.author}
                  {r.language === "en" && (
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-muted">em inglês</span>
                  )}
                </p>
                <p className="leading-relaxed text-muted">{r.excerpt}</p>
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                  Ler resenha completa
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <PosterRow title="Veja também" href="/explorar" movies={movie.recommendations} />
    </article>
  );
}
