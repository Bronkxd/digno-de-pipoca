import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getServiceBySlug } from "@/config/services";
import { getServiceLists } from "@/config/lists";
import { loadCatalog } from "@/lib/catalog";
import { parseExploreParams, toSearchString } from "@/lib/explore-params";
import { CatalogSections } from "@/components/CatalogSections";

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
  const catalog = await loadCatalog(lists, q);

  return (
    <div className="space-y-10">
      <h1 className="faixa -mt-6 bg-butter py-10 text-4xl sm:text-5xl">Filmes {service.inName}</h1>
      <CatalogSections
        catalog={catalog}
        gridTitle={`Todos os filmes ${service.inName}`}
        searchString={toSearchString(q)}
      />
    </div>
  );
}
