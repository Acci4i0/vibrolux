"""Builds the Vibrolux type family: Vibrolux Display (Bold) and Vibrolux Text (Light, Regular, Bold).

Pipeline: glyph geometry (glyphs.py) -> rounding/slices -> optical sidebearings -> outline-measured kerning
-> TTF (+ ttfautohint for the Text styles) -> WOFF2."""
import os
import sys
import time
from shapely.geometry import Polygon, box
from shapely.geometry.polygon import orient
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.feaLib.builder import addOpenTypeFeaturesFromString
from fontTools.ttLib import TTFont

from geo import opening, U
import glyphs as GL

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out')
os.makedirs(OUT, exist_ok=True)

BASE = dict(H=700, A=752, D=-200, ir=1, g=0, slices=False, wscale=0.80, Sref=92, dk=1.0, blf=0.5, dig=1.0, rf=0.30,
            t3=1.0, hint=True)
STYLES = {
    'VibroluxDisplay-Bold': dict(BASE, family='Vibrolux Display', style='Bold', weight=700,
                                 X=530, A=760, D=-190, S=176, T=150, rf=0.31, rs=18, ir=0, g=15, slices=True,
                                 wscale=1.0, Sref=176, sb=42, dk=0.97, blf=1.0, space=270, t3=0.78, hint=False),
    'VibroluxText-Light': dict(BASE, family='Vibrolux Text', style='Light', weight=300, X=520, S=60, T=54, rs=3, sb=52, space=224),
    'VibroluxText-Regular': dict(BASE, family='Vibrolux Text', style='Regular', weight=400, X=520, S=92, T=82, rs=5, sb=56, space=232),
    'VibroluxText-Bold': dict(BASE, family='Vibrolux Text', style='Bold', weight=700, X=520, S=136, T=120, rs=8, sb=58, space=240),
}

CMAP = {
    'space': 0x20, 'nbspace': 0xA0, 'period': 0x2E, 'comma': 0x2C, 'colon': 0x3A, 'semicolon': 0x3B, 'exclam': 0x21,
    'question': 0x3F, 'quoteright': 0x2019, 'quoteleft': 0x2018, 'quotedblright': 0x201D, 'quotedblleft': 0x201C,
    'quotesingle': 0x27, 'quotedbl': 0x22, 'hyphen': 0x2D, 'endash': 0x2013, 'emdash': 0x2014, 'underscore': 0x5F,
    'parenleft': 0x28, 'parenright': 0x29, 'bracketleft': 0x5B, 'bracketright': 0x5D, 'slash': 0x2F,
    'backslash': 0x5C, 'bar': 0x7C, 'plus': 0x2B, 'minus': 0x2212, 'equal': 0x3D, 'multiply': 0xD7,
    'guillemotleft': 0xAB, 'guillemotright': 0xBB, 'less': 0x3C, 'greater': 0x3E, 'lessequal': 0x2264,
    'greaterequal': 0x2265, 'arrowright': 0x2192, 'arrownortheast': 0x2197, 'bullet': 0x2022,
    'periodcentered': 0xB7, 'ellipsis': 0x2026, 'degree': 0xB0, 'asterisk': 0x2A, 'numbersign': 0x23,
    'percent': 0x25, 'ampersand': 0x26, 'at': 0x40, 'copyright': 0xA9, 'Euro': 0x20AC, 'twosuperior': 0xB2,
    'dollar': 0x24, 'dotlessi': 0x131, 'ordmasculine': 0xBA, 'ordfeminine': 0xAA, 'asciicircum': 0x5E,
    'asciitilde': 0x7E, 'mu': 0xB5, 'braceleft': 0x7B, 'braceright': 0x7D, 'grave': 0x60,
    'zero': 0x30, 'one': 0x31, 'two': 0x32, 'three': 0x33, 'four': 0x34, 'five': 0x35, 'six': 0x36,
    'seven': 0x37, 'eight': 0x38, 'nine': 0x39,
}
for ch in 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz':
    CMAP[ch] = ord(ch)
