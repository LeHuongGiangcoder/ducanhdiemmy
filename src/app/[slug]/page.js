import { notFound } from "next/navigation";
import Invitation from "@/components/Invitation";
import { allSlugs, getGuest } from "@/data/guests";
import { couple, wedding } from "@/data/wedding";

/**
 * One prerendered invitation per guest. The registry is build-time content, so
 * these pages are fully static — no database read stands between a guest
 * tapping their link and seeing their own name.
 */
export function generateStaticParams() {
  return allSlugs().map((slug) => ({ slug }));
}

/** Only known guests get a page; unknown slugs 404 rather than render blank. */
export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guest = getGuest(slug);
  if (!guest) return {};

  return {
    title: `${guest.salutation} ${guest.name} — ${couple.groom} & ${couple.bride}`,
    description: `${wedding.dateLabel} · ${wedding.venue.name}`,
    robots: { index: false, follow: false },
  };
}

export default async function GuestPage({ params }) {
  const { slug } = await params;
  const guest = getGuest(slug);
  if (!guest) notFound();

  return <Invitation guest={guest} />;
}
