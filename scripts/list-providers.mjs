// Lista os provedores de streaming de filmes no Brasil segundo o TMDB.
// Uso: node scripts/list-providers.mjs   (lê TMDB_READ_TOKEN de .env.local)
import { readFileSync } from "node:fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const token = env.match(/^TMDB_READ_TOKEN=(.+)$/m)?.[1]?.trim();
if (!token) throw new Error("TMDB_READ_TOKEN não encontrado em .env.local");

const res = await fetch("https://api.themoviedb.org/3/watch/providers/movie?watch_region=BR&language=pt-BR", {
  headers: { Authorization: `Bearer ${token}` },
});
if (!res.ok) throw new Error(`TMDB respondeu ${res.status}`);
const { results } = await res.json();
for (const p of results.sort((a, b) => a.provider_id - b.provider_id)) {
  console.log(`${String(p.provider_id).padStart(5)}  ${p.provider_name}`);
}
