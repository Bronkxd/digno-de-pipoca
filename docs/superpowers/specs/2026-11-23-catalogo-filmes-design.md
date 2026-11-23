# Catálogo de Filmes nos Streamings — Design

Data: 2026-11-23
Status: aprovado (2026-11-23)

## 1. Intenção

Um site (acessado pelo navegador, no celular e no computador) que ajuda a pessoa a **decidir se um filme vale a pena assistir**. Ele mostra o que está disponível agora nos serviços de streaming por assinatura no Brasil, com lançamentos, indicações do próprio site e avaliações de cada filme.

A pergunta que o site responde: *"O que tem de bom pra assistir nos streamings que eu assino, e esse filme vale a pena?"*

Fonte de dados: API do TMDB (https://developer.themoviedb.org/docs/getting-started). Os dados de "onde assistir" vêm do JustWatch, repassados pelo TMDB.

## 2. Objetivos

- Página inicial com listas **automáticas** de indicações, iguais para todos os visitantes.
- Página de cada filme com o que é preciso para decidir: nota, número de votos, sinopse, trailer, elenco, duração, gênero, classificação indicativa, onde assistir e "veja também".
- Explorar o catálogo por serviço, gênero, ano e nota mínima.
- Busca por título.
- Rápido no celular e legível pelo Google (páginas montadas no servidor).

## 3. Fora do escopo (não-objetivos)

- **Séries.** Somente filmes.
- **Login e contas de usuário.** Nada depende de usuário: sem favoritos salvos na nuvem, sem "minha lista".
- **Indicações personalizadas.** Todas as indicações são iguais para todos.
- **Curadoria manual** (escolhas editoriais, área de administração). Pode vir depois.
- **Filmes só para aluguel ou compra.** "Disponível" significa incluído na assinatura (`flatrate`).
- **Apps nas lojas** (Play Store/App Store).
- **"Chegou esta semana no streaming".** A API não informa a data de entrada no serviço. Isso exige banco próprio e fica para uma fase futura (seção 9).
- **Notas de IMDb/Rotten Tomatoes.** Só as notas do TMDB nesta versão.

## 4. Anti-objetivos (seria um fracasso mesmo funcionando)

- Dizer que um filme está num serviço quando ele já saiu de lá (dados velhos demais).
- Misturar aluguel/compra com assinatura, fazendo a pessoa achar que pode assistir de graça no plano.
- Listas "melhores" cheias de filmes com nota alta e pouquíssimos votos, ou filmes obscuros sem pôster ou sinopse.
- Site lento no celular.

## 5. Restrições

- **Região `BR` e idioma `pt-BR`** em todas as chamadas. Se a sinopse em português estiver vazia, usar a sinopse em inglês.
- **Atribuição obrigatória:** exibir o logo/crédito do TMDB e o crédito do JustWatch onde aparecem os serviços ("Dados de disponibilidade: JustWatch").
- **Sem link direto para o filme dentro do streaming:** a API não fornece. O bloco "Onde assistir" mostra os logos dos serviços. Proposta: o bloco inteiro leva ao link de "onde assistir" que o TMDB devolve (página do TMDB/JustWatch para o filme).
- **Termos da API TMDB:** a chave gratuita é para uso não comercial. Se o site passar a gerar receita (anúncios, afiliados), é preciso rever a licença.
- **Limite de resultados:** `/discover/movie` retorna no máximo 500 páginas (~10 mil filmes) por consulta. Isso não atrapalha as listas, que mostram as primeiras páginas, mas a navegação "explorar" não deve prometer paginação infinita além desse teto.
- **Chave da API só no servidor.** Nunca enviada ao navegador.

## 6. Abordagens consideradas

| Abordagem | Como funciona | Prós | Contras |
|---|---|---|---|
| **1. Site com servidor leve (Next.js + Vercel)** — **escolhida** | Páginas montadas no servidor, que consulta o TMDB e guarda cache por algumas horas | Chave escondida, rápido, bom para o Google, hospedagem gratuita | Não sabe quando o filme entrou no streaming |
| 2. Site só no navegador (React puro) | Navegador do visitante chama o TMDB direto | Mais simples | Chave exposta, ruim para o Google, cada visita gasta chamadas |
| 3. Servidor + banco + sincronização diária | Baixa a disponibilidade todo dia e guarda | Catálogo completo, "chegou esta semana" | Bem maior: banco, tarefas agendadas, custo e manutenção |

**Escolhida: opção 1**, pelo usuário. Ela atende tudo o que foi pedido. A parte de "chegou esta semana" da opção 3 pode ser acrescentada depois em cima dela, sem refazer nada.

## 7. O que o site tem

### 7.1 Serviços cobertos (proposta)

Netflix, Prime Video, Disney+, Max, Globoplay, Apple TV+, Paramount+.

Os IDs de cada serviço devem ser confirmados em `GET /watch/providers/movie?watch_region=BR`, porque os IDs e nomes mudam (ex.: HBO Max → Max). A lista deve ficar num arquivo de configuração simples, para que adicionar ou remover um serviço não exija mudar código.

**Mapeamento serviço → IDs do TMDB** (decisão minha): cada serviço do site pode corresponder a mais de um ID no TMDB.
- **Planos com anúncios contam como o próprio serviço.** Exemplo: "Netflix basic with Ads" conta como Netflix, porque o filme está incluído naquele plano.
- **Canais vendidos dentro de outro serviço não contam.** Exemplos: "Max Amazon Channel" e "Paramount+ Amazon Channel" **não** contam como Prime Video, porque são cobrados à parte. Também **não** contam como Max ou Paramount+, porque exigem a assinatura da Amazon. Assim o site não sugere que um filme está incluído num plano quando não está (seção 4).

Ao falar em "filmes disponíveis" daqui em diante, considere: `watch_region=BR`, `with_watch_monetization_types=flatrate` e `with_watch_providers` = todos os IDs mapeados dos serviços acima, unidos por `|` (OU).

### 7.2 Página inicial: listas automáticas

Cada lista é uma faixa horizontal de pôsteres com um link "ver tudo" para a página de explorar com o filtro correspondente.

| Lista | Regra (proposta) |
|---|---|
| **Lançamentos** | Disponíveis, com data de lançamento mundial (`primary_release_date`) nos últimos 12 meses, mínimo de 20 votos, ordenados por data de lançamento (mais novo primeiro). Decisão minha: a data mundial é a mais completa no TMDB; as datas brasileiras faltam em muitos filmes. A lista mostra "filmes recentes que já estão no streaming", não "acabou de chegar" (ver seção 9) |
| **Em alta** | Disponíveis, ordenados por popularidade |
| **Mais bem avaliados** | Disponíveis, nota ≥ 7,5 e ≥ 1.000 votos, ordenados por nota |
| **Destaques por serviço** | Uma faixa por serviço: filmes daquele serviço, nota ≥ 7 e ≥ 300 votos, ordenados por popularidade |
| **Por gênero** (algumas faixas) | Ex.: Comédia, Terror, Animação: disponíveis, nota ≥ 6,5 e ≥ 200 votos, ordenados por popularidade |

Em todas as listas, ficam de fora filmes sem pôster e filmes adultos (`include_adult=false`). Os limites de votos e notas são pontos de partida e devem ficar fáceis de ajustar, num único arquivo de configuração.

### 7.3 Página do filme

- Título, ano, pôster e imagem de fundo
- Nota TMDB (0–10) **e número de votos** (ex.: "7,8 · 12.400 votos"), sempre juntos
- Classificação indicativa brasileira (de `release_dates`, certificação `BR`), quando existir
- Duração e gêneros
- Sinopse (pt-BR, com o inglês como reserva)
- Trailer: o vídeo do YouTube do tipo `Trailer`, priorizando pt-BR e depois en. Se não houver, a seção não aparece.
- Diretor e os ~10 primeiros do elenco
- **Onde assistir:** logos de **todos** os serviços por assinatura (`flatrate`) no Brasil que o TMDB informar, não só os 7 cobertos (decisão do usuário). Exemplos: Telecine, MUBI, Claro TV+ e canais da Amazon (marcados como canal pago à parte). Crédito ao JustWatch. Se o filme não estiver em nenhum, mostrar: "No momento, este filme não está em nenhum streaming por assinatura no Brasil." Um filme que só está num serviço menor ainda pode ser encontrado pela busca, mas não aparece nas listas, no explorar nem no "veja também", que usam só os 7.
- **Resenhas:** até 3 resenhas do TMDB, com trecho e link para a resenha completa, indicando o idioma (a maioria é em inglês). Se não houver, a seção não aparece.
- **Veja também:** recomendações do TMDB para o filme, **mostrando só as que estão disponíveis** nos serviços cobertos (decisão minha: o site é sobre o que dá pra assistir agora). Na prática, isso significa checar a disponibilidade de até 20 recomendações, com o resultado guardado em cache.

Proposta: buscar a maior parte desses dados numa chamada só, com `append_to_response=videos,credits,release_dates,watch/providers,recommendations,reviews`.

### 7.4 Explorar

Mostra **somente filmes disponíveis** nos serviços cobertos, como o resto do site; não há opção de incluir filmes fora do streaming. Sem filtro de serviço, os 7 serviços entram combinados por OU. Uma página com filtros combináveis (serviço, gênero, ano/década, nota mínima) e ordenação (popularidade, nota, lançamento). Os filtros ficam na URL, para que o link possa ser compartilhado. A paginação usa "carregar mais" e respeita o teto de 500 páginas.

### 7.5 Página por serviço

Exemplo: `/servico/netflix`. É a página de explorar já filtrada pelo serviço, com faixas próprias (em alta, mais bem avaliados, lançamentos). Também ajuda a trazer visitas do Google ("melhores filmes na Netflix").

### 7.6 Busca

Busca por título com `/search/movie`. Os resultados mostram todos os filmes encontrados. Proposta: não marcar a disponibilidade na lista de resultados, para não gastar uma chamada por resultado. A página do filme já deixa claro se ele está ou não disponível.

### 7.7 Rodapé

Logo e crédito do TMDB com o aviso exigido ("This product uses the TMDB API but is not endorsed or certified by TMDB"), além do crédito ao JustWatch.

## 8. Decisões técnicas

- **Next.js (App Router) + TypeScript**, hospedado na **Vercel** (plano gratuito).
- **Cache no servidor** (revalidação do Next.js):
  - Listas e páginas de explorar: 6 horas
  - Página do filme e disponibilidade: 12 horas
  - Lista de serviços e gêneros: 7 dias

  O objetivo é que a disponibilidade nunca fique mais de meio dia desatualizada (anti-objetivo da seção 4), sem gastar chamadas à toa.
- **Chave do TMDB** em variável de ambiente no servidor (token de leitura v4, enviado como `Authorization: Bearer`).
- **Imagens** servidas pelo CDN do TMDB (`image.tmdb.org`), escolhendo o tamanho adequado (pôsteres das listas em `w342`, por exemplo).
- **Design responsivo**, pensado primeiro para o celular.
- **Erros:** se o TMDB falhar, mostrar o último conteúdo em cache, ou uma mensagem amigável se não houver cache. Nunca uma página em branco.

## 9. Futuro (não faz parte desta versão)

1. **"Chegou/saiu esta semana":** tarefa diária que guarda a disponibilidade e compara com o dia anterior (abordagem 3, sobre esta base).
2. Notas de IMDb/Rotten Tomatoes (API OMDb).
3. Curadoria manual ("escolhas da semana").
4. Filtro "só os serviços que eu assino", salvo no próprio navegador, sem precisar de login.
5. Séries.

## 10. Deixado para quem for construir

- Identidade visual (cores, tipografia, nome e logo do site).
- Biblioteca de estilos e componentes.
- Estrutura de pastas e organização do código.
- Ajuste fino dos números de nota e votos das listas, depois de ver resultados reais.
- Estratégia de testes.
