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
    slug: "long-name-test",
    salutation: "Dear",
    name: "Mr. Jason Lau & Ms. Dung Dang",
    seats: 2,
  },
  {
    slug: "long-vn-test",
    salutation: "Dear",
    name: "Ông Nguyễn Văn Thành & Bà Trần Thị Phương Loan",
    seats: 4,
  },
  {
    slug: "mr-nguyen-van-an",
    salutation: "Dear",
    name: "Mr. Nguyễn Văn An",
    seats: 2,
  },
  {
    slug: "ms-tran-thi-bao-ngoc",
    salutation: "Dear",
    name: "Ms. Trần Thị Bảo Ngọc",
    seats: 1,
  },
  {
    slug: "mr-and-mrs-le",
    salutation: "Dear",
    name: "Mr. & Mrs. Le",
    seats: 4,
  },
  {
    slug: "james-carter",
    salutation: "Dear",
    name: "James Carter",
    seats: 2,
  },
];
