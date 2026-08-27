/**
 * GUEST SNAPSHOT — offline fallback, not the source of truth.
 *
 * The live list lives in the couple's Google Sheet and is read at runtime by
 * src/lib/guest-registry.js. This file is only reached when the sheet cannot
 * be: no webhook configured yet, or a cold server instance during a Google
 * outage. Keeping it in git means every invitation link still resolves.
 *
 * Refresh it before a deploy with:  npm run guests:snapshot
 */

export const snapshot = [
  {
    slug: "mr-nguyen-van-an",
    name: "Mr. Nguyễn Văn An",
    seats: 2,
    lang: "en",
  },
  {
    slug: "ms-tran-thi-bao-ngoc",
    name: "Ms. Trần Thị Bảo Ngọc",
    seats: 1,
    lang: "en",
  },
  {
    slug: "mr-and-mrs-le",
    name: "Mr. & Mrs. Le",
    seats: 4,
    lang: "en",
  },
  {
    slug: "james-carter",
    name: "James Carter",
    seats: 2,
    lang: "en",
  },
];
