import sys
from PIL import Image, ImageDraw, ImageFont
OUT = '/home/claude/font/out/'


def proof(path, lines, out, bg=(15, 14, 18), fg=(255, 255, 255), width=1800):
    rows = []
    for fontfile, size, text in lines:
        f = ImageFont.truetype(OUT + fontfile, size)
        rows.append((f, size, text))
    h = sum(int(s * 1.35) for _, s, _ in rows) + 60
    im = Image.new('RGB', (width, h), bg)
    d = ImageDraw.Draw(im)
    y = 30
    for f, s, t in rows:
        d.text((40, y), t, font=f, fill=fg)
        y += int(s * 1.35)
    im.save(out)


if __name__ == '__main__':
    D = 'VibroluxDisplay-Bold.ttf'
    proof('', [
        (D, 150, 'VIBROLUX'),
        (D, 90, 'ABCDEFGHIJKLM'),
        (D, 90, 'NOPQRSTUVWXYZ'),
        (D, 90, 'abcdefghijklm'),
        (D, 90, 'nopqrstuvwxyz'),
        (D, 90, '0123456789 &@%'),
        (D, 70, 'ÀÈÉÌÒÙ àèéìòù ’«»“”!?'),
        (D, 70, 'Vibrofinitura → 2×3 ≥ °²©'),
    ], '/home/claude/font/proof_display.png')
    lines = []
    for st in ('Light', 'Regular', 'Bold'):
        T = f'VibroluxText-{st}.ttf'
        lines += [(T, 64, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), (T, 64, 'abcdefghijklmnopqrstuvwxyz 0123456789'),
                  (T, 30, 'Sabbiatura, vibrofinitura e tribofinitura isotropica: trattamenti superficiali dei metalli dal 1987.'),
                  (T, 18, 'Vibrolux Srl, Sant’Ambrogio (TO): lavaggi e oliature, brillantatura. Certificata ISO 9001:2015 — «qualità» è la nostra parola.')]
    proof('', lines, '/home/claude/font/proof_text.png', bg=(255, 255, 255), fg=(50, 45, 42))
