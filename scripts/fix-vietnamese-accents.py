"""
Dò và sửa các glyph tiếng Việt bị đặt dấu sai vị trí trong một font.

    python3 scripts/fix-vietnamese-accents.py "public/font/DFVN Big Bang.otf"

VÌ SAO CẦN: DFVN Big Bang vẽ đúng gần như mọi ký tự, nhưng tám glyph mang dấu
huyền — ằ Ằ ừ Ừ ờ Ờ ỳ Ỳ — có dấu bị ném ra ngoài ô chữ, lệch khoảng 400 đơn vị
sang trái và 200 lên trên. Trên màn hình nó hiện thành một dấu huyền lơ lửng
tách rời khỏi chữ. Tên người Việt dính lỗi này rất nhiều: Hằng, Bằng, Từ, Lời.

CÁCH LÀM: với mỗi glyph nghi lỗi, lấy glyph cùng chữ gốc nhưng mang dấu sắc làm
mốc — dấu sắc và dấu huyền luôn ngồi cùng một chỗ. Tách contour của dấu, dời cho
khớp mốc. Không đụng tới contour của chữ gốc.

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

if not suspects:
    print("Không tìm thấy glyph nào lệch — font đã đúng.")
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

font.save(path)
print(f"Đã sửa {len(suspects)} glyph và ghi đè {path}")
