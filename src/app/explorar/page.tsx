import type { Metadata } from "next";
import { discoverMovies } from "@/lib/tmdb/discover";
import { getGenres } from "@/lib/tmdb/genres";
import { parseExploreParams, toDiscoverFilters, toSearchString } from "@/lib/explore-params";
import { ExploreFilters } from "@/components/ExploreFilters";
import { LoadMoreGrid } from "@/components/LoadMoreGrid";

export const metadata: Metadata = { title: "Explorar filmes" };

export default async function ExplorePage({ searchParams }: PageProps<"/explorar">) {
  const q = { ...parseExploreParams(await searchParams), page: 1 };
  const searchString = toSearchString(q);
  const [initial, genres] = await Promise.all([discoverMovies(toDiscoverFilters(q), 1), getGenres().catch(() => [])]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Explorar filmes</h1>
      <ExploreFilters q={q} genres={genres} />
      <LoadMoreGrid key={searchString} initial={initial} searchString={searchString} />
    </div>
  );
}
