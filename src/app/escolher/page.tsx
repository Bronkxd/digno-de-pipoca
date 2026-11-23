import type { Metadata } from "next";
import { ChooseForm } from "@/components/ChooseForm";
import { FeaturedPicker } from "@/components/FeaturedPicker";
import { choiceLabel, parseChoice } from "@/lib/choose";
import { findMovies } from "@/lib/tmdb/choose";

export const metadata: Metadata = {
  title: "Me ajude a escolher",
  description: "Responda três perguntas e a pipoca escolhe um filme que já está na assinatura dos streamings do Brasil.",
  alternates: { canonical: "/escolher" },
};

export default async function ChoosePage({ searchParams }: PageProps<"/escolher">) {
  const choice = parseChoice(await searchParams);
  const movies = choice ? await findMovies(choice, new Date()) : [];

  return (
    <div className="space-y-8">
      {choice && movies.length > 0 ? (
        <>
          <FeaturedPicker key={Object.values(choice).join("-")} movies={movies} heading="A pipoca escolheu" note={choiceLabel(choice)} />
          <h2 className="text-2xl sm:text-3xl">Mudar as respostas</h2>
        </>
      ) : (
        <div className="faixa -mt-6 space-y-3 bg-butter py-10">
          <h1 className="text-4xl sm:text-5xl">Me ajude a escolher</h1>
          <p className="text-lg">
            {choice
              ? "Nenhum filme passou por essas respostas. Tente dar mais tempo ou mudar o clima."
              : "Três respostas e a pipoca escolhe um filme que já está na assinatura."}
          </p>
        </div>
      )}
      <ChooseForm choice={choice} />
    </div>
  );
}
