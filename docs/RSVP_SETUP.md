# RSVP → Google Sheets (15 minutes)

Responses are posted to a Google Apps Script Web App bound to the couple's own
spreadsheet. No third-party service, no API keys, no monthly cost — and the
couple watches replies land in a sheet they already know how to use.

Each guest's `slug` is the primary key, so a reply is always filed against the
right invitation and a guest who changes their mind **updates their existing
row** rather than creating a duplicate.

---

## 1. Create the sheet

1. Go to <https://sheets.new> and name it e.g. `Duc Anh & Diem My — RSVP`.
2. **Extensions → Apps Script**. Delete the placeholder `myFunction`.
3. Paste the script below.
4. Change `SECRET` to any long random string. Keep it — you'll need it in step 3.

```js
const SHEET_NAME = 'RSVP';
const SECRET = 'CHANGE-ME-to-a-long-random-string';

const HEADERS = [
  'Updated', 'Slug', 'Name', 'Attending', 'Guests',
  'Seats allocated', 'Lucky number', 'Message',
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000); // serialise concurrent replies

  try {
    const body = JSON.parse(e.postData.contents);

    if (body.secret !== SECRET) {
      return json({ ok: false, error: 'unauthorized' });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    const row = [
      new Date(),
      body.slug || '',
      body.name || '',
      body.attending ? 'YES' : 'NO',
      body.guestCount || 0,
      body.seatsAllocated || '',
      body.luckyNumber || '',
      body.message || '',
    ];

    // Upsert on slug so a changed mind overwrites, never duplicates.
    const slugs = sheet.getLastRow() > 1
      ? sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getValues().flat()
      : [];
    const existing = slugs.indexOf(body.slug);

    if (body.slug && existing !== -1) {
      sheet.getRange(existing + 2, 1, 1, row.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## 2. Deploy it

1. **Deploy → New deployment → ⚙️ → Web app**.
2. *Execute as*: **Me**.
3. *Who has access*: **Anyone**.
   (Required — the website's server calls it anonymously. The `SECRET` is what
   actually guards it.)
4. **Deploy**, authorise when prompted, and copy the **Web app URL**.

> Re-deploying after any script edit requires **Deploy → Manage deployments →
> ✏️ → New version**, or the old code keeps running.

## 3. Point the site at it

`.env.local` for development, and the same two variables in your Vercel project
settings (**Settings → Environment Variables**) for production:

```bash
RSVP_WEBHOOK_URL="https://script.google.com/macros/s/AKfy…/exec"
RSVP_SHARED_SECRET="the same long random string"
```

Restart `npm run dev` after adding them.

## 4. Check it

```bash
curl -s -X POST http://localhost:3000/api/rsvp \
  -H 'Content-Type: application/json' \
  -d '{"slug":"james-carter","attending":true,"guestCount":2,"message":"Test"}'
```

Expect `{"ok":true,"storage":"sheet"}` and a new row in the sheet. If you get
`"storage":"local"`, the env var isn't loaded — the reply was still saved, to
`.rsvp-local.jsonl`, so nothing is lost.

---

## Behaviour worth knowing

- **Nothing is ever silently dropped.** If the webhook is missing or errors, the
  reply is appended to `.rsvp-local.jsonl` and logged, and the guest sees a real
  error rather than a false success.
- **The server never trusts the browser** for identity. Name, seat allowance and
  lucky number are re-read from `src/data/guests.js` using the slug, so a guest
  cannot RSVP as someone else or claim more seats than they were given.
- **Party size is clamped** to that invitation's `seats`.
