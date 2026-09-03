/**
 * GUEST SNAPSHOT — offline fallback, not the source of truth.
 *
 * The live list lives in the couple's Google Sheet and is read at runtime by
 * src/lib/guest-registry.js. This file is only reached when the sheet cannot
 * be: no webhook configured yet, or a cold server instance during a Google
 * outage. Keeping it in git means every invitation link still resolves.
 *
 * `code` is the guest's three-digit No from the sheet — the code they type at
 * the gate. A guest without one gets an invitation that opens on the link
 * alone, which is the right way to fail: an outage must not lock anyone out.
 *
 * Refresh it before a deploy with:  npm run guests:snapshot
 */

export const snapshot = [
  {
    slug: "mr-nguyen-van-an",
    name: "Mr. Nguyễn Văn An",
    code: "001",
    attending: true,
    table: "10",
    seats: 2,
    lang: "en",
  },
  {
    slug: "ms-tran-thi-bao-ngoc",
    name: "Ms. Trần Thị Bảo Ngọc",
    code: "002",
    seats: 1,
    lang: "en",
  },
  {
    slug: "mr-and-mrs-le",
    name: "Mr. & Mrs. Le",
    code: "003",
    seats: 4,
    lang: "en",
  },
  {
    slug: "james-carter",
    name: "James Carter",
    code: "004",
    seats: 2,
    lang: "en",
  },
];
