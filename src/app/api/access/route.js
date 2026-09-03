import { getGuestFresh, normaliseCode } from "@/lib/guest-registry";

/**
 * POST /api/access — the gate on a personal invitation.
 *
 * Each guest's row carries a three-digit number in the `No` column, printed on
 * what they were sent. Typing it is what opens their invitation, so a link that
 * gets forwarded on doesn't open by itself.
 *
 * The comparison happens here rather than in the browser on purpose: the code
 * is never part of the page, so it cannot be read out of the source. The read
 * is uncached — a guest added to the sheet a moment ago must be able to get in.
 */
export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const slug = String(payload.slug ?? "").trim();
  const code = normaliseCode(payload.code);

  if (!slug || !code) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const guest = await getGuestFresh(slug);
  // A wrong slug and a wrong code answer the same way, so the endpoint can't be
  // used to find out which invitations exist.
  if (!guest || !guest.code || guest.code !== code) {
    return Response.json({ ok: false }, { status: 401 });
  }

  return Response.json({ ok: true });
}
