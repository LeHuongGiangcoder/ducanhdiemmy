import { appendFile } from "node:fs/promises";

/**
 * RSVP persistence.
 *
 * Primary target is a Google Apps Script Web App bound to the couple's
 * spreadsheet (see docs/RSVP_SETUP.md). It is a single HTTPS POST — no SDK, no
 * service account, no vendor lock-in, and the couple watches rows appear in a
 * sheet they already know how to use.
 *
 * If the webhook isn't configured yet the site stays fully functional: the
 * record is appended to `.rsvp-local.jsonl` and logged, so nothing is lost
 * while the sheet is being set up.
 */

const ENDPOINT = process.env.RSVP_WEBHOOK_URL;
const SECRET = process.env.RSVP_SHARED_SECRET;
const LOCAL_FILE = ".rsvp-local.jsonl";

export async function saveRsvp(record) {
  if (!ENDPOINT) {
    await saveLocally(record);
    return { ok: true, storage: "local" };
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...record, secret: SECRET }),
    // The sheet is the source of truth; never serve a cached write.
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  // Apps Script Web Apps answer 200 even when the script itself failed, so the
  // body has to be inspected as well as the status.
  let body = null;
  try {
    body = await res.json();
  } catch {
    // Non-JSON reply (usually a Google sign-in page) — treated as a failure.
  }

  if (!res.ok || !body?.ok) {
    // Keep a local copy so a webhook outage can't silently lose an RSVP.
    const reason = body?.error ?? `HTTP ${res.status}`;
    await saveLocally({ ...record, _deliveryFailed: reason });
    throw new Error(`RSVP webhook rejected the write: ${reason}`);
  }

  return { ok: true, storage: "sheet" };
}

async function saveLocally(record) {
  try {
    await appendFile(LOCAL_FILE, JSON.stringify(record) + "\n", "utf8");
  } catch {
    // Read-only filesystem (e.g. serverless) — the console line is the record.
  }
  console.info("[rsvp]", JSON.stringify(record));
}
