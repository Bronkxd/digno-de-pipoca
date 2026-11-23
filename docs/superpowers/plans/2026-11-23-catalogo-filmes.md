# Catálogo de Filmes nos Streamings — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Site em Next.js que mostra os filmes disponíveis por assinatura nos principais streamings do Brasil. Ele traz listas automáticas, uma página por filme para decidir se vale a pena, explorar com filtros, uma página por serviço e busca.

**Architecture:** Páginas montadas no servidor (App Router) que consultam a API do TMDB via `fetch` com `next.revalidate`, de modo que o Data Cache do Next guarda as respostas e serve a última versão se o TMDB falhar. Toda a lógica (montar consultas, mapear respostas, formatar valores) fica em funções puras em `src/lib`, testadas com Vitest. As páginas e os componentes só montam a tela com o que essas funções devolvem.

**Tech Stack:** Next.js (versão atual do `create-next-app@latest`, App Router, TypeScript, Tailwind, ESLint, pasta `src/`), Vitest + React Testing Library + jsdom, hospedagem na Vercel. Node 26 e npm 11 já estão instalados na máquina.

**Spec:** `docs/superpowers/specs/2026-11-23-catalogo-filmes-design.md`

**Pré-requisito do usuário:** um token de leitura da API do TMDB (v4 "API Read Access Token"), colocado em `.env.local` como `TMDB_READ_TOKEN`. Os testes unitários não precisam dele, mas o Task 12 precisa.

## Global Constraints

- Todas as chamadas ao TMDB usam `language=pt-BR`; as que envolvem disponibilidade usam `watch_region=BR`.
- "Disponível" = `with_watch_monetization_types=flatrate` + `with_watch_providers` = todos os IDs mapeados dos 7 serviços, unidos por `|`.
- Os 7 serviços: Netflix, Prime Video, Disney+, Max, Globoplay, Apple TV+, Paramount+. Planos com anúncios contam como o próprio serviço; canais vendidos dentro da Amazon ("… Amazon Channel") não contam como nenhum dos 7.
- `include_adult=false` em toda consulta. Filmes sem pôster não aparecem em listas, no explorar nem no "veja também".
- A chave do TMDB vive só no servidor (`process.env.TMDB_READ_TOKEN`, enviada como `Authorization: Bearer`). Nenhum componente cliente importa `src/lib/tmdb/*`.
- Cache: listas e explorar `21600` s (6 h); filme e disponibilidade `43200` s (12 h); serviços e gêneros `604800` s (7 dias).
- Nota e número de votos aparecem sempre juntos, no formato `7,8 · 12.400 votos`.
- O rodapé exibe o logo do TMDB, o texto exato `This product uses the TMDB API but is not endorsed or certified by TMDB.` e o texto `Dados de disponibilidade: JustWatch`.
- O explorar nunca pede página além de `min(total_pages, 500)`.
- Textos da interface em português do Brasil. Nomes no código em inglês.
- Sem login, sem banco de dados, sem séries.

## Review Focus

1. **Filme sem sinopse em pt-BR:** usar a sinopse em inglês. Se as duas estiverem vazias, mostrar `Sinopse indisponível.` (teste no Task 5).
2. **ID de filme inexistente ou não numérico (`/filme/abc`, `/filme/999999999`):** página "Filme não encontrado" com status 404, nunca erro 500 (teste no Task 3 para `TmdbError.status`, verificação no Task 8).
3. **Parâmetros de URL inválidos no explorar (`?nota=abc`, `?servico=xyz`, `?pagina=-3`, `?pagina=900`):** ignorados ou limitados, nunca quebram (testes no Task 9).
4. **Filme com 0 votos:** mostrar `Sem avaliações` em vez de `0,0 · 0 votos`; e ordenar por nota sem mínimo de votos não pode encher a lista de filmes com 1 voto (testes nos Tasks 1 e 4).
5. **Busca vazia ou só com espaços (`/busca?q=%20`):** não chamar o TMDB; mostrar o convite para digitar (teste no Task 11).

---

## Estrutura de arquivos

```
catalogo-filmes/
  .env.local.example            # TMDB_READ_TOKEN=
  next.config.ts                # remotePatterns image.tmdb.org
  vitest.config.ts
  scripts/list-providers.mjs    # imprime os provedores BR do TMDB (conferência de IDs)
  public/tmdb-logo.svg
  src/
    config/
      services.ts               # os 7 serviços e seus IDs no TMDB
      lists.ts                  # regras das listas da página inicial + números ajustáveis
    lib/
      format.ts                 # formatRating, formatRuntime, tmdbImage
      tmdb/
        types.ts                # tipos crus do TMDB + tipos do app
        client.ts               # tmdbFetch, TmdbError, REVALIDATE
        discover.ts             # buildDiscoverParams, discoverMovies, withPosterOnly
        providers.ts            # mapWatchProviders, isAvailableOnCovered
        movie.ts                # getMovie + mapeadores puros
        search.ts               # searchMovies
      explore-params.ts         # URL <-> filtros do explorar
    components/
      Header.tsx  Footer.tsx  MovieCard.tsx  PosterRow.tsx  RatingBadge.tsx
      WhereToWatch.tsx  ExploreFilters.tsx  LoadMoreGrid.tsx (cliente)
    app/
      layout.tsx  page.tsx  error.tsx  not-found.tsx
      filme/[id]/page.tsx  filme/[id]/not-found.tsx
      explorar/page.tsx
      servico/[slug]/page.tsx
      busca/page.tsx
      api/descobrir/route.ts
  tests/                        # espelha src/ (ex.: tests/lib/format.test.ts)
```

