"use client";

export default function ErrorPage({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div className="space-y-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Algo deu errado</h1>
      <p className="text-muted">Não foi possível carregar os filmes agora. Tente de novo em alguns minutos.</p>
      <button
        type="button"
        onClick={() => retry()}
        className="rounded-full bg-accent px-6 py-2 font-medium text-background hover:brightness-110"
      >
        Tentar de novo
      </button>
    </div>
  );
}
