// Os 7 serviços cobertos pelo site e seus IDs de provedor no TMDB (região BR).
// Confira os IDs com: node scripts/list-providers.mjs
// Regra: inclua o ID do serviço e do seu plano "with Ads"/"com anúncios";
// nunca inclua IDs cujo nome contenha "Channel" (canais pagos à parte).

export type CoveredService = { slug: string; name: string; inName: string; tmdbProviderIds: number[] };

export const COVERED_SERVICES: CoveredService[] = [
  { slug: "netflix", name: "Netflix", inName: "na Netflix", tmdbProviderIds: [8, 1796] },
  { slug: "prime-video", name: "Prime Video", inName: "no Prime Video", tmdbProviderIds: [119, 2100] },
  { slug: "disney-plus", name: "Disney+", inName: "no Disney+", tmdbProviderIds: [337] },
  { slug: "max", name: "HBO Max", inName: "na HBO Max", tmdbProviderIds: [1899] },
  { slug: "globoplay", name: "Globoplay", inName: "no Globoplay", tmdbProviderIds: [307] },
  { slug: "apple-tv-plus", name: "Apple TV", inName: "no Apple TV", tmdbProviderIds: [350] },
  { slug: "paramount-plus", name: "Paramount+", inName: "no Paramount+", tmdbProviderIds: [531, 2303] },
];

export const ALL_COVERED_PROVIDER_IDS: number[] = COVERED_SERVICES.flatMap((s) => s.tmdbProviderIds);

export function getServiceBySlug(slug: string): CoveredService | undefined {
  return COVERED_SERVICES.find((s) => s.slug === slug);
}