## Tipos compartilhados (definidos no Task 1 em `src/lib/tmdb/types.ts`, usados por todos)

```ts
export type MovieSummary = {
  id: number; title: string; posterPath: string | null;
  releaseDate: string | null; voteAverage: number; voteCount: number;
};
export type SortBy = "popularity.desc" | "vote_average.desc" | "primary_release_date.desc";
export type DiscoverFilters = {
  providerIds: number[]; genreIds?: number[];
  releasedFrom?: string; releasedTo?: string;   // "YYYY-MM-DD"
  minRating?: number; minVotes?: number; sortBy: SortBy;
};
export type DiscoverPage = { results: MovieSummary[]; page: number; totalPages: number };
export type ProviderBadge = { id: number; name: string; logoPath: string | null; isCovered: boolean; isChannel: boolean };
export type WatchInfo = { link: string | null; providers: ProviderBadge[] };
export type ReviewExcerpt = { author: string; excerpt: string; url: string; language: "pt-BR" | "en" };
export type CastMember = { name: string; character: string; profilePath: string | null };
export type MovieDetails = {
  id: number; title: string; year: number | null; posterPath: string | null; backdropPath: string | null;
  runtime: number | null; genres: string[]; overview: string; certification: string | null;
  voteAverage: number; voteCount: number; trailerKey: string | null; director: string | null;
  cast: CastMember[]; watch: WatchInfo; reviews: ReviewExcerpt[]; recommendations: MovieSummary[];
};
```

Os tipos crus do TMDB (`TmdbMovieListItem`, `TmdbWatchProvidersResult`, `TmdbVideo`, `TmdbReleaseDates`, `TmdbCredits`, `TmdbReview`, `TmdbMovieDetailsResponse`) ficam no mesmo arquivo e seguem os nomes de campos da documentação do TMDB (snake_case).

---

### Task 1: Projeto, testes e formatação

**Files:**
- Create: projeto Next.js em `catalogo-filmes/`, `vitest.config.ts`, `.env.local.example`, `src/lib/tmdb/types.ts`, `src/lib/format.ts`
- Test: `tests/lib/format.test.ts`

**Interfaces:**
- Produces: os tipos acima; `formatRating(voteAverage: number, voteCount: number): string`; `formatRuntime(minutes: number | null): string | null`; `tmdbImage(path: string | null, size: "w92" | "w185" | "w342" | "w500" | "w780" | "w1280" | "original"): string | null`; `npm test` roda o Vitest.

- [ ] **Step 1: Criar o projeto.** A pasta `catalogo-filmes/` já contém `docs/`, e o `create-next-app` recusa pastas com arquivos. Por isso: mova `docs/` para a pasta de rascunho da sessão, rode `npx create-next-app@latest catalogo-filmes --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack` a partir de `a pasta de projetos` (responda "não" a perguntas extras) e mova `docs/` de volta.
- [ ] **Step 2: Instalar e configurar os testes.** `npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom vite-tsconfig-paths`. Configure `vitest.config.ts` com ambiente `jsdom`, alias `@/`, `include: ["tests/**/*.test.{ts,tsx}"]` e setup importando `@testing-library/jest-dom/vitest`. Adicione `"test": "vitest run"` ao `package.json`. Crie `.env.local.example` com `TMDB_READ_TOKEN=` e confirme que `.env*.local` está no `.gitignore`.
- [ ] **Step 3: Escrever os testes que falham**

```ts
describe("formatRating", () => {
  it("formata nota e votos em pt-BR", () => expect(formatRating(7.83, 12400)).toBe("7,8 · 12.400 votos"));
  it("singular", () => expect(formatRating(6, 1)).toBe("6,0 · 1 voto"));
  it("sem votos", () => expect(formatRating(0, 0)).toBe("Sem avaliações"));
});
describe("formatRuntime", () => {
  it("horas e minutos", () => expect(formatRuntime(135)).toBe("2h 15min"));
  it("menos de 1h", () => expect(formatRuntime(48)).toBe("48min"));
  it("hora cheia", () => expect(formatRuntime(120)).toBe("2h"));
  it("nulo ou zero", () => { expect(formatRuntime(null)).toBeNull(); expect(formatRuntime(0)).toBeNull(); });
});
describe("tmdbImage", () => {
  it("monta URL", () => expect(tmdbImage("/a.jpg", "w342")).toBe("https://image.tmdb.org/t/p/w342/a.jpg"));
  it("nulo", () => expect(tmdbImage(null, "w342")).toBeNull());
});
```

