import { cormorant, tanAegean, tanPearl } from "./fonts";
import { couple, wedding } from "@/data/wedding";
import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://ducanhdiemmy.com"),
  title: `${couple.groom} & ${couple.bride} — Wedding Invitation`,
  description: `Join us at ${wedding.venue.name} on ${wedding.dateLabel}.`,
  openGraph: {
    title: `${couple.groom} & ${couple.bride}`,
    description: `${wedding.dateLabel} · ${wedding.venue.name}`,
    type: "website",
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
      className={`${tanAegean.variable} ${tanPearl.variable} ${cormorant.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
