"""Glyph construction for the Vibrolux family. Every glyph is built from the same few parts as the logo:
rectangular counters, heavy rounded outer corners, and (Display only) hairline slices where strokes meet."""
import math
from shapely.geometry import Polygon, box
from shapely import affinity
from geo import rr, diag, U, mirror_x, rot180, shift, slice_cut, paint, EMPTY

G = {}  # name -> function(ctx) -> (geom, width)


def glyph(*names):
    def deco(f):
        for n in names:
            G[n] = f
        return f
    return deco


class Ctx:
    def __init__(self, p):
        self.p = p
        for k, v in p.items():
            setattr(self, k, v)
        self.R = self.rf * self.H        # big radius, cap height shapes
        self.Rx = self.rf * self.X       # big radius, x-height shapes
        self.cuts = []

    # widths: proportion of a reference height, scaled for the style, plus extra stems for heavier weights
    def wd(self, ratio, ref=None, stems=2):
        ref = ref or self.H
        return round(ratio * ref * self.wscale + stems * (self.S - self.Sref) * 0.5)

    def wx(self, ratio, stems=2):
        return self.wd(ratio, self.X, stems)

    def ri(self, r, stroke):
        return self.ir * max(r - stroke, 0)

    def frame(self, x0, y0, x1, y1, radii, sl=None, sr=None, tb=None, tt=None, inner=None):
        sl = self.S if sl is None else sl
        sr = self.S if sr is None else sr
        tb = self.T if tb is None else tb
        tt = self.T if tt is None else tt
        bl, br, tr, tl = radii if not isinstance(radii, (int, float)) else (radii,) * 4
        if inner is None:
            inner = (self.ri(bl, min(sl, tb)), self.ri(br, min(sr, tb)), self.ri(tr, min(sr, tt)), self.ri(tl, min(sl, tt)))
        return rr(x0, y0, x1, y1, (bl, br, tr, tl)).difference(rr(x0 + sl, y0 + tb, x1 - sr, y1 - tt, inner))

    def hole(self, x0, y0, x1, y1, radii=0):
        return rr(x0, y0, x1, y1, radii)

    # hairline slices (Display only)
    def cut(self, P, d, e, w):
        if self.slices:
            self.cuts.append(slice_cut(P, d, e, w, self.g))

    def sl_bl(self, x, y, top=None):      # left stem [x, x+S] rising from a bar whose top is y+T
        self.cut((x + self.S, y + self.T), (0, 1), (-1, 0), self.S)

    def sl_tl(self, x, ytop):             # left stem hanging from a top bar ending at ytop
        self.cut((x + self.S, ytop - self.T), (0, -1), (-1, 0), self.S)

    def sl_br(self, xr, y):               # right stem [xr-S, xr] rising from a bar
        self.cut((xr - self.S, y + self.T), (0, 1), (1, 0), self.S)

    def sl_bar_br(self, xr, y):           # bottom bar cut next to a right stem
        self.cut((xr - self.S, y + self.T), (-1, 0), (0, -1), self.T)

    def paint(self, base, top):
        return paint(base, top, self.g if self.slices else 0)

    def hw(self, dx, dy, th):
        return th / 2 / max(math.sin(math.atan2(abs(dy), abs(dx))), 0.2)

    def stroke(self, xa, ya, xb, yb, th=None, ea=None, eb=None):
        """Diagonal with horizontal ends. ea/eb: 'l' or 'r' = which edge sits on xa/xb (else xa/xb is the centre)."""
        th = th or self.S * self.dk
        h = self.hw(xb - xa, yb - ya, th)
        for _ in range(3):
            ca = xa + (h if ea == 'l' else -h if ea == 'r' else 0)
            cb = xb + (h if eb == 'l' else -h if eb == 'r' else 0)
            h = self.hw(cb - ca, yb - ya, th)
        return diag(ca, ya, cb, yb, th)


def clipy(g, y0, y1, x0=-2000, x1=4000):
    return g.intersection(box(x0, y0, x1, y1))


# ───────────────────────── CAPITALS ─────────────────────────

@glyph('O')
def O(c, h=None, ratio=1.22):
    h = h or c.H
    w = c.wd(ratio)
    c.sl_bl(0, 0)
    return c.frame(0, 0, w, h, c.rf * h), w


@glyph('zero')
def zero(c):
    w = c.wd(c.dig)
    c.sl_bl(0, 0)
    return c.frame(0, 0, w, c.H, c.R), w


@glyph('Q')
def Q(c):
    o, w = O(c)
    th = c.T * 1.05
    tail = clipy(c.stroke(w * 0.60, c.T * 2.0, w * 1.02, -0.15 * c.H, th, eb='r'), -0.15 * c.H, c.H)
    return c.paint(o, tail), w


@glyph('C')
def C(c):
    w = c.wd(1.12)
    rt = c.T * 0.6
    g = c.frame(0, 0, w, c.H, (c.R, rt, rt, c.R)).difference(box(w - c.S - 1, c.T, w + 1, c.H - c.T))
    c.sl_bl(0, 0)
    return g, w


@glyph('G')
def Gg(c):
    w = c.wd(1.17)
    ym = c.H * 0.52
    g = c.frame(0, 0, w, c.H, (c.R, c.R, c.T * 0.6, c.R)).difference(box(w - c.S - 1, ym, w + 1, c.H - c.T))
    g = U(g, box(w * 0.52, ym - c.T, w - c.S + 1, ym))
    c.sl_bl(0, 0)
    return g, w


@glyph('D')
def D(c):
    w = c.wd(1.15)
    c.sl_bl(0, 0)
    return c.frame(0, 0, w, c.H, (c.R * 0.32, c.R, c.R, 0)), w


