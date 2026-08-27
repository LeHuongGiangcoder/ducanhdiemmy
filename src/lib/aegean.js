/**
 * TAN Aegean / TAN Pearl glyph coverage.
 *
 * Both display faces are Latin-only: they carry Đ Â Ê Ô Ă and single acute /
 * grave accents, but NOT Ư Ơ nor any stacked Vietnamese tone mark
 * (ễ ệ ố ộ ắ ằ ả ạ …). Letting the browser fall back per-glyph would render a
 * name like "Nguyễn" half in Aegean and half in Cormorant, which looks broken.
 *
 * So: if a string contains even one unsupported character, we set the WHOLE
 * string in DFVN Big Bang instead — a display face with full Vietnamese
 * coverage. One deliberate typeface, never a mix.
 *
 * Ranges below are extracted directly from the font's cmap table — regenerate
 * with fontTools if the font file is ever replaced.
 */
const RANGES = "20-5d,5f-7e,80-b4,b7-ef,f1-17e,218-21b,237,2c6-2c7,2d8-2dd,326,1e80-1e85,2013-2014,2018-201a,201c-201e,2020-2022,2026,2030,2039-203a,2044,2074,20ac,2122,2212,2248,2260,2264-2265"
  .split(",")
  .map((part) => {
    const [a, b] = part.split("-");
    return [parseInt(a, 16), parseInt(b ?? a, 16)];
  });

/** True when every character in `text` exists in the display face. */
export function isDisplaySafe(text) {
  if (!text) return true;
  for (const char of String(text).normalize("NFC")) {
    const cp = char.codePointAt(0);
    if (cp === 0x0a || cp === 0x0d) continue;
    if (!RANGES.some(([lo, hi]) => cp >= lo && cp <= hi)) return false;
  }
  return true;
}

/**
 * Class to put on a guest name / any user-supplied string.
 * Returns TAN Aegean when safe, DFVN Big Bang when not.
 */
export function displayFontClass(text) {
  return isDisplaySafe(text) ? "font-display" : "font-display-vn";
}
