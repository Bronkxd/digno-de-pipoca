import Link from "next/link";
import { COVERED_SERVICES } from "@/config/services";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Vale a Pena<span className="text-accent">?</span>
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
            className="w-full rounded-full bg-surface px-4 py-2 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </form>
        <Link href="/explorar" className="text-sm hover:text-accent">
          Explorar
        </Link>
      </div>
      <nav aria-label="Serviços" className="mx-auto max-w-6xl overflow-x-auto px-4 pb-2">
        <ul className="flex gap-4 text-sm whitespace-nowrap text-muted">
          {COVERED_SERVICES.map((s) => (
            <li key={s.slug}>
              <Link href={`/servico/${s.slug}`} className="hover:text-foreground">
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