@glyph('B')
def B(c):
    w = c.wd(1.08)
    ym = (c.H - c.T) / 2
    wu = w - c.wd(0.07, stems=0)
    ru = min(c.R, (c.H - ym) * 0.5)
    rl = min(c.R, (ym + c.T) * 0.5)
    up = c.frame(0, ym, wu, c.H, (0, ru, ru, 0))
    lo = c.frame(0, 0, w, ym + c.T, (rl * c.blf, rl, rl, 0))
    c.sl_bl(0, 0)
    return U(up, lo), w


def eshape(c, w, h, mid=0.86, bottom=True):
    ym = (h - c.T) / 2
    g = U(box(0, 0, c.S, h), box(0, h - c.T, w, h), box(0, ym, w * mid, ym + c.T))
    if bottom:
        g = U(g, box(0, 0, w, c.T)).intersection(rr(0, 0, w, h, (c.R * c.blf, 0, 0, 0)))
    return g


@glyph('E')
def E(c):
    w = c.wd(1.0, stems=1)
    c.sl_bl(0, 0)
    return eshape(c, w, c.H), w


@glyph('F')
def F(c):
    w = c.wd(0.98, stems=1)
    c.sl_tl(0, c.H)
    return eshape(c, w, c.H, bottom=False), w


@glyph('H')
def H(c):
    w = c.wd(1.12)
    ym = (c.H - c.T) / 2
    return U(box(0, 0, c.S, c.H), box(w - c.S, 0, w, c.H), box(0, ym, w, ym + c.T)), w


@glyph('I')
def I(c):
    return box(0, 0, c.S, c.H), c.S


@glyph('J')
def J(c):
    w = c.wd(1.0)
    g = U(box(w - c.S, 0, w, c.H), box(0, 0, w, c.T), box(0, 0, c.S, c.H * 0.36))
    g = g.intersection(rr(0, 0, w, c.H, (c.R, c.R, 0, 0)))
    if c.ir:
        g = g.difference(rr(c.S, c.T, w - c.S, c.H, (c.ri(c.R, c.S), c.ri(c.R, c.S), 0, 0)))
    c.sl_bar_br(w, 0)
    return g, w


def kshape(c, w, h, top):
    stem = box(0, 0, c.S, top)
    y0 = h * 0.24
    # the arm grows out of the stem: its centreline starts in the middle of the stem
    th = c.S * c.dk
    xa = c.S * 0.5
    arm = clipy(c.stroke(xa, y0, w, h, eb='r'), y0, h).intersection(box(0, -1, w + 1, h + 1))
    ha = c.hw(w - xa, h - y0, th)
    xb = w - ha
    t = 0.40
    px, py = xa + (xb - xa) * t, y0 + (h - y0) * t
    leg = clipy(c.stroke(px, py, w, 0, eb='r'), 0, py)
    return U(stem, c.paint(arm, leg))


@glyph('K')
def K(c):
    w = c.wd(1.15)
    return kshape(c, w, c.H, c.H), w


@glyph('L')
def L(c):
    w = c.wd(0.96, stems=1)
    g = U(box(0, 0, c.S, c.H), box(0, 0, w, c.T)).intersection(rr(0, 0, w, c.H, (c.R * c.blf, 0, 0, 0)))
    c.sl_bl(0, 0)
    return g, w


def mshape(c, w, h, yv):
    stems = U(box(0, 0, c.S, h), box(w - c.S, 0, w, h))
    a = clipy(c.stroke(0, h, w / 2, yv, ea='l'), yv, h)
    b = clipy(c.stroke(w, h, w / 2, yv, ea='r'), yv, h)
    return c.paint(c.paint(stems, a), b)


@glyph('M')
def M(c):
    w = c.wd(1.42, stems=3)
    return mshape(c, w, c.H, c.H * 0.2), w


@glyph('N')
def N(c):
    w = c.wd(1.15)
    stems = U(box(0, 0, c.S, c.H), box(w - c.S, 0, w, c.H))
    d = clipy(c.stroke(0, c.H, w, 0, ea='l', eb='r'), 0, c.H)
    return c.paint(stems, d), w


def pbowl(c, w, h, yb, top):
    r = min(c.R, (top - yb) * 0.5)
    return c.frame(0, yb, w, top, (0, r, r, 0))


@glyph('P')
def P(c):
    w = c.wd(1.06)
    yb = c.H * 0.36
    c.sl_tl(0, c.H)
    return U(box(0, 0, c.S, c.H), pbowl(c, w, c.H, yb, c.H)), w


@glyph('R')
def Rr(c):
    w = c.wd(1.14)
    yb = c.H * 0.36
    wb = w - c.wd(0.05, stems=0)
    base = U(box(0, 0, c.S, c.H), pbowl(c, wb, c.H, yb, c.H))
    leg = clipy(c.stroke(wb * 0.50, yb + c.T, w, 0, ea='l', eb='r'), 0, yb + c.T)
    c.sl_tl(0, c.H)
    return c.paint(base, leg), w


def sshape(c, w, h, tl=None, T=None):
    T = T or c.T
    ym = (h - T) / 2
    R = min(c.rf * h, (ym + T) * 0.5)
    ri = c.ri(R, T)
    up = rr(0, ym, w, h, (R, 0, 0, R if tl is None else tl)).difference(rr(c.S, ym + T, w + 1, h - T, (ri, 0, 0, ri)))
    up = up.difference(box(w - R, ym - 1, w + 1, ym + T + 1))   # no spur where the spine meets the lower bowl
    lo = rr(0, 0, w, ym + T, (0, R, R, 0)).difference(rr(-1, T, w - c.S, ym, (0, ri, ri, 0)))
    return U(up, lo)


@glyph('S')
def S(c):
    w = c.wd(1.08)
    c.sl_br(w, 0)
    return sshape(c, w, c.H), w


@glyph('T')
def T(c):
    w = c.wd(1.08, stems=1)
    return U(box(0, c.H - c.T, w, c.H), box((w - c.S) / 2, 0, (w + c.S) / 2, c.H)), w


