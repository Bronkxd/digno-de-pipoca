"use client";

const TMDB = /^https:\/\/image\.tmdb\.org\/t\/p\/w(\d+)(\/.+)$/;
const WIDTHS = [92, 154, 185, 342, 500, 780, 1280];

/** Troca o tamanho no endereço do TMDB pelo menor que cobre a largura pedida, até o limite do `src`. */
export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }): string {
  const m = TMDB.exec(src);
  if (!m) return src;
  const max = Number(m[1]);
  const size = Math.min(WIDTHS.find((w) => w >= width) ?? max, max);
  return `https://image.tmdb.org/t/p/w${size}${m[2]}`;
}
