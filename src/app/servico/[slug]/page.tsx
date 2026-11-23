import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getServiceBySlug } from "@/config/services";
import { getServiceLists } from "@/config/lists";
import { discoverMovies } from "@/lib/tmdb/discover";
import { parseExploreParams, toDiscoverFilters, toSearchString } from "@/lib/explore-params";
import { PosterRow } from "@/components/PosterRow";
import { LoadMoreGrid } from "@/components/LoadMoreGrid";

export async function generateMetadata({ params }: PageProps<"/servico/[slug]">): Promise<Metadata> {
  const service = getServiceBySlug((await params).slug);
  if (!service) return { title: "Serviço não encontrado" };
  return {
    title: `Melhores filmes ${service.inName}`,
    description: `Os filmes em alta, mais bem avaliados e lançamentos incluídos na assinatura ${service.inName} no Brasil.`,
  };
}

export default async function ServicePage({ params }: PageProps<"/servico/[slug]">) {
  const service = getServiceBySlug((await params).slug);
  if (!service) notFound();

  // Renderiza por requisição; os dados do TMDB ficam 6 h no cache (REVALIDATE.lists).
  await connection();

  const lists = getServiceLists(service, new Date());
  const q = parseExploreParams({ servico: service.slug });
  const [rows, grid] = await Promise.all([
    Promise.allSettled(lists.map((l) => discoverMovies(l.filters, 1))),
    discoverMovies(toDiscoverFilters(q), 1),
  ]);

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold sm:text-3xl">Filmes {service.inName}</h1>
      {lists.map((list, i) => {
        const r = rows[i];
        return r.status === "fulfilled" ? (
          <PosterRow key={list.id} title={list.title} href={list.href} movies={r.value.results} />
        ) : null;
      })}
      <section aria-labelledby="todos" className="space-y-4">
        <h2 id="todos" className="text-lg font-semibold sm:text-xl">Todos os filmes {service.inName}</h2>
        <LoadMoreGrid initial={grid} searchString={toSearchString(q)} />
      </section>
    </div>
  );
}
