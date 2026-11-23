import { COMPANIES, MOODS, TIMES, type Choice } from "@/lib/choose";

const QUESTIONS = [
  { name: "clima", legend: "Qual é o clima?", options: MOODS, field: "mood" },
  { name: "tempo", legend: "Quanto tempo você tem?", options: TIMES, field: "time" },
  { name: "companhia", legend: "Quem vai assistir?", options: COMPANIES, field: "company" },
] as const;

/** Formulário GET: funciona sem JavaScript e deixa as respostas no endereço. */
export function ChooseForm({ choice }: { choice: Choice | null }) {
  return (
    <form action="/escolher" method="get" className="space-y-8 rounded-2xl bg-candy p-5 sm:p-8">
      {QUESTIONS.map((q) => (
        <fieldset key={q.name}>
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
    </form>
  );
}
