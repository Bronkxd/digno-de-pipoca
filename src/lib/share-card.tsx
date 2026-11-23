import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { bagSvg, titleSize } from "./share-image";

export const shareSize = { width: 1200, height: 630 };

type Card = {
  title: string;
  line: string;
  badge: string;
  voteAverage: number;
  voteCount: number;
  poster?: string | null;
  cache?: string;
};

/** O pôster é opcional: se não carregar, a imagem sai sem ele. */
async function toDataUri(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { Accept: "image/jpeg,image/png" } });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !/jpeg|png/.test(type)) return null;
    return `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
  } catch {
    return null;
  }
}

export async function shareCard({ title, line, badge, voteAverage, voteCount, poster, cache }: Card) {
  const [font, posterUri] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/TitanOne-Regular.ttf")),
    poster ? toDataUri(poster) : null,
  ]);
  const bag = `data:image/svg+xml;base64,${Buffer.from(bagSvg(voteAverage, voteCount)).toString("base64")}`;
  const shown = title.length > 90 ? `${title.slice(0, 88).trimEnd()}…` : title;

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#ffd75e", color: "#1b2350", fontFamily: "Titan" }}>
        {posterUri && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={posterUri} alt="" width={300} height={450} style={{ objectFit: "cover", borderRadius: 16, margin: "90px 0 0 56px" }} />
        )}
        <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center", padding: "48px 0 48px 56px" }}>
          <div style={{ display: "flex", fontSize: 30, color: "#a31623" }}>Digno de Pipoca</div>
          <div style={{ display: "flex", fontSize: titleSize(shown), lineHeight: 1.1, marginTop: 18 }}>{shown}</div>
          <div style={{ display: "flex", fontSize: 30, marginTop: 22 }}>{line}</div>
        </div>
        <div style={{ display: "flex", position: "relative", width: 330, alignItems: "flex-end" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bag} alt="" width={320} height={309} />
          <div style={{ display: "flex", position: "absolute", left: 0, bottom: badge.length > 4 ? 88 : 72, width: 320, justifyContent: "center", fontSize: badge.length > 4 ? 22 : 52 }}>
            {badge}
          </div>
        </div>
      </div>
    ),
    {
      ...shareSize,
      fonts: [{ name: "Titan", data: font, style: "normal", weight: 400 }],
      headers: cache ? { "Cache-Control": cache } : undefined,
    },
  );
}
