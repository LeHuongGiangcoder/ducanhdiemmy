# Google Sheet = nguồn duy nhất (20 phút)

Một spreadsheet, một tab `Guests Management`. Cô dâu chú rể gõ tên khách vào đó; website
đọc lên để dựng link riêng cho từng người, và ghi phản hồi RSVP ngược lại đúng
hàng của người đó. Không có chỗ nào khác phải sửa, không cần deploy lại.

| Cột | Ai điền | Ý nghĩa |
|-----|---------|---------|
| `No` | tự sinh | số thứ tự **và là mã khách nhập để mở thiệp** — 3 chữ số (`001`, `002`…) |
| `Name` | **bạn gõ** | tên hiện trên thiệp — có dấu tiếng Việt thoải mái |
| `Seats` | **bạn gõ** | số chỗ tối đa của thiệp này (bỏ trống = 2) |
| `Lang` | **bạn chọn** | `vi` = thiệp tiếng Việt, `en` = tiếng Anh, `pr` = thiệp hai bên gia đình đứng tên. **Bỏ trống = `en`** |
| `Table` | **bạn gõ** | số bàn, hiện trong thẻ phản hồi sau khi khách xác nhận. Bỏ trống = khách thấy "sẽ được cập nhật" |
| `Slug` | tự sinh | phần đuôi URL, sinh từ tên |
| `Link` | tự sinh | link để gửi cho khách — copy thẳng từ đây |
| `Attending` | website ghi | `YES` / `NO` |
| `Guests` | website ghi | số người khách xác nhận |
| `Message` | website ghi | lời nhắn của khách |
| `Updated` | website ghi | lúc khách trả lời gần nhất |

