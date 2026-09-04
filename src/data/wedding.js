/**
 * Structural facts about the wedding — the same in every language.
 *
 * Wording lives in src/data/content.js, one entry per language. Anything that
 * would have to be repeated identically in both dictionaries belongs here
 * instead, so the two can never drift apart.
 */

export const couple = {
  // Full names as they appear burnt into the hero video.
  groomFull: "Vu Trung Duc Anh",
  brideFull: "Nguyen Tat Diem My",
  initials: "D.A & D.M",
  monogram: "/assets/monogram-couple.png",
};

export const wedding = {
  // Taken from the card composed into the hero video: FRIDAY | OCTOBER 02 | 17:45 | 2026
  date: "2026-10-02T17:45:00+07:00",
  dateLabel: "Friday, 02 October 2026",
  dateShort: "02 · 10 · 2026",
  timeLabel: "17:45",
  venue: {
    // A proper noun and a hotel's own room name — untranslated in both versions.
    name: "Fairmont Hanoi",
    mark: "/assets/venue.webp",
    hall: "Grand Ballroom",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Fairmont+Hanoi",
  },
};

/** Running order. Titles and detail lines are per-language, in content.js. */
export const timelineTimes = ["17:45", "18:45", "19:15", "20:30", "21:30"];

/** Swatch colours. Their names are per-language, in content.js. */
export const dressPalette = ["#0A1422", "#3d6285", "#111111", "#e8dcc8", "#a1907f"];

/** Fallback used at `/` — anyone opening the site without a personal link. */
export const defaultGuest = {
  slug: "",
  name: "Honoured Guest",
  seats: 2,
  luckyNumber: null,
  lang: "en",
  table: null,
  // No row in the sheet, so there is no reply to look up and no table to show.
  attending: null,
  guestCount: 0,
};