- [ ] **Step 4: Rodar e ver falhar.** `npm test` → FAIL (módulo não existe).
- [ ] **Step 5: Implementar `src/lib/format.ts` e `src/lib/tmdb/types.ts`.** Use `Intl.NumberFormat("pt-BR")` com uma casa decimal fixa para a nota.
- [ ] **Step 6: Rodar e ver passar.** `npm test` → PASS. `npm run build` → sucesso.
- [ ] **Step 7: Commit.** `git init` em `catalogo-filmes/` e então `git add -A && git commit -m "chore: projeto Next.js, Vitest e formatação"`. O commit inclui `docs/`.

---

### Task 2: Serviços cobertos e "onde assistir"

**Files:**
- Create: `scripts/list-providers.mjs`, `src/config/services.ts`, `src/lib/tmdb/providers.ts`
- Test: `tests/lib/providers.test.ts`

**Interfaces:**
- Consumes: `ProviderBadge`, `WatchInfo`, `TmdbWatchProvidersResult` (Task 1)
- Produces:
  - `type CoveredService = { slug: string; name: string; tmdbProviderIds: number[] }`
  - `COVERED_SERVICES: CoveredService[]`
  - `ALL_COVERED_PROVIDER_IDS: number[]`
  - `getServiceBySlug(slug: string): CoveredService | undefined`
  - `mapWatchProviders(result: TmdbWatchProvidersResult | undefined): WatchInfo`: só `results.BR.flatrate`; serviços cobertos primeiro, depois os demais, cada grupo pela `display_priority`; `link = results.BR.link ?? null`.
  - `isAvailableOnCovered(result: TmdbWatchProvidersResult | undefined): boolean`

- [ ] **Step 1: Conferir os IDs reais.** Escreva `scripts/list-providers.mjs` (lê o token de `.env.local` e faz GET em `/3/watch/providers/movie?watch_region=BR&language=pt-BR`, imprimindo `provider_id  provider_name`). Rode `node scripts/list-providers.mjs`. Se ainda não houver token, use os valores iniciais abaixo e deixe a conferência para o Task 12.
- [ ] **Step 2: Preencher `src/config/services.ts`.** Valores iniciais, a confirmar com o script:

| slug | name | tmdbProviderIds |
|---|---|---|
| netflix | Netflix | 8, 1796 (com anúncios) |
| prime-video | Prime Video | 119, 2100 (com anúncios) |
| disney-plus | Disney+ | 337 |
| max | Max | 1899 |
| globoplay | Globoplay | 307 |
| apple-tv-plus | Apple TV+ | 350 |
| paramount-plus | Paramount+ | 531 |

Regra para a conferência: inclua todo ID cujo nome seja o serviço ou o serviço "with Ads"/"com anúncios". Nunca inclua IDs cujo nome contenha `Channel`.

- [ ] **Step 3: Escrever os testes que falham**

```ts
// fixture: BR.flatrate = [Telecine(id 227, prio 20), Netflix(8, prio 5), "Max Amazon Channel"(1825, prio 40), Globoplay(307, prio 10)], BR.rent = [Apple TV(2)]
it("só flatrate do BR, cobertos primeiro, por prioridade", () =>
  expect(mapWatchProviders(fixture).providers.map(p => p.id)).toEqual([8, 307, 227, 1825]));
it("marca canal e cobertura", () => {
  const ch = mapWatchProviders(fixture).providers.find(p => p.id === 1825)!;
  expect(ch).toMatchObject({ isChannel: true, isCovered: false });
});
it("link do BR", () => expect(mapWatchProviders(fixture).link).toBe(fixture.results.BR.link));
it("sem BR → vazio", () => expect(mapWatchProviders({ id: 1, results: {} })).toEqual({ link: null, providers: [] }));
it("indefinido → vazio", () => expect(mapWatchProviders(undefined)).toEqual({ link: null, providers: [] }));
it("disponível se algum flatrate coberto", () => expect(isAvailableOnCovered(fixture)).toBe(true));
it("só canal/aluguel → indisponível", () => expect(isAvailableOnCovered(onlyChannelAndRent)).toBe(false));
it("plano com anúncios conta", () => expect(isAvailableOnCovered(onlyNetflixAds /* id 1796 */)).toBe(true));
it("getServiceBySlug", () => { expect(getServiceBySlug("netflix")?.name).toBe("Netflix"); expect(getServiceBySlug("xyz")).toBeUndefined(); });
```

- [ ] **Step 4: Rodar e ver falhar.** `npm test -- providers` → FAIL.
- [ ] **Step 5: Implementar.** `isChannel = /channel/i.test(provider_name)`.
- [ ] **Step 6: Rodar e ver passar.** `npm test` → PASS.
- [ ] **Step 7: Commit.** `feat: serviços cobertos e mapeamento de onde assistir`

---

### Task 3: Cliente do TMDB

**Files:**
- Create: `src/lib/tmdb/client.ts`
- Test: `tests/lib/client.test.ts`

