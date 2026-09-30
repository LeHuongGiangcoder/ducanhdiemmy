import { notFound } from "next/navigation";
import Invitation from "@/components/Invitation";
import Unavailable from "@/components/Unavailable";
import { allSlugs, getGuest, lookupGuest, publicGuest } from "@/lib/guest-registry";
import { wedding } from "@/data/wedding";
import { getContent } from "@/data/content";

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

  // The tab title speaks the guest's language too.
  const t = getContent(guest.lang);

  return {
    title: `${t.hero.salutation} ${guest.name} — ${t.intro.groom} & ${t.intro.bride}`,
    description: `${wedding.dateLabel} · ${wedding.venue.name}`,
    robots: { index: false, follow: false },
  };
}

export default async function GuestPage({ params }) {
  const { slug } = await params;
  const { guest, live } = await lookupGuest(slug);

  /*
   * A miss is only a 404 when the sheet actually SAID so.
   *
   * This is the bug guests reported. A sheet read that timed out used to
   * return the committed snapshot, the guest's slug was not in it, and the
   * page called notFound() on a guest who plainly exists. The 404 page offers
   * the general invitation, and the general invitation asks for a code — so a
   * personalised link that should have opened straight onto their name sent
   * them to the gate to type a number instead.
   *
   * And it stuck: this route is ISR-cached, so that one bad read was written
   * into the cache and served to EVERYONE opening that link for the next few
   * minutes. Caching is not avoidable here — a render that throws is cached
   * just the same, measured; `x-nextjs-prerender: 1` comes back either way.
   * So the answer is not to dodge the cache but to never produce the wrong
   * answer in the first place, in three places at once:
   *
   *   1. the snapshot now holds the real 482 guests, not four demo rows, so a
   *      failed read still finds almost everybody (src/data/guests.js);
   *   2. the read retries and waits longer before it gives up
   *      (src/lib/guest-registry.js);
   *   3. and what is left — a guest added since the last snapshot, opening
   *      their link mid-outage — gets the screen below rather than the gate.
   */
  if (!guest && !live) return <Unavailable />;
  if (!guest) notFound();

  // Their own link: no code to type, the invitation opens on the button alone.
  // publicGuest drops the `code` field — the invitation is a client component,
  // so anything handed to it is readable in the page source.
  return <Invitation guest={publicGuest(guest)} />;
}
