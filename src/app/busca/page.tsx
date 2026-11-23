import type { Metadata } from "next";
import Link from "next/link";
import { searchMovies } from "@/lib/tmdb/search";
import { MovieCard } from "@/components/MovieCard";

export const metadata: Metadata = { title: "Buscar filmes" };

function first(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

export default async function SearchPage({ searchParams }: PageProps<"/busca">) {
  const sp = await searchParams;
  const q = first(sp.q).trim();
  const page = Number.parseInt(first(sp.pagina), 10) || 1;

  if (!q) {
    return (
      <div className="space-y-4 py-10 text-center">
        <h1 className="text-2xl font-bold">Buscar filmes</h1>
        <p className="text-muted">Digite o nome de um filme para buscar.</p>
      </div>
    );
  }

  const result = await searchMovies(q, page);
  const pageHref = (n: number) => `/busca?${new URLSearchParams({ q, pagina: String(n) }).toString()}`;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Resultados para &ldquo;{q}&rdquo;</h1>
      {result.totalPages > 0 && page > result.totalPages ? (
        <div className="space-y-2 py-10 text-center">
          <p className="text-muted">
            {`Esta página não existe. A busca tem ${result.totalPages} ${result.totalPages === 1 ? "página" : "páginas"}.`}
          </p>
          <Link href={pageHref(result.totalPages)} className="text-accent hover:underline">
            Ir para a última página
          </Link>
        </div>
      ) : result.results.length === 0 ? (
        <p className="py-10 text-center text-muted">Nenhum filme encontrado para &quot;{q}&quot;.</p>
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-4 lg:grid-cols-6">
            {result.results.map((m) => (
              <li key={m.id}>
                <MovieCard movie={m} />
              </li>
            ))}
          </ul>
          {result.totalPages > 1 && (
            <nav aria-label="Páginas" className="flex items-center justify-center gap-4 text-sm">
              {result.page > 1 && (
                <Link href={pageHref(result.page - 1)} className="text-accent hover:underline">
                  ← Anterior
                </Link>
              )}
              <span className="text-muted">
                Página {result.page} de {result.totalPages}
              </span>
              {result.page < result.totalPages && (
                <Link href={pageHref(result.page + 1)} className="text-accent hover:underline">
                  Próxima →
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