**Interfaces:**
- Produces:
  - `REVALIDATE = { lists: 21600, movie: 43200, static: 604800 } as const`
  - `class TmdbError extends Error { status: number }`
  - `tmdbFetch<T>(path: string, params: Record<string, string | number | undefined>, revalidate: number): Promise<T>`: base `https://api.themoviedb.org/3`; acrescenta `language=pt-BR` se `params.language` não vier; omite parâmetros `undefined`; envia `Authorization: Bearer ${process.env.TMDB_READ_TOKEN}` e `next: { revalidate }`; resposta não-ok → `throw new TmdbError(status)`; token ausente → `throw new Error("TMDB_READ_TOKEN não configurado")`.
  - Começa com `import "server-only"` (instale o pacote `server-only`; no Vitest, crie um alias para um módulo vazio).

- [ ] **Step 1: Escrever os testes que falham** (com `vi.stubGlobal("fetch", ...)` e `vi.stubEnv`)

```ts
it("monta URL com pt-BR e sem undefined", async () => {
  await tmdbFetch("/discover/movie", { page: 2, with_genres: undefined }, REVALIDATE.lists);
  const [url, init] = fetchMock.mock.calls[0];
  expect(url).toBe("https://api.themoviedb.org/3/discover/movie?page=2&language=pt-BR");
  expect(init.headers.Authorization).toBe("Bearer tok");
  expect(init.next).toEqual({ revalidate: 21600 });
});
it("respeita language explícito", ...);      // language: "en-US" não é sobrescrito
it("404 vira TmdbError com status", async () =>
  await expect(tmdbFetch("/movie/1", {}, 1)).rejects.toMatchObject({ name: "TmdbError", status: 404 }));
it("sem token falha com mensagem clara", ...);
```

- [ ] **Step 2: Rodar e ver falhar.** `npm test -- client` → FAIL.
- [ ] **Step 3: Implementar `src/lib/tmdb/client.ts`.**
- [ ] **Step 4: Rodar e ver passar.** `npm test` → PASS.
- [ ] **Step 5: Commit.** `feat: cliente do TMDB com cache e erros`

---

### Task 4: Consulta de filmes disponíveis e regras das listas

**Files:**
- Create: `src/lib/tmdb/discover.ts`, `src/config/lists.ts`
- Test: `tests/lib/discover.test.ts`, `tests/config/lists.test.ts`

**Interfaces:**
- Consumes: `tmdbFetch`, `REVALIDATE` (Task 3); `ALL_COVERED_PROVIDER_IDS`, `COVERED_SERVICES` (Task 2)
- Produces:
  - `MIN_VOTES_FOR_RATING_SORT = 200`
  - `buildDiscoverParams(f: DiscoverFilters, today: Date): Record<string, string>`
  - `withPosterOnly(items: TmdbMovieListItem[]): MovieSummary[]` (descarta `poster_path` nulo e converte para `MovieSummary`)
  - `discoverMovies(f: DiscoverFilters, page?: number): Promise<DiscoverPage>`: `totalPages = min(total_pages, 500)`; `page` fora de 1..500 é limitado
  - Em `lists.ts`: `type HomeList = { id: string; title: string; filters: DiscoverFilters; href: string }`, `getHomeLists(today: Date): HomeList[]` e `getServiceLists(service: CoveredService, today: Date): HomeList[]`

- [ ] **Step 1: Escrever os testes que falham**

```ts
const today = new Date("2026-11-23T12:00:00Z");
it("parâmetros fixos de disponibilidade", () => expect(buildDiscoverParams({ providerIds: [8, 1796], sortBy: "popularity.desc" }, today)).toMatchObject({
  watch_region: "BR", with_watch_monetization_types: "flatrate", with_watch_providers: "8|1796",
  include_adult: "false", sort_by: "popularity.desc", "primary_release_date.lte": "2026-11-23" }));
it("filtros opcionais", () => expect(buildDiscoverParams({ providerIds: [8], genreIds: [35, 27], releasedFrom: "2025-01-01",
  minRating: 7.5, minVotes: 1000, sortBy: "vote_average.desc" }, today)).toMatchObject({
  with_genres: "35,27", "primary_release_date.gte": "2025-01-01", "vote_average.gte": "7.5", "vote_count.gte": "1000" }));
it("ordenar por nota impõe mínimo de votos", () =>
  expect(buildDiscoverParams({ providerIds: [8], sortBy: "vote_average.desc" }, today)["vote_count.gte"]).toBe("200"));
it("releasedTo menor que hoje prevalece", ...);        // releasedTo "2019-12-31" → lte "2019-12-31"
it("withPosterOnly descarta sem pôster", ...);
it("discoverMovies limita totalPages a 500", ...);    // mock tmdbFetch com total_pages 812 → 500
// lists.test.ts
it("lista da home na ordem e com as regras do spec", () => {
  const ls = getHomeLists(today);
  expect(ls.map(l => l.id)).toEqual(["lancamentos", "em-alta", "mais-bem-avaliados",
    "servico-netflix", "servico-prime-video", "servico-disney-plus", "servico-max", "servico-globoplay",
    "servico-apple-tv-plus", "servico-paramount-plus", "genero-comedia", "genero-terror", "genero-animacao"]);
  expect(ls[0].filters).toMatchObject({ releasedFrom: "2025-11-23", minVotes: 20, sortBy: "primary_release_date.desc" });
  expect(ls[2].filters).toMatchObject({ minRating: 7.5, minVotes: 1000, sortBy: "vote_average.desc" });
  expect(ls[3].filters).toMatchObject({ providerIds: [8, 1796], minRating: 7, minVotes: 300, sortBy: "popularity.desc" });
  expect(ls[10].filters).toMatchObject({ genreIds: [35], minRating: 6.5, minVotes: 200 });
});
```

