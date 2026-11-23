import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { genreSlug, getGenres } from "@/lib/tmdb/genres";

export const metadata: Metadata = {
  title: "Gêneros",
  description: "Escolha um gênero e veja os filmes incluídos na assinatura dos streamings do Brasil.",
};

export default async function GenresPage() {
  await connection();
  const genres = await getGenres();

  return (
    <div className="space-y-10">
      <h1 className="faixa -mt-6 bg-butter py-10 text-4xl sm:text-5xl">Gêneros</h1>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {genres.map((g) => (
          <li key={g.id}>
            <Link
              href={`/genero/${genreSlug(g.name)}`}
              className="flex h-full min-h-20 items-center rounded-2xl bg-candy px-5 py-4 text-lg font-bold transition hover:bg-butter"
            >
              {g.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
