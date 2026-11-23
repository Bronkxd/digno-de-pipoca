"use client";

export default function ErrorPage({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div className="space-y-4 py-16 text-center">
      <h1 className="text-4xl">Algo deu errado</h1>
      <p className="text-muted">Não foi possível carregar os filmes agora. Tente de novo em alguns minutos.</p>
      <button
        type="button"
        onClick={() => retry()}
        className="botao"
      >
        Tentar de novo
      </button>
    </div>
  );
}