Valores do spec que vão para `lists.ts` como constantes nomeadas: Lançamentos (12 meses, mínimo de 20 votos, data de lançamento decrescente); Em alta (popularidade); Mais bem avaliados (≥ 7,5, ≥ 1.000 votos, nota); Destaques por serviço (≥ 7, ≥ 300 votos, popularidade; títulos `Destaques na Netflix` etc.); Gêneros Comédia 35, Terror 27, Animação 16 (≥ 6,5, ≥ 200 votos, popularidade). Cada `href` aponta para `/explorar` com os mesmos filtros na URL (formato do Task 9; as listas de serviço apontam para `/servico/<slug>`). `getServiceLists` gera `Em alta`, `Mais bem avaliados` e `Lançamentos` restritos aos IDs do serviço.

- [ ] **Step 2: Rodar e ver falhar.** `npm test -- discover lists` → FAIL.
- [ ] **Step 3: Implementar.** As datas são formatadas como `YYYY-MM-DD` em UTC.
- [ ] **Step 4: Rodar e ver passar.** `npm test` → PASS.
- [ ] **Step 5: Commit.** `feat: consulta de filmes disponíveis e regras das listas`

---

### Task 5: Dados da página do filme

**Files:**
- Create: `src/lib/tmdb/movie.ts`
- Test: `tests/lib/movie.test.ts`

**Interfaces:**
- Consumes: `tmdbFetch`, `REVALIDATE`, `TmdbError` (Task 3); `mapWatchProviders`, `isAvailableOnCovered` (Task 2); `withPosterOnly` (Task 4)
- Produces:
  - Mapeadores puros: `pickTrailer(videos: TmdbVideo[]): string | null` (site `YouTube`, tipo `Trailer`; prefere `iso_639_1 === "pt"`, depois `en`, depois `official`; devolve a `key`); `pickBrCertification(rd: TmdbReleaseDates): string | null` (primeira `certification` não vazia do país `BR`); `mapCredits(c: TmdbCredits): { director: string | null; cast: CastMember[] }` (diretor = primeiro `job === "Director"`; elenco = 10 primeiros por `order`); `toReviewExcerpts(reviews: TmdbReview[], language: "pt-BR" | "en"): ReviewExcerpt[]` (máximo 3; trecho cortado em 400 caracteres numa fronteira de palavra, com `…`)
  - `getMovie(id: number): Promise<MovieDetails | null>`: devolve `null` em `TmdbError` 404 e propaga os outros erros

`getMovie` faz:
1. `GET /movie/{id}` com `append_to_response=videos,credits,release_dates,watch/providers,recommendations` e `include_video_language=pt,en`, usando `REVALIDATE.movie`.
2. Se `overview` vier vazia: `GET /movie/{id}` com `language: "en-US"` e usa a `overview` de lá. Se também vier vazia: `"Sinopse indisponível."`.
3. Resenhas: `GET /movie/{id}/reviews` em `pt-BR`. Se vier vazio, em `en-US`. Marca o idioma pela chamada que trouxe os resultados.
4. Veja também: das recomendações com pôster (máximo de 20), busca `GET /movie/{rid}/watch/providers` de cada uma em paralelo (`REVALIDATE.movie`), mantém as que passam em `isAvailableOnCovered` e corta em 12. Se uma dessas chamadas falhar, a recomendação é descartada sem derrubar a página.

- [ ] **Step 1: Escrever os testes que falham** (mapeadores com fixtures; `getMovie` com `tmdbFetch` mockado via `vi.mock`)

```ts
it("pickTrailer prefere pt", ...);                       // [en Trailer, pt Teaser, pt Trailer] → key do pt Trailer
it("pickTrailer sem trailer → null", ...);
it("certificação BR", ...);                              // US "PG-13", BR ["", "14"] → "14"
it("créditos: diretor e 10 do elenco por order", ...);
it("resenha cortada em 400 com …", ...);
it("getMovie: sinopse cai para inglês", ...);           // pt "" → en "An overview" → overview "An overview"
it("getMovie: sem sinopse nenhuma", async () => expect((await getMovie(1))!.overview).toBe("Sinopse indisponível."));
it("getMovie: 404 → null", ...);
it("getMovie: veja também só disponíveis, no máximo 12", ...);
it("getMovie: falha em uma recomendação não derruba", ...);
it("getMovie: resenhas caem para inglês e marcam language 'en'", ...);
```

