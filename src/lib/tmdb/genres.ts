import { tmdbFetch, REVALIDATE } from "./client";

export type Genre = { id: number; name: string };

export async function getGenres(): Promise<Genre[]> {
  const data = await tmdbFetch<{ genres: Genre[] }>("/genre/movie/list", {}, REVALIDATE.static);
  return [...data.genres].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export function genreSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Gêneros em que "Filmes de <nome>" soa mal.
const SPECIAL_TITLES: Record<number, string> = {
  99: "Documentários",
  10751: "Filmes para a família",
  10770: "Filmes feitos para TV",
};

export function genreTitle(g: Genre): string {
  return SPECIAL_TITLES[g.id] ?? `Filmes de ${g.name.toLowerCase()}`;
}
