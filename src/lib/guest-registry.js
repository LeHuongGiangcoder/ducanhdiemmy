import { snapshot } from "@/data/guests";

/**
 * GUEST REGISTRY — read from the couple's Google Sheet at runtime.
 *
 * The sheet is the single place anything is edited: type a name into the
 * `Guests` tab and that guest's link is live within a minute, no redeploy. The
 * same Apps Script Web App that receives RSVPs answers the read, so there is
 * one URL and one secret to configure (see docs/RSVP_SETUP.md).
 *
 * Availability matters more than freshness here — a guest tapping their link
 * must never see a 404 because Google was slow. Three levels of fallback:
 *
 *   1. in-process cache, refreshed every TTL_MS
 *   2. the last good response, however old, if the sheet read fails
 *   3. src/data/guests.js — a snapshot committed to git, so even a cold
 *      instance during a Google outage still serves every invitation
 */

const ENDPOINT = process.env.RSVP_WEBHOOK_URL;
const SECRET = process.env.RSVP_SHARED_SECRET;

/** Matches `export const revalidate` on the invitation pages. */
export const GUESTS_TTL_SECONDS = 60;
const TTL_MS = GUESTS_TTL_SECONDS * 1000;

let cache = { at: 0, list: null };

export async function getGuests() {
  if (cache.list && Date.now() - cache.at < TTL_MS) return cache.list;

  if (!ENDPOINT) return snapshot; // sheet not wired up yet
  try {
    const list = await fetchFromSheet();
    cache = { at: Date.now(), list };
    return list;
  } catch (error) {
    console.error("[guests] sheet read failed", error);
    return cache.list ?? snapshot;
  }
}

export async function getGuest(slug) {
  if (!slug) return null;
  const list = await getGuests();
  return list.find((g) => g.slug === slug) ?? null;
}

export async function allSlugs() {
  const list = await getGuests();
  return list.map((g) => g.slug);
}

async function fetchFromSheet() {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "guests", secret: SECRET }),
    // This module does its own caching; Next must not layer another on top.
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  // Apps Script answers 200 even when the script threw, so the body decides.
  let body = null;
  try {
    body = await res.json();
  } catch {
    // Non-JSON (usually a Google sign-in page) — treated as a failure.
  }

  if (!res.ok || !body?.ok) {
    throw new Error(body?.error ?? `HTTP ${res.status}`);
  }
  if (!Array.isArray(body.guests)) {
    throw new Error("Malformed guest list");
  }
  // An empty sheet would blank every invitation — refuse it and keep the
  // previous list rather than serving a site with no guests on it.
  if (body.guests.length === 0) {
    throw new Error("Sheet returned no guests");
  }

  return body.guests.map(normalise).filter((g) => g.slug && g.name);
}

/** The sheet only carries name/seats/slug; everything else takes a default. */
function normalise(row) {
  const seats = Number.parseInt(row.seats, 10);
  return {
    slug: String(row.slug ?? "").trim(),
    salutation: String(row.salutation ?? "").trim() || "Dear",
    name: String(row.name ?? "").trim(),
    seats: Number.isFinite(seats) && seats > 0 ? seats : 2,
    luckyNumber: String(row.luckyNumber ?? "").trim() || null,
    note: String(row.note ?? "").trim() || undefined,
  };
}
