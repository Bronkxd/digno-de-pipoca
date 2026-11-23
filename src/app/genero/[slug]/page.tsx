import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CatalogSections } from "@/components/CatalogSections";
import { getGenreLists } from "@/config/lists";
import { COVERED_SERVICES } from "@/config/services";
import { loadCatalog } from "@/lib/catalog";
import { parseExploreParams, toSearchString } from "@/lib/explore-params";
import { genreSlug, genreTitle, getGenres } from "@/lib/tmdb/genres";

async function findGenre(slug: string) {
  return (await getGenres()).find((g) => genreSlug(g.name) === slug);
}

export async function generateMetadata({ params }: PageProps<"/genero/[slug]">): Promise<Metadata> {
  const genre = await findGenre((await params).slug);
  if (!genre) return { title: "Gênero não encontrado" };
  const title = genreTitle(genre);
  return { title, description: `${title} incluídos na assinatura dos principais streamings do Brasil.` };
}

export default async function GenrePage({ params, searchParams }: PageProps<"/genero/[slug]">) {
  await connection();
  const { slug } = await params;
  const genre = await findGenre(slug);
  if (!genre) notFound();

  const { services } = parseExploreParams({ servico: (await searchParams).servico });
  const q = { services, genre: genre.id, sort: "popularidade" as const, page: 1 };
  const catalog = await loadCatalog(getGenreLists(genre.id, services, new Date()), q);

  const title = genreTitle(genre);
  const href = (selected: string[]) =>
    selected.length ? `/genero/${slug}?${new URLSearchParams({ servico: selected.join(",") })}` : `/genero/${slug}`;
  const chips = [
    { name: "Todos", active: services.length === 0, href: href([]) },
    ...COVERED_SERVICES.map((s) => {
      const active = services.includes(s.slug);
      return { name: s.name, active, href: href(active ? services.filter((x) => x !== s.slug) : [...services, s.slug]) };
    }),
  ];

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <h1 className="faixa -mt-6 bg-butter py-10 text-4xl sm:text-5xl">{title}</h1>
        <nav aria-label="Filtrar por streaming" className="space-y-2">
          <p className="font-semibold">Filtrar por streaming</p>
          <ul className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <li key={c.name}>
                <Link
                  href={c.href}
                  scroll={false}
                  aria-current={c.active ? "true" : undefined}
                  className={`block rounded-full px-4 py-2 font-medium transition ${c.active ? "bg-accent text-white" : "bg-candy hover:bg-butter"}`}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <CatalogSections
        catalog={catalog}
        gridTitle={`Todos: ${title[0].toLowerCase()}${title.slice(1)}`}
        searchString={toSearchString(q)}
      />
    </div>
  );
}
