/**
 * Đức Anh & Diễm My — guest list + RSVP, một tab duy nhất.
 *
 * Sheet vừa là nguồn danh sách khách (site đọc lên), vừa là nơi RSVP đổ về
 * (site ghi xuống). Cô dâu chú rể chỉ gõ bốn cột: Name, Lang, Table, Seats.
 *
 * Cài đặt: xem docs/RSVP_SETUP.md.
 */

/** Phải khớp CHÍNH XÁC tên tab dưới đáy spreadsheet, kể cả khoảng trắng. */
const SHEET_NAME = 'Guests Management';

/**
 * Đổi thành một chuỗi ngẫu nhiên thật dài. Đây là thứ duy nhất canh cửa Web App
 * (Web App phải để "Anyone" mới gọi vào được), nên đừng commit giá trị thật lên
 * git — chỉ dán vào Apps Script và vào biến môi trường RSVP_SHARED_SECRET.
 */
const SECRET = 'CHANGE-ME-to-a-long-random-string';

/** Đổi thành domain thật sau khi deploy — chỉ dùng để dựng cột Link. */
const SITE_ORIGIN = 'https://ducanhdiemmy.gloweb.site';

const HEADERS = [
  'No', 'Name', 'Seats', 'Lang', 'Table', 'Slug', 'Link',
  'Attending', 'Guests', 'Message', 'Updated',
];

const FIRST_ROW = 2; // hàng 1 là header
const DEFAULT_SEATS = 2;
/** Ô Lang để trống nghĩa là tiếng Anh — ngôn ngữ của video hero mặc định. */
const DEFAULT_LANG = 'en';
/*
 * Chấp nhận mọi cách viết thường gặp. Ô Lang là dropdown, nhưng người ta vẫn
 * dán đè hoặc gõ tay — và một ô ghi 'viet' mà lặng lẽ ra thiệp tiếng Anh là
 * kiểu lỗi không ai phát hiện cho tới khi khách đã nhận link.
 */
const LANGS = {
  en: 'en', eng: 'en', english: 'en', anh: 'en', 'tieng anh': 'en',
  vi: 'vi', vn: 'vi', vie: 'vi', viet: 'vi', vietnamese: 'vi',
  'viet nam': 'vi', 'tieng viet': 'vi',
};

/** Bỏ dấu để 'Tiếng Việt' và 'tieng viet' cùng tra được một chỗ. */
function langKey_(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .trim()
    .toLowerCase();
}

/* ------------------------------------------------------------------ menu */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Wedding')
    .addItem('Tạo link cho khách mới', 'generateLinks')
    .addItem('Dựng lại sheet (chạy 1 lần)', 'setupSheet')
    .addItem('Kiểm tra dữ liệu gửi cho website', 'checkData')
    .addToUi();
}

/** Chạy tay khi vừa thêm khách và muốn thấy link ngay. */
function generateLinks() {
  const sheet = sheet_();
  const n = syncGuests_(sheet, columns_(sheet));
  SpreadsheetApp.getActiveSpreadsheet().toast(n + ' khách đã có link.', 'Wedding');
}

/** Chạy 1 lần lúc mới dựng: tạo tab, header, định dạng. */
function setupSheet() {
  const sheet = sheet_();
  sheet.getRange(1, 1, 1, HEADERS.length)
    .setValues([HEADERS])
    .setFontWeight('bold');
  sheet.setFrozenRows(1);

  const col = columns_(sheet);
  sheet.setColumnWidth(col.name, 220);
  sheet.setColumnWidth(col.link, 320);
  sheet.setColumnWidth(col.message, 320);

  // Ô Lang thành dropdown en/vi để khỏi gõ sai.
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['en', 'vi'], true)
    .setAllowInvalid(false)
    .setHelpText('en = thiệp tiếng Anh, vi = thiệp tiếng Việt. Trống = en.')
    .build();
  sheet.getRange(FIRST_ROW, col.lang, sheet.getMaxRows() - 1, 1)
    .setDataValidation(rule);

  SpreadsheetApp.getActiveSpreadsheet().toast('Sheet đã sẵn sàng.', 'Wedding');
}

