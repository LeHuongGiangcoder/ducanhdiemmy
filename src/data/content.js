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
 * "Dress Code", "Timeline", "R.S.V.P." — at the couple's request. Strings that
 * do carry Vietnamese tone marks are set in DFVN Big Bang automatically; see
 * src/lib/aegean.js.
 */

const en = {
  intro: {
    eyebrow: "Save the Date",
    groom: "Duc Anh",
    bride: "Diem My",
    cta: "Open Invitation",
    /**
     * The master-link gate — the guest's code from the `No` column.
     *
     * Every string here is bilingual, and deliberately so: at the master link
     * nobody has said who they are yet, so there is no `Lang` to render in.
     * Once the code resolves, the invitation itself speaks one language only.
     * `codeCta` is separate from `cta` above for exactly that reason — a guest
     * on their own link gets the button in their own language.
     */
    codeLabel: "Mã khách mời · Guest Code",
    codePlaceholder: "000",
    codeCta: "Mở thiệp · Open Invitation",
    codeChecking: "Đang mở · Opening…",
    codeHint:
      "Vui lòng nhập mã khách mời được ghi trên thiệp.\nPlease enter the Guest Code shown on your invitation.",
    codeErrorEmpty:
      "Vui lòng nhập mã khách mời.\nPlease enter your Guest Code.",
    codeErrorWrong:
      "Không tìm thấy mã khách mời. Vui lòng kiểm tra lại mã trên thiệp.\nGuest Code not found. Please check the code shown on your invitation.",
    codeErrorNetwork:
      "Chưa kiểm tra được. Xin thử lại.\nConnection failed, please try again",
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
    title: "Dress Code",
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
    errorGeneric: "Something went wrong.",
    errorAttending: "Please let us know if you can join us.",
    /**
     * The card shown in place of the form once a reply is in — one of three,
     * chosen by whether the guest is coming and whether they have been seated.
     * `headline` is the number itself when there is one, so the table takes the
     * same slot in all three states.
     */
    confirm: {
      seated: {
        eyebrow: "For the Evening",
        title: "Your Table",
        body: (name) =>
          `Thank you for your kind response.\nWe look forward to sharing this special occasion with you.`,
      },
      pending: {
        eyebrow: "For the Evening",
        title: "Your Table",
        headline: "To be assigned",
        body: (name) =>
          `Thank you for your kind response.\nYour table number will appear here once seating arrangements are finalized.`,
        note: "Please check this invitation again before the celebration.",
      },
      declined: {
        eyebrow: "Thank You",
        title: "Your Response",
        headline: "Unable to attend",
        body: (name) =>
          `Thank you for your kind response.\nWe are sorry that you will not be able to share this special occasion with us.`,
      },
      edit: "Update Response",
    },
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
    /** Same bilingual gate as the English dictionary — see the note there. */
    codeLabel: "Mã khách mời · Guest Code",
    codePlaceholder: "000",
    codeCta: "Mở thiệp · Open Invitation",
    codeChecking: "Đang mở · Opening…",
    codeHint:
      "Vui lòng nhập mã khách mời được ghi trên thiệp.\nPlease enter the Guest Code shown on your invitation.",
    codeErrorEmpty:
      "Vui lòng nhập mã khách mời.\nPlease enter your Guest Code.",
    codeErrorWrong:
      "Không tìm thấy mã khách mời. Vui lòng kiểm tra lại mã trên thiệp.\nGuest Code not found. Please check the code shown on your invitation.",
    codeErrorNetwork:
      "Chưa kiểm tra được. Xin thử lại.\nWe couldn't check that just now. Please try again.",
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
    title: "Dress Code",
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
    errorGeneric: "Đã có lỗi xảy ra.",
    errorAttending: "Vui lòng cho chúng tôi biết bạn có tham dự được không.",
    confirm: {
      seated: {
        eyebrow: "Tại buổi tiệc",
        title: "Số bàn",
        body: (name) =>
          `Trân trọng cảm ơn ${name} đã dành thời gian phản hồi.\nThật vui khi được sẻ chia ngày đặc biệt này cùng những người chúng tôi yêu quý.`,
      },
      pending: {
        eyebrow: "Tại buổi tiệc",
        title: "Số bàn",
        headline: "Sẽ được cập nhật",
        body: (name) =>
          `Trân trọng cảm ơn ${name} đã dành thời gian phản hồi.\nSố bàn sẽ được hiển thị tại đây sau khi chúng tôi hoàn tất sắp xếp chỗ ngồi.`,
        note: "Xin vui lòng xem lại thiệp trước ngày diễn ra buổi tiệc.",
      },
      declined: {
        eyebrow: "R.S.V.P.",
        title: "Phản hồi",
        headline: "Không thể tham dự",
        body: (name) =>
          `Trân trọng cảm ơn ${name} đã dành thời gian phản hồi.\nDù không thể đón tiếp Quý vị trong ngày vui, chúng tôi vẫn vô cùng trân quý tình cảm và lời chúc của Quý vị dành cho hai chúng tôi.`,
      },
      edit: "Cập nhật phản hồi",
    },
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
