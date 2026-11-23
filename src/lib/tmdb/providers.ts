import { ALL_COVERED_PROVIDER_IDS } from "@/config/services";
import type { ProviderBadge, TmdbWatchProvidersResult, WatchInfo } from "./types";

const covered = new Set(ALL_COVERED_PROVIDER_IDS);

export function mapWatchProviders(result: TmdbWatchProvidersResult | undefined): WatchInfo {
  const br = result?.results?.BR;
  if (!br) return { link: null, providers: [] };

  const byPriority = [...(br.flatrate ?? [])].sort((a, b) => a.display_priority - b.display_priority);
  const badges: ProviderBadge[] = byPriority.map((p) => ({
    id: p.provider_id,
    name: p.provider_name,
    logoPath: p.logo_path,
    isCovered: covered.has(p.provider_id),
    isChannel: /channel/i.test(p.provider_name),
  }));

  return {
    link: br.link ?? null,
    providers: [...badges.filter((b) => b.isCovered), ...badges.filter((b) => !b.isCovered)],
  };
}

export function isAvailableOnCovered(result: TmdbWatchProvidersResult | undefined): boolean {
  return (result?.results?.BR?.flatrate ?? []).some((p) => covered.has(p.provider_id));
}
