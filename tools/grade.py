"""
The one colour treatment for every picture on the site (Vibrolux's look: silver, graphite, anthracite, white).

    python3 tools/grade.py in.jpg out.jpg [--width 2400]

What it does, in order:
  1. almost monochrome: the luminance of a red-leaning black-and-white mix, with 4% of the original colour left in
  2. a cool tint in the shadows (graphite), neutral highlights
  3. a gentle S curve: deep but not crushed blacks, clean whites
It never sharpens or adds grain; it only resizes down when the picture is wider than --width.
"""
import sys
import numpy as np
from PIL import Image


def grade(im: Image.Image) -> Image.Image:
    a = np.asarray(im.convert('RGB')).astype(np.float32) / 255.0
    lin = np.where(a <= 0.04045, a / 12.92, ((a + 0.055) / 1.055) ** 2.4)        # to linear light
    # 1. black-and-white mix (a little more red, like a light yellow filter: skin, rust and paint read lighter)
    y = lin[..., 0] * 0.34 + lin[..., 1] * 0.56 + lin[..., 2] * 0.10
    mono = np.repeat(y[..., None], 3, axis=2)
    col = mono + (lin - mono) * 0.04
    # 2. graphite: shadows a touch cool, highlights neutral
    t = np.clip(y, 0, 1)[..., None] ** 0.5
    tint = np.array([0.965, 0.985, 1.035], dtype=np.float32)
    col = col * (tint + (1.0 - tint) * t)
    # back to display, then 3. the S curve
    s = np.where(col <= 0.0031308, col * 12.92, 1.055 * np.clip(col, 0, None) ** (1 / 2.4) - 0.055)
    s = np.clip(s, 0, 1)
    s = s + 0.18 * (s - 0.5) * (1 - np.abs(2 * s - 1))                            # contrast around the middle
    s = 0.02 + s * 0.96                                                           # blacks at 2%, whites at 98%
    return Image.fromarray((np.clip(s, 0, 1) * 255 + 0.5).astype(np.uint8))


if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    width = int(sys.argv[sys.argv.index('--width') + 1]) if '--width' in sys.argv else 2400
    im = Image.open(src)
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    grade(im).save(dst, quality=86, optimize=True, progressive=True)