EXTRA_CODEPOINTS = {0x2032: 'quoteright', 0x2010: 'hyphen', 0x2011: 'hyphen', 0x202F: 'nbspace', 0x2009: 'space'}

# ── Optical sidebearings: factor on the style's base sidebearing, per side (left, right).
#    1 = straight vertical side; ~0.8 = round side; ~0.35 = diagonal side; ~0.55 = open side under/over a bar.
ROUND, DIAG, OPEN = 0.80, 0.30, 0.55
SB = {}
for g in 'BDEFHIKLMNPR': SB[g] = [1, 1]
for g in 'bhklmnpr': SB[g] = [1, 1]
for g in 'CGOQS': SB[g] = [ROUND, ROUND]
for g in 'acegos': SB[g] = [ROUND, ROUND]
for g in 'AVWXvwx': SB[g] = [DIAG, DIAG]
SB.update({
    'B': [1, ROUND], 'D': [1, ROUND], 'P': [1, ROUND], 'R': [1, DIAG + 0.1], 'C': [ROUND, 0.75], 'G': [ROUND, 0.95],
    'E': [1, 0.8], 'F': [1, OPEN], 'L': [1, OPEN - 0.1], 'K': [1, DIAG + 0.05], 'T': [OPEN - 0.1, OPEN - 0.1],
    'Y': [DIAG, DIAG], 'Z': [0.7, 0.7], 'J': [0.7, 1], 'U': [0.95, 0.95], 'S': [0.85, 0.85],
    'b': [1, ROUND], 'p': [1, ROUND], 'd': [ROUND, 1], 'q': [ROUND, 1], 'g': [ROUND, 1], 'a': [ROUND, 1],
    'c': [ROUND, 0.75], 'e': [ROUND, 0.85], 'u': [0.95, 1], 'y': [0.95, 1], 'h': [1, 1], 'n': [1, 1], 'm': [1, 1],
    'r': [1, OPEN - 0.15], 'f': [0.65, OPEN - 0.15], 't': [0.55, 0.55], 'k': [1, DIAG + 0.05], 'j': [0.45, 1],
    'z': [0.7, 0.7], 'i': [1, 1], 'l': [1, 1], 'dotlessi': [1, 1],
    'period': [0.9, 0.9], 'comma': [0.9, 0.9], 'colon': [0.9, 0.9], 'semicolon': [0.9, 0.9], 'exclam': [0.9, 0.9],
    'quoteright': [0.7, 0.7], 'quoteleft': [0.7, 0.7], 'quotedblright': [0.7, 0.7], 'quotedblleft': [0.7, 0.7],
    'hyphen': [0.6, 0.6], 'endash': [0.5, 0.5], 'emdash': [0.4, 0.4], 'question': [0.7, 0.7],
    'parenleft': [1, 0.6], 'parenright': [0.6, 1], 'bracketleft': [1, 0.6], 'bracketright': [0.6, 1],
    'braceleft': [0.8, 0.6], 'braceright': [0.6, 0.8], 'slash': [0.2, 0.2], 'backslash': [0.2, 0.2],
    'guillemotleft': [0.6, 0.6], 'guillemotright': [0.6, 0.6],
})
TABULAR = {'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'}

# glyphs with an open or diagonal side, the only ones the automatic kerning looks at
OPEN_SIDE = set('AVWXYTLFPKRJvwxyfrtk') | {'period', 'comma', 'ellipsis', 'quoteright', 'quoteleft', 'quotedblright',
                                               'quotedblleft', 'quotesingle', 'quotedbl', 'hyphen', 'endash', 'emdash',
                                               'slash', 'guillemotleft', 'guillemotright'}
KERN_SET = set('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz') | {
    'period', 'comma', 'colon', 'semicolon', 'ellipsis', 'quoteright', 'quoteleft', 'quotedblright', 'quotedblleft',
    'quotesingle', 'quotedbl', 'hyphen', 'endash', 'emdash', 'slash', 'parenleft', 'parenright', 'guillemotleft',
    'guillemotright', 'exclam', 'question', 'ampersand'}


