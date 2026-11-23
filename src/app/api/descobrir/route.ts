import { discoverMovies } from "@/lib/tmdb/discover";
import { parseExploreParams, toDiscoverFilters } from "@/lib/explore-params";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw: Record<string, string[]> = {};
  for (const [key, value] of url.searchParams) (raw[key] ??= []).push(value);

  const q = parseExploreParams(raw);
  try {
    const page = await discoverMovies(toDiscoverFilters(q), q.page);
    return Response.json(page, {
      headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=3600" },
    });
  } catch {
    return Response.json({ error: "Não foi possível carregar os filmes." }, { status: 502 });
  }
}
