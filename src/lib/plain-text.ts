const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", "#39": "'", nbsp: " " };

// Um marcador só conta se abre antes de texto e fecha depois dele, fora de palavras:
// assim "Thunderbolts*", "f**k" e "snake_case" ficam como estão.
const STARS = /(?<![\p{L}\p{N}*])(\*{1,3})(?=[^\s*])([\s\S]*?[^\s*])\1(?![\p{L}\p{N}*])/gu;
const UNDERSCORES = /(?<![\p{L}\p{N}_])(_{1,3})(?=[^\s_])([\s\S]*?[^\s_])\1(?![\p{L}\p{N}_])/gu;
const LOOSE_BOLD = /(?<![\p{L}\p{N}*])\*{2,3}(?![*])|(?<=[\s.,;:!?)"”…])\*{2,3}(?=\s|$)/gmu;

/** Tira a formatação (Markdown e HTML) que os autores usam nas resenhas do TMDB, mantendo os parágrafos. */
export function plainText(raw: string): string {
  let s = raw
    .replace(/\r\n?/g, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(?:a|b|i|u|s|p|em|strong|span|div|h[1-6]|ul|ol|li|blockquote|code|pre|small|sup|sub)(?:\s[^<>]*)?>/gi, "")
    .replace(/!?\[([^\]\n]*)\]\([^)\s]*\)/g, "$1")
    .replace(/^[ \t]*(?:[-*_=][ \t]*){3,}$/gm, "")
    .replace(/`+/g, "")
    .replace(/^[ \t]*(?:(?:#{1,6}|>|[-*+])[ \t]+)+/gm, "");

  for (let before = ""; before !== s; ) {
    before = s;
    s = s.replace(STARS, "$2").replace(UNDERSCORES, "$2");
  }

  return s
    .replace(LOOSE_BOLD, "")
    .replace(/&(amp|lt|gt|quot|apos|#39|nbsp);/g, (_, name: string) => ENTITIES[name])
    .replace(/[ \t]+$|^[ \t]+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .replace(/^(?:português|english|inglês|español)[ \t]*(?:\n+|$)/i, "");
}
