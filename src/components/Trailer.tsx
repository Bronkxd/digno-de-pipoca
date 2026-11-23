"use client";

import Image from "next/image";
import { useState } from "react";

/** Mostra uma capa; o player do YouTube (quase 1 MB) só carrega depois do clique. */
export function Trailer({ trailerKey, title, backdrop }: { trailerKey: string; title: string; backdrop: string | null }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video w-full max-w-3xl overflow-hidden rounded-xl bg-foreground">
      {playing ? (
        <iframe
          ref={(el) => el?.focus()}
          src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1`}
          title={`Trailer de ${title}`}
          className="h-full w-full"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Assistir ao trailer de ${title}`}
          className="group absolute inset-0 grid place-items-center -outline-offset-4"
        >
          {backdrop && (
            <Image src={backdrop} alt="" fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover opacity-70" />
          )}
          <span className="relative grid size-20 place-items-center rounded-full bg-accent text-white transition group-hover:scale-110 motion-reduce:transform-none">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="ml-1 size-9" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
