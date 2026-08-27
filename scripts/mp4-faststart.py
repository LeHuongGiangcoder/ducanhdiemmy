"""
Dời atom `moov` lên đầu file MP4 — tương đương `ffmpeg -movflags +faststart`,
nhưng không cần cài ffmpeg và không mã hoá lại.

    python3 scripts/mp4-faststart.py "public/hero final viet.mp4"

VÌ SAO CẦN: trình duyệt phải đọc `moov` mới biết giải mã video. Nhiều phần mềm
dựng phim ghi `moov` xuống cuối file, khiến trình duyệt buộc phải tải trọn cả
file trước khi hiện được khung hình đầu tiên — hero 7 MB mất khoảng 30 giây
trên 4G. Đưa `moov` lên đầu thì nó phát ngay sau vài trăm KB.

Chạy lại mỗi khi thay video hero. Chạy trên file đã đúng thì báo và thoát,
không làm gì thêm — an toàn khi chạy nhầm nhiều lần.

Chỉ sắp xếp lại thứ tự các khối và cộng bù cho bảng offset chunk; khối `mdat`
chứa toàn bộ hình và tiếng được sao nguyên vẹn từng byte.
"""
import struct, sys

CONTAINERS = {b'moov', b'trak', b'mdia', b'minf', b'stbl', b'edts', b'udta', b'mvex'}

def parse(buf, start, end):
    """Liệt kê atom trong [start, end)."""
    out, pos = [], start
    while pos + 8 <= end:
        size, typ = struct.unpack(">I4s", buf[pos:pos + 8])
        head = 8
        if size == 1:
            size = struct.unpack(">Q", buf[pos + 8:pos + 16])[0]
            head = 16
        if size < head or pos + size > end:
            break
        out.append((typ, pos, size, head))
        pos += size
    return out

def patch_offsets(buf, start, end, delta, found):
    """Cộng `delta` vào mọi bảng offset chunk nằm trong vùng này."""
    for typ, pos, size, head in parse(buf, start, end):
        if typ in CONTAINERS:
            patch_offsets(buf, pos + head, pos + size, delta, found)
        elif typ in (b'stco', b'co64'):
            wide = typ == b'co64'
            n = struct.unpack(">I", buf[pos + head + 4:pos + head + 8])[0]
            base = pos + head + 8
            step = 8 if wide else 4
            for i in range(n):
                at = base + i * step
                val = struct.unpack(">Q" if wide else ">I", buf[at:at + step])[0]
                buf[at:at + step] = struct.pack(">Q" if wide else ">I", val + delta)
            found.append((typ.decode(), n))

path = sys.argv[1]
raw = bytearray(open(path, 'rb').read())
tops = parse(raw, 0, len(raw))
names = [t.decode('latin1') for t, _, _, _ in tops]
print("thứ tự cũ:", " ".join(names))

moov = next((a for a in tops if a[0] == b'moov'), None)
mdat = next((a for a in tops if a[0] == b'mdat'), None)
if not moov or not mdat:
    sys.exit("thiếu moov hoặc mdat")
if moov[1] < mdat[1]:
    sys.exit("moov đã ở trước mdat — không cần làm gì")

moov_bytes = bytearray(raw[moov[1]:moov[1] + moov[2]])
delta = moov[2]  # mdat bị đẩy xuống đúng bằng kích thước moov

found = []
patch_offsets(moov_bytes, moov[3], len(moov_bytes), delta, found)
print("đã cộng bù", delta, "byte cho:", ", ".join(f"{t} ({n} chunk)" for t, n in found))

out = bytearray()
for typ, pos, size, _ in tops:          # mọi atom trước mdat, bỏ moov
    if typ == b'moov': continue
    if pos < mdat[1]: out += raw[pos:pos + size]
out += moov_bytes                        # moov chèn ngay trước mdat
for typ, pos, size, _ in tops:
    if typ == b'moov': continue
    if pos >= mdat[1]: out += raw[pos:pos + size]

assert len(out) == len(raw), f"lệch kích thước: {len(out)} vs {len(raw)}"
open(path, 'wb').write(out)
print("đã ghi", path, f"({len(out)/1e6:.2f} MB, không đổi)")
