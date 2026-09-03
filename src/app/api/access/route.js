import { getGuestByCode, publicGuest } from "@/lib/guest-registry";

/**
 * POST /api/access — the code typed at the master link.
 *
 * ducanhdiemmy.gloweb.site is the one address printed on the cards, the same
 * for everybody. What makes it personal is the three-digit number in the `No`
 * column, printed alongside it: this route trades that code for the guest's
 * invitation, so the master link lands on their name, their language and their
 * table without anyone having to send out four hundred different URLs.
 *
 * A guest who already has their own /slug link never comes through here.
 *
 * The read is uncached — someone added to the sheet a minute ago must be able
 * to get in — and the reply carries no code, only the invitation it unlocked.
 */
export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const code = String(payload.code ?? "").trim();
  if (!code) return Response.json({ ok: false }, { status: 400 });

  const guest = await getGuestByCode(code);
  if (!guest) return Response.json({ ok: false }, { status: 404 });

  return Response.json({ ok: true, guest: publicGuest(guest) });
}