def finish(c, geom):
    geom = opening(geom, c.rs)
    if c.cuts:
        geom = geom.difference(U(*c.cuts))
        geom = opening(geom, 1.5)
    return geom.simplify(0.3)


def to_glyph(geom, dx):
    pen = TTGlyphPen(None)
    polys = [geom] if isinstance(geom, Polygon) else list(getattr(geom, 'geoms', []))
    for poly in polys:
        if not isinstance(poly, Polygon) or poly.is_empty or poly.area < 40:
            continue
        poly = orient(poly, sign=-1.0)
        for ring in [poly.exterior] + list(poly.interiors):
            pts = []
            for x, y in list(ring.coords)[:-1]:
                p = (round(x + dx), round(y))
                if not pts or pts[-1] != p:
                    pts.append(p)
            if len(pts) > 1 and pts[0] == pts[-1]:
                pts.pop()
            if len(pts) < 3:
                continue
            pen.moveTo(pts[0])
            for p in pts[1:]:
                pen.lineTo(p)
            pen.closePath()
    return pen.glyph()


def sb_factors(name):
    if name in SB:
        return SB[name]
    for gname, cp, base, kind in GL.COMPOSED:
        if gname == name:
            return SB.get(base, [1, 1])
    return [1, 1]


# ── Kerning measured on the outlines: compare the mean white between two profiles with the white of a
#    straight-straight pair, and close the excess for pairs with an open or diagonal side.
STEP = 12


def profiles(geom, lsb, adv, lo, hi):
    """Per band: (left ink x, right ink x) in advance coordinates, or None where the band is empty."""
    prof = []
    for y in range(lo, hi, STEP):
        part = geom.intersection(box(-3000, y, 5000, y + STEP)) if not geom.is_empty else geom
        if part.is_empty or part.area < 4:
            prof.append(None)
        else:
            b = part.bounds
            prof.append((b[0] + lsb, adv - (b[2] + lsb)))   # white on the left, white on the right
    return prof


def auto_kern(info, c):
    lo, hi = -220, 900
    P = {n: profiles(g, lsb, adv, lo, hi) for n, (g, lsb, adv) in info.items() if n in KERN_SET or n in OPEN_SIDE}

    def pair_white(a, b):
        pa, pb = P[a], P[b]
        ws = [ra[1] + rb[0] for ra, rb in zip(pa, pb) if ra and rb]
        return ws

    ref_caps = sum(pair_white('H', 'H')) / len(pair_white('H', 'H'))
    ref_lc = sum(pair_white('n', 'n')) / len(pair_white('n', 'n'))
    names = sorted(P)
    pairs = []
    for a in names:
        for b in names:
            if a not in OPEN_SIDE and b not in OPEN_SIDE:
                continue
            ws = pair_white(a, b)
            if len(ws) < 3:
                continue
            ref = ref_caps if (a[:1].isupper() and b[:1].isupper()) else ref_lc
            mean, mn = sum(ws) / len(ws), min(ws)
            excess = mean - ref
            if excess <= ref * 0.35:
                continue
            k = -0.45 * excess
            k = max(k, -(mn - ref * 0.62))       # keep a minimum of white between the closest points
            k = max(k, -0.11 * c.H * 1.4)
            k = int(round(k / 5.0) * 5)
            if k <= -15:
                pairs.append((a, b, k))
    return pairs


def kern_fea(pairs):
    lines = ['languagesystem DFLT dflt;', 'languagesystem latn dflt;', 'feature kern {']
    for a, b, v in pairs:
        lines.append('  pos %s %s %d;' % (a, b, v))
    lines.append('} kern;')
    return '\n'.join(lines)


