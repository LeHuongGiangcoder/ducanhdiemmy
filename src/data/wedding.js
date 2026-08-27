/**
 * Single source of truth for every piece of wedding content.
 * Edit here — no section component hardcodes copy.
 */

export const couple = {
  groom: "Duc Anh",
  bride: "Diem My",
  // Full names as they appear burnt into "hero final.mp4".
  groomFull: "Vu Trung Duc Anh",
  brideFull: "Nguyen Tat Diem My",
  initials: "D.A & D.M",
  monogram: "/assets/monogram-couple.png",
};

export const wedding = {
  // Taken from the card composed into "hero final.mp4": FRIDAY | OCTOBER 02 | 17:45 | 2026
  date: "2026-10-02T17:45:00+07:00",
  dateLabel: "Friday, 02 October 2026",
  dateShort: "02 · 10 · 2026",
  timeLabel: "17:45",
  venue: {
    name: "Fairmont Hanoi",
    mark: "/assets/venue.webp",
    hall: "Grand Ballroom, B1 Floor",
    address: "27–29 Ly Thai To, Hoan Kiem, Hanoi",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Fairmont+Hanoi",
  },
};

export const timeline = [
  {
    time: "17:45",
    title: "Welcome Reception",
    subtitle: "Drinks, canapés, live music & photographs",
  },
  { time: "18:45", title: "Wedding Ceremony" },
  {
    time: "19:15",
    title: "Dinner Reception",
    subtitle: "Dinner, curated wines & spirits, live performances & lucky draws",
  },
  {
    time: "20:30",
    title: "Evening Celebration",
    subtitle: "Games, gifts & special moments",
  },
  {
    time: "21:30",
    title: "DJ & After Party",
    subtitle: "Music, drinks & dancing",
  },
];

/** Small print under the timeline. */
export const timelineNote =
  "Please keep your lucky number close throughout the evening.";

export const dressCode = {
  headline: "Elegant & formal attire",
  paletteHeading: "Dress Palette",
  swatches: [
    { name: "Midnight Blue", hex: "#0f2e4e" },
    { name: "Ocean Blue", hex: "#3d6285" },
    { name: "Black", hex: "#111111" },
    { name: "Ivory", hex: "#e8dcc8" },
  ],
};

export const thankYou = {
  headline: "Thank You",
  body: "Some moments are made\nall the more meaningful\nby the people we share them with.\nThank you for being part of ours.",
  signoff: "With Love",
};

/** Fallback used at `/` — anyone opening the site without a personal link. */
export const defaultGuest = {
  slug: "",
  salutation: "Dear",
  name: "Honoured Guest",
  seats: 2,
  luckyNumber: null,
};