- [ ] **Step 2: Rodar e ver falhar.** `npm test -- movie` → FAIL.
- [ ] **Step 3: Implementar `src/lib/tmdb/movie.ts`.** `year` vem dos 4 primeiros dígitos de `release_date`.
- [ ] **Step 4: Rodar e ver passar.** `npm test` → PASS.
- [ ] **Step 5: Commit.** `feat: dados completos da página do filme`

---

### Task 6: Layout e componentes básicos

**Files:**
- Create: `src/components/{Header,Footer,MovieCard,PosterRow,RatingBadge}.tsx`, `public/tmdb-logo.svg`
- Modify: `src/app/layout.tsx`, `next.config.ts`
- Test: `tests/components/basics.test.tsx`

**Interfaces:**
- Consumes: `formatRating`, `tmdbImage` (Task 1); `COVERED_SERVICES` (Task 2)
- Produces: `<RatingBadge voteAverage voteCount />`, `<MovieCard movie: MovieSummary />` (link para `/filme/{id}`, pôster `w342` via `next/image`, título e `RatingBadge`), `<PosterRow title: string; href: string; movies: MovieSummary[] />` (faixa com rolagem horizontal e link "Ver tudo"; com 0 filmes não renderiza nada), `<Header />` (nome provisório do site `Vale a Pena?`, campo de busca que envia GET para `/busca?q=` e links para `/explorar` e `/servico/<slug>`), `<Footer />`

- [ ] **Step 1: Escrever os testes que falham**

```tsx
it("RatingBadge mostra nota e votos", () => { render(<RatingBadge voteAverage={7.83} voteCount={12400} />); expect(screen.getByText("7,8 · 12.400 votos")).toBeInTheDocument(); });
it("MovieCard leva à página do filme", ...);       // href "/filme/603"
it("PosterRow vazia não renderiza", ...);          // container vazio
it("Footer tem atribuições exatas", () => {
  render(<Footer />);
  expect(screen.getByText("This product uses the TMDB API but is not endorsed or certified by TMDB.")).toBeInTheDocument();
  expect(screen.getByText("Dados de disponibilidade: JustWatch")).toBeInTheDocument();
  expect(screen.getByAltText("TMDB")).toBeInTheDocument();
});
```

- [ ] **Step 2: Rodar e ver falhar.** `npm test -- basics` → FAIL.
- [ ] **Step 3: Implementar.** Baixe o logo oficial em https://www.themoviedb.org/about/logos-attribution e salve como `public/tmdb-logo.svg`. Em `next.config.ts`, use `images.remotePatterns` para `https://image.tmdb.org/t/p/**`. Em `layout.tsx`: `<html lang="pt-BR">`, Header, `main` e Footer, além de metadata com título padrão e template `%s · Vale a Pena?`. O layout é pensado primeiro para o celular; o visual fica a critério de quem implementa.
- [ ] **Step 4: Rodar e ver passar.** `npm test` → PASS; `npm run build` → sucesso.
- [ ] **Step 5: Commit.** `feat: layout, cabeçalho, rodapé com atribuições e cards`

---

### Task 7: Página inicial

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `getHomeLists` (Task 4), `discoverMovies` (Task 4), `PosterRow` (Task 6)

- [ ] **Step 1: Implementar.** Server component que busca a página 1 de todas as listas em paralelo (`Promise.allSettled`). Uma lista que falhar é omitida e as outras continuam aparecendo. Se todas falharem, lança o erro para o `error.tsx` (Task 12). Use `export const revalidate = 21600`.
- [ ] **Step 2: Verificar.** Com o token em `.env.local`, rode `npm run dev` e abra `/`: as 13 faixas aparecem e cada pôster abre `/filme/<id>`. Sem token, `npm run build` deve terminar (a página é gerada sob demanda; se o build tentar pré-gerá-la, use `export const dynamic = "force-dynamic"` só nesse caso e anote).
- [ ] **Step 3: Commit.** `feat: página inicial com listas automáticas`

---

### Task 8: Página do filme

**Files:**
- Create: `src/app/filme/[id]/page.tsx`, `src/app/filme/[id]/not-found.tsx`, `src/components/WhereToWatch.tsx`
- Test: `tests/components/where-to-watch.test.tsx`

**Interfaces:**
- Consumes: `getMovie` (Task 5), `formatRuntime`, `tmdbImage` (Task 1), `RatingBadge`, `PosterRow` (Task 6)
- Produces: `<WhereToWatch watch: WatchInfo />`

- [ ] **Step 1: Escrever os testes que falham**

```tsx
it("lista logos e créditos", ...);           // nomes dos provedores como alt; texto "Dados de disponibilidade: JustWatch"
it("canal marcado", ...);                     // provedor isChannel mostra "canal pago à parte"
it("bloco leva ao link do TMDB", ...);        // <a href={watch.link}>
it("vazio → mensagem exata", () => {
  render(<WhereToWatch watch={{ link: null, providers: [] }} />);
  expect(screen.getByText("No momento, este filme não está em nenhum streaming por assinatura no Brasil.")).toBeInTheDocument();
});
```

