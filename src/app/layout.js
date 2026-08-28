import { cormorant, dfvnBigBang, tanAegean, tanPearl } from "./fonts";
import { wedding } from "@/data/wedding";
import { DEFAULT_LANG, getContent } from "@/data/content";
import "./globals.css";
/* The shared link has no guest, so it carries the default language. */
const site = getContent(DEFAULT_LANG).intro;

export const metadata = {
  metadataBase: new URL("https://ducanhdiemmy.gloweb.site"),
  title: `${site.groom} & ${site.bride} — Wedding Invitation`,
  description: `Join us at ${wedding.venue.name} on ${wedding.dateLabel}. (Please view on mobile)`,
  openGraph: {
    title: `${site.groom} & ${site.bride}`,
    description: `${wedding.dateLabel} · ${wedding.venue.name} (Please view on mobile)`,
    type: "website",
    images: ["/social_preview_v2.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/social_preview_v2.jpg"],
  },
  robots: { index: false, follow: false }, // private invitation
};

export const viewport = {
  themeColor: "#0f2e4e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${tanAegean.variable} ${tanPearl.variable} ${dfvnBigBang.variable} ${cormorant.variable}`}
    >
      <body>
        {children}
      </body>
    </html>
  );
}
