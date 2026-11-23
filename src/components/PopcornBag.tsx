import { formatRating } from "@/lib/format";

type Spot = { x: number; y: number; r: number };

/** De baixo para cima, do centro para as pontas: a pilha cresce junto com a nota. */
function pile(rows: { y: number; xs: number[] }[], r: number): Spot[] {
  return rows.flatMap(({ y, xs }) =>
    [...xs]
      .sort((a, b) => Math.abs(a - 150) - Math.abs(b - 150))
      .map((x, i) => ({ x, y: y + (i % 2 ? 4 : -3), r })),
  );
}

const BIG = pile(
  [
    { y: 100, xs: [42, 69, 96, 123, 150, 177, 204, 231, 258] },
    { y: 80, xs: [56, 83, 110, 137, 164, 191, 218, 245] },
    { y: 61, xs: [82, 109, 136, 163, 190, 217] },
    { y: 43, xs: [108, 136, 164, 192] },
  ],
  19,
);
const SMALL = pile(
  [
    { y: 92, xs: [75, 150, 225] },
    { y: 42, xs: [112, 188] },
    { y: -4, xs: [150] },
  ],
  44,
);

/** Quantas pipocas aparecem: nota 4,5 ou menos quase vazio, 8,5 ou mais cheio. */
export function kernelCount(voteAverage: number, voteCount: number, max: number): number {
  if (!voteCount) return 0;
  return Math.min(max, Math.max(1, Math.round(((voteAverage - 4.5) / 4) * max)));
}

export function Kernel({ x, y, r, i = 0 }: Spot & { i?: number }) {
  return (
    <g className="pipoca" style={{ "--i": i } as React.CSSProperties}>
      <g fill={r > 30 ? "#ffe08a" : "#fffaf0"} stroke="#c98a1b" strokeWidth={r / 9}>
        <circle cx={x - r * 0.42} cy={y + r * 0.1} r={r * 0.56} />
        <circle cx={x + r * 0.42} cy={y + r * 0.12} r={r * 0.54} />
        <circle cx={x} cy={y - r * 0.36} r={r * 0.6} />
      </g>
      <circle cx={x} cy={y + r * 0.12} r={r * 0.28} fill="#f6b93b" />
    </g>
  );
}

/** Saquinho listrado que enche conforme a nota. É decorativo: a nota vem em texto ao lado. */
export function PopcornBag({
  voteAverage,
  voteCount,
  size = "small",
  className = "",
}: {
  voteAverage: number;
  voteCount: number;
  size?: "small" | "big";
  className?: string;
}) {
  const big = size === "big";
  const spots = (big ? BIG : SMALL).slice(0, kernelCount(voteAverage, voteCount, big ? BIG.length : SMALL.length));
  const stripes = big ? 9 : 5;
  const top = (n: number) => 20 + (260 / stripes) * n;
  const bottom = (n: number) => 50 + (200 / stripes) * n;

  return (
    <svg
      aria-hidden="true"
      viewBox={big ? "0 15 300 290" : "0 -55 300 360"}
      className={`${big ? "enche" : "pula"} overflow-visible ${className}`}
    >
      {spots.map((s, i) => (
        <Kernel key={i} {...s} i={i} />
      ))}
      {Array.from({ length: stripes }, (_, n) => (
        <polygon
          key={n}
          points={`${top(n)},112 ${(top(n) + top(n + 1)) / 2},${big ? 100 : 94} ${top(n + 1)},112 ${bottom(n + 1)},300 ${bottom(n)},300`}
          fill={n % 2 ? "#ffffff" : "#c8202f"}
        />
      ))}
      {!big && <polygon points="20,112 280,112 250,300 50,300" fill="none" stroke="#c8202f" strokeWidth={10} />}
      {big && (
        <>
          <circle cx={150} cy={205} r={58} fill="#ffd75e" stroke="#ffffff" strokeWidth={7} />
          <text
            x={150}
            y={voteCount ? 223 : 211}
            textAnchor="middle"
            fill="#1b2350"
            fontSize={voteCount ? 50 : 17}
            style={{ fontFamily: "var(--font-titan), sans-serif" }}
          >
            {voteCount ? formatRating(voteAverage, voteCount).split(" ")[0] : "Sem nota"}
          </text>
        </>
      )}
    </svg>
  );
}
