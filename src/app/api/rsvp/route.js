import { getGuest } from "@/data/guests";
import { defaultGuest } from "@/data/wedding";
import { saveRsvp } from "@/lib/rsvp-store";

/**
 * POST /api/rsvp
 *
 * The guest's slug arrives with the submission, so every response is tied back
 * to the named invitation without the guest retyping who they are. The server
 * re-reads the registry rather than trusting the client for name/seats.
 */

const MAX_MESSAGE = 800;

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const { slug = "", attending, guestCount, message = "", name = "" } = payload;

  // Resolve the invitation. An unknown slug is only allowed through as the
  // generic invitation, and then only with a typed-in name.
  const guest = slug ? getGuest(slug) : null;
  if (slug && !guest) {
    return Response.json({ error: "Unknown invitation." }, { status: 404 });
  }

  if (attending !== true && attending !== false) {
    return Response.json(
      { error: "Please let us know if you can join us." },
      { status: 400 },
    );
  }

  const displayName = (guest?.name ?? String(name).trim()).slice(0, 120);
  if (!displayName) {
    return Response.json({ error: "Please tell us your name." }, { status: 400 });
  }

  // Clamp the party size to what this invitation actually admits.
  const seats = guest?.seats ?? defaultGuest.seats;
  const count = attending
    ? Math.min(Math.max(Number.parseInt(guestCount, 10) || 1, 1), seats)
    : 0;

  const record = {
    slug: guest?.slug ?? "(direct)",
    name: displayName,
    attending,
    guestCount: count,
    seatsAllocated: seats,
    luckyNumber: guest?.luckyNumber ?? "",
    message: String(message).trim().slice(0, MAX_MESSAGE),
    submittedAt: new Date().toISOString(),
  };

  try {
    const result = await saveRsvp(record);
    return Response.json({ ok: true, storage: result.storage });
  } catch (error) {
    console.error("[rsvp] save failed", error);
    return Response.json(
      { error: "We couldn't save that just now. Please try again." },
      { status: 502 },
    );
  }
}
