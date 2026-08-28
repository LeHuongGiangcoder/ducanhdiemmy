import localFont from "next/font/local";

/**
 * TAN Aegean — all headings / section titles.
 * NOTE: this face has no Vietnamese diacritics (see src/lib/aegean.js).
 */
export const tanAegean = localFont({
  src: "../../public/font/TANAEGEAN-Regular.otf",
  variable: "--font-display",
  weight: "400",
  style: "normal",
  display: "swap",
  fallback: ["Cormorant Garamond", "Georgia", "serif"],
});

/** TAN Pearl — reserved exclusively for the couple's names. */
export const tanPearl = localFont({
  src: "../../public/font/TAN-PEARL.otf",
  variable: "--font-couple",
  weight: "400",
  style: "normal",
  display: "swap",
  fallback: ["Cormorant Garamond", "Georgia", "serif"],
});

/**
 * DFVN Big Bang — display face for Vietnamese names.
 *
 * TAN Aegean has no stacked tone marks, so a name like "Chị Minh Anh" used to
 * fall back to italic body copy and read as a different kind of text entirely.
 * This face carries the full Vietnamese set in a display weight, so a Vietnamese
 * name still looks like a name on an invitation.
 */
export const dfvnBigBang = localFont({
  // No space in the filename: it ends up in the font URL, and an older
  // in-app webview handling %20 badly means the face silently never arrives.
  src: "../../public/font/dfvn-big-bang.otf",
  variable: "--font-display-vn",
  weight: "400",
  style: "normal",
  display: "swap",
  fallback: ["Cormorant Garamond", "Georgia", "serif"],
});

/** Cormorant Garamond — body copy. Full Vietnamese coverage. */
export const cormorant = localFont({
  src: [
    {
      path: "../../public/font/CormorantGaramond-VariableFont_wght.ttf",
      weight: "300 700",
      style: "normal",
    },
    {
      path: "../../public/font/CormorantGaramond-Italic-VariableFont_wght.ttf",
      weight: "300 700",
      style: "italic",
    },
  ],
  variable: "--font-text",
  display: "swap",
  fallback: ["Georgia", "serif"],
});
