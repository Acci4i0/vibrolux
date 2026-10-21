"""Geometry primitives for the Vibrolux type family (units: 1000 UPM, y up, baseline 0)."""
import math
from shapely.geometry import Polygon, MultiPolygon, box, Point
from shapely.ops import unary_union
from shapely import affinity

EMPTY = Polygon()


def arcpts(cx, cy, r, a0, a1):
    n = max(3, int(abs(a1 - a0) / 90 * max(4, r / 9)))
    return [(cx + r * math.cos(math.radians(a0 + (a1 - a0) * i / n)),
             cy + r * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]


def rr(x0, y0, x1, y1, r=0):
    """Rectangle with per-corner radii (bl, br, tr, tl)."""
    if x1 < x0:
        x0, x1 = x1, x0
    if y1 < y0:
        y0, y1 = y1, y0
    w, h = x1 - x0, y1 - y0
    if w <= 0 or h <= 0:
        return EMPTY
    if isinstance(r, (int, float)):
        r = (r, r, r, r)
    bl, br, tr, tl = [max(0, v) for v in r]
    lim = lambda v, horiz_other, vert_other: min(v, w if horiz_other == 0 else w / 2, h if vert_other == 0 else h / 2)
    bl, br, tr, tl = lim(bl, br, tl), lim(br, bl, tr), lim(tr, tl, br), lim(tl, tr, bl)
    pts = []
    pts += arcpts(x0 + bl, y0 + bl, bl, 180, 270) if bl else [(x0, y0)]
    pts += arcpts(x1 - br, y0 + br, br, 270, 360) if br else [(x1, y0)]
    pts += arcpts(x1 - tr, y1 - tr, tr, 0, 90) if tr else [(x1, y1)]
    pts += arcpts(x0 + tl, y1 - tl, tl, 90, 180) if tl else [(x0, y1)]
    return Polygon(pts)


def diag(x0, y0, x1, y1, thick):
    """Stroke with horizontal ends, centreline (x0,y0)->(x1,y1), perpendicular thickness `thick`."""
    ang = math.atan2(abs(y1 - y0), abs(x1 - x0))
    hw = thick / 2 / max(math.sin(ang), 0.2)
    return Polygon([(x0 - hw, y0), (x0 + hw, y0), (x1 + hw, y1), (x1 - hw, y1)])


def U(*gs):
    return unary_union([g for g in gs if g is not None and not g.is_empty])


def mirror_x(g, w):
    return affinity.scale(g, -1, 1, origin=(w / 2, 0))


def rot180(g, w, h):
    return affinity.rotate(g, 180, origin=(w / 2, h / 2))


def shift(g, dx=0, dy=0):
    return affinity.translate(g, dx, dy)


def opening(g, r):
    if r <= 0 or g.is_empty:
        return g
    return g.buffer(-r, join_style=1, quad_segs=6).buffer(r, join_style=1, quad_segs=6)


def slice_cut(P, d, e, w, g, k=1.12):
    """Hairline arc cutting a stroke of thickness w next to an inner corner P.
    d: unit vector along the cut stroke, away from the joint; e: unit vector across it, toward its outer edge."""
    rho = k * w
    cx, cy = P[0] + rho * d[0], P[1] + rho * d[1]
    ring = Point(cx, cy).buffer(rho + g / 2, quad_segs=48).difference(Point(cx, cy).buffer(rho - g / 2, quad_segs=48))
    pt = lambda s, t: (P[0] + s * d[0] + t * e[0], P[1] + s * d[1] + t * e[1])
    clip = Polygon([pt(-g, -g), pt(rho, -g), pt(rho, w + 3 * g), pt(-g, w + 3 * g)])
    return ring.intersection(clip)


def paint(base, top, g):
    """Overlapping ribbons: `top` lies over `base` with a hairline gap around it."""
    if g <= 0:
        return U(base, top)
    return U(base.difference(top.buffer(g, join_style=2, mitre_limit=3)), top)
