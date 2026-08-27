/**
 * Đức Anh & Diễm My — guest list + RSVP, một tab duy nhất.
 *
 * Sheet vừa là nguồn danh sách khách (site đọc lên), vừa là nơi RSVP đổ về
 * (site ghi xuống). Cô dâu chú rể chỉ gõ hai cột: Name và Seats.
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
const SITE_ORIGIN = 'https://ducanhdiemmy.vercel.app';

const HEADERS = [
  'No', 'Name', 'Seats', 'Slug', 'Link',
  'Attending', 'Guests', 'Message', 'Updated',
];

// 1-based column positions, khớp với HEADERS ở trên.
const COL = {
  no: 1, name: 2, seats: 3, slug: 4, link: 5,
  attending: 6, guests: 7, message: 8, updated: 9,
};
const FIRST_ROW = 2; // hàng 1 là header
const DEFAULT_SEATS = 2;

/* ------------------------------------------------------------------ menu */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Wedding')
    .addItem('Tạo link cho khách mới', 'generateLinks')
    .addItem('Dựng lại sheet (chạy 1 lần)', 'setupSheet')
    .addToUi();
}

/** Chạy tay khi vừa thêm khách và muốn thấy link ngay. */
function generateLinks() {
  const n = syncGuests_(sheet_());
  SpreadsheetApp.getActiveSpreadsheet().toast(n + ' khách đã có link.', 'Wedding');
}

/** Chạy 1 lần lúc mới dựng: tạo tab, header, định dạng. */
function setupSheet() {
  const sheet = sheet_();
  sheet.getRange(1, 1, 1, HEADERS.length)
    .setValues([HEADERS])
    .setFontWeight('bold');
  sheet.setFrozenRows(1);
  sheet.setColumnWidth(COL.name, 220);
  sheet.setColumnWidth(COL.link, 320);
  sheet.setColumnWidth(COL.message, 320);
  SpreadsheetApp.getActiveSpreadsheet().toast('Sheet đã sẵn sàng.', 'Wedding');
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
    // Khách mới gõ tay vào sheet chưa có slug — bù trước khi đọc hoặc ghi,
    // để cô dâu chú rể không phải nhớ bấm menu.
    syncGuests_(sheet);

    if (body.action === 'guests') {
      return json({ ok: true, guests: readGuests_(sheet) });
    }

    return json(writeRsvp_(sheet, body));
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
function syncGuests_(sheet) {
  const rows = dataRows_(sheet);
  if (rows === 0) return 0;

  const range = sheet.getRange(FIRST_ROW, 1, rows, HEADERS.length);
  const values = range.getValues();

  const taken = {};
  values.forEach(function (row) {
    const slug = String(row[COL.slug - 1]).trim();
    if (slug) taken[slug] = true;
  });

  let changed = false;
  let counted = 0;

  values.forEach(function (row, i) {
    const name = String(row[COL.name - 1]).trim();
    if (!name) return; // hàng trống ở giữa danh sách — bỏ qua
    counted++;

    if (row[COL.no - 1] !== counted) {
      row[COL.no - 1] = counted;
      changed = true;
    }

    let slug = String(row[COL.slug - 1]).trim();
    if (!slug) {
      slug = uniqueSlug_(slugify_(name), taken);
      taken[slug] = true;
      row[COL.slug - 1] = slug;
      changed = true;
    }

    const link = SITE_ORIGIN + '/' + slug;
    if (row[COL.link - 1] !== link) {
      row[COL.link - 1] = link;
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

function readGuests_(sheet) {
  const rows = dataRows_(sheet);
  if (rows === 0) return [];

  return sheet.getRange(FIRST_ROW, 1, rows, HEADERS.length)
    .getValues()
    .map(function (row) {
      const seats = parseInt(row[COL.seats - 1], 10);
      return {
        slug: String(row[COL.slug - 1]).trim(),
        name: String(row[COL.name - 1]).trim(),
        seats: seats > 0 ? seats : DEFAULT_SEATS,
      };
    })
    .filter(function (g) { return g.slug && g.name; });
}

/**
 * Ghi phản hồi vào đúng hàng của khách. Đổi ý thì ghi đè, không sinh hàng mới.
 * Khách vào thẳng /rsvp (không qua link riêng) thì nối thêm một hàng mới.
 */
function writeRsvp_(sheet, body) {
  const slug = String(body.slug || '').trim();
  const answer = [
    body.attending ? 'YES' : 'NO',
    body.guestCount || 0,
    body.message || '',
    new Date(),
  ];

  const rows = dataRows_(sheet);
  const slugs = rows > 0
    ? sheet.getRange(FIRST_ROW, COL.slug, rows, 1).getValues()
    : [];

  for (let i = 0; i < slugs.length; i++) {
    if (slug && String(slugs[i][0]).trim() === slug) {
      sheet.getRange(FIRST_ROW + i, COL.attending, 1, 4).setValues([answer]);
      return { ok: true, row: FIRST_ROW + i };
    }
  }

  // Không khớp slug nào: khách tự vào, chỉ có cái tên họ gõ.
  const row = [];
  row[COL.no - 1] = '';
  row[COL.name - 1] = body.name || '';
  row[COL.seats - 1] = '';
  row[COL.slug - 1] = '';
  row[COL.link - 1] = '';
  row[COL.attending - 1] = answer[0];
  row[COL.guests - 1] = answer[1];
  row[COL.message - 1] = answer[2];
  row[COL.updated - 1] = answer[3];
  sheet.appendRow(row);
  return { ok: true, row: sheet.getLastRow() };
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
