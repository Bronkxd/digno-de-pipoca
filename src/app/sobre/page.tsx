import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sobre o projeto",
  description: "Por que o Digno de Pipoca existe, como ele foi feito e quem criou.",
};

const DECISIONS = [
  {
    title: "Só o que já está na assinatura",
    text: "Filmes que só dá para alugar ou comprar ficam de fora das listas. Na página do filme, canais cobrados à parte aparecem marcados, para ninguém ter surpresa.",
  },
  {
    title: "Nota sempre com número de votos",
    text: "Uma nota 10 com um voto não diz nada. As listas de mais bem avaliados exigem um mínimo de votos, e o saquinho de pipoca enche conforme a nota.",
  },
  {
    title: "Pensado para o celular",
    text: "O trailer só carrega quando você aperta o play e cada tela baixa a imagem do tamanho certo. Na página do filme, o conteúdo principal passou de 9,3 para 3,2 segundos em um teste que simula celular (Lighthouse, novembro de 2026).",
  },
  {
    title: "Continua de pé quando algo falha",
    text: "Se a fonte dos dados sai do ar, o site tenta usar a última resposta guardada e mantém no ar as partes que funcionam.",
  },
];

export default function AboutPage() {
  return (
    <div className="space-y-12">
      <div className="faixa -mt-6 bg-butter py-10">
        <h1 className="text-4xl sm:text-5xl">Sobre o projeto</h1>
      </div>

      <section aria-labelledby="por-que">
        <div className="max-w-2xl space-y-4 text-lg leading-relaxed">
          <h2 id="por-que" className="text-2xl sm:text-3xl">Por que existe</h2>
          <p>
            Criei o Digno de Pipoca para ajudar na busca por novos filmes. Hoje pouca gente tem tempo de ficar
            procurando, então o site mostra de uma vez se um filme vale a pena e onde assistir.
          </p>
          <p>
            <Link href="/" className="botao">Ver o que assistir hoje</Link>
          </p>
        </div>
      </section>

      <section aria-labelledby="decisoes" className="faixa bg-candy py-10">
        <h2 id="decisoes" className="mb-6 text-2xl sm:text-3xl">Decisões do projeto</h2>
        <ul className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
          {DECISIONS.map((d) => (
            <li key={d.title} className="space-y-1">
              <h3 className="text-lg font-bold">{d.title}</h3>
              <p className="leading-relaxed">{d.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="como" className="max-w-2xl space-y-4 text-lg leading-relaxed">
        <h2 id="como" className="text-2xl sm:text-3xl">Como foi feito</h2>
        <p>
          A ideia, as escolhas e a direção do projeto são minhas. O código foi desenvolvido com ajuda de IA (Claude
          Code), com testes automáticos. As tecnologias são Next.js, React, TypeScript e Tailwind CSS, e os dados vêm
          do TMDB e do JustWatch.
        </p>
        <p>
          <a
            href="https://github.com/Bronkxd/digno-de-pipoca"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-accent-dark underline underline-offset-4"
          >
            Ver o código no GitHub
          </a>
        </p>
      </section>

      <section aria-labelledby="contato" className="max-w-2xl space-y-4 text-lg leading-relaxed">
        <h2 id="contato" className="text-2xl sm:text-3xl">Quem criou</h2>
        <p>
          Sou Caio. Para falar sobre o projeto, escreva para{" "}
          <a href="mailto:bronkxdev@gmail.com" className="font-semibold text-accent-dark underline underline-offset-4">
            bronkxdev@gmail.com
          </a>
          .
        </p>
      </section>
    </div>
  );
}
