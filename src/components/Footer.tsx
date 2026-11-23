import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 bg-foreground py-8 text-sm text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between">
        <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="shrink-0">
          <Image src="/tmdb-logo.svg" alt="TMDB" unoptimized width={120} height={16} />
        </a>
        <div className="space-y-1 sm:text-right">
          <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
          <p>Dados de disponibilidade: JustWatch</p>
          <p>
            Criado por BronkxDev.{" "}
            <Link href="/sobre" className="font-semibold underline underline-offset-4">
              Sobre o projeto
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