Script chỉ ghi đúng ba cột `No` / `Slug` / `Link`, mỗi cột một lần — nên **công
thức bạn để ở các cột khác (ví dụ `Lang`, `Table` lấy bằng `IMPORTRANGE`) không
bị xoá** mỗi lần link được sinh ra. Xem [Kéo `Lang` / `Table` từ sheet
khác](#kéo-lang--table-từ-sheet-khác) nếu muốn dùng công thức.

Cột được tra theo **tên ở hàng 1**, không theo vị trí — bạn kéo cột đi chỗ khác
hay chèn thêm cột vào giữa, script vẫn chạy đúng. Cột nào thiếu sẽ được tạo
thêm vào cuối khi script chạy lần đầu.

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
   - `SITE_ORIGIN` — domain thật của site (mặc định `https://ducanhdiemmy.gloweb.site`,
     khớp với `metadataBase` trong src/app/layout.js), dùng để dựng cột `Link`.
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

## Mã mở thiệp — chỉ ở link master

Có hai đường vào, và chỉ một đường hỏi mã:

| Khách mở | Có hỏi mã không |
|---|---|
| link riêng, ví dụ `…gloweb.site/mr-quoc-tran` | **Không.** Thiệp mở thẳng như cũ |
| link master `ducanhdiemmy.gloweb.site` | **Có.** Gõ mã mới vào được |

Cột `No` vừa là số thứ tự vừa là **mã riêng của từng khách**, luôn 3 chữ số
(`001`, `002`, …), lưu dạng text để số 0 ở đầu không bị Sheets cắt mất.

Ở link master, mã **không phải để kiểm tra** mà để **tra ra khách nào**: một địa
chỉ in chung trên mọi tấm thiệp, khách gõ mã của mình và thiệp mở ra đúng tên,
đúng ngôn ngữ, đúng số bàn của họ — không phải gửi đi bốn trăm cái link khác nhau.

Vài điểm đáng biết:

- Mã gõ đúng thì **thanh địa chỉ tự đổi** thành link riêng của khách
  (`…/mr-quoc-tran`), nên khách bookmark hay tải lại trang là vào thẳng thiệp
  của mình, không phải gõ mã lần nữa. Trang không reload, nên nhạc vẫn nổi lên
  đúng cú bấm như thiết kế.
- `001` và `1` được coi là một, để khách gõ kiểu nào cũng vào được.
- Danh sách được đọc **trực tiếp từ sheet, không qua cache**, nên khách vừa được
  thêm vào sheet là mã dùng được ngay.
- Hàng nào chưa có `No` thì không có mã để gõ — vẫn vào được bằng link riêng.
- `/rsvp` (không kèm slug) vẫn là đường vào không cần mã, dành cho khách tự gõ
  tên. Xem [Vài điều đáng biết](#vài-điều-đáng-biết).

## Thẻ phản hồi và số bàn

Sau khi gửi phản hồi, khách thấy một thẻ thay cho form, ở một trong ba trạng thái:

| Trạng thái | Khi nào | Hiện gì |
|---|---|---|
| có bàn | `Attending` = YES và cột `Table` đã có số | số bàn, cỡ lớn |
| chờ xếp bàn | `Attending` = YES, `Table` còn trống | "Sẽ được cập nhật" |
| không dự | `Attending` = NO | "Không thể tham dự" |

Số bàn được đọc lại từ sheet **mỗi lần khách mở thiệp**, qua
`/api/rsvp/status` (không cache). Nên cứ điền cột `Table` bất cứ lúc nào — khách
mở lại link cũ là thấy số mới, không cần deploy lại và không phải gửi lại link.

Thẻ có nút **Cập nhật phản hồi**: khách bấm là quay lại form với lựa chọn cũ đã
được chọn sẵn, gửi lại thì **ghi đè lên chính hàng đó**, không sinh hàng mới.

## Kéo `Lang` / `Table` từ sheet khác

Không bắt buộc. Chỉ dùng khi danh sách gốc (tên, ngôn ngữ, số bàn) được quản ở
một spreadsheet khác và bạn không muốn gõ lại sang đây:

```
C2:  =ARRAYFORMULA(IF(B2:B="";"";IFNA(VLOOKUP(B2:B;IMPORTRANGE("<id sheet gốc>";"'Danh sách khách'!F:G");2;FALSE);"")))
D2:  =ARRAYFORMULA(IF(B2:B="";"";IFNA(VLOOKUP(B2:B;IMPORTRANGE("<id sheet gốc>";"'Danh sách khách'!F:J");5;FALSE);"")))
```

Dò theo **tên** ở cột `B` sang cột F của sheet gốc, lấy về G (ngôn ngữ) cho `C`
và J (số bàn) cho `D`.

Bốn điều cần nhớ:

- **Chỉ đặt công thức ở đúng ô C2 và D2.** Nó tự đổ xuống cả cột. Gõ đè một giá
  trị vào giữa cột là cả cột hỏng (`#REF!`).
- **Giữ nguyên `IFNA(…;"")`.** Cột `Table` được hiện thẳng cho khách làm số bàn
  của họ, nên tên không dò được phải ra ô trống (khách thấy "sẽ được cập nhật"),
  tuyệt đối không phải một chữ báo lỗi.
- **Tên phải khớp từng ký tự** giữa hai sheet, kể cả `Mr.`/`Ms.`, dấu tiếng Việt
  và khoảng trắng thừa. Lệch một chữ là ô trống mà không có gì báo — khách sẽ
  nhận thiệp tiếng Anh (vì `Lang` trống mặc định là `en`) và không thấy số bàn.
  Muốn soi thì thêm một cột phụ ngoài rìa: `=IF(B2="";"";IF(C2="";"⚠ không dò được";""))`.
- **`IMPORTRANGE` làm số bàn chậm hơn.** Site đọc sheet này không qua cache,
  nhưng bản thân ô `D` chỉ làm mới theo nhịp của `IMPORTRANGE` (có thể tới ~30
  phút). Sát ngày cưới, gõ thẳng số bàn vào cột `Table` là nhanh nhất.

Lần đầu chạy, Google hỏi **Allow access** một lần cho `IMPORTRANGE`.

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

## Ba bản thiệp

Mỗi khách nhận thiệp bằng đúng bản ghi ở cột `Lang`. Không có hai website,
không có hai bản build — cùng một trang, đổi từ điển nội dung theo từng khách.

| `Lang` | Thiệp | Khác gì |
| --- | --- | --- |
| `en` | Tiếng Anh | mặc định khi ô trống |
| `vi` | Tiếng Việt | video hero riêng, cô dâu chú rể đứng tên |
| `pr` | Hai bên gia đình | **video hero riêng + lời cảm ơn của gia đình**, ký `Gia Đình Hai Bên`; mọi phần còn lại y hệt bản `vi` |

Bản tiếng Việt và bản `pr` dùng video hero riêng và font DFVN Big Bang cho
những dòng có dấu, vì TAN Aegean không vẽ được dấu tiếng Việt.

Muốn xem thử bản kia mà không phải sửa sheet: thêm `?lang=vi`, `?lang=pr`
(hoặc `?lang=en`) vào cuối link bất kỳ.

```
https://ducanhdiemmy.gloweb.site/mr-quoc-tran?lang=pr
```

Vài tiêu đề giữ nguyên tiếng Anh trong bản Việt theo yêu cầu: `Dress Code`,
`Timeline`, `R.S.V.P.`. Muốn dịch nốt thì sửa `src/data/content.js`.
