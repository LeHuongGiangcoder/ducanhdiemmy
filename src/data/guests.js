/**
 * GUEST REGISTRY — the personalised invitation list.
 *
 * Every entry becomes its own prerendered page at `/<slug>`, and every RSVP is
 * written back to the sheet keyed by that same slug. Add a guest here, redeploy,
 * and their link is live.
 *
 *   slug        URL segment. Lowercase, a–z 0–9 and hyphens only. Must be unique.
 *   salutation  Prefix rendered above the name — "Dear", "Kính mời", …
 *   name        Rendered over the hero video. Vietnamese diacritics are fine:
 *               names that TAN Aegean can't set fall back to Cormorant whole
 *               (see src/lib/aegean.js), so they never render half-broken.
 *   seats       Max people this invitation admits — caps the RSVP guest count.
 *   luckyNumber Printed on their card for the 10 PM lucky draw. Optional.
 *   note        Optional private line shown only on their invitation.
 *
 * Bulk import: paste the couple's spreadsheet through `npm run guests:import`
 * (see scripts/import-guests.mjs) rather than hand-writing hundreds of rows.
 */

export const guests = [
  {
    slug: "mr-nguyen-van-an",
    salutation: "Dear",
    name: "Mr. Nguyễn Văn An",
    seats: 2,
    luckyNumber: "018",
  },
  {
    slug: "ms-tran-thi-bao-ngoc",
    salutation: "Dear",
    name: "Ms. Trần Thị Bảo Ngọc",
    seats: 1,
    luckyNumber: "019",
  },
  {
    slug: "mr-and-mrs-le",
    salutation: "Dear",
    name: "Mr. & Mrs. Le",
    seats: 4,
    luckyNumber: "020",
    note: "We have kept a table by the window for your family.",
  },
  {
    slug: "james-carter",
    salutation: "Dear",
    name: "James Carter",
    seats: 2,
    luckyNumber: "021",
  },
];

const bySlug = new Map(guests.map((g) => [g.slug, g]));

export function getGuest(slug) {
  return bySlug.get(slug) ?? null;
}

export function allSlugs() {
  return guests.map((g) => g.slug);
}
