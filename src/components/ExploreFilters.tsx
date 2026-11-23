import { COVERED_SERVICES } from "@/config/services";
import type { ExploreQuery } from "@/lib/explore-params";
import type { Genre } from "@/lib/tmdb/genres";

const field = "w-full rounded-lg bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent";

/** Formulário GET: funciona sem JavaScript e deixa os filtros na URL. */
export function ExploreFilters({ q, genres, action = "/explorar", showServices = true }: {
  q: ExploreQuery;
  genres: Genre[];
  action?: string;
  showServices?: boolean;
}) {
  return (
    <form action={action} method="get" className="space-y-4 rounded-xl border border-white/10 p-4">
      {showServices && (
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Serviços</legend>
          <div className="flex flex-wrap gap-2">
            {COVERED_SERVICES.map((s) => (
              <label key={s.slug} className="flex cursor-pointer items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-sm has-[:checked]:bg-accent has-[:checked]:text-background">
                <input type="checkbox" name="servico" value={s.slug} defaultChecked={q.services.includes(s.slug)} className="sr-only" />
                {s.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <label className="col-span-2 space-y-1 text-sm sm:col-span-1">
          <span>Gênero</span>
          <select name="genero" defaultValue={q.genre ?? ""} className={field}>
            <option value="">Todos</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span>Do ano</span>
          <input type="number" name="de" min={1880} max={2100} placeholder="1990" defaultValue={q.from ?? ""} className={field} />
        </label>
        <label className="space-y-1 text-sm">
          <span>Até o ano</span>
          <input type="number" name="ate" min={1880} max={2100} placeholder="2026" defaultValue={q.to ?? ""} className={field} />
        </label>
        <label className="space-y-1 text-sm">
          <span>Nota mínima</span>
          <select name="nota" defaultValue={q.minRating ?? ""} className={field}>
            <option value="">Qualquer</option>
            {[5, 6, 6.5, 7, 7.5, 8].map((n) => (
              <option key={n} value={n}>{String(n).replace(".", ",")}+</option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span>Ordenar por</span>
          <select name="ordem" defaultValue={q.sort} className={field}>
            <option value="popularidade">Popularidade</option>
            <option value="nota">Nota</option>
            <option value="lancamento">Lançamento</option>
          </select>
        </label>
      </div>
      <button type="submit" className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-background hover:brightness-110">
        Aplicar filtros
      </button>
    </form>
  );
}
