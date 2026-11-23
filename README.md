# Digno de Pipoca

Catálogo que responde "o que vale a pena assistir hoje?" com os filmes incluídos na assinatura dos principais streamings do Brasil.

**No ar:** https://digno-de-pipoca.vercel.app

![Página inicial do Digno de Pipoca](docs/inicio.png)

## O que faz

- Sugere um filme em destaque, com um saquinho de pipoca que enche conforme a nota.
- Monta listas automáticas: lançamentos, em alta, mais bem avaliados, por streaming e por gênero.
- Mostra em cada filme a nota, o número de votos, o trailer, o elenco, as resenhas e onde assistir.
- Permite explorar com filtros que ficam no endereço e podem ser compartilhados.
- Gera uma imagem de compartilhamento para cada filme.

## Decisões do projeto

| Problema | Solução |
|---|---|
| Aluguel e compra confundem quem quer saber o que já pode assistir | Só entram filmes incluídos na assinatura; canais vendidos à parte são marcados |
| Listas de "melhores" cheias de filmes com 1 voto | Toda ordenação por nota exige um mínimo de votos |
| Disponibilidade desatualizada | O endereço de cada consulta muda a cada período de cache, então páginas pouco visitadas não mostram dados de semanas atrás |
| TMDB fora do ar | O site tenta a resposta guardada do período anterior e tolera falhas parciais |
| Imagens pesadas no celular | Um carregador próprio escolhe entre os tamanhos do TMDB; o player do YouTube só carrega no clique |
| Chave da API | Fica só no servidor |

O design completo está em [docs/superpowers/specs](docs/superpowers/specs).

## Tecnologias

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Vitest e Testing Library. Hospedado na Vercel.

## Como rodar

Requer Node 24 ou mais novo e um [API Read Access Token do TMDB](https://www.themoviedb.org/settings/api).

```bash
npm install
cp .env.local.example .env.local   # cole o token em TMDB_READ_TOKEN
npm run dev
```

| Comando | O que faz |
|---|---|
| `npm test` | Roda os testes (não precisa de token) |
| `npm run lint` | Verifica o código |
| `npm run build` | Compila para produção (não precisa de token) |
| `node scripts/list-providers.mjs` | Lista os códigos dos streamings no Brasil |

## Como foi feito

Projeto desenvolvido com ajuda de IA (Claude Code).

## Créditos

This product uses the TMDB API but is not endorsed or certified by TMDB. Dados de disponibilidade: JustWatch. Fonte Titan One, licença [OFL](src/assets/TitanOne-OFL.txt). Uso não comercial.
