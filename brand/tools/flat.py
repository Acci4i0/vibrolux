"""Quick check: lay a render on Carta or Nero. python3 flat.py in.png out.jpg carta|nero
Transparent renders go over the colour; opaque Nero renders get pure black lifted to Nero."""
import sys
from PIL import Image
BG = {'carta': (240, 239, 233), 'nero': (15, 14, 18)}
src, dst, bg = sys.argv[1], sys.argv[2], sys.argv[3]
im = Image.open(src).convert('RGBA')
c = BG[bg]
if im.getextrema()[3][0] == 255:  # opaque: lift black to the background colour
    lut = sum(([round(c[k] + v * (255 - c[k]) / 255) for v in range(256)] for k in range(3)), [])
    im.convert('RGB').point(lut).save(dst, quality=92)
else:
    base = Image.new('RGBA', im.size, c + (255,))
    base.alpha_composite(im)
    base.convert('RGB').save(dst, quality=92)