def ushape(c, w, h, top, br=True):
    R = c.rf * h
    g = rr(0, 0, w, top, (R, R if br else 0, 0, 0))
    hole = rr(c.S, c.T, w - c.S, top + 1, (c.ri(R, c.S), c.ri(R, c.S) if br else 0, 0, 0))
    return g.difference(hole)


@glyph('U')
def Uu(c):
    w = c.wd(1.10)
    c.sl_bl(0, 0)
    c.sl_bar_br(w, 0)
    return ushape(c, w, c.H, c.H), w


def vshape(c, w, h, bottom=0):
    a = clipy(c.stroke(0, h, w / 2, bottom, ea='l'), bottom, h)
    b = clipy(c.stroke(w, h, w / 2, bottom, ea='r'), bottom, h)
    return c.paint(a, b)


@glyph('V')
def V(c):
    w = c.wd(1.30)
    return vshape(c, w, c.H), w


def wshape(c, w, h):
    x1, x2, xm, hm = w * 0.27, w * 0.73, w / 2, h * 0.8
    a = clipy(c.stroke(0, h, x1, 0, ea='l'), 0, h)
    b = clipy(c.stroke(xm, hm, x1, 0), 0, hm)
    cc = clipy(c.stroke(xm, hm, x2, 0), 0, hm)
    d = clipy(c.stroke(w, h, x2, 0, ea='r'), 0, h)
    return c.paint(c.paint(c.paint(a, b), cc), d)


@glyph('W')
def W(c):
    w = c.wd(1.75, stems=4)
    return wshape(c, w, c.H), w


def xshape(c, w, h):
    a = clipy(c.stroke(0, 0, w, h, ea='l', eb='r'), 0, h)
    b = clipy(c.stroke(0, h, w, 0, ea='l', eb='r'), 0, h)
    return c.paint(a, b)


@glyph('X')
def X(c):
    w = c.wd(1.30)
    return xshape(c, w, c.H), w


@glyph('Y')
def Y(c):
    w = c.wd(1.24)
    ym = c.H * 0.42
    a = clipy(c.stroke(0, c.H, w / 2, ym, ea='l'), ym, c.H)
    b = clipy(c.stroke(w, c.H, w / 2, ym, ea='r'), ym, c.H)
    stem = box((w - c.S) / 2, 0, (w + c.S) / 2, ym + 1)
    return U(c.paint(a, b), stem), w


@glyph('A')
def A(c):
    w = c.wd(1.30)
    a = clipy(c.stroke(0, 0, w / 2, c.H, ea='l'), 0, c.H)
    b = clipy(c.stroke(w / 2, c.H, w, 0, eb='r'), 0, c.H)
    yb = c.H * 0.24
    bar = box(0, yb, w, yb + c.T).intersection(U(a, b).convex_hull)
    return c.paint(U(a, bar), b), w


def zshape(c, w, h):
    bars = U(box(0, h - c.T, w, h), box(0, 0, w, c.T))
    d = clipy(c.stroke(w, h - c.T * 0.5, 0, c.T * 0.5, ea='r', eb='l'), c.T * 0.5, h - c.T * 0.5)
    return c.paint(bars, d)


@glyph('Z')
def Z(c):
    w = c.wd(1.10, stems=1)
    return zshape(c, w, c.H), w


# ───────────────────────── LOWERCASE ─────────────────────────

@glyph('o')
def o(c):
    w = c.wx(1.12)
    c.sl_bl(0, 0)
    return c.frame(0, 0, w, c.X, c.Rx), w


@glyph('a')
def a(c):
    w = c.wx(1.02)
    T3 = c.T * c.t3
    yb = c.X * 0.56
    xa = w * 0.06
    hook = rr(xa, 0, w, c.X, (0, 0, c.Rx, 0)).difference(rr(xa - 1, -1, w - c.S, c.X - T3, (0, 0, c.ri(c.Rx, c.S), 0)))
    rb = min(c.Rx, yb * 0.5)
    bowl = c.frame(0, 0, w - c.S + 1, yb, (rb, 0, 0, rb), sr=1, tb=T3, tt=T3)
    c.cut((c.S, T3), (0, 1), (-1, 0), c.S)
    return U(hook, bowl, box(w - c.S - 2, 0, w, yb)), w


def bowl_stem(c, w, stem_side, y0, y1):
    """o-bowl with a straight stem side; stem_side 'l' or 'r'."""
    R = c.Rx
    if stem_side == 'l':
        return c.frame(0, 0, w, c.X, (R * c.blf, R, R, 0))
    return c.frame(0, 0, w, c.X, (R, 0, 0, R))


@glyph('b')
def b(c):
    w = c.wx(1.10)
    c.sl_bl(0, 0)
    return U(box(0, 0, c.S, c.A), bowl_stem(c, w, 'l', 0, c.X)), w


@glyph('d')
def d(c):
    w = c.wx(1.10)
    c.sl_bl(0, 0)
    return U(box(w - c.S, 0, w, c.A), bowl_stem(c, w, 'r', 0, c.X)), w


@glyph('p')
def p_(c):
    w = c.wx(1.10)
    c.sl_tl(0, c.X)
    return U(box(0, c.D, c.S, c.X), c.frame(0, 0, w, c.X, (0, c.Rx, c.Rx, 0))), w


@glyph('q')
def q(c):
    w = c.wx(1.10)
    c.sl_bl(0, 0)
    return U(box(w - c.S, c.D, w, c.X), bowl_stem(c, w, 'r', 0, c.X)), w


@glyph('c')
def c_(c):
    w = c.wx(1.02)
    rt = c.T * 0.6
    c.sl_bl(0, 0)
    return c.frame(0, 0, w, c.X, (c.Rx, rt, rt, c.Rx)).difference(box(w - c.S - 1, c.T, w + 1, c.X - c.T)), w


