import { shareCard, shareSize } from "@/lib/share-card";

export const alt = "Digno de Pipoca: o que vale a pena assistir hoje?";
export const size = shareSize;
export const contentType = "image/png";

export default function Image() {
  return shareCard({
    title: "O que vale a pena assistir hoje?",
    line: "Filmes nos streamings do Brasil",
    badge: "Bora?",
    voteAverage: 9,
    voteCount: 1,
  });
}
