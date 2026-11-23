# Me ajude a escolher — design curto (aprovado em 2026-11-23)

**Por quê:** pouca gente tem tempo de procurar filme; três perguntas levam a uma sugestão. É também a demonstração principal do portfólio.

**Abordagens:** (1) página com formulário GET e resultado no servidor — **escolhida**: funciona sem JavaScript e o link guarda as respostas; (2) assistente no navegador passo a passo — mais animado, mas sem link compartilhável simples; (3) IA conversando — custo por uso e chave extra.

**O que é:** `/escolher` pergunta clima (rir, chorar, sentir medo, adrenalina, pensar), tempo (até 1h30, até 2h, sem pressa) e companhia (só eu, casal, família com crianças, amigos). O resultado usa o destaque da pipoca, um filme por vez, com "Ver onde assistir" e "Estourar outro filme".

**Regras:** só filmes na assinatura dos 7 serviços; nota mínima 6,8 e mínimo de votos. Família: classificação brasileira até 10 anos e sem terror ("sentir medo" vira mistério e fantasia).

**Achado:** os filtros de duração e classificação do TMDB são aproximados. Quando a resposta limita tempo ou classificação, cada candidato é conferido nos próprios detalhes; filme sem esse dado fica de fora.

**Decisões do construtor:** até 12 sugestões; o primeiro muda a cada dia; só eu = mais bem avaliados; amigos = mais populares e muito votados; casal = sem filmes infantis.
