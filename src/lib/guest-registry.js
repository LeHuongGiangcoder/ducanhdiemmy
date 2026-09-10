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
 *
 * What is cached is the sheet's own answer — the raw rows — and NOT the guest
 * objects normalise() makes of them. That distinction cost a release: the data
 * cache outlives a deployment, so when `anHoi` was added to normalise() the
 * new build went on being handed guest objects shaped by the old one, and
 * every guest arrived without the field. Their invitations rendered as though
 * nobody had been invited to the ceremonies.
 *
 * Caching the rows puts the boundary in the right place. A row is what Google
 * said; a guest is what this file decides a row means, and that meaning is now
 * recomputed on every read, so it can never be served stale from a build that
 * no longer exists.
 *
 * The key is versioned for the same reason — it is what makes the entries the
 * old code wrote unreachable rather than merely wrong. Bump it whenever what
 * goes INTO the cache changes shape.
 */
const readRows = unstable_cache(fetchRows, ["guest-registry", "rows-v1"], {
  revalidate: GUESTS_TTL_SECONDS,
  tags: ["guests"],
});

/** Rows as they came off the sheet → guests as the site understands them. */
function shape(rows) {
  return rows.map(normalise).filter((g) => g.slug && g.name);
}

/** Survives a failed refresh; only ever holds a list the sheet really returned. */
let lastGood = null;

/** The committed snapshot, put through the same shaping as a sheet row. */
const fallback = snapshot.map(normalise);

export async function getGuests() {
  if (!ENDPOINT) return fallback; // sheet not wired up yet
  try {
    const list = shape(await readRows());
    lastGood = list;
    return list;
  } catch (error) {
    console.error("[guests] sheet read failed", error);
    return lastGood ?? fallback;
  }
}

export async function getGuest(slug) {
  if (!slug) return null;
  const list = await getGuests();
  return list.find((g) => g.slug === slug) ?? null;
}

/**
 * The list read straight from the sheet, with the cache stepped over.
 *
 * For the two places where a minute-old answer would be the wrong answer: the
 * code someone just typed at the master link, and the table number the couple
 * may have assigned since the page was rendered. Everything else goes through
 * getGuests, which is cached and keeps the invitations prerenderable.
 *
 * Falls back to the cached list rather than failing — a slow sheet must not
 * turn into a guest who can't get in.
 */
async function readFresh() {
  try {
    const list = shape(await fetchRows());
    lastGood = list;
    return list;
  } catch (error) {
    console.error("[guests] fresh sheet read failed", error);
    return getGuests();
  }
}

export async function getGuestFresh(slug) {
  if (!slug) return null;
  const list = await readFresh();
  return list.find((g) => g.slug === slug) ?? null;
}

/**
 * Look a guest up by the code they typed at the master link — the three-digit
 * `No` from their row. This is a lookup, not a check: the code is how someone
 * arriving at ducanhdiemmy.gloweb.site says which invitation is theirs.
 */
export async function getGuestByCode(code) {
  const wanted = normaliseCode(code);
  if (!wanted) return null;
  const list = await readFresh();
  return list.find((g) => g.code && g.code === wanted) ?? null;
}

/**
 * The guest as the browser is allowed to see them — everything except `code`.
 *
 * The invitation is a client component, so whatever it is handed is in the page
 * source. Nobody's code needs to be there for the invitation to render, so it
 * is dropped on the way out.
 */
export function publicGuest(guest) {
  if (!guest) return guest;
  const { code, ...rest } = guest;
  return rest;
}

export async function allSlugs() {
  const list = await getGuests();
  return list.map((g) => g.slug);
}

/** The sheet's rows, untouched. Shaping into guests happens after the cache. */
async function fetchRows() {
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

  return body.guests;
}

/** The sheet carries name/seats/slug/lang; everything else takes a default. */
function normalise(row) {
  const seats = Number.parseInt(row.seats, 10);
  // Kept exactly as written, and null while blank, so the confirmation card can
  // tell "not seated yet" from a table. Never falls back to Seats: a party of
  // two would come out as table 2, which reads as an answer and isn't one.
  const table = String(row.table ?? "").trim();
  const count = Number.parseInt(row.guestCount, 10);
  return {
    slug: String(row.slug ?? "").trim(),
    name: String(row.name ?? "").trim(),
    // The No column, three digits — the code the guest types at the gate.
    // Never sent to the browser; see publicGuest().
    code: normaliseCode(row.code ?? row.no),
    seats: Number.isFinite(seats) && seats > 0 ? seats : 2,
    table: table || null,
    // The reply already on the sheet, so a guest returning to their link sees
    // their own answer rather than an empty form. `null` means "hasn't replied".
    attending: row.attending === true ? true : row.attending === false ? false : null,
    guestCount: Number.isFinite(count) && count > 0 ? count : 0,
    // A blank Lang cell means English — the language the hero video is cut in.
    lang: normaliseLang(row.lang),
    /*
     * Whether this guest is also asked to the ăn hỏi and vu quy at the two
     * family homes. Only a row that actually says yes gets the toggle on their
     * invitation — a blank cell, a missing column, or a sheet that predates
     * the column all mean no, which is the safe direction to be wrong in: a
     * guest who should have been invited will say so, whereas one who is shown
     * an address they were never meant to have cannot be un-shown it.
     */
    anHoi: isYes(row.anHoi),
    luckyNumber: String(row.luckyNumber ?? "").trim() || null,
    note: String(row.note ?? "").trim() || undefined,
  };
}

/**
 * A yes/no cell, in whatever the sheet happens to hold.
 *
 * The script already folds the column down to YES/NO, but a checkbox column
 * arrives as a real boolean and a hand-typed cell as anything at all. Only an
 * explicit yes counts; everything else — blank, "no", a typo, the column not
 * existing — is no.
 */
function isYes(value) {
  if (value === true) return true;
  const text = String(value ?? "").trim().toLowerCase();
  return text === "yes" || text === "y" || text === "true" || text === "1" || text === "có" || text === "co" || text === "x";
}

/**
 * "1", 1, "01" and "001" are all the same guest, so codes are compared in one
 * shape: digits only, padded to at least three. Anything with no digits in it
 * at all (a blank No cell) yields "", which no submitted code can match.
 */
export function normaliseCode(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.padStart(3, "0");
}