/**
 * Hiện đúng thứ website sẽ nhận được — không đoán nữa.
 *
 * Chạy từ menu nên dùng code MỚI NHẤT ĐÃ SAVE, còn website thì dùng bản đã
 * Deploy. Nên nếu bảng này ghi `vi` mà thiệp vẫn ra tiếng Anh, lỗi nằm ở chỗ
 * deployment chưa lên version mới, không phải ở dữ liệu trong sheet.
 */
function checkData() {
  const sheet = sheet_();
  const col = columns_(sheet);
  syncGuests_(sheet, col);
  const guests = readGuests_(sheet, col);

  const lines = guests.slice(0, 12).map(function (g) {
    return g.lang + '   ' + g.slug + '   ' + g.name;
  });

  const viCount = guests.filter(function (g) { return g.lang === 'vi'; }).length;
  const message =
    guests.length + ' khách — ' + viCount + ' tiếng Việt, ' +
    (guests.length - viCount) + ' tiếng Anh\n\n' +
    'lang  slug  name\n' + lines.join('\n') +
    (guests.length > 12 ? '\n… còn ' + (guests.length - 12) + ' dòng' : '');

  SpreadsheetApp.getUi().alert('Dữ liệu gửi cho website', message,
    SpreadsheetApp.getUi().ButtonSet.OK);
}

/* -------------------------------------------------------------- endpoint */

/**
 * Một endpoint cho cả hai chiều:
 *   { action: 'guests' }  → trả danh sách khách cho website
 *   { slug, attending, … } → ghi RSVP vào đúng hàng của khách đó
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000); // xếp hàng các phản hồi đồng thời

  try {
    const body = JSON.parse(e.postData.contents);

    if (body.secret !== SECRET) {
      return json({ ok: false, error: 'unauthorized' });
    }

    const sheet = sheet_();
    const col = columns_(sheet);
    // Khách mới gõ tay vào sheet chưa có slug — bù trước khi đọc hoặc ghi,
    // để cô dâu chú rể không phải nhớ bấm menu.
    syncGuests_(sheet, col);

    if (body.action === 'guests') {
      return json({ ok: true, guests: readGuests_(sheet, col) });
    }

    return json(writeRsvp_(sheet, col, body));
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/* ---------------------------------------------------------------- helpers */

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setValues([HEADERS])
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * Vị trí từng cột, tra theo TÊN ở hàng 1 chứ không theo thứ tự cố định.
 *
 * Nghĩa là kéo cột đi chỗ khác hay chèn thêm cột vào giữa, script vẫn chạy
 * đúng — miễn chữ ở hàng 1 giữ nguyên. Cột nào chưa tồn tại (sheet dựng trước
 * khi có `Lang`) thì được tạo thêm vào cuối, kèm chữ header, nên sheet cũ tự
 * nâng cấp mà không mất dữ liệu.
 */
function columns_(sheet) {
  const width = Math.max(sheet.getLastColumn(), 1);
  const header = sheet.getRange(1, 1, 1, width).getValues()[0]
    .map(function (h) { return String(h).trim().toLowerCase(); });

  const col = {};
  let next = header.length + 1;

  HEADERS.forEach(function (name) {
    const at = header.indexOf(name.toLowerCase());
    if (at !== -1) {
      col[name.toLowerCase()] = at + 1;
    } else {
      sheet.getRange(1, next).setValue(name).setFontWeight('bold');
      col[name.toLowerCase()] = next;
      next++;
    }
  });
  return col;
}

/** Số hàng dữ liệu hiện có (không tính header). */
function dataRows_(sheet) {
  return Math.max(0, sheet.getLastRow() - 1);
}

/**
 * Điền No / Slug / Link cho mọi hàng đã có tên.
 *
 * Slug đã tồn tại thì KHÔNG bao giờ đổi — link đã gửi cho khách phải sống mãi,
 * kể cả khi sau này sửa lại chính tả cái tên.
 */
