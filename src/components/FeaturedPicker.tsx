"use client";

import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatRating, tmdbImage } from "@/lib/format";
import type { MovieSummary } from "@/lib/tmdb/types";
import { Kernel, PopcornBag } from "./PopcornBag";

const POSTER_SIZES = "(max-width: 639px) 169px, (max-width: 1023px) 211px, 253px";

const BURST = Array.from({ length: 16 }, (_, i) => {
  const angle = Math.PI * (1.08 + (0.84 * i) / 15);
  const distance = 190 + ((i * 53) % 110);
  return { x: Math.round(Math.cos(angle) * distance), y: Math.round(Math.sin(angle) * distance) };
});

/** Destaque da página inicial: o pôster sai do saquinho e o botão estoura outro filme. */
export function FeaturedPicker({ movies, heading = "O que vale a pena assistir hoje?", note, helpLink = false }: {
  movies: MovieSummary[];
  heading?: string;
  note?: string;
  helpLink?: boolean;
}) {
  const [turn, setTurn] = useState(0);
  const movie = movies[turn % movies.length];
  const next = movies[(turn + 1) % movies.length];
  const nextPoster = tmdbImage(next.posterPath, "w500");

  useEffect(() => {
    if (!nextPoster) return;
    const { props } = getImageProps({ src: nextPoster, alt: "", fill: true, sizes: POSTER_SIZES });
    const img = new window.Image();
    img.sizes = POSTER_SIZES;
    img.srcset = props.srcSet ?? "";
  }, [nextPoster]);

  const poster = tmdbImage(movie.posterPath, "w500");
  const year = movie.releaseDate?.slice(0, 4);

  return (
    <section aria-label="Filme em destaque" className="faixa -mt-6 mb-8 overflow-hidden bg-butter">
      <div className="grid gap-x-12 gap-y-6 pt-8 lg:min-h-[36rem] lg:grid-cols-[1.15fr_1fr] lg:grid-rows-[1fr_auto_1fr]">
        <div className="space-y-2 lg:self-end">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl">{heading}</h1>
          {note && <p className="text-lg font-semibold">{note}</p>}
        </div>

        <div className="relative mx-auto w-64 self-end sm:w-80 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:w-[24rem]">
          <div key={`poster-${turn}`} className="sobe relative mx-auto -mb-[46%] w-[66%]">
            {poster && (
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
                <Image src={poster} alt={`Pôster de ${movie.title}`} fill preload sizes={POSTER_SIZES} className="object-cover" />
              </div>
            )}
          </div>
          {turn > 0 && (
            <div key={`estouro-${turn}`} aria-hidden className="pointer-events-none absolute bottom-[35%] left-1/2">
              {BURST.map((b, i) => (
                <svg
                  key={i}
                  viewBox="-20 -20 40 40"
                  className="voa absolute -ml-5 size-10"
                  style={{ "--x": `${b.x}px`, "--y": `${b.y}px`, animationDelay: `${(i % 4) * 40}ms` } as React.CSSProperties}
                >
                  <Kernel x={0} y={0} r={18} />
                </svg>
              ))}
            </div>
          )}
          <div key={`saco-${turn}`} className={`relative ${turn > 0 ? "sacode" : ""}`}>
            <PopcornBag size="big" voteAverage={movie.voteAverage} voteCount={movie.voteCount} className="-mb-2 block w-full" />
          </div>
        </div>

        <div className="space-y-5 pb-10 lg:row-start-2 lg:pb-0">
          <div aria-live="polite" aria-atomic="true">
            <div key={turn} className="troca space-y-2">
              <h2 className="text-2xl text-accent-dark sm:text-3xl">{movie.title}</h2>
              <p className="font-semibold">
                {year && `${year}, `}nota {formatRating(movie.voteAverage, movie.voteCount).replace(" · ", " em ")}
              </p>
              {movie.overview && <p className="line-clamp-4 max-w-xl text-lg leading-relaxed">{movie.overview}</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/filme/${movie.id}`} className="botao">
              Ver onde assistir
            </Link>
            {movies.length > 1 && (
              <button type="button" onClick={() => setTurn((t) => t + 1)} className="botao botao-claro">
                Estourar outro filme
              </button>
            )}
            {helpLink && (
              <Link href="/escolher" className="self-center font-bold underline underline-offset-4">
                Me ajude a escolher
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
