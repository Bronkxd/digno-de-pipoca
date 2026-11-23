import type { Metadata } from "next";
import { Figtree, Titan_One } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const titan = Titan_One({
  weight: "400",
  variable: "--font-titan",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://digno-de-pipoca.vercel.app"),
  openGraph: { siteName: "Digno de Pipoca", locale: "pt_BR", type: "website" },
  twitter: { card: "summary_large_image" },
  title: {
    default: "Digno de Pipoca · Filmes nos streamings",
    template: "%s · Digno de Pipoca",
  },
  description:
    "Descubra o que vale a pena assistir nos streamings do Brasil: lançamentos, mais bem avaliados e onde assistir cada filme.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${figtree.variable} ${titan.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Header />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
