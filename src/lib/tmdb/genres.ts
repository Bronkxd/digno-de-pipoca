import { tmdbFetch, REVALIDATE } from "./client";

export type Genre = { id: number; name: string };

export async function getGenres(): Promise<Genre[]> {
  const data = await tmdbFetch<{ genres: Genre[] }>("/genre/movie/list", {}, REVALIDATE.static);
  return [...data.genres].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}