@glyph('e')
def e(c):
    w = c.wx(1.06)
    T3 = c.T * c.t3
    tb = T3 * 0.86 if c.t3 < 1 else T3
    ym = c.X * 0.50 - tb / 2
    g = c.frame(0, 0, w, c.X, (c.Rx, T3 * 0.6, c.Rx, c.Rx), tb=T3, tt=T3)
    g = U(g, box(c.S - 1, ym, w, ym + tb)).difference(box(w - c.S - 1, T3, w + 1, ym))
    c.cut((c.S, T3), (0, 1), (-1, 0), c.S)
    return g, w


@glyph('f')
def f(c):
    w = c.wx(0.66, stems=1)
    xs = w * 0.2
    rf = min(c.Rx, (w - xs) * 0.7)
    hook = rr(xs, 0, w, c.A, (0, 0, 0, rf)).difference(rr(xs + c.S, -1, w + 1, c.A - c.T, (0, 0, 0, c.ri(rf, c.S))))
    return U(hook, box(0, c.X - c.T, w * 0.92, c.X)), w


def tail(c, w, xg):
    """descender hook under a right stem"""
    Rd = min(c.Rx, -c.D * 0.85)
    return rr(xg, c.D, w, 1, (0, Rd, 0, 0)).difference(rr(xg - 1, c.D + c.T, w - c.S, 2, (0, c.ri(Rd, c.S), 0, 0)))


@glyph('g')
def g_(c):
    w = c.wx(1.10)
    c.sl_bl(0, 0)
    return U(bowl_stem(c, w, 'r', 0, c.X), box(w - c.S, 0, w, c.X), tail(c, w, w * 0.06)), w


def nshape(c, w, top, x0=0):
    R = min(c.Rx, (w - x0) * 0.5)
    return rr(x0, 0, w, top, (0, 0, R, 0)).difference(rr(x0 + c.S, -1, w - c.S, top - c.T, (0, 0, c.ri(R, c.S), 0)))


@glyph('n')
def n(c):
    w = c.wx(1.06)
    c.sl_tl(0, c.X)
    return nshape(c, w, c.X), w


@glyph('h')
def h(c):
    w = c.wx(1.06)
    c.sl_tl(0, c.X)
    return U(nshape(c, w, c.X), box(0, 0, c.S, c.A)), w


@glyph('m')
def m(c):
    w = c.wx(1.62, stems=3)
    xm = (w - c.S) / 2
    c.sl_tl(0, c.X)
    return U(nshape(c, xm + c.S, c.X), nshape(c, w, c.X, xm)), w


@glyph('u')
def u(c):
    w = c.wx(1.06)
    c.sl_bl(0, 0)
    return ushape(c, w, c.X, c.X, br=False), w


@glyph('r')
def r(c):
    w = c.wx(0.70, stems=1)
    Rr_ = min(c.Rx * 0.75, w - c.S)
    g = rr(0, 0, w, c.X, (0, 0, Rr_, 0)).difference(rr(c.S, -1, w + 1, c.X - c.T, (0, 0, 0, 0)))
    c.sl_tl(0, c.X)
    return g, w


@glyph('s')
def s(c):
    w = c.wx(1.0)
    T3 = c.T * c.t3
    c.cut((w - c.S, T3), (0, 1), (1, 0), c.S)
    return sshape(c, w, c.X, T=T3), w


@glyph('t')
def t(c):
    w = c.wx(0.68, stems=1)
    xs = w * 0.18
    top = c.A * 0.93
    Rt = min(c.Rx, (w - xs) * 0.8)
    g = rr(xs, 0, w, top, (Rt, 0, 0, 0)).difference(rr(xs + c.S, c.T, w + 1, top + 1, (c.ri(Rt, c.S), 0, 0, 0)))
    c.sl_bl(xs, 0)
    return U(g, box(0, c.X - c.T, w * 0.94, c.X)), w


@glyph('i')
def i(c):
    return U(box(0, 0, c.S, c.X), dot_i(c, c.S / 2)), c.S


def dot_i(c, cx):
    # square dot, sheared like the tick over the logo's i
    y0 = c.X + c.T * 0.95
    d = max(c.S, c.T) * 1.04
    sk = 0
    return Polygon([(cx - d / 2 - sk / 2, y0), (cx + d / 2 - sk / 2, y0), (cx + d / 2 + sk / 2, y0 + d), (cx - d / 2 + sk / 2, y0 + d)])


@glyph('j')
def j(c):
    w = c.wx(0.50, stems=1)
    Rd = min(c.Rx, -c.D * 0.85)
    g = rr(0, c.D, w, c.X, (0, Rd, 0, 0)).difference(rr(-1, c.D + c.T, w - c.S, c.X + 1, (0, c.ri(Rd, c.S), 0, 0)))
    return U(g, dot_i(c, w - c.S / 2)), w


@glyph('dotlessi')
def dotlessi(c):
    return box(0, 0, c.S, c.X), c.S


@glyph('k')
def k(c):
    w = c.wx(1.0)
    return U(kshape(c, w, c.X, c.X), box(0, 0, c.S, c.A)), w


@glyph('l')
def l(c):
    return box(0, 0, c.S, c.A), c.S


@glyph('v')
def v(c):
    w = c.wx(1.12)
    return vshape(c, w, c.X), w


@glyph('w')
def w_(c):
    w = c.wx(1.66, stems=4)
    return wshape(c, w, c.X), w


@glyph('x')
def x(c):
    w = c.wx(1.10)
    return xshape(c, w, c.X), w


@glyph('y')
def y(c):
    w = c.wx(1.10)
    c.sl_bl(0, 0)
    return U(ushape(c, w, c.X, c.X, br=False), tail(c, w, w * 0.06)), w


@glyph('z')
def z(c):
    w = c.wx(1.0, stems=1)
    return zshape(c, w, c.X), w


# ───────────────────────── FIGURES ─────────────────────────

