import { notFound } from "next/navigation";
import Invitation from "@/components/Invitation";
import Unavailable from "@/components/Unavailable";
import { allSlugs, getGuest, lookupGuest, publicGuest } from "@/lib/guest-registry";
import { wedding } from "@/data/wedding";
import { getContent } from "@/data/content";

export async function generateStaticParams() {
  return (await allSlugs()).map((slug) => ({ slug }));
}

/** Same contract as /[slug]: names added after the build render on demand. */
export const dynamicParams = true;

export const revalidate = 60; // keep in sync with GUESTS_TTL_SECONDS

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guest = await getGuest(slug);
  if (!guest) return {};

  // The tab title speaks the guest's language too.
  const t = getContent(guest.lang);

  return {
    title: `${t.rsvp.title} — ${guest.name}`,
    description: `${wedding.dateLabel} · ${wedding.venue.name}`,
    robots: { index: false, follow: false },
  };
}

export default async function GuestRsvpPage({ params }) {
  const { slug } = await params;
  const { guest, live } = await lookupGuest(slug);
  // Same rule as the invitation page: an unreadable sheet is not a 404, and
  // must not answer as one. See src/app/[slug]/page.js.
  if (!guest && !live) return <Unavailable />;
  if (!guest) notFound();

  return <Invitation guest={publicGuest(guest)} bypassIntro={true} />;
}
