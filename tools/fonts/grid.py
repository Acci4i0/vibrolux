"""Glyph tables: each glyph drawn large with baseline / x-height / cap-height / ascender / descender lines and its advance box."""
import sys
from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont

OUT = '/home/claude/font/out/'


def table(fontname, chars, out, size=200, cols=10, dark=True):
    f = ImageFont.truetype(OUT + fontname, size)
    tt = TTFont(OUT + fontname)
    cmap = tt.getBestCmap()
    hmtx = tt['hmtx']
    os2 = tt['OS/2']
    upm = 1000
    s = size / upm
    cw = int(size * 1.6)
    ch = int(size * 1.55)
    rows = (len(chars) + cols - 1) // cols
    bg, fg, ln = ((15, 14, 18), (255, 255, 255), (60, 60, 80)) if dark else ((255, 255, 255), (30, 30, 30), (210, 210, 230))
    im = Image.new('RGB', (cw * cols, ch * rows), bg)
    d = ImageDraw.Draw(im)
    lab = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 14) if True else None
    for k, c in enumerate(chars):
        col, row = k % cols, k // cols
        x0, y0 = col * cw, row * ch
        base = y0 + int(size * 1.15)
        for yv, color in ((0, (120, 80, 80)), (os2.sxHeight, ln), (os2.sCapHeight, ln), (-200, ln), (760, ln)):
            yy = base - yv * s
            d.line([(x0 + 4, yy), (x0 + cw - 4, yy)], fill=color)
        gname = cmap.get(ord(c))
        adv = hmtx[gname][0] if gname else 0
        gx = x0 + (cw - adv * s) / 2
        d.rectangle([gx, base - 760 * s, gx + adv * s, base + 200 * s], outline=(70, 90, 140))
        asc = f.getmetrics()[0]
        d.text((gx, base - asc), c, font=f, fill=fg)
        d.text((x0 + 6, y0 + 4), '%s %s %d' % (c, gname, adv), font=lab, fill=(140, 140, 160))
    im.save(out)


if __name__ == '__main__':
    fn, chars, out = sys.argv[1], sys.argv[2], sys.argv[3]
    size = int(sys.argv[4]) if len(sys.argv) > 4 else 160
    cols = int(sys.argv[5]) if len(sys.argv) > 5 else 9
    table(fn, chars, out, size, cols)
