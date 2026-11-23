import { describe, it, expect } from "vitest";
import { plainText } from "@/lib/plain-text";

describe("plainText", () => {
  it.each([
    ["rótulo de idioma e título do caso real", "**Português**\r\n\r\n**_Um choque de culturas._**\r\n\r\nEste filme", "Um choque de culturas.\n\nEste filme"],
    ["ordem trocada", "_**Um hino à Liberdade**_", "Um hino à Liberdade"],
    ["negrito no meio", "A **violent, bloody** thriller", "A violent, bloody thriller"],
    ["itálico", "o filme *Alien* e _Aliens_, ambos", "o filme Alien e Aliens, ambos"],
    ["negrito em vários parágrafos", "**um\n\ndois**", "um\n\ndois"],
    ["negrito com espaço sobrando", "** Nota final **", "Nota final"],
    ["título", "## Story: 9", "Story: 9"],
    ["citação e lista", "* > BOM\n- outro", "BOM\noutro"],
    ["linha separadora", "fim\n______\ncomeço", "fim\n\ncomeço"],
    ["código", "```\r\nUm Clássico\r\n```", "Um Clássico"],
    ["HTML", "but <em>'Training Day'</em> is<br>great", "but 'Training Day' is\ngreat"],
    ["entidade", "plot &amp; save &quot;it&quot;", 'plot & save "it"'],
    ["link", "veja [aqui](https://a.com/x_y_z)", "veja aqui"],
  ])("limpa: %s", (_, raw, clean) => expect(plainText(raw)).toBe(clean));

  it.each([
    ["nome de filme com asterisco", "Thunderbolts* é bom. Sim, Thunderbolts* mesmo"],
    ["palavrão censurado", "what the f**k is this s**t, f***ing hell"],
    ["conta e comparação", "nota 3 * 2 > 5 e a < b"],
    ["sublinhado dentro de palavra ou endereço", "https://a.com/meu_texto_longo snake_case_aqui"],
    ["hífen e travessão", "bom - muito bom — excelente"],
    ["hashtag", "#Oscar e nota #1"],
    ["menção a idioma no texto", "Português é a língua do filme"],
  ])("preserva: %s", (_, text) => expect(plainText(text)).toBe(text));

  it("só marcação vira vazio", () => expect(plainText("**Português**\n\n---")).toBe(""));
});
