import "server-only";

const BASE_URL = "https://api.themoviedb.org/3";

/** Tempos de cache em segundos (spec, seção 8). */
export const REVALIDATE = { lists: 21600, movie: 43200, static: 604800 } as const;

export class TmdbError extends Error {
  readonly status: number;
  constructor(status: number) {
    super(`TMDB respondeu com status ${status}`);
    this.name = "TmdbError";
    this.status = status;
  }
}

export async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number | undefined>,
  revalidate: number,
): Promise<T> {
  const token = process.env.TMDB_READ_TOKEN;
  if (!token) throw new Error("TMDB_READ_TOKEN não configurado");

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  if (!search.has("language")) search.set("language", "pt-BR");
  // Faixa de tempo no endereço: a cada `revalidate` segundos a URL muda e o cache antigo deixa de ser usado.
  // Sem isso, uma página pouco visitada mostraria dados de semanas atrás (o Next serve o velho e atualiza depois).
  search.set("cb", String(Math.floor(Date.now() / (revalidate * 1000))));

  const res = await fetch(`${BASE_URL}${path}?${search.toString()}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    next: { revalidate },
  });
  if (!res.ok) throw new TmdbError(res.status);
  return (await res.json()) as T;
}
