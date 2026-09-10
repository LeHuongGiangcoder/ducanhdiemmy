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
  /*
   * The same two names carrying their tone marks — what the ceremony cards
   * set, and what the hero footage itself reads. Structural rather than
   * per-language: a name is not translated, so both dictionaries would hold
   * the identical string.
   */
  groomFullVn: "Vũ Trung Đức Anh",
  brideFullVn: "Nguyễn Tất Diễm My",
  initials: "D.A & D.M",
  monogram: "/assets/monogram-couple.png",
};

/**
 * The couple's parents, by household.
 *
 * Two places set these names — the gate on the families' version, and the
 * ceremony cards behind the toggle — so they live here rather than in either
 * of them. The honorific and the line break travel with the name because
 * both places want the same two lines: family name above, given name below.
 *
 * Where each break falls is settled by the couple's own card, not by taste:
 * the footage reads "NGUYỄN TẤT DIỄM MY", so the bride's father is
 * Nguyễn Tất / Kim Dũng and not Nguyễn / Tất Kim Dũng. Rendered with
 * white-space: pre-line.
 *
 * The household labels are per-language and live in content.js.
 */
export const families = {
  groom: ["Mr. Vũ\nHồng Khanh", "Mrs. Nguyễn\nNgọc Thanh"],
  bride: ["Mr. Nguyễn Tất\nKim Dũng", "Mrs. Lê\nHồng Ánh"],
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

/**
 * The traditional ceremonies — the other day, and the other invitation.
 *
 * Three days before the Fairmont reception the two families hold the rites at
 * their own homes: the ăn hỏi and vu quy at the bride's, the thành hôn at the
 * groom's, one continuous afternoon that moves between the two addresses. Not
 * every guest is asked to it, which is why the sheet carries a column for it
 * and the toggle only appears for the guests whose row says yes.
 *
 * Structural, so it lives here beside `wedding` rather than in either
 * dictionary: the date, the hour and the two addresses are the same sentence
 * in every language.
 */
export const engagement = {
  date: "2026-09-29T14:00:00+07:00",
  dateShort: "29 · 09 · 2026",
  timeLabel: "14:00",
  /*
   * The lunar date, as printed on the cards. Carried as a finished string
   * rather than computed: converting a Gregorian date to the sexagenary
   * calendar is a table lookup no one here needs shipped to a phone, and the
   * families have already written the line they want.
   */
  lunar: "ngày 19 tháng 08 năm Bính Ngọ",
  /*
   * Keyed by household, not by ceremony. The tab a guest picks is "whose home
   * am I going to", and each home holds whichever rite belongs to it — see
   * `ceremony.sides` in content.js for the wording each one carries.
   */
  homes: {
    groom: { address: "Số 29 Ngõ 36 Giang Văn Minh, Ba Đình, Hà Nội" },
    bride: { address: "Số 58 Hàng Cót, Hoàn Kiếm, Hà Nội" },
  },
};

/**
 * The afternoon's running order — one list, shown under either tab.
 *
 * Deliberately shared: it is a single sequence that crosses both houses (the
 * rước dâu at 16:30 is the move from one to the other), so splitting it in two
 * would leave each half describing a journey that ends nowhere.
 */
export const engagementTimes = ["15:00", "15:30", "15:45", "16:30", "17:00", "18:00"];

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
  // Nobody without a row is invited to the family ceremonies.
  anHoi: false,
};