@glyph('one')
def one(c):
    w = c.wd(c.dig)
    xs = w * 0.56 - c.S / 2
    g = U(box(xs, 0, xs + c.S, c.H), box(w * 0.16, c.H - c.T, xs + 1, c.H))
    return g, w


@glyph('two')
def two(c):
    w = c.wd(c.dig)
    ym = (c.H - c.T) / 2
    R = min(c.R, (c.H - ym) * 0.5)
    ri = c.ri(R, c.S)
    up = rr(0, ym, w, c.H, (0, R, R, 0)).difference(rr(-1, ym + c.T, w - c.S, c.H - c.T, (0, ri, ri, 0)))
    lo = rr(0, 0, w, ym + c.T, (0, 0, 0, R)).difference(rr(c.S, c.T, w + 1, ym, (0, 0, 0, ri)))
    c.sl_bl(0, 0)
    return U(up, lo), w


@glyph('three')
def three(c):
    w = c.wd(c.dig)
    ym = (c.H - c.T) / 2
    ri = c.ri(c.R, c.S)
    g = rr(0, 0, w, c.H, (0, c.R, c.R, 0))
    g = g.difference(rr(-1, c.T, w - c.S, ym, (0, ri, 0, 0))).difference(rr(-1, ym + c.T, w - c.S, c.H - c.T, (0, 0, ri, 0)))
    g = g.difference(box(-1, ym - 1, w * 0.24, ym + c.T + 1))
    c.sl_br(w, 0)
    return g, w


@glyph('four')
def four(c):
    w = c.wd(c.dig)
    yb = c.H * 0.27
    xr = w - c.S - w * 0.1
    left = U(box(0, yb, c.S, c.H), box(0, yb, w, yb + c.T)).intersection(rr(0, yb, w, c.H, (c.R * 0.8 * c.blf, 0, 0, 0)))
    c.cut((c.S, yb + c.T), (0, 1), (-1, 0), c.S)
    return U(left, box(xr, 0, xr + c.S, c.H)), w


@glyph('five')
def five(c):
    w = c.wd(c.dig)
    ym = (c.H - c.T) / 2
    R = min(c.R, (ym + c.T) * 0.5)
    ri = c.ri(R, c.S)
    up = box(0, ym, w, c.H).difference(box(c.S, ym + c.T, w + 1, c.H - c.T))
    lo = rr(0, 0, w, ym + c.T, (0, R, R, 0)).difference(rr(-1, c.T, w - c.S, ym, (0, ri, ri, 0)))
    c.sl_br(w, 0)
    return U(up, lo), w


@glyph('six')
def six(c):
    w = c.wd(c.dig)
    ym = (c.H - c.T) / 2
    Rb = min(c.R, (ym + c.T) * 0.5)
    g = rr(0, 0, w, c.H, (c.R, Rb, c.T * 0.6, c.R))
    g = g.difference(box(c.S, ym + c.T, w + 1, c.H - c.T))
    g = g.difference(rr(c.S, c.T, w - c.S, ym, (c.ri(c.R, c.S), c.ri(Rb, c.S), c.ri(Rb, c.S), 0)))
    c.sl_bl(0, 0)
    return g, w


@glyph('nine')
def nine(c):
    g, w = six(c)
    c.cuts = [rot180(k, w, c.H) for k in c.cuts]
    return rot180(g, w, c.H), w


@glyph('seven')
def seven(c):
    w = c.wd(c.dig)
    bar = box(0, c.H - c.T, w, c.H)
    d = clipy(c.stroke(w, c.H - c.T * 0.5, w * 0.22, 0, ea='r', eb='l'), 0, c.H - c.T * 0.5)
    return c.paint(bar, d), w


@glyph('eight')
def eight(c):
    w = c.wd(c.dig)
    ym = (c.H - c.T) / 2
    xi = w * 0.05
    Rl = min(c.R, (ym + c.T) * 0.5)
    Ru = min(c.R, (c.H - ym) * 0.5)
    lo = c.frame(0, 0, w, ym + c.T, Rl)
    up = c.frame(xi, ym, w - xi, c.H, Ru)
    c.sl_bl(0, 0)
    return U(lo, up), w


# ───────────────────────── PUNCTUATION & SYMBOLS ─────────────────────────

def dw(c):
    return max(c.S, c.T) * 1.04


@glyph('space', 'nbspace')
def space(c):
    return EMPTY, round(c.space)


@glyph('period')
def period(c):
    d = dw(c)
    return box(0, 0, d, d), d


def comma_shape(c, y=0):
    d = dw(c)
    t = Polygon([(d * 0.28, 1), (d, 1), (d * 0.5, -d * 0.95), (-d * 0.12, -d * 0.95)])
    return shift(U(box(0, 0, d, d), t), 0, y)


@glyph('comma')
def comma(c):
    return comma_shape(c), dw(c)


@glyph('colon')
def colon(c):
    d = dw(c)
    return U(box(0, 0, d, d), box(0, c.X - d, d, c.X)), d


@glyph('semicolon')
def semicolon(c):
    d = dw(c)
    return U(comma_shape(c), box(0, c.X - d, d, c.X)), d


@glyph('exclam')
def exclam(c):
    d = dw(c)
    return U(box(0, 0, d, d), box((d - c.S) / 2, d * 1.6, (d + c.S) / 2, c.H)), d


@glyph('question')
def question(c):
    w = c.wd(0.92)
    d = dw(c)
    ym = c.H * 0.36
    R = min(c.R, (c.H - ym) * 0.5)
    top = rr(0, ym, w, c.H, (0, R, R, 0)).difference(rr(-1, ym + c.T, w - c.S, c.H - c.T, (0, c.ri(R, c.S), c.ri(R, c.S), 0)))
    xs = w * 0.36
    g = U(top.difference(box(-1, ym - 1, xs, ym + c.T + 1)), box(xs, d * 1.6, xs + c.S, ym + c.T))
    return U(g, box(xs + (c.S - d) / 2, 0, xs + (c.S + d) / 2, d)), w


