import Link from "next/link";

export default function MovieNotFound() {
  return (
    <div className="space-y-4 py-16 text-center">
      <h1 className="text-4xl">Filme não encontrado</h1>
      <p className="text-muted">Esse endereço não corresponde a nenhum filme.</p>
      <Link href="/" className="text-accent hover:underline">
        Voltar para a página inicial
      </Link>
    </div>
  );
}
