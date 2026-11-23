import { kernelCount } from "@/components/PopcornBag";

const ROWS = [
  { y: 100, xs: [150, 123, 177, 96, 204, 69, 231, 42, 258] },
  { y: 80, xs: [137, 164, 110, 191, 83, 218, 56, 245] },
  { y: 61, xs: [136, 163, 109, 190, 82, 217] },
  { y: 43, xs: [136, 164, 108, 192] },
];
const SPOTS = ROWS.flatMap(({ y, xs }) => xs.map((x, i) => ({ x, y: y + (i % 2 ? 4 : -3) })));

/** Saquinho de pipoca como SVG em texto: o gerador das imagens de compartilhamento não aceita os componentes. */
export function bagSvg(voteAverage: number, voteCount: number): string {
  const kernels = SPOTS.slice(0, kernelCount(voteAverage, voteCount, SPOTS.length)).map(
    ({ x, y }) =>
      `<g fill="#fffaf0" stroke="#c98a1b" stroke-width="2"><circle cx="${x - 8}" cy="${y + 2}" r="10.6"/><circle cx="${x + 8}" cy="${y + 2}" r="10.3"/><circle cx="${x}" cy="${y - 7}" r="11.4"/><circle cx="${x}" cy="${y + 2}" r="5.3" fill="#f6b93b" stroke="none"/></g>`,
  );
  const stripes = Array.from({ length: 9 }, (_, n) => {
    const top = (i: number) => 20 + (260 / 9) * i;
    const bottom = (i: number) => 50 + (200 / 9) * i;
    return `<polygon points="${top(n)},112 ${(top(n) + top(n + 1)) / 2},100 ${top(n + 1)},112 ${bottom(n + 1)},300 ${bottom(n)},300" fill="${n % 2 ? "#ffffff" : "#c8202f"}"/>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="580" viewBox="0 15 300 290">${kernels.join("")}${stripes.join("")}<circle cx="150" cy="205" r="58" fill="#ffd75e" stroke="#ffffff" stroke-width="7"/></svg>`;
}

export function titleSize(title: string): number {
  if (title.length <= 16) return 84;
  if (title.length <= 32) return 66;
  if (title.length <= 60) return 52;
  return 40;
}