def quote_shape(c):
    d = dw(c) * 0.9
    return shift(comma_shape(c), 0, c.H - dw(c)).intersection(box(-500, c.H - d * 1.9, 500, c.H + 10))


@glyph('quoteright')
def quoteright(c):
    return quote_shape(c), dw(c)


@glyph('quoteleft')
def quoteleft(c):
    q = quote_shape(c)
    b = q.bounds
    return affinity.rotate(q, 180, origin=((b[0] + b[2]) / 2, (b[1] + b[3]) / 2)), dw(c)


@glyph('quotedblright')
def quotedblright(c):
    q, d = quote_shape(c), dw(c)
    gap = d * 0.55
    return U(q, shift(q, d + gap)), 2 * d + gap


@glyph('quotedblleft')
def quotedblleft(c):
    q, d = quoteleft(c)
    gap = d * 0.55
    return U(q, shift(q, d + gap)), 2 * d + gap


@glyph('quotesingle')
def quotesingle(c):
    s = c.S * 0.85
    return box(0, c.H - c.H * 0.3, s, c.H), s


@glyph('quotedbl')
def quotedbl(c):
    s = c.S * 0.85
    b = box(0, c.H * 0.7, s, c.H)
    return U(b, shift(b, s * 1.6)), s * 2.6


@glyph('hyphen')
def hyphen(c):
    w = c.wd(0.42, stems=0)
    y = c.X * 0.5 - c.T / 2
    return box(0, y, w, y + c.T), w


@glyph('endash')
def endash(c):
    w = c.wd(0.72, stems=0)
    y = c.X * 0.5 - c.T / 2
    return box(0, y, w, y + c.T), w


@glyph('emdash')
def emdash(c):
    w = c.wd(1.3, stems=0)
    y = c.X * 0.5 - c.T / 2
    return box(0, y, w, y + c.T), w


@glyph('underscore')
def underscore(c):
    w = c.wd(0.8, stems=0)
    return box(0, -c.T * 1.6, w, -c.T * 0.6), w


def bracket(c, round_):
    w = c.wd(0.30, stems=1)
    y0, y1 = c.D * 0.85, c.A + (c.A - c.H) * 0 + 20
    R = min(c.R * 0.8, w) if round_ else 0
    g = rr(0, y0, w, y1, (R, 0, 0, R)).difference(rr(c.S, y0 + c.T, w + 1, y1 - c.T, (c.ri(R, c.S), 0, 0, c.ri(R, c.S))))
    return g, w


@glyph('parenleft')
def parenleft(c):
    return bracket(c, True)


@glyph('parenright')
def parenright(c):
    g, w = bracket(c, True)
    return mirror_x(g, w), w


@glyph('bracketleft')
def bracketleft(c):
    return bracket(c, False)


@glyph('bracketright')
def bracketright(c):
    g, w = bracket(c, False)
    return mirror_x(g, w), w


@glyph('slash')
def slash(c):
    w = c.wd(0.62, stems=1)
    y0, y1 = c.D * 0.6, c.A
    return clipy(c.stroke(0, y0, w, y1, ea='l', eb='r'), y0, y1), w


@glyph('backslash')
def backslash(c):
    g, w = slash(c)
    return mirror_x(g, w), w


@glyph('bar')
def bar(c):
    s = c.S * 0.8
    return box(0, c.D * 0.8, s, c.A + 20), s


def math_bar(c, w, y):
    t = c.T * 0.8
    return box(0, y - t / 2, w, y + t / 2)


@glyph('plus')
def plus(c):
    w = c.wd(0.8, stems=0)
    ym = c.H * 0.4
    t = c.T * 0.8
    return U(math_bar(c, w, ym), box((w - t) / 2, ym - w / 2, (w + t) / 2, ym + w / 2)), w


@glyph('minus')
def minus(c):
    w = c.wd(0.8, stems=0)
    return math_bar(c, w, c.H * 0.4), w


@glyph('equal')
def equal(c):
    w = c.wd(0.8, stems=0)
    ym = c.H * 0.4
    gap = c.T * 0.75
    return U(math_bar(c, w, ym - gap), math_bar(c, w, ym + gap)), w


@glyph('multiply')
def multiply(c):
    w = c.wd(0.62, stems=0)
    ym = c.H * 0.4
    th = c.T * 0.8
    a = c.stroke(0, ym - w / 2, w, ym + w / 2, th, ea='l', eb='r')
    b = c.stroke(0, ym + w / 2, w, ym - w / 2, th, ea='l', eb='r')
    return U(a, b), w


def chevron(c, x, w, h, ym, th):
    a = clipy(c.stroke(x + w, ym + h / 2, x, ym, th, ea='r', eb='l'), ym, ym + h / 2)
    b = clipy(c.stroke(x, ym, x + w, ym - h / 2, th, ea='l', eb='r'), ym - h / 2, ym)
    return U(a, b)


@glyph('guillemotleft')
def guillemotleft(c):
    cw, h, th = c.wd(0.30, stems=0), c.X * 0.62, c.T * 0.85
    gap = cw * 0.35
    ym = c.X * 0.5
    return U(chevron(c, 0, cw, h, ym, th), chevron(c, cw + gap, cw, h, ym, th)), 2 * cw + gap


@glyph('guillemotright')
def guillemotright(c):
    g, w = guillemotleft(c)
    return mirror_x(g, w), w


@glyph('less')
def less(c):
    w = c.wd(0.62, stems=0)
    return chevron(c, 0, w, c.H * 0.6, c.H * 0.4, c.T * 0.85), w


@glyph('greater')
def greater(c):
    g, w = less(c)
    return mirror_x(g, w), w


