import { unstable_cache } from "next/cache";
import { normaliseLang } from "@/data/content";
import { snapshot } from "@/data/guests";

/**
 * GUEST REGISTRY — read from the couple's Google Sheet at runtime.
 *
 * The sheet is the single place anything is edited: type a name into the
 * `Guests` tab and that guest's link is live within a minute, no redeploy. The
 * same Apps Script Web App that receives RSVPs answers the read, so there is
 * one URL and one secret to configure (see docs/RSVP_SETUP.md).
 *
 * The read goes through unstable_cache, not a hand-rolled timer. That is not
 * only about hit rate: an uncached fetch inside a page that exports
 * `revalidate` throws "Page changed from static to dynamic at runtime" the
 * first time an invitation is rendered on demand. Cached data keeps the
 * invitation pages prerenderable, which is what makes them fast.
 *
 * Availability matters more than freshness here — a guest tapping their link
 * must never see a 404 because Google was slow. Three levels of fallback:
 *
 *   1. the Next data cache, refreshed every GUESTS_TTL_SECONDS
 *   2. the last good response, however old, if the sheet read fails
 *   3. src/data/guests.js — a snapshot committed to git, so even a cold
 *      instance during a Google outage still serves every invitation
 */

const ENDPOINT = process.env.RSVP_WEBHOOK_URL;
const SECRET = process.env.RSVP_SHARED_SECRET;

/** Matches `export const revalidate` on the invitation pages. */
export const GUESTS_TTL_SECONDS = 60;

/**
 * Shared by every render in a build and by every request after it, so
 * generateStaticParams and the page body can never disagree about who exists.
 */
const readSheet = unstable_cache(fetchFromSheet, ["guest-registry"], {
  revalidate: GUESTS_TTL_SECONDS,
  tags: ["guests"],
});

/** Survives a failed refresh; only ever holds a list the sheet really returned. */
let lastGood = null;

export async function getGuests() {
  if (!ENDPOINT) return snapshot; // sheet not wired up yet
  try {
    const list = await readSheet();
    lastGood = list;
    return list;
  } catch (error) {
    console.error("[guests] sheet read failed", error);
    return lastGood ?? snapshot;
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
    // unstable_cache above owns the caching; this fetch is the cache miss.
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

/** The sheet carries name/seats/slug/lang; everything else takes a default. */
function normalise(row) {
  const seats = Number.parseInt(row.seats, 10);
  // The Seats cell doubles as the table assignment. Kept as written (and null
  // while blank) so the thank-you note can tell "not seated yet" from a table.
  const table = String(row.table ?? row.seats ?? "").trim();
  return {
    slug: String(row.slug ?? "").trim(),
    name: String(row.name ?? "").trim(),
    seats: Number.isFinite(seats) && seats > 0 ? seats : 2,
    table: table || null,
    // A blank Lang cell means English — the language the hero video is cut in.
    lang: normaliseLang(row.lang),
    luckyNumber: String(row.luckyNumber ?? "").trim() || null,
    note: String(row.note ?? "").trim() || undefined,
  };
}
