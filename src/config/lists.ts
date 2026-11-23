// Regras das listas automáticas (spec, seção 7.2). Ajuste os números aqui.
import { ALL_COVERED_PROVIDER_IDS, COVERED_SERVICES, type CoveredService } from "./services";
import type { DiscoverFilters } from "@/lib/tmdb/types";

export type HomeList = { id: string; title: string; filters: DiscoverFilters; href: string };

export const RELEASES = { months: 12, minVotes: 20 };
export const TOP_RATED = { minRating: 7.5, minVotes: 1000 };
export const SERVICE_HIGHLIGHTS = { minRating: 7, minVotes: 300 };
export const GENRE_ROWS = { minRating: 6.5, minVotes: 200 };
export const HOME_GENRES = [
  { slug: "comedia", name: "Comédia", id: 35 },
  { slug: "terror", name: "Terror", id: 27 },
  { slug: "animacao", name: "Animação", id: 16 },
];

function monthsAgo(today: Date, months: number): string {
  const d = new Date(today);
  d.setUTCMonth(d.getUTCMonth() - months);
  return d.toISOString().slice(0, 10);
}

/** Link para /explorar com os parâmetros na ordem usada pelo explorar. */
function exploreHref(q: { servico?: string; genero?: number; de?: string; nota?: number; ordem?: "nota" | "lancamento" }): string {
  const sp = new URLSearchParams();
  if (q.servico) sp.set("servico", q.servico);
  if (q.genero !== undefined) sp.set("genero", String(q.genero));
  if (q.de) sp.set("de", q.de);
  if (q.nota !== undefined) sp.set("nota", String(q.nota));
  if (q.ordem) sp.set("ordem", q.ordem);
  const s = sp.toString();
  return s ? `/explorar?${s}` : "/explorar";
}

export function getHomeLists(today: Date): HomeList[] {
  const all = ALL_COVERED_PROVIDER_IDS;
  const releasedFrom = monthsAgo(today, RELEASES.months);

  return [
    {
      id: "lancamentos",
      title: "Lançamentos",
      filters: { providerIds: all, releasedFrom, minVotes: RELEASES.minVotes, sortBy: "primary_release_date.desc" },
      href: exploreHref({ de: releasedFrom.slice(0, 4), ordem: "lancamento" }),
    },
    {
      id: "em-alta",
      title: "Em alta",
      filters: { providerIds: all, sortBy: "popularity.desc" },
      href: exploreHref({}),
    },
    {
      id: "mais-bem-avaliados",
      title: "Mais bem avaliados",
      filters: { providerIds: all, ...TOP_RATED, sortBy: "vote_average.desc" },
      href: exploreHref({ nota: TOP_RATED.minRating, ordem: "nota" }),
    },
    ...COVERED_SERVICES.map((s) => ({
      id: `servico-${s.slug}`,
      title: `Destaques ${s.inName}`,
      filters: { providerIds: s.tmdbProviderIds, ...SERVICE_HIGHLIGHTS, sortBy: "popularity.desc" as const },
      href: `/servico/${s.slug}`,
    })),
    ...HOME_GENRES.map((g) => ({
      id: `genero-${g.slug}`,
      title: g.name,
      filters: { providerIds: all, genreIds: [g.id], ...GENRE_ROWS, sortBy: "popularity.desc" as const },
      href: exploreHref({ genero: g.id, nota: GENRE_ROWS.minRating }),
    })),
  ];
}

export function getServiceLists(service: CoveredService, today: Date): HomeList[] {
  const ids = service.tmdbProviderIds;
  const releasedFrom = monthsAgo(today, RELEASES.months);
  return [
    {
      id: "em-alta",
      title: "Em alta",
      filters: { providerIds: ids, sortBy: "popularity.desc" },
      href: exploreHref({ servico: service.slug }),
    },
    {
      id: "mais-bem-avaliados",
      title: "Mais bem avaliados",
      filters: { providerIds: ids, ...SERVICE_HIGHLIGHTS, sortBy: "vote_average.desc" },
      href: exploreHref({ servico: service.slug, nota: SERVICE_HIGHLIGHTS.minRating, ordem: "nota" }),
    },
    {
      id: "lancamentos",
      title: "Lançamentos",
      filters: { providerIds: ids, releasedFrom, minVotes: RELEASES.minVotes, sortBy: "primary_release_date.desc" },
      href: exploreHref({ servico: service.slug, de: releasedFrom.slice(0, 4), ordem: "lancamento" }),
    },
  ];
}
