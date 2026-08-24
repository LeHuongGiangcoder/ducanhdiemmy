/**
 * Single source of truth for every piece of wedding content.
 * Edit here — no section component hardcodes copy.
 */

export const couple = {
  groom: "Duc Anh",
  bride: "Diem My",
  // Full names as they appear burnt into hero.mp4.
  groomFull: "Vu Trung Duc Anh",
  brideFull: "Nguyen Tat Diem My",
  initials: "D.A & D.M",
  monogram: "/assets/monogram.webp",
};

export const wedding = {
  // Taken from the card composed into hero.mp4: FRIDAY | OCTOBER 02 | 17:45 | 2026
  date: "2026-10-02T17:45:00+07:00",
  dateLabel: "Friday, 02 October 2026",
  dateShort: "02 . 10 . 2026",
  timeLabel: "17:45",
  venue: {
    name: "Fairmont Hanoi",
    mark: "/assets/venue.webp",
    address: "83A Ly Thuong Kiet, Hoan Kiem, Hanoi",
    // TODO — confirm the street address with the couple.
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Fairmont+Hanoi",
  },
};

export const timeline = [
  { time: "17:45", title: "Guest Arrival" },
  { time: "18:15", title: "Wedding Reception" },
  {
    time: "22:15",
    title: "Live Performance",
    subtitle: "Lucky draw",
    note: "Please keep your Lucky Number until the end of the celebration to receive a gift from the bride and groom.",
  },
];

export const dressCode = {
  headline: "Elegant and formal attire",
  body: "in shades of navy blue, black, cream, and blue.",
  swatches: [
    { name: "Navy blue", hex: "#0f2e4e" },
    { name: "Black", hex: "#111111" },
    { name: "Cream", hex: "#e8dcc8" },
    { name: "Blue", hex: "#3d6285" },
  ],
};

export const thankYou = {
  headline: "Thank You",
  body: "For standing beside us, for the years that led here, and for raising a glass to the ones ahead. Your presence is the finest thing on our table.",
  signoff: "With love,",
};

/** Fallback used at `/` — anyone opening the site without a personal link. */
export const defaultGuest = {
  slug: "",
  salutation: "Dear",
  name: "Honoured Guest",
  seats: 2,
  luckyNumber: null,
};
