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
  variable: "--font-body",
  display: "swap",
  fallback: ["Georgia", "serif"],
});
