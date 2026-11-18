// Atkinson Hyperlegible Next for the link preview. Google Fonts serves a whole TTF to a plain fetch
// (a `text=` subset breaks the image renderer). If the fetch fails the image still renders in the
// built-in font.
export async function atkinson(weight: 400 | 800): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:wght@${weight}`;
    const css = await (await fetch(url)).text();
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!src) return null;
    const res = await fetch(src);
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}