- [ ] **Step 2: Rodar e ver falhar.** `npm test -- where-to-watch` → FAIL.
- [ ] **Step 3: Implementar `WhereToWatch` e a página.** O `params` é uma Promise (`const { id } = await params`). Um `id` não numérico ou `getMovie` devolvendo `null` → `notFound()`. A página mostra, nesta ordem: imagem de fundo, pôster, título e ano, `RatingBadge`, classificação indicativa, duração, gêneros, sinopse, WhereToWatch, trailer (`<iframe>` de `https://www.youtube-nocookie.com/embed/{key}`, omitido se `null`), diretor e elenco, resenhas (autor, trecho, link "Ler resenha completa", selo "em inglês" quando `language === "en"`; seção omitida se vazia) e `PosterRow` "Veja também" (omitida se vazia). Exporte `generateMetadata` com o título do filme. `not-found.tsx` mostra "Filme não encontrado" e um link para a página inicial.
- [ ] **Step 4: Rodar e ver passar.** `npm test` → PASS.
- [ ] **Step 5: Verificar no navegador.** `/filme/603` mostra tudo. `/filme/abc` e `/filme/999999999` mostram "Filme não encontrado" com status 404 (confira com `curl -s -o /dev/null -w "%{http_code}" localhost:3000/filme/abc` → `404`).
- [ ] **Step 6: Commit.** `feat: página do filme`

---

### Task 9: Explorar com filtros na URL e "carregar mais"

**Files:**
- Create: `src/lib/explore-params.ts`, `src/app/explorar/page.tsx`, `src/app/api/descobrir/route.ts`, `src/components/ExploreFilters.tsx`, `src/components/LoadMoreGrid.tsx`
- Test: `tests/lib/explore-params.test.ts`

**Interfaces:**
- Consumes: `discoverMovies`, `MIN_VOTES_FOR_RATING_SORT` (Task 4); `COVERED_SERVICES`, `ALL_COVERED_PROVIDER_IDS`, `getServiceBySlug` (Task 2); `MovieCard` (Task 6)
- Produces:
  - `type ExploreQuery = { services: string[]; genre?: number; from?: number; to?: number; minRating?: number; sort: "popularidade" | "nota" | "lancamento"; page: number }`
  - `parseExploreParams(sp: Record<string, string | string[] | undefined>): ExploreQuery`
  - `toDiscoverFilters(q: ExploreQuery): DiscoverFilters`
  - `toSearchString(q: ExploreQuery): string` (sem `page`; omite os valores padrão)
  - Parâmetros de URL: `servico` (slugs separados por vírgula), `genero`, `de`, `ate` (anos), `nota`, `ordem`, `pagina`
  - Rota `GET /api/descobrir?<mesmos parâmetros>&pagina=N` → JSON `DiscoverPage`

- [ ] **Step 1: Escrever os testes que falham**

```ts
it("padrões", () => expect(parseExploreParams({})).toEqual({ services: [], sort: "popularidade", page: 1 }));
it("lê tudo", () => expect(parseExploreParams({ servico: "netflix,max", genero: "35", de: "2010", ate: "2019", nota: "7", ordem: "nota", pagina: "3" }))
  .toEqual({ services: ["netflix", "max"], genre: 35, from: 2010, to: 2019, minRating: 7, sort: "nota", page: 3 }));
it("ignora inválidos", () => expect(parseExploreParams({ servico: "xyz,netflix", genero: "abc", nota: "abc", ordem: "foo", de: "19x" }))
  .toEqual({ services: ["netflix"], sort: "popularidade", page: 1 }));
it("nota fora de 0..10 ignorada", ...);
it("página limitada a 1..500", () => { expect(parseExploreParams({ pagina: "-3" }).page).toBe(1); expect(parseExploreParams({ pagina: "900" }).page).toBe(500); });
it("sem serviço → todos os IDs cobertos", () => expect(toDiscoverFilters(parseExploreParams({})).providerIds).toEqual(ALL_COVERED_PROVIDER_IDS));
it("anos viram datas", () => expect(toDiscoverFilters({ services: [], from: 2010, to: 2019, sort: "lancamento", page: 1 }))
  .toMatchObject({ releasedFrom: "2010-01-01", releasedTo: "2019-12-31", sortBy: "primary_release_date.desc" }));
it("ida e volta pela URL", ...);                 // parse(toSearchString(q)) == q, com page 1
```

- [ ] **Step 2: Rodar e ver falhar.** `npm test -- explore-params` → FAIL.
- [ ] **Step 3: Implementar `explore-params.ts`.**
- [ ] **Step 4: Rodar e ver passar.** `npm test` → PASS.
- [ ] **Step 5: Implementar a página, a rota e os componentes.** `ExploreFilters` é um `<form method="get" action="/explorar">` com caixas de seleção para os serviços, um select de gênero (opções vindas de `GET /genre/movie/list` com `REVALIDATE.static`), anos de/até, nota mínima e ordem; funciona sem JavaScript. A página renderiza a página 1 no servidor e entrega o resto a `LoadMoreGrid` (`"use client"`, recebe `initial: DiscoverPage` e `searchString`, busca `/api/descobrir?{searchString}&pagina=N` e esconde o botão "Carregar mais" quando `page >= totalPages`). Nenhum resultado → "Nenhum filme encontrado com esses filtros." A rota usa `parseExploreParams` (por isso nunca passa de 500) e responde com `Cache-Control: s-maxage=21600, stale-while-revalidate`.
- [ ] **Step 6: Verificar.** `/explorar?servico=netflix&genero=27&ordem=nota` lista filmes de terror da Netflix por nota, e "Carregar mais" acrescenta resultados. `/explorar?nota=abc&pagina=900` não quebra.
- [ ] **Step 7: Commit.** `feat: explorar com filtros compartilháveis e carregar mais`

