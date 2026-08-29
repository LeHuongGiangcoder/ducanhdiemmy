/**
 * Every word on the invitation, in both languages.
 *
 * The couple invite guests who read English and guests who read Vietnamese, so
 * each guest's row in the sheet carries a `Lang` and their invitation is
 * rendered in it. One code path, two dictionaries — never two builds, which
 * would be two things to remember to change.
 *
 * Structural data (times, hex values, map URL, the date itself) stays in
 * wedding.js: it is the same in both languages, and duplicating it here would
 * be an invitation to let the two drift apart.
 *
 * A few headings are deliberately left in English in the Vietnamese version —
 * "Dress code", "Timeline", "R.S.V.P." — at the couple's request. Strings that
 * do carry Vietnamese tone marks are set in DFVN Big Bang automatically; see
 * src/lib/aegean.js.
 */

const en = {
  intro: {
    eyebrow: "Save the Date",
    groom: "Duc Anh",
    bride: "Diem My",
    cta: "Open Invitation",
  },
  hero: {
    src: "/hero%20final.mp4",
    salutation: "Dear",
  },
  venue: {
    eyebrow: "The Celebration",
    title: "Venue",
    address: "27–29 Ly Thai To, Hoan Kiem, Hanoi",
    mapLink: "View on Google Maps",
  },
  dressCode: {
    eyebrow: "For the Occasion",
    title: "Dress code",
    headline: "Elegant & Formal attire",
    paletteHeading: "Dress Palette",
    swatches: ["Midnight\nBlue", "Ocean\nBlue", "Black", "Ivory"],
  },
  timeline: {
    eyebrow: "The Evening",
    title: "Timeline",
    items: [
      { title: "Welcome Reception", subtitle: "Drinks, canapés, live music & photographs" },
      { title: "Wedding Ceremony" },
      { title: "Dinner Reception", subtitle: "Dinner, curated wines & spirits, live performances & lucky draws" },
      { title: "Evening Celebration", subtitle: "Games, gifts & special moments" },
      { title: "DJ & After Party", subtitle: "Music, drinks & dancing" },
    ],
    /* The break is deliberate and matches the Vietnamese note: the closing
       phrase gets the second line to itself in both versions. Rendered with
       white-space: pre-line — see .note in Timeline.module.css. */
    note: "Please keep your lucky number close\nthroughout the evening.",
  },
  rsvp: {
    eyebrow: "Kindly Reply",
    title: "R.S.V.P.",
    intro: "We would be delighted to have you join us.",
    /** Prefixes the guest's name. Empty in Vietnamese, where the name stands alone. */
    forPrefix: "For",
    nameLabel: "Your name",
    attendingLegend: "Will you be joining us?",
    accept: "Joyfully accept",
    decline: "Regretfully decline",
    guestsLegend: "Number of guests",
    submit: "Send Response",
    sending: "Sending…",
    deadline: "Kindly reply by 20 September.",
    luckyPrefix: "Your lucky number is",
    luckySuffix: "— please keep it close throughout the evening.",
    thanksAccept: "Thank you — we can't wait to celebrate with you.",
    thanksDecline: "Thank you for letting us know. You will be missed.",
    errorGeneric: "Something went wrong.",
    errorAttending: "Please let us know if you can join us.",
  },
  thankYou: {
    headline: "Thank You",
    body: "Some moments are made\nall the more meaningful\nby the people we share them with.\nThank you for being part of ours.",
    signoff: "With Love",
  },
  menu: {
    open: "Open menu",
    close: "Close menu",
    links: ["Home", "Venue", "Dress Code", "Timeline", "R.S.V.P."],
  },
  music: {
    play: "Play music",
    pause: "Pause music",
  },
};