function syncGuests_(sheet, col) {
  const rows = dataRows_(sheet);
  if (rows === 0) return 0;

  const width = sheet.getLastColumn();
  const range = sheet.getRange(FIRST_ROW, 1, rows, width);
  const values = range.getValues();

  const taken = {};
  values.forEach(function (row) {
    const slug = String(row[col.slug - 1]).trim();
    if (slug) taken[slug] = true;
  });

  let changed = false;
  let counted = 0;

  values.forEach(function (row) {
    const name = String(row[col.name - 1]).trim();
    if (!name) return; // hàng trống ở giữa danh sách — bỏ qua
    counted++;

    if (row[col.no - 1] !== counted) {
      row[col.no - 1] = counted;
      changed = true;
    }

    let slug = String(row[col.slug - 1]).trim();
    if (!slug) {
      slug = uniqueSlug_(slugify_(name), taken);
      taken[slug] = true;
      row[col.slug - 1] = slug;
      changed = true;
    }

    // Dấu / thừa ở cuối SITE_ORIGIN sinh ra link //slug — vẫn tới nơi, nhưng
    // qua một cú redirect 308 mà trình duyệt trong app không phải lúc nào cũng theo.
    const link = SITE_ORIGIN.replace(/\/+$/, '') + '/' + slug;
    if (row[col.link - 1] !== link) {
      row[col.link - 1] = link;
      changed = true;
    }
  });

  if (changed) range.setValues(values);
  return counted;
}

function uniqueSlug_(base, taken) {
  if (!base) base = 'guest';
  if (!taken[base]) return base;
  // Hai người trùng tên vẫn phải có hai link khác nhau.
  let n = 2;
  while (taken[base + '-' + n]) n++;
  return base + '-' + n;
}

/** "Ms. Trần Thị Bảo Ngọc" → "ms-tran-thi-bao-ngoc" */
function slugify_(value) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // bỏ dấu thanh
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function readGuests_(sheet, col) {
  const rows = dataRows_(sheet);
  if (rows === 0) return [];

  return sheet.getRange(FIRST_ROW, 1, rows, sheet.getLastColumn())
    .getValues()
    .map(function (row) {
      const seats = parseInt(row[col.seats - 1], 10);
      const lang = langKey_(row[col.lang - 1]);
      return {
        slug: String(row[col.slug - 1]).trim(),
        name: String(row[col.name - 1]).trim(),
        seats: seats > 0 ? seats : DEFAULT_SEATS,
        lang: LANGS[lang] || DEFAULT_LANG,
        // Ô trống được giữ nguyên là chuỗi rỗng: site cần phân biệt "chưa xếp
        // bàn" (hiện 'sẽ cập nhật sớm') với một số bàn đã có.
        table: String(row[col.table - 1]).trim(),
      };
    })
    .filter(function (g) { return g.slug && g.name; });
}

/**
 * Ghi phản hồi vào đúng hàng của khách. Đổi ý thì ghi đè, không sinh hàng mới.
 * Khách vào thẳng /rsvp (không qua link riêng) thì nối thêm một hàng mới.
 */
function writeRsvp_(sheet, col, body) {
  const slug = String(body.slug || '').trim();
  const answer = {};
  answer[col.attending] = body.attending ? 'YES' : 'NO';
  answer[col.guests] = body.guestCount || 0;
  answer[col.message] = body.message || '';
  answer[col.updated] = new Date();

  const rows = dataRows_(sheet);
  const slugs = rows > 0
    ? sheet.getRange(FIRST_ROW, col.slug, rows, 1).getValues()
    : [];

  for (let i = 0; i < slugs.length; i++) {
    if (slug && String(slugs[i][0]).trim() === slug) {
      const at = FIRST_ROW + i;
      // Từng ô một: bốn cột trả lời không nhất thiết nằm cạnh nhau nữa.
      Object.keys(answer).forEach(function (c) {
        sheet.getRange(at, Number(c)).setValue(answer[c]);
      });
      return { ok: true, row: at };
    }
  }

  // Không khớp slug nào: khách tự vào, chỉ có cái tên họ gõ.
  const at = sheet.getLastRow() + 1;
  sheet.getRange(at, col.name).setValue(body.name || '');
  Object.keys(answer).forEach(function (c) {
    sheet.getRange(at, Number(c)).setValue(answer[c]);
  });
  return { ok: true, row: at };
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
