import { connection } from "next/server";
import { getHomeLists } from "@/config/lists";
import { discoverMovies } from "@/lib/tmdb/discover";
import { pickFeatured } from "@/lib/featured";
import { FeaturedPicker } from "@/components/FeaturedPicker";
import { PosterRow } from "@/components/PosterRow";

export default async function HomePage() {
  // Renderiza por requisição; as chamadas ao TMDB ficam 6 h no cache de dados (REVALIDATE.lists).
  await connection();

  const today = new Date();
  const lists = getHomeLists(today);
  const pages = await Promise.allSettled(lists.map((l) => discoverMovies(l.filters, 1)));
  if (pages.every((p) => p.status === "rejected")) {
    throw (pages[0] as PromiseRejectedResult).reason;
  }

  const resultsOf = (id: string) => {
    const page = pages[lists.findIndex((l) => l.id === id)];
    return page?.status === "fulfilled" ? page.value.results : [];
  };
  const featured = pickFeatured([resultsOf("em-alta"), resultsOf("mais-bem-avaliados")], today);

  return (
    <div className="space-y-12">
      {featured.length > 0 ? (
        <FeaturedPicker movies={featured} />
      ) : (
        <h1 className="text-4xl">O que vale a pena assistir hoje?</h1>
      )}
      <p className="mb-6 text-lg text-muted">Filmes incluídos na assinatura dos principais streamings do Brasil.</p>
      {lists.map((list, i) => {
        const page = pages[i];
        if (page.status === "rejected") return null;
        return (
          <PosterRow
            key={list.id}
            title={list.title}
            href={list.href}
            movies={page.value.results}
            highlight={list.id === "mais-bem-avaliados"}
          />
        );
      })}
    </div>
  );
}
