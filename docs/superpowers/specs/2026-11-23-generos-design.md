# Aba Gêneros — design curto (aprovado em 2026-11-23)

**Por quê:** hoje o gênero só se escolhe nos filtros do Explorar; o usuário quer procurar por gênero direto pelo menu.

**Abordagens:** (1) aba + página própria por gênero — **escolhida**: endereço próprio, bom para o Google; (2) aba que abre o Explorar filtrado — mais rápida, mas cai numa tela de filtros; (3) menu suspenso — ruim no celular com ~19 gêneros.

**O que é:** link "Gêneros" no topo → `/generos` (todos os gêneros do TMDB, em português) → `/genero/<slug>` com filtro de streaming, faixas Em alta, Mais bem avaliados e Lançamentos, e a grade com "Carregar mais".

**Regras:** só filmes na assinatura dos 7 serviços; notas e votos das páginas de serviço; filtro de streaming vale para a página toda e fica em `?servico=`; "Ver tudo" de Comédia, Terror e Animação na home leva à página do gênero; Explorar não muda.

**Decisões do construtor:** slug = nome sem acentos; títulos especiais para Documentário, Família e Cinema TV; dá para marcar mais de um streaming.
