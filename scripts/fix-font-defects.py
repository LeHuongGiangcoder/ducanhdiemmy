"""
Dò và sửa các lỗi vẽ chữ trong file font.

    python3 scripts/fix-font-defects.py "public/font/DFVN Big Bang.otf"

DFVN Big Bang mang hai lỗi, cả hai đều chỉ lộ ra khi đã lên màn hình:

1. DẤU HUYỀN ĐẶT SAI CHỖ — tám glyph ằ Ằ ừ Ừ ờ Ờ ỳ Ỳ có dấu bị ném ra ngoài ô
   chữ, lệch chừng 400 đơn vị sang trái và 200 lên trên, hiện thành một dấu
   huyền lơ lửng tách rời. Tên người Việt dính rất nhiều: Hằng, Bằng, Từ, Lời.
   Sửa bằng cách lấy glyph cùng chữ gốc nhưng mang dấu sắc làm mốc — dấu sắc và
   dấu huyền luôn ngồi cùng một chỗ — rồi dời contour của dấu cho khớp. Contour
   của chữ gốc không bị đụng tới.

2. SỐ 1 VẼ RA CHỮ D — ký tự '1' trỏ nhầm sang glyph `one.1`, mà outline của nó
   trùng khít từng điểm với glyph `D`. Bản thân font có sẵn glyph `one` vẽ đúng
   nhưng bị bỏ rơi, không ký tự nào trỏ tới. Sửa bằng cách trỏ lại cho đúng.
   Lỗi này làm "17:45" hiện thành "D7:45".

Chạy lại trên font đã sửa thì không tìm thấy gì và thoát — an toàn khi lặp.
"""
import sys, unicodedata
from collections import defaultdict
from fontTools.ttLib import TTFont
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.t2CharStringPen import T2CharStringPen

TONES = set("̣̀́̉̃")
GRAVE, ACUTE = "̀", "́"

path = sys.argv[1] if len(sys.argv) > 1 else sys.exit("Thiếu đường dẫn font")
font = TTFont(path)
gs = font.getGlyphSet()
cmap = font.getBestCmap()
charstrings = font["CFF "].cff[font["CFF "].cff.fontNames[0]].CharStrings


def bounds(name):
    pen = BoundsPen(gs)
    gs[name].draw(pen)
    return pen.bounds


def contours(name):
    """Tách outline thành từng contour rời, kèm bbox."""
    rec = RecordingPen()
    gs[name].draw(rec)
    out, cur = [], []
    for op, args in rec.value:
        cur.append((op, args))
        if op in ("closePath", "endPath"):
            out.append(cur)
            cur = []
    if cur:
        out.append(cur)
    result = []
    for c in out:
        bp = BoundsPen(None)
        for op, args in c:
            getattr(bp, op)(*args)
        result.append((c, bp.bounds))
    return result


def same(a, b, tol=2.0):
    return a and b and all(abs(x - y) <= tol for x, y in zip(a, b))


# --- dò: so mỗi ký tự với anh em cùng chữ gốc + dấu phụ, khác dấu thanh -------
groups = defaultdict(dict)
for cp in range(0x20, 0x1EFA):
    ch = chr(cp)
    if cp not in cmap:
        continue
    d = unicodedata.normalize("NFD", ch)
    if len(d) < 2 or not any(m in TONES for m in d[1:]):
        continue
    stem = d[0] + "".join(m for m in d[1:] if m not in TONES)
    tone = "".join(m for m in d[1:] if m in TONES)
    groups[stem][tone] = ch

suspects = []
for stem, members in groups.items():
    if len(members) < 3 or GRAVE not in members or ACUTE not in members:
        continue
    boxes = {t: bounds(cmap[ord(c)]) for t, c in members.items()}
    xs = sorted(b[0] for b in boxes.values() if b)
    ys = sorted(b[3] for b in boxes.values() if b)
    mx, my = xs[len(xs) // 2], ys[len(ys) // 2]
    b = boxes[GRAVE]
    if b and (b[0] < mx - 150 or b[3] > my + 120):
        suspects.append((members[GRAVE], members[ACUTE]))

def fix_orphan_digit():
    """Ký tự nào đang trỏ tới một glyph trùng khít với glyph của ký tự khác?"""
    def path_of(name):
        rec = RecordingPen()
        gs[name].draw(rec)
        return tuple(
            (op, tuple(
                (round(pt[0], 1), round(pt[1], 1)) if isinstance(pt, tuple) else pt
                for pt in args
            ))
            for op, args in rec.value
        )

    for ch, correct in (("1", "one"),):
        cur = cmap.get(ord(ch))
        if not cur or cur == correct or correct not in font.getGlyphOrder():
            continue
        # Chỉ sửa khi đã chắc glyph hiện tại là bản sao của một chữ khác.
        twins = [c for c, n in cmap.items()
                 if n != cur and path_of(n) == path_of(cur)]
        if not twins:
            continue
        for table in font["cmap"].tables:
            if ord(ch) in table.cmap:
                table.cmap[ord(ch)] = correct
        print(f"  '{ch}': đang vẽ ra '{chr(twins[0])}' — trỏ lại sang glyph `{correct}`")


if not suspects:
    print("Không tìm thấy glyph dấu nào lệch.")
    fix_orphan_digit()
    font.save(path)
    sys.exit(0)

# --- sửa --------------------------------------------------------------------
for ch, ref_ch in sorted(suspects):
    broken, ref = cmap[ord(ch)], cmap[ord(ref_ch)]
    bc, rc = contours(broken), contours(ref)

    ref_boxes = [b for _, b in rc]
    base = [(c, b) for c, b in bc if any(same(b, rb) for rb in ref_boxes)]
    accent = [(c, b) for c, b in bc if not any(same(b, rb) for rb in ref_boxes)]
    base_boxes = [b for _, b in base]
    ref_accent = [(c, b) for c, b in rc if not any(same(b, bb) for bb in base_boxes)]

    if not accent or not ref_accent:
        print(f"  {ch}: không tách được dấu khỏi chữ — BỎ QUA")
        continue

    def span(items):
        return (min(b[0] for _, b in items), max(b[2] for _, b in items),
                max(b[3] for _, b in items))

    ax0, ax1, ay1 = span(accent)
    rx0, rx1, ry1 = span(ref_accent)
    dx = (rx0 + rx1) / 2 - (ax0 + ax1) / 2   # canh giữa theo dấu sắc
    dy = ry1 - ay1                            # cùng độ cao đỉnh dấu

    pen = T2CharStringPen(gs[broken].width, None)
    for group in (base, accent):
        shift = group is accent
        for c, _ in group:
            for op, args in c:
                if shift and args and isinstance(args[0], tuple):
                    args = tuple((x + dx, y + dy) for (x, y) in args)
                getattr(pen, op)(*args)

    old = charstrings[broken]
    charstrings[broken] = pen.getCharString(old.private, old.globalSubrs)
    print(f"  {ch}  (mốc {ref_ch})  dời dấu dx={dx:+.0f} dy={dy:+.0f}")

fix_orphan_digit()

font.save(path)
print(f"Đã ghi đè {path}")
