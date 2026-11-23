"use client";

import { useState } from "react";
import type { DiscoverPage, MovieSummary } from "@/lib/tmdb/types";
import { MovieCard } from "./MovieCard";

export function LoadMoreGrid({ initial, searchString }: { initial: DiscoverPage; searchString: string }) {
  const [movies, setMovies] = useState<MovieSummary[]>(initial.results);
  const [page, setPage] = useState(initial.page);
  const [totalPages, setTotalPages] = useState(initial.totalPages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function loadMore() {
    setLoading(true);
    setError(false);
    try {
      const qs = searchString ? `${searchString}&pagina=${page + 1}` : `pagina=${page + 1}`;
      const res = await fetch(`/api/descobrir?${qs}`);
      if (!res.ok) throw new Error(String(res.status));
      const next = (await res.json()) as DiscoverPage;
      setMovies((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        return [...prev, ...next.results.filter((m) => !seen.has(m.id))];
      });
      setPage(next.page);
      setTotalPages(next.totalPages);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  if (movies.length === 0) {
    return <p className="py-10 text-center text-muted">Nenhum filme encontrado com esses filtros.</p>;
  }

  return (
    <div className="space-y-6">
      <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-4 lg:grid-cols-6">
        {movies.map((m) => (
          <li key={m.id}>
            <MovieCard movie={m} />
          </li>
        ))}
      </ul>
      {error && <p className="text-center text-sm text-red-300">Não foi possível carregar mais filmes. Tente de novo.</p>}
      {page < totalPages && (
        <div className="text-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="rounded-full bg-accent px-6 py-2 font-medium text-background transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Carregando…" : "Carregar mais"}
          </button>
        </div>
      )}
    </div>
  );
}
