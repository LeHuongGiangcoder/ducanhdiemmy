import { notFound } from "next/navigation";
import Invitation from "@/components/Invitation";
import { allSlugs, getGuest } from "@/lib/guest-registry";
import { couple, wedding } from "@/data/wedding";

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

  return {
    title: `R.S.V.P. — ${guest.salutation} ${guest.name}`,
    description: `${wedding.dateLabel} · ${wedding.venue.name}`,
    robots: { index: false, follow: false },
  };
}

export default async function GuestRsvpPage({ params }) {
  const { slug } = await params;
  const guest = await getGuest(slug);
  if (!guest) notFound();

  return <Invitation guest={guest} bypassIntro={true} />;
}