def build(name, p, verbose=False):
    order = ['.notdef'] + list(GL.G.keys()) + [n for n, *_ in GL.COMPOSED]
    order = list(dict.fromkeys(order))
    glyphs, metrics, cmap, info = {}, {}, {}, {}
    base_sb = p['sb']
    for gname in order:
        c = GL.Ctx(p)
        if gname == '.notdef':
            geom, w = box(0, 0, 500, 700).difference(box(60, 60, 440, 640)), 500
        elif gname in GL.G:
            geom, w = GL.G[gname](c)
        else:
            _, cp, base, kind = next(x for x in GL.COMPOSED if x[0] == gname)
            geom, w = GL.composed(c, base, kind)
        geom = finish(c, geom) if not geom.is_empty else geom
        if gname in ('space', 'nbspace'):
            lsb, adv = 0, round(w)
        elif gname in TABULAR:
            lsb = base_sb
            adv = round(w + 2 * base_sb)
        else:
            fl, fr = sb_factors(gname)
            lsb = round(base_sb * fl)
            adv = round(w + lsb + base_sb * fr)
        glyphs[gname] = to_glyph(geom, lsb)
        b = geom.bounds if not geom.is_empty else (0, 0, 0, 0)
        metrics[gname] = (adv, round(b[0] + lsb) if not geom.is_empty else 0)
        info[gname] = (geom, lsb, adv)
    for gname, cp in CMAP.items():
        if gname in glyphs:
            cmap[cp] = gname
    for gname, cp, *_ in GL.COMPOSED:
        cmap[cp] = gname
    for cp, gname in EXTRA_CODEPOINTS.items():
        cmap[cp] = gname

    fb = FontBuilder(1000, isTTF=True)
    fb.setupGlyphOrder(order)
    fb.setupCharacterMap(cmap)
    fb.setupGlyf(glyphs)
    fb.setupHorizontalMetrics(metrics)
    asc, desc = 960, -250
    fb.setupHorizontalHeader(ascent=asc, descent=desc, lineGap=0)
    family, style = p['family'], p['style']
    rib = style if style in ('Regular', 'Bold') else 'Regular'
    fb.setupNameTable({
        'familyName': family if style in ('Regular', 'Bold') else f'{family} {style}',
        'styleName': rib,
        'typographicFamily': family, 'typographicSubfamily': style,
        'uniqueFontIdentifier': f'{family} {style} 1.100', 'fullName': f'{family} {style}',
        'psName': name, 'version': 'Version 1.100',
        'copyright': '© 2026 Vibrolux S.r.l. Designed by Andrea Lando after the Vibrolux logotype.',
        'designer': 'Andrea Lando',
    })
    fb.setupOS2(version=4, sTypoAscender=asc, sTypoDescender=desc, sTypoLineGap=0, usWinAscent=1000, usWinDescent=280,
                sxHeight=p['X'], sCapHeight=p['H'], usWeightClass=p['weight'], usWidthClass=5,
                fsSelection=(0x20 if style == 'Bold' else 0x40) | 0x80, achVendID='VBLX',
                ulUnicodeRange1=0b11, ulCodePageRange1=0b11)
    fb.setupPost()
    fb.setupHead(unitsPerEm=1000, created=int(time.time()) + 2082844800, modified=int(time.time()) + 2082844800)
    font = fb.font
    if style == 'Bold':
        font['head'].macStyle = 1
    pairs = auto_kern(info, GL.Ctx(p))
    addOpenTypeFeaturesFromString(font, kern_fea(pairs))
    ttf = os.path.join(OUT, name + '.ttf')
    font.save(ttf)
    if p.get('hint'):
        import ttfautohint
        data = ttfautohint.ttfautohint(in_file=ttf, hinting_range_min=8, hinting_range_max=50,
                                       increase_x_height=14, no_info=True)
        with open(ttf, 'wb') as fh:
            fh.write(data)
    f2 = TTFont(ttf)
    f2.flavor = 'woff2'
    f2.save(os.path.join(OUT, name + '.woff2'))
    if verbose:
        return ttf, pairs
    return ttf, len(pairs)


if __name__ == '__main__':
    names = sys.argv[1:] or list(STYLES)
    for n in names:
        ttf, k = build(n, STYLES[n])
        print(ttf, os.path.getsize(os.path.join(OUT, n + '.woff2')), 'kern pairs:', k)
