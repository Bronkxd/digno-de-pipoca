import Image from "next/image";
import { tmdbImage } from "@/lib/format";
import type { WatchInfo } from "@/lib/tmdb/types";

export function WhereToWatch({ watch }: { watch: WatchInfo }) {
  if (watch.providers.length === 0) {
    return (
      <section aria-labelledby="onde-assistir" className="space-y-2">
        <h2 id="onde-assistir" className="text-2xl">Onde assistir</h2>
        <p className="text-muted">No momento, este filme não está em nenhum streaming por assinatura no Brasil.</p>
      </section>
    );
  }

  const list = (
    <ul className="flex flex-wrap gap-3">
      {watch.providers.map((p) => {
        const logo = tmdbImage(p.logoPath, "w92");
        return (
          <li key={p.id} className="flex items-center gap-2 rounded-xl bg-surface py-1.5 pr-3 pl-1.5">
            {logo ? (
              <Image src={logo} alt={p.name} width={36} height={36} className="rounded-md" />
            ) : (
              <span className="flex h-9 items-center px-1 text-sm font-medium">{p.name}</span>
            )}
            {logo && <span className="text-sm">{p.name}</span>}
            {p.isChannel && <span className="text-xs text-muted">canal pago à parte</span>}
          </li>
        );
      })}
    </ul>
  );

  return (
    <section aria-labelledby="onde-assistir" className="space-y-3">
      <h2 id="onde-assistir" className="text-2xl">Onde assistir (assinatura)</h2>
      {list}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
        {watch.link && (
          <a href={watch.link} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent hover:underline">
            Ver onde assistir no TMDB
          </a>
        )}
        <p>Dados de disponibilidade: JustWatch</p>
      </div>
    </section>
  );
}