@glyph('lessequal')
def lessequal(c):
    w = c.wd(0.62, stems=0)
    t = c.T * 0.75
    ch = chevron(c, 0, w, c.H * 0.5, c.H * 0.5, t)
    return U(ch, box(0, 0, w, t)), w


@glyph('greaterequal')
def greaterequal(c):
    g, w = lessequal(c)
    return mirror_x(g, w), w


def arrow(c):
    w = c.wd(0.95, stems=0)
    ym = c.H * 0.4
    th = c.T * 0.72
    hh = c.H * 0.64
    head = mirror_x(chevron(c, 0, hh * 0.5, hh, ym, th), w)
    shaft = box(0, ym - th / 2, w - th * 0.8, ym + th / 2)
    return U(head, shaft), w


@glyph('arrowright')
def arrowright(c):
    return arrow(c)


@glyph('arrownortheast')
def arrownortheast(c):
    g, w = arrow(c)
    g = affinity.rotate(g, 45, origin=(w / 2, c.H * 0.4))
    b = g.bounds
    g = shift(g, -b[0], 0)
    return g, b[2] - b[0]


@glyph('bullet')
def bullet(c):
    d = dw(c) * 1.1
    y = c.X * 0.5 - d / 2
    return box(0, y, d, y + d), d


@glyph('periodcentered')
def periodcentered(c):
    d = dw(c)
    y = c.X * 0.5 - d / 2
    return box(0, y, d, y + d), d


@glyph('ellipsis')
def ellipsis(c):
    d = dw(c)
    gap = d * 0.75
    return U(*[box(k * (d + gap), 0, k * (d + gap) + d, d) for k in range(3)]), 3 * d + 2 * gap


@glyph('degree')
def degree(c):
    s = c.H * 0.36
    t = c.T * 0.7
    return shift(c.frame(0, 0, s, s, s * 0.32, t, t, t, t), 0, c.H - s), s


@glyph('asterisk')
def asterisk(c):
    s = c.H * 0.42
    t = c.T * 0.75
    arm = box(-t / 2, 0, t / 2, s / 2)
    g = U(*[affinity.rotate(arm, a, origin=(0, 0)) for a in (0, 60, 120, 180, 240, 300)])
    g = shift(g, s / 2, c.H - s / 2)
    b = g.bounds
    return shift(g, -b[0], 0), b[2] - b[0]


@glyph('numbersign')
def numbersign(c):
    w = c.wd(0.92, stems=0)
    t = c.T * 0.8
    h = c.H * 0.8
    v1 = clipy(c.stroke(w * 0.22, 0, w * 0.40, h, t), 0, h)
    v2 = shift(v1, w * 0.36)
    hb = U(box(0, h * 0.30, w, h * 0.30 + t), box(0, h * 0.64, w, h * 0.64 + t))
    return U(v1, v2, hb), w


@glyph('percent')
def percent(c):
    w = c.wd(1.2, stems=0)
    s = c.H * 0.36
    t = c.T * 0.7
    ring = c.frame(0, 0, s, s, s * 0.3, t, t, t, t)
    sl = clipy(c.stroke(w * 0.18, 0, w * 0.82, c.H, t * 1.1), 0, c.H)
    return U(shift(ring, 0, c.H - s), shift(ring, w - s, 0), sl), w


@glyph('ampersand')
def ampersand(c):
    w = c.wd(1.12)
    ym = c.H * 0.52
    xi = w * 0.08
    wl = w * 0.84
    lo = c.frame(0, 0, wl, ym + c.T, min(c.R, (ym + c.T) / 2)).difference(box(wl - c.S - 1, c.T, w, ym + c.T + 1))
    up = c.frame(xi, ym, w * 0.70, c.H, min(c.R, (c.H - ym) / 2))
    leg = clipy(c.stroke(xi + c.S * 0.2, ym + c.T, w, 0, ea='l', eb='r'), 0, ym + c.T)
    spur = box(wl - c.S, ym * 0.62, w, ym * 0.62 + c.T)
    return U(lo, up, spur, leg), w


@glyph('at')
def at(c):
    ga, wa = a(c)
    c.cuts = []
    s = 0.62
    inner = affinity.scale(ga, s, s, origin=(0, 0))
    t = c.T * 0.8
    W_ = max(wa * s + 2 * t + 2 * c.S * 0.7, c.H * 0.92 * c.wscale)
    Hh = c.H
    ring = c.frame(0, c.D * 0.55, W_, Hh, c.R * 0.9, t * 1.1, t * 1.1, t, t)
    ring = ring.difference(box(W_ * 0.6, c.D * 0.55 - 1, W_ + 1, c.D * 0.55 + t + 1))
    inner = shift(inner, (W_ - wa * s) / 2 + c.S * 0.05, (Hh + c.D * 0.55) / 2 - c.X * s / 2)
    return U(ring, inner), W_


@glyph('copyright')
def copyright(c):
    s = c.H * 1.0
    t = c.T * 0.65
    ring = c.frame(0, 0, s, s, c.R, t, t, t, t)
    ci = s * 0.46
    x0 = (s - ci) / 2
    inner = rr(x0, x0, x0 + ci, x0 + ci, (ci * 0.3, 0, 0, ci * 0.3)).difference(box(x0 + t, x0 + t, x0 + ci + 1, x0 + ci - t))
    return U(ring, inner), s


@glyph('Euro')
def euro(c):
    g, w = C(c)
    c.cuts = []
    ym = c.H / 2
    t = c.T * 0.75
    bars = U(box(-w * 0.12, ym + t * 0.4, w * 0.62, ym + t * 1.4), box(-w * 0.12, ym - t * 1.4, w * 0.62, ym - t * 0.4))
    g = U(shift(g, w * 0.12), shift(bars, w * 0.12))
    return g, w * 1.12


@glyph('twosuperior')
def twosuperior(c):
    g, w = two(c)
    c.cuts = []
    s = 0.58
    return shift(affinity.scale(g, s, s, origin=(0, 0)), 0, c.H * (1 - s) + c.H * 0.06), w * s


