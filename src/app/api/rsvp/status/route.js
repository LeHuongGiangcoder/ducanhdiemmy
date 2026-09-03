import { getGuestFresh, publicGuest } from "@/lib/guest-registry";

/**
 * GET /api/rsvp/status?slug=… — this guest's row as it stands right now.
 *
 * The invitation page is cached for a minute and may have been prerendered days
 * ago, so it is the wrong place to read a reply from. Two things change under
 * it: the couple assign a table long after the guest replied, and the guest may
 * have replied from another device. Both are answered by reading the sheet
 * uncached, which is what this route is for.
 */
export const dynamic = "force-dynamic";

export async function GET(request) {
  const slug = new URL(request.url).searchParams.get("slug")?.trim();
  if (!slug) return Response.json({ error: "Missing slug." }, { status: 400 });

  const guest = await getGuestFresh(slug);
  if (!guest) return Response.json({ error: "Unknown invitation." }, { status: 404 });

  const { name, table, attending, guestCount, seats } = publicGuest(guest);
  return Response.json({ ok: true, name, table, attending, guestCount, seats });
}
