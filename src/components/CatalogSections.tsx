import type { Catalog } from "@/lib/catalog";
import { LoadMoreGrid } from "./LoadMoreGrid";
import { PosterRow } from "./PosterRow";

export function CatalogSections({ catalog, gridTitle, searchString }: {
  catalog: Catalog;
  gridTitle: string;
  searchString: string;
}) {
  return (
    <>
      {catalog.rows.map(({ list, page }) => (
        <PosterRow key={list.id} title={list.title} href={list.href} movies={page.results} />
      ))}
      <section aria-labelledby="todos" className="space-y-4">
        <h2 id="todos" className="text-2xl sm:text-3xl">{gridTitle}</h2>
        {catalog.grid ? (
          <LoadMoreGrid key={searchString} initial={catalog.grid} searchString={searchString} />
        ) : (
          <p className="text-muted">Não foi possível carregar esta lista agora. Tente de novo em alguns minutos.</p>
        )}
      </section>
    </>
  );
}
