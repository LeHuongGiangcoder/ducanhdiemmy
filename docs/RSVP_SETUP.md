# Google Sheet = nguồn duy nhất (20 phút)

Một spreadsheet, một tab `Guests Management`. Cô dâu chú rể gõ tên khách vào đó; website
đọc lên để dựng link riêng cho từng người, và ghi phản hồi RSVP ngược lại đúng
hàng của người đó. Không có chỗ nào khác phải sửa, không cần deploy lại.

| Cột | Ai điền | Ý nghĩa |
|-----|---------|---------|
| `No` | tự sinh | số thứ tự |
| `Name` | **bạn gõ** | tên hiện trên thiệp — có dấu tiếng Việt thoải mái |
| `Seats` | **bạn gõ** | số chỗ tối đa của thiệp này (bỏ trống = 2) |
| `Slug` | tự sinh | phần đuôi URL, sinh từ tên |
| `Link` | tự sinh | link để gửi cho khách — copy thẳng từ đây |
| `Attending` | website ghi | `YES` / `NO` |
| `Guests` | website ghi | số người khách xác nhận |
| `Message` | website ghi | lời nhắn của khách |
| `Updated` | website ghi | lúc khách trả lời gần nhất |

`Slug` sinh ra một lần rồi **không bao giờ tự đổi** — link đã gửi cho khách sống
mãi, kể cả khi sau này sửa lại chính tả cái tên. Muốn tự đặt link, cứ gõ tay vào
cột `Slug` trước.

---

## 1. Tạo sheet và dán script

1. Vào <https://sheets.new>, đặt tên `Duc Anh & Diem My — RSVP`.
2. **Extensions → Apps Script**, xoá `myFunction` mẫu.
3. Dán toàn bộ nội dung [`docs/apps-script.gs`](apps-script.gs).
4. Sửa ba hằng số ở đầu file:
   - `SECRET` — chuỗi ngẫu nhiên thật dài. Giữ lại, bước 3 cần đến.
   - `SITE_ORIGIN` — domain thật của site, dùng để dựng cột `Link`.
   - `SHEET_NAME` — tên tab, phải khớp chính xác tên hiển thị dưới đáy sheet.
5. Lưu, chọn hàm `setupSheet` rồi bấm **Run** một lần (cấp quyền khi Google hỏi).
   Tab và hàng header được tạo xong.

## 2. Deploy Web App

1. **Deploy → New deployment → ⚙️ → Web app**.
2. *Execute as*: **Me**.
3. *Who has access*: **Anyone**.
   (Bắt buộc — server của website gọi vào ẩn danh. `SECRET` mới là thứ canh cửa.)
4. **Deploy**, cấp quyền, copy **Web app URL**.

> Mỗi lần sửa script phải **Deploy → Manage deployments → ✏️ → New version**,
> không thì code cũ vẫn chạy.

## 3. Trỏ website vào đó

`.env.local` cho máy local, và đúng hai biến này trong Vercel
(**Settings → Environment Variables**) cho production:

```bash
RSVP_WEBHOOK_URL="https://script.google.com/macros/s/AKfy…/exec"
RSVP_SHARED_SECRET="đúng chuỗi SECRET ở bước 1"
```

Chạy lại `npm run dev` sau khi thêm.

## 4. Kiểm tra

Gõ một cái tên vào cột `Name`, rồi:

```bash
curl -s -X POST http://localhost:3000/api/rsvp -H 'Content-Type: application/json' -d '{"slug":"nguyen-van-an","attending":true,"guestCount":2,"message":"Test"}'
```

Mong đợi `{"ok":true,"storage":"sheet"}` và cột `Attending` của hàng đó đổi thành
`YES`. Nếu ra `"storage":"local"` thì biến môi trường chưa nạp — phản hồi vẫn
được giữ trong `.rsvp-local.jsonl`, không mất.

---

## Thêm khách sau khi site đã chạy

Gõ tên vào sheet là xong. Trong vòng **60 giây** link của người đó sống — website
đọc lại danh sách mỗi phút. Muốn thấy link ngay lập tức để copy đi gửi thì bấm
menu **Wedding → Tạo link cho khách mới** trong sheet.

## Ảnh chụp dự phòng

`src/data/guests.js` là bản sao danh sách khách nằm trong git, chỉ được dùng đến
khi không đọc được sheet (chưa cấu hình webhook, hoặc Google trục trặc đúng lúc
một server instance khởi động nguội). Cập nhật trước mỗi lần deploy:

```bash
npm run guests:snapshot
```

Không sửa tay file đó — lần chạy sau sẽ ghi đè.

## Vài điều đáng biết

- **Không bao giờ mất phản hồi.** Webhook lỗi thì RSVP được ghi vào
  `.rsvp-local.jsonl` kèm log, và khách thấy thông báo lỗi thật chứ không phải
  một lời cảm ơn giả.
- **Server không tin trình duyệt** về danh tính. Tên và số ghế được đọc lại từ
  sheet theo `slug`, nên khách không thể RSVP hộ người khác hay khai quá số chỗ.
- **Đổi ý thì ghi đè**, không sinh hàng mới — mỗi khách đúng một hàng.
- Khách vào thẳng `/rsvp` (không qua link riêng) vẫn trả lời được: họ tự gõ tên,
  và một hàng mới được nối vào cuối sheet.