@glyph('dollar')
def dollar(c):
    g, w = S(c)
    c.cuts = []
    t = c.S * 0.6
    return U(g, box((w - t) / 2, -c.H * 0.12, (w + t) / 2, c.H * 1.12)), w


# ───────────────────────── ACCENTS ─────────────────────────

def acute(c, cx, y0, w=None, h=None):
    w = w or c.S * 1.15
    h = h or c.S * 1.0
    sk = h * 1.0
    return Polygon([(cx - w / 2 - sk / 2, y0), (cx + w / 2 - sk / 2, y0), (cx + w / 2 + sk / 2, y0 + h), (cx - w / 2 + sk / 2, y0 + h)])


def accent(c, kind, cx, y0, h):
    w = c.S * 1.1
    if kind == 'acute':
        return acute(c, cx, y0, w, h)
    if kind == 'grave':
        return mirror_x(acute(c, 0, y0, w, h), 0).union(EMPTY) if False else affinity.scale(acute(c, cx, y0, w, h), -1, 1, origin=(cx, 0))
    if kind == 'circumflex':
        cw = c.S * 1.6
        th = c.S * 0.75
        l = clipy(c.stroke(cx - cw, y0, cx, y0 + h, th, ea='l', eb='r'), y0, y0 + h)
        r_ = clipy(c.stroke(cx, y0 + h, cx + cw, y0, th, ea='l', eb='r'), y0, y0 + h)
        return U(l, r_)
    if kind == 'dieresis':
        d = min(dw(c), h)
        gap = d * 0.7
        return U(box(cx - gap / 2 - d, y0, cx - gap / 2, y0 + d), box(cx + gap / 2, y0, cx + gap / 2 + d, y0 + d))
    raise ValueError(kind)


ACC = {'grave': 'grave', 'acute': 'acute', 'circumflex': 'circumflex', 'dieresis': 'dieresis'}
COMPOSED = []  # (glyph name, codepoint, base, accent)
for base, letters in (('A', 'ÀÁÂÄ'), ('E', 'ÈÉÊË'), ('I', 'ÌÍÎÏ'), ('O', 'ÒÓÔÖ'), ('U', 'ÙÚÛÜ'),
                      ('a', 'àáâä'), ('e', 'èéêë'), ('dotlessi', 'ìíîï'), ('o', 'òóôö'), ('u', 'ùúûü')):
    for ch, kind in zip(letters, ('grave', 'acute', 'circumflex', 'dieresis')):
        COMPOSED.append(('uni%04X' % ord(ch), ord(ch), base, kind))


def composed(c, base, kind):
    g, w = G[base](c)
    lower = base.islower() or base == 'dotlessi'
    if lower:
        y0, h = c.X + c.T * 0.95, c.S * 1.15
    else:
        y0, h = c.H + c.T * 0.6, c.S * 0.95
    cx = w / 2
    return U(g, accent(c, kind, cx, y0, h)), w


# ───────────────────────── EXTRAS ─────────────────────────

def ordinal(c, base):
    g, w = G[base](c)
    c.cuts = []
    s = 0.56
    t = c.T * 0.7
    g = affinity.scale(g, s, s, origin=(0, 0))
    y0 = c.H - c.X * s
    g = shift(g, 0, y0)
    return U(g, box(0, y0 - t * 1.7, w * s, y0 - t * 0.7)), w * s


@glyph('ordmasculine')
def ordmasculine(c):
    return ordinal(c, 'o')


@glyph('ordfeminine')
def ordfeminine(c):
    return ordinal(c, 'a')


@glyph('asciicircum')
def asciicircum(c):
    w = c.wd(0.62, stems=0)
    return accent(c, 'circumflex', w / 2, c.H * 0.62, c.H * 0.38), w


@glyph('asciitilde')
def asciitilde(c):
    w = c.wd(0.8, stems=0)
    t = c.T * 0.8
    ym = c.H * 0.4
    hgt = t * 2.2
    r = min(hgt, w / 2) * 0.5
    left = rr(0, ym - hgt / 2, w / 2 + t / 2, ym + hgt / 2, (0, 0, r, r)).difference(
        rr(t, ym - hgt / 2 - 1, w / 2 - t / 2, ym + hgt / 2 - t, (0, 0, max(r - t, 0), max(r - t, 0))))
    left = left.difference(box(-1, ym - hgt / 2 - 1, t, ym - hgt / 2 + hgt * 0.35))
    right = affinity.rotate(left, 180, origin=(w / 2, ym))
    return U(left, right), w


def brace(c):
    w = c.wd(0.36, stems=1)
    y0, y1 = c.D * 0.85, c.A + 20
    ym = (y0 + y1) / 2
    R = min(c.R * 0.6, w * 0.6)
    xs = w * 0.32
    upper = rr(xs, ym, w, y1, (0, 0, 0, R)).difference(rr(xs + c.S, ym - 1, w + 1, y1 - c.T, (0, 0, 0, c.ri(R, c.S))))
    lower = rr(xs, y0, w, ym, (R, 0, 0, 0)).difference(rr(xs + c.S, y0 + c.T, w + 1, ym + 1, (c.ri(R, c.S), 0, 0, 0)))
    nub = box(0, ym - c.T / 2, xs + 1, ym + c.T / 2)
    return U(upper, lower, nub), w


@glyph('braceleft')
def braceleft(c):
    return brace(c)


@glyph('braceright')
def braceright(c):
    g, w = brace(c)
    return mirror_x(g, w), w


@glyph('grave')
def grave_(c):
    w = c.S * 2.2
    return accent(c, 'grave', w / 2, c.H - c.S * 0.95, c.S * 0.95), w


@glyph('mu')
def mu(c):
    g, w = G['u'](c)
    return U(g, box(0, c.D, c.S, c.T)), w
