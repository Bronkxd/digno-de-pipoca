import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getMovie } from "@/lib/tmdb/movie";
import { formatRuntime, tmdbImage } from "@/lib/format";
import { RatingBadge } from "@/components/RatingBadge";
import { PopcornBag } from "@/components/PopcornBag";
import { PosterRow } from "@/components/PosterRow";
import { Trailer } from "@/components/Trailer";
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
      <header className="noite faixa relative isolate -mt-6 overflow-hidden bg-foreground py-10 text-white">
        {backdrop && (
          <Image src={backdrop} alt="" fill preload sizes="100vw" className="-z-10 object-cover opacity-25" />
        )}
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end">
          {poster && (
            <div className="relative aspect-[2/3] w-40 shrink-0 overflow-hidden rounded-lg sm:w-56">
              <Image src={poster} alt={`Pôster de ${movie.title}`} fill loading="eager" sizes="(max-width: 639px) 160px, 224px" className="object-cover" />
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-4">
            <h1 className="text-4xl sm:text-5xl">
              {movie.title} {movie.year && <span className="whitespace-nowrap">({movie.year})</span>}
            </h1>
            <div className="text-base">
              <RatingBadge voteAverage={movie.voteAverage} voteCount={movie.voteCount} className="text-white" />
            </div>
            <ul className="flex flex-wrap items-center gap-3">
              {movie.certification && (
                <li className="rounded border border-white/70 px-1.5 py-0.5 text-xs font-semibold">
                  {movie.certification}
                </li>
              )}
              {runtime && <li>{runtime}</li>}
              {movie.genres.length > 0 && <li>{movie.genres.join(", ")}</li>}
            </ul>
            <p className="max-w-2xl text-lg leading-relaxed">{movie.overview}</p>
          </div>
          <PopcornBag
            size="big"
            voteAverage={movie.voteAverage}
            voteCount={movie.voteCount}
            className="hidden w-52 shrink-0 lg:block"
          />
        </div>
      </header>

      <WhereToWatch watch={movie.watch} />

      {movie.trailerKey && (
        <section aria-labelledby="trailer" className="space-y-3">
          <h2 id="trailer" className="text-2xl sm:text-3xl">Trailer</h2>
          <Trailer trailerKey={movie.trailerKey} title={movie.title} backdrop={backdrop} />
        </section>
      )}

      {(movie.director || movie.cast.length > 0) && (
        <section aria-labelledby="elenco" className="space-y-3">
          <h2 id="elenco" className="text-2xl sm:text-3xl">Direção e elenco</h2>
          {movie.director && (
            <p>
              <span className="text-muted">Direção:</span> {movie.director}
            </p>
          )}
          {movie.cast.length > 0 && (
            <ul className="grid gap-x-6 gap-y-5 min-[26rem]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              {movie.cast.map((c) => (
                <li key={`${c.name}-${c.character}`} className="flex items-center gap-3">
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-full bg-candy">
                    {c.profilePath && (
                      <Image src={tmdbImage(c.profilePath, "w185")!} alt="" fill sizes="56px" className="object-cover" />
                    )}
                  </span>
                  <span className="min-w-0 text-sm leading-snug font-semibold">
                    {c.name}
                    {c.character && <span className="block font-normal text-muted">{c.character}</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {movie.reviews.length > 0 && (
        <section aria-labelledby="resenhas" className="space-y-3">
          <h2 id="resenhas" className="text-2xl sm:text-3xl">Resenhas</h2>
          <ul className="grid gap-4 md:grid-cols-3">
            {movie.reviews.map((r) => (
              <li key={r.url} className="space-y-2 rounded-xl bg-surface p-5">
                <p className="flex items-center gap-2 font-medium">
                  {r.author}
                  {r.language === "en" && (
                    <span className="rounded bg-candy px-1.5 py-0.5 text-xs text-muted">em inglês</span>
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
