import { notFound } from "next/navigation";
import Invitation from "@/components/Invitation";
import { allSlugs, getGuest } from "@/lib/guest-registry";
import { couple, wedding } from "@/data/wedding";

/**
 * Every guest in the sheet is prerendered at build time, so the invitations
 * that exist when the site ships are served as static HTML.
 */
export async function generateStaticParams() {
  return (await allSlugs()).map((slug) => ({ slug }));
}

/**
 * A name added to the sheet after the build still works: the page is rendered
 * on demand the first time it is opened, then cached like the rest. An unknown
 * slug 404s from inside the page.
 */
export const dynamicParams = true;

/** How long a rendered invitation is served before the sheet is re-read. */
export const revalidate = 60; // keep in sync with GUESTS_TTL_SECONDS

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guest = await getGuest(slug);
  if (!guest) return {};

  return {
    title: `${guest.salutation} ${guest.name} — ${couple.groom} & ${couple.bride}`,
    description: `${wedding.dateLabel} · ${wedding.venue.name}`,
    robots: { index: false, follow: false },
  };
}

export default async function GuestPage({ params }) {
  const { slug } = await params;
  const guest = await getGuest(slug);
  if (!guest) notFound();

  return <Invitation guest={guest} />;
}
