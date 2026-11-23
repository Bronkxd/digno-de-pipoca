import Link from "next/link";
import { PopcornBag } from "./PopcornBag";
import { COVERED_SERVICES } from "@/config/services";

export function Header() {
  return (
    <header className="letreiro z-20 bg-accent text-white sm:sticky sm:top-0">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
        <Link href="/" className="flex items-end gap-2 font-display text-2xl">
          <PopcornBag voteAverage={10} voteCount={1} className="w-8" />
          Digno de Pipoca
        </Link>
        <form action="/busca" method="get" role="search" className="order-last w-full sm:order-none sm:ml-auto sm:w-72">
          <label htmlFor="busca" className="sr-only">
            Buscar filme
          </label>
          <input
            id="busca"
            type="search"
            name="q"
            placeholder="Buscar filme…"
            className="w-full rounded-full bg-white px-4 py-2 text-foreground placeholder:text-muted"
          />
        </form>
        <Link href="/explorar" className="ml-auto font-semibold underline-offset-4 hover:underline sm:ml-0">
          Explorar
        </Link>
      </div>
      <nav aria-label="Gêneros e serviços" className="mx-auto max-w-6xl trilho overflow-x-auto px-4 pb-2">
        <ul className="flex gap-5 py-1 font-medium whitespace-nowrap">
          <li>
            <Link href="/escolher" className="font-bold underline-offset-4 hover:underline">
              Me ajude a escolher
            </Link>
          </li>
          <li className="border-r border-white/50 pr-5">
            <Link href="/generos" className="font-bold underline-offset-4 hover:underline">
              Gêneros
            </Link>
          </li>
          {COVERED_SERVICES.map((s) => (
            <li key={s.slug}>
              <Link href={`/servico/${s.slug}`} className="underline-offset-4 hover:underline">
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
