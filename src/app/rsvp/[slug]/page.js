import { notFound } from "next/navigation";
import Rsvp from "@/components/Rsvp";
import { allSlugs, getGuest } from "@/data/guests";
import { couple, wedding } from "@/data/wedding";

export function generateStaticParams() {
  return allSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guest = getGuest(slug);
  if (!guest) return {};

  return {
    title: `R.S.V.P. — ${guest.salutation} ${guest.name}`,
    description: `${wedding.dateLabel} · ${wedding.venue.name}`,
    robots: { index: false, follow: false },
  };
}

export default async function GuestRsvpPage({ params }) {
  const { slug } = await params;
  const guest = getGuest(slug);
  if (!guest) notFound();

  return (
    <main>
      <Rsvp guest={guest} />
    </main>
  );
}
