import { Kernel } from "./PopcornBag";

/** Duração de um estouro completo, incluindo os atrasos. */
export const BURST_MS = 2200;

// Posições fixas e espalhadas: parece sorteio, mas não muda a cada render.
const spread = (i: number, seed: number, range: number) => {
  const n = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return Math.round((n - Math.floor(n)) * range);
};
const KERNELS = Array.from({ length: 64 }, (_, i) => ({
  left: spread(i, 1, 100),
  size: 34 + spread(i, 2, 46),
  rise: 45 + spread(i, 3, 60),
  drift: spread(i, 4, 180) - 90,
  spin: spread(i, 5, 560) - 280,
  delay: spread(i, 6, 700),
  duration: 1100 + spread(i, 7, 400),
}));

/** Pipocas que sobem de baixo pela tela inteira. Decorativo; o CSS esconde para quem pede menos movimento. */
export function PopcornBurst() {
  return (
    <div data-estouro aria-hidden="true" className="estouro pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {KERNELS.map((k, i) => (
        <svg
          key={i}
          viewBox="-20 -20 40 40"
          width={k.size}
          height={k.size}
          className="absolute top-full"
          style={
            {
              left: `${k.left}%`,
              marginLeft: -k.size / 2,
              animationDelay: `${k.delay}ms`,
              animationDuration: `${k.duration}ms`,
              "--sobe": `${-k.rise}vh`,
              "--desvio": `${k.drift}px`,
              "--giro": `${k.spin}deg`,
            } as React.CSSProperties
          }
        >
          <Kernel x={0} y={0} r={18} />
        </svg>
      ))}
    </div>
  );
}
