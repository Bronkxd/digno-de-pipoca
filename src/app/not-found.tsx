import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-4 py-16 text-center">
      <h1 className="text-4xl">Página não encontrada</h1>
      <p className="text-muted">O endereço que você abriu não existe.</p>
      <Link href="/" className="text-accent hover:underline">
        Voltar para a página inicial
      </Link>
    </div>
  );
}
