import { connection } from "next/server";
import { getHomeLists } from "@/config/lists";
import { discoverMovies } from "@/lib/tmdb/discover";
import { PosterRow } from "@/components/PosterRow";

export default async function HomePage() {
  // Renderiza por requisição; as chamadas ao TMDB ficam 6 h no cache de dados (REVALIDATE.lists).
  await connection();

  const lists = getHomeLists(new Date());
  const pages = await Promise.allSettled(lists.map((l) => discoverMovies(l.filters, 1)));
  if (pages.every((p) => p.status === "rejected")) {
    throw (pages[0] as PromiseRejectedResult).reason;
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold sm:text-3xl">O que vale a pena assistir hoje?</h1>
        <p className="text-muted">Filmes incluídos na assinatura dos principais streamings do Brasil.</p>
      </div>
      {lists.map((list, i) => {
        const page = pages[i];
        if (page.status === "rejected") return null;
        return <PosterRow key={list.id} title={list.title} href={list.href} movies={page.value.results} />;
      })}
    </div>
  );
}
