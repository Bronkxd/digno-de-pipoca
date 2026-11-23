"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { COMPANIES, MOODS, TIMES, type Choice } from "@/lib/choose";
import { BURST_MS, PopcornBurst } from "./PopcornBurst";

export { BURST_MS };

const QUESTIONS = [
  { name: "clima", legend: "Qual é o clima?", options: MOODS, field: "mood" },
  { name: "tempo", legend: "Quanto tempo você tem?", options: TIMES, field: "time" },
  { name: "companhia", legend: "Quem vai assistir?", options: COMPANIES, field: "company" },
] as const;

/** Formulário GET: funciona sem JavaScript e deixa as respostas no endereço. Com JavaScript, estoura pipocas ao enviar. */
export function ChooseForm({ choice }: { choice: Choice | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    if (!burst) return;
    // Enquanto o resultado não chega, emenda outro estouro.
    const timer = setTimeout(() => setBurst(pending ? burst + 1 : 0), BURST_MS);
    return () => clearTimeout(timer);
  }, [burst, pending]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const query = new URLSearchParams(QUESTIONS.map((q) => [q.name, String(data.get(q.name) ?? "")]));
    setBurst((b) => b + 1);
    startTransition(() => router.push(`/escolher?${query}`));
  }

  return (
    <form action="/escolher" method="get" onSubmit={onSubmit} className="space-y-8 rounded-2xl bg-candy p-5 sm:p-8">
      {QUESTIONS.map((q) => (
        // A chave muda com a resposta do endereço: ao voltar no navegador, a marcação acompanha.
        <fieldset key={`${q.name}-${choice?.[q.field] ?? ""}`}>
          <legend className="mb-3 text-xl font-bold">{q.legend}</legend>
          <div className="flex flex-wrap gap-2">
            {q.options.map((o) => (
              <label
                key={o.key}
                className="relative cursor-pointer rounded-full bg-white px-5 py-3 font-medium transition hover:bg-butter has-[:checked]:bg-accent has-[:checked]:text-white has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-foreground"
              >
                <input
                  type="radio"
                  name={q.name}
                  value={o.key}
                  required
                  defaultChecked={choice?.[q.field] === o.key}
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                />
                {o.label}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <button type="submit" className="botao text-lg">
        Estourar meu filme
      </button>
      {burst > 0 && createPortal(<PopcornBurst key={burst} />, document.body)}
    </form>
  );
}