---

### Task 10: Página por serviço

**Files:**
- Create: `src/app/servico/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getServiceBySlug`, `COVERED_SERVICES` (Task 2); `getServiceLists`, `discoverMovies` (Task 4); `PosterRow` (Task 6); `LoadMoreGrid`, `toSearchString` (Task 9)

- [ ] **Step 1: Implementar.** Slug desconhecido → `notFound()`. `generateStaticParams` devolve os 7 slugs. A página mostra o título `Filmes na <Nome>`, as faixas de `getServiceLists` e, abaixo, uma grade "Todos os filmes na <Nome>" (popularidade) usando `LoadMoreGrid` com `servico=<slug>`. `generateMetadata` usa o título `Melhores filmes na <Nome>`. `revalidate = 21600`.
- [ ] **Step 2: Verificar.** `/servico/netflix` mostra as faixas e a grade. `/servico/xyz` → 404.
- [ ] **Step 3: Commit.** `feat: página por serviço`

---

### Task 11: Busca

**Files:**
- Create: `src/lib/tmdb/search.ts`, `src/app/busca/page.tsx`
- Test: `tests/lib/search.test.ts`

**Interfaces:**
- Consumes: `tmdbFetch`, `REVALIDATE` (Task 3); `MovieCard` (Task 6)
- Produces: `searchMovies(query: string, page?: number): Promise<DiscoverPage>`: `query.trim()` vazio → `{ results: [], page: 1, totalPages: 0 }` sem chamar o TMDB; senão `GET /search/movie` com `query`, `region: "BR"`, `include_adult: "false"` e `REVALIDATE.lists`. Mantém os resultados sem pôster (a busca mostra tudo) e não marca disponibilidade.

- [ ] **Step 1: Escrever os testes que falham**

```ts
it("vazio ou espaços não chama o TMDB", async () => {
  expect(await searchMovies("   ")).toEqual({ results: [], page: 1, totalPages: 0 });
  expect(tmdbFetchMock).not.toHaveBeenCalled();
});
it("passa query, região e adulto", ...);
it("mantém sem pôster", ...);
```

- [ ] **Step 2: Rodar e ver falhar.** `npm test -- search` → FAIL.
- [ ] **Step 3: Implementar `search.ts` e a página.** Sem `q` → "Digite o nome de um filme para buscar." Sem resultados → `Nenhum filme encontrado para "<q>".` Com resultados, uma grade de `MovieCard` (o card sem pôster mostra um espaço reservado com o título) e paginação simples por links `?q=…&pagina=N`.
- [ ] **Step 4: Rodar e ver passar.** `npm test` → PASS.
- [ ] **Step 5: Commit.** `feat: busca por título`

---

### Task 12: Erros, conferência final e publicação

**Files:**
- Create: `src/app/error.tsx`, `src/app/not-found.tsx`
- Modify: `src/config/services.ts` (se a conferência de IDs mudar algo)

- [ ] **Step 1: Páginas de erro.** `error.tsx` (`"use client"`) mostra "Não foi possível carregar os filmes agora. Tente de novo em alguns minutos." e um botão "Tentar de novo" (`reset()`). `not-found.tsx` mostra "Página não encontrada" com um link para a página inicial.
- [ ] **Step 2: Conferir os IDs dos serviços com o token real.** Rode `node scripts/list-providers.mjs` e ajuste `services.ts` pela regra do Task 2. Se algo mudar, rode `npm test` e ajuste os testes que fixam IDs.
- [ ] **Step 3: Verificação completa.** `npm test` → tudo PASS; `npm run lint` → sem erros; `npm run build` → sucesso; `npm run start` e percorra: `/`, `/filme/603`, `/filme/abc` (404), `/explorar?servico=globoplay`, "Carregar mais", `/servico/max`, `/busca?q=matrix`, `/busca?q=%20`. Confira também a tela com largura de celular (375 px). Confirme que o token não aparece no navegador: rode `grep -r "TMDB_READ_TOKEN\|Bearer" .next/static` → nenhum resultado.
- [ ] **Step 4: Commit.** `feat: páginas de erro e conferência final`
- [ ] **Step 5: Publicação na Vercel (com o usuário).** Isso exige a conta do usuário, então pare aqui e peça a ele para: criar o projeto na Vercel a partir do repositório (ou rodar `npx vercel` logado), configurar `TMDB_READ_TOKEN` nas variáveis de ambiente e fazer o deploy. Depois, repita o percurso do Step 3 na URL publicada.