const vi = {
  intro: {
    eyebrow: "Save the Date",
    groom: "Đức Anh",
    bride: "Diễm My",
    cta: "Mở thiệp mời",
  },
  hero: {
    src: "/hero%20final%20viet.mp4?v=2",
    salutation: "Trân trọng kính mời",
  },
  venue: {
    eyebrow: "Lễ Thành Hôn",
    title: "Địa điểm",
    address: "27–29 Lý Thái Tổ, Hoàn Kiếm, Hà Nội",
    mapLink: "Xem chỉ đường",
  },
  dressCode: {
    eyebrow: "Trang phục dự tiệc",
    title: "Dress code",
    headline: "Trang trọng & Thanh lịch",
    paletteHeading: "Bảng màu gợi ý",
    swatches: ["Xanh\nNavy", "Xanh\nDương", "Đen", "Trắng\nNgà"],
  },
  timeline: {
    eyebrow: "Chương trình buổi tiệc",
    title: "Timeline",
    items: [
      { title: "Đón Khách", subtitle: "Đồ uống nhẹ, canapé, nhạc sống & chụp hình" },
      { title: "Lễ Thành Hôn" },
      { title: "Khai Tiệc", subtitle: "Tiệc tối, rượu vang & rượu mạnh tuyển chọn, biểu diễn trực tiếp & bốc thăm may mắn" },
      { title: "Chương Trình Giao Lưu", subtitle: "Trò chơi, quà tặng & những khoảnh khắc đặc biệt" },
      { title: "DJ & After Party", subtitle: "Âm nhạc, đồ uống & dancing" },
    ],
    note: "Vui lòng giữ số may mắn bên mình\ntrong suốt buổi tiệc.",
  },
  rsvp: {
    eyebrow: "Xác nhận tham dự",
    title: "R.S.V.P.",
    intro: "Chúng tôi rất mong được đón tiếp",
    forPrefix: "",
    nameLabel: "Tên của bạn",
    attendingLegend: "Xin vui lòng xác nhận",
    accept: "Hân hạnh tham dự.",
    decline: "Rất tiếc, không thể tham dự.",
    guestsLegend: "Số khách tham dự",
    submit: "Gửi phản hồi",
    sending: "Đang gửi…",
    deadline: "Vui lòng phản hồi trước ngày 20.09.2026.",
    luckyPrefix: "Số may mắn của bạn là",
    luckySuffix: "— vui lòng giữ bên mình trong suốt buổi tiệc.",
    thanksAccept: "Cảm ơn bạn — chúng tôi rất mong được gặp bạn trong ngày vui.",
    thanksDecline: "Cảm ơn bạn đã phản hồi. Chúng tôi sẽ nhớ bạn.",
    errorGeneric: "Đã có lỗi xảy ra.",
    errorAttending: "Vui lòng cho chúng tôi biết bạn có tham dự được không.",
  },
  thankYou: {
    headline: "Lời Cảm Ơn",
    body: "Niềm vui trong ngày trọng đại này\nsẽ càng trọn vẹn hơn khi được\nsẻ chia cùng những người chúng tôi\nyêu quý và trân trọng.\n\nCảm ơn vì đã dành thời gian,\ntình cảm và những lời chúc tốt đẹp\ncho dấu mốc đặc biệt này của chúng tôi.",
    signoff: "Thân mến",
  },
  menu: {
    open: "Mở menu",
    close: "Đóng menu",
    links: ["Trang chủ", "Địa điểm", "Trang phục", "Chương trình", "Xác nhận"],
  },
  music: {
    play: "Bật nhạc",
    pause: "Tắt nhạc",
  },
};

const dictionaries = { en, vi };

export const LANGUAGES = Object.keys(dictionaries);
export const DEFAULT_LANG = "en";

/** Anything unrecognised — blank cell, a typo, "English" — falls back to `en`. */
export function normaliseLang(value) {
  const key = String(value ?? "").trim().toLowerCase().slice(0, 2);
  return dictionaries[key] ? key : DEFAULT_LANG;
}

export function getContent(lang) {
  return dictionaries[normaliseLang(lang)];
}
