"""
Vibrolux — a circular vibrator after the LM VBC 400 (Ø 1340 mm, tub 480 mm), cut open by a quarter, in Cycles:
the Lavorazioni hero (public/assets/lavorazioni/vibratore-sezione-*.webp). Blender 3.4.

Two steps, so the media are laid out once:
  1. build the scene and save it
     Blender -b --factory-startup -P render/vbc.py -- media=1 sim=0 chips=1 spp=8 w=320 h=200 out=/tmp/x.png blend=/abs/path/vbc.blend
  2. shoot it (camera, lights, materials, the hero gear and its reflection card are set here)
     Blender -b --factory-startup -P render/vbc.py -- blendin=/abs/path/vbc.blend spp=128 w=2880 h=1800 rig=lowkey \
       light=1.0 cards=0.8 cutv=0.72 coat=0.1 paintc=0.025 chip=0.15 look='High Contrast' exposure=-0.3 \
       camloc=1.0,-0.5,0.66 camtgt=0.35,0.1,0.33 lens=45 sx=-0.07 fstop=2.2 fx=0.45 fy=0.0 fz=0.35 \
       hg_a=0.1 hg_r=0.055 hg_tilt=12 out=/abs/path/vibratore-sezione.png
Units: metres, Z up. The cut wedge faces the camera. sim=1 settles the media with rigid bodies instead (hours on a laptop).
"""
import bpy, bmesh, math, random, sys, time
from mathutils import Vector, Matrix, Euler

# ───────── arguments ─────────
ARGS = dict(out='//out.png', w=960, h=600, spp=32, clay=0, media=1, sim=1, chips=6000, cam='a', focus='face',
            fstop=4.0, lens=50.0, cutcol='grey', blend='', exposure=0.0, frame=0,
            camloc='', camtgt='', sx=0.0, sy=0.0, light=1.0, rig='studio', glare=0.0, blendin='', drop=0.08, chip=0.2, lin=0.035, paintc=0.04, cutv=0.6, cards=1.0, coat=0.25, look='Medium High Contrast', fx=0.0, fy=0.0, fz=0.0, secchips=1, secv=0.3, hero=1, hg_a=0.32, hg_r=0.02, hg_tilt=14.0, gcard=14.0, gdist=0.9, gw=0.7, topsize=1.4, graze=90.0)
for a in sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []:
    k, v = a.split('=', 1)
    ARGS[k] = type(ARGS[k])(v) if k in ARGS and not isinstance(ARGS[k], str) else v
A = ARGS

# ───────── dimensions ─────────
CX, CY, CR = 0.42, 0.20, 0.23          # channel centre radius, height of the round bottom's centre, inner radius
LIN, SH = 0.016, 0.014                 # lining, steel
COL = CX - CR                          # column radius
TOP = 0.48                             # rim
FILL = 0.385                           # free surface of the media
MR = CR - LIN
CUT_C = math.radians(-50)              # wedge centre (toward the camera)
CUT_H = math.radians(45)
PHI0 = CUT_C + CUT_H
PHIL = 2 * math.pi - 2 * CUT_H

BUILD = r'''
random.seed(7)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
col_main = sc.collection


def link(obj, coll=None):
    (coll or col_main).objects.link(obj)
    return obj


# ───────── profiles ─────────
def arc(cx, cy, r, a0, a1, n):
    return [(cx + r * math.cos(a0 + (a1 - a0) * i / n), cy + r * math.sin(a0 + (a1 - a0) * i / n)) for i in range(n + 1)]


def fillet(poly, r=0.003, seg=5):
    """round every sharp corner of a closed polygon with radius r (curved runs, made of short segments, stay as they are)"""
    out = []
    n = len(poly)
    for i in range(n):
        a, b, c = Vector(poly[i - 1]), Vector(poly[i]), Vector(poly[(i + 1) % n])
        u, v = a - b, c - b
        lu, lv = u.length, v.length
        if lu < 1e-6 or lv < 1e-6:
            continue
        u.normalize(); v.normalize()
        ang = math.acos(max(-1, min(1, u.dot(v))))
        if ang > math.radians(160):
            out.append(tuple(b)); continue
        t = r / math.tan(ang / 2)
        t = min(t, 0.45 * lu, 0.45 * lv)
        rr = t * math.tan(ang / 2)
        p0, p1 = b + u * t, b + v * t
        bis = (u + v).normalized()
        cen = b + bis * (rr / math.sin(ang / 2))
        a0 = math.atan2(p0.y - cen.y, p0.x - cen.x)
        a1 = math.atan2(p1.y - cen.y, p1.x - cen.x)
        d = a1 - a0
        while d > math.pi: d -= 2 * math.pi
        while d < -math.pi: d += 2 * math.pi
        for k in range(seg + 1):
            aa = a0 + d * k / seg
            out.append((cen.x + rr * math.cos(aa), cen.y + rr * math.sin(aa)))
    return out


def tub_profile():
    ro = CR + SH
    p = [(0.0, TOP + 0.022), (COL - 0.01, TOP + 0.022), (COL, TOP + 0.012)]
    p += arc(CX, CY, CR, math.pi, 2 * math.pi, 64)[0:]
    p = [(0.0, TOP + 0.022), (COL - 0.012, TOP + 0.022), (COL, TOP + 0.010), (COL, CY)] + arc(CX, CY, CR, math.pi, 2 * math.pi, 64)[1:]
    p += [(CX + CR, TOP), (CX + CR + 0.075, TOP), (CX + CR + 0.075, TOP - 0.03), (CX + ro, TOP - 0.03)]
    p += [(CX + ro, CY)] + arc(CX, CY, ro, 0, -math.pi, 64)[1:]
    p += [(CX - ro, TOP + 0.006), (0.0, TOP + 0.006)]
    return p


def lining_profile():
    t = TOP - 0.03
    return [(COL, t), (COL + LIN, t), (COL + LIN, CY)] + arc(CX, CY, MR, math.pi, 2 * math.pi, 64)[1:] + \
           [(CX + MR, t), (CX + CR, t), (CX + CR, CY)] + arc(CX, CY, CR, 0, -math.pi, 64)[1:] + [(COL, CY)]


def core_profile():
    r, f = MR - 0.004, FILL - 0.03
    return [(CX - r, f), (CX + r, f), (CX + r, CY)] + arc(CX, CY, r, 0, -math.pi, 48)[1:] + [(CX - r, CY)]


def ring(r0, r1, z0, z1):
    return [(r0, z1), (r1, z1), (r1, z0), (r0, z0)]


def revolve(name, prof, phi0=PHI0, phil=PHIL, steps=240, r=0.003, caps=True, mat=None, capmat=None):
    """revolve a closed (ρ, z) profile; the cut faces get their own material"""
    prof = fillet(prof, r) if r else prof
    bm = bmesh.new()
    vs = [bm.verts.new((x * math.cos(phi0), x * math.sin(phi0), z)) for x, z in prof]
    es = [bm.edges.new((vs[i], vs[(i + 1) % len(vs)])) for i in range(len(vs))]
    start_face = bm.faces.new(vs) if caps else None
    res = bmesh.ops.spin(bm, geom=vs + es + ([start_face] if start_face else []), cent=(0, 0, 0), axis=(0, 0, 1),
                         dvec=(0, 0, 0), angle=phil, steps=steps, use_duplicate=False)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me)
    link(ob)
    for p in me.polygons:
        p.use_smooth = True
    me.use_auto_smooth = True
    me.auto_smooth_angle = math.radians(40)
    if mat: me.materials.append(mat)
    if capmat:
        me.materials.append(capmat)
        # cap faces: their normal is tangential (perpendicular to the radius and to z)
        for p in me.polygons:
            c = p.center
            if abs(p.normal.z) < 0.2 and Vector((c.x, c.y, 0)).length > 1e-4:
                radial = Vector((c.x, c.y, 0)).normalized()
                if abs(p.normal.dot(radial)) < 0.05 and p.area > 0:
                    # tangential faces at the two cut angles
                    a = math.atan2(c.y, c.x)
                    for ca in (phi0, phi0 + phil):
                        if abs(math.atan2(math.sin(a - ca), math.cos(a - ca))) < 0.02:
                            p.material_index = 1
    return ob


# ───────── materials ─────────
def principled(name, base=(0.5, 0.5, 0.5), metal=0.0, rough=0.5, coat=0.0, coat_rough=0.1, aniso=0.0, spec=0.5):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*base, 1)
    b.inputs['Metallic'].default_value = metal
    b.inputs['Roughness'].default_value = rough
    b.inputs['Clearcoat'].default_value = coat
    b.inputs['Clearcoat Roughness'].default_value = coat_rough
    b.inputs['Anisotropic'].default_value = aniso
    b.inputs['Specular'].default_value = spec
    return m


def add_noise_roughness(m, scale=180.0, lo=0.28, hi=0.42):
    """break the roughness up a little: real surfaces are never uniform"""
    nt = m.node_tree
    b = nt.nodes['Principled BSDF']
    n = nt.nodes.new('ShaderNodeTexNoise'); n.inputs['Scale'].default_value = scale; n.inputs['Detail'].default_value = 6
    r = nt.nodes.new('ShaderNodeMapRange'); r.inputs['To Min'].default_value = lo; r.inputs['To Max'].default_value = hi
    nt.links.new(n.outputs['Fac'], r.inputs['Value'])
    nt.links.new(r.outputs['Result'], b.inputs['Roughness'])


def packed_section(name):
    """a sectioned mass of preforms: voronoi cells, light chips with dark gaps, each a slightly different grey"""
    m = principled(name, rough=0.75)
    nt = m.node_tree
    b = nt.nodes['Principled BSDF']
    tc = nt.nodes.new('ShaderNodeTexCoord')
    v = nt.nodes.new('ShaderNodeTexVoronoi'); v.feature = 'F1'; v.distance = 'CHEBYCHEV'
    v.inputs['Scale'].default_value = 42.0; v.inputs['Randomness'].default_value = 1.0
    v2 = nt.nodes.new('ShaderNodeTexVoronoi'); v2.feature = 'DISTANCE_TO_EDGE'
    v2.inputs['Scale'].default_value = 42.0; v2.inputs['Randomness'].default_value = 1.0
    nt.links.new(tc.outputs['Object'], v.inputs['Vector']); nt.links.new(tc.outputs['Object'], v2.inputs['Vector'])
    gap = nt.nodes.new('ShaderNodeMapRange'); gap.inputs['From Min'].default_value = 0.07; gap.inputs['From Max'].default_value = 0.13
    nt.links.new(v2.outputs['Distance'], gap.inputs['Value'])
    tone = nt.nodes.new('ShaderNodeMapRange'); tone.inputs['To Min'].default_value = 0.22; tone.inputs['To Max'].default_value = 0.6
    nt.links.new(v.outputs['Color'], tone.inputs['Value'])
    mul = nt.nodes.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'
    nt.links.new(tone.outputs['Result'], mul.inputs[0]); nt.links.new(gap.outputs['Result'], mul.inputs[1])
    add = nt.nodes.new('ShaderNodeMath'); add.operation = 'ADD'; add.inputs[1].default_value = 0.012
    nt.links.new(mul.outputs['Value'], add.inputs[0])
    cr = nt.nodes.new('ShaderNodeCombineColor')
    for i in range(3): nt.links.new(add.outputs['Value'], cr.inputs[i])
    nt.links.new(cr.outputs['Color'], b.inputs['Base Color'])
    return m


clay = principled('clay', (0.6, 0.6, 0.6), rough=0.6)
if A['clay']:
    paint = steel = polished = lining = chipmat = coremat = cutmat = clay
    packed = clay
else:
    paint = principled('paint', (0.05, 0.052, 0.056), rough=0.38, coat=0.6, coat_rough=0.12)   # anthracite satin paint
    add_noise_roughness(paint, 120, 0.32, 0.44)
    steel = principled('steel', (0.62, 0.62, 0.63), metal=1.0, rough=0.3, aniso=0.5)
    add_noise_roughness(steel, 300, 0.24, 0.34)
    polished = principled('polished', (0.9, 0.9, 0.91), metal=1.0, rough=0.08)
    lining = principled('lining', (0.11, 0.105, 0.1), rough=0.55, spec=0.4)                    # polyurethane
    add_noise_roughness(lining, 60, 0.5, 0.62)
    chipmat = principled('ceramic', (0.42, 0.41, 0.39), rough=0.62, spec=0.35)
    coremat = principled('core', (0.02, 0.02, 0.02), rough=0.9)
    cutcolors = {'grey': (0.55, 0.55, 0.55), 'navy': (0.0151, 0.0513, 0.1567), 'light': (0.8, 0.8, 0.8)}
    cutmat = principled('cut', cutcolors.get(A['cutcol'], (0.55, 0.55, 0.55)), rough=0.55)
    packed = packed_section('packed')

# ───────── the machine ─────────
tub = revolve('tub', tub_profile(), mat=paint, capmat=cutmat)
lin = revolve('lining', lining_profile(), mat=lining, capmat=cutmat, r=0.002)
seat = revolve('seat', ring(0.30, 0.62, -0.09, -0.06), mat=paint, capmat=cutmat)
bflange = revolve('base_top', ring(0.28, 0.62, -0.37, -0.34), mat=paint, capmat=cutmat)
drum = revolve('drum', ring(0.465, 0.48, -0.68, -0.37), mat=paint, capmat=cutmat, r=0.002)
foot = revolve('foot', ring(0.465, 0.57, -0.70, -0.68), mat=paint, capmat=cutmat)


def in_wedge(a, pad=0.0):
    return abs(math.atan2(math.sin(a - CUT_C), math.cos(a - CUT_C))) < CUT_H + pad


# bolts on the rim
def hexbolt(name, s=0.009):
    bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=s, depth=0.008)
    ob = bpy.context.object; ob.name = name
    bev = ob.modifiers.new('bev', 'BEVEL'); bev.width = 0.0012; bev.segments = 2
    ob.data.materials.append(steel)
    bpy.ops.object.shade_smooth(); ob.data.use_auto_smooth = True; ob.data.auto_smooth_angle = math.radians(40)
    return ob


proto = hexbolt('bolt')
proto.location = (100, 0, 0)
for i in range(48):
    a = 2 * math.pi * i / 48
    if in_wedge(a, 0.03): continue
    o = proto.copy(); link(o)
    o.location = (0.69 * math.cos(a), 0.69 * math.sin(a), TOP + 0.004)
    o.rotation_euler = (0, 0, a)

# coil springs between seat and base: flat-ended helices
def spring(name):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'
    sp = cu.splines.new('POLY')
    pts = []
    turns, r, h, n = 6.5, 0.045, 0.25, 260
    for i in range(n + 1):
        t = i / n
        a = t * turns * 2 * math.pi
        # dead coils at both ends (flat): pitch eases to zero there
        e = t * h
        e = h * (t - (0.04 / (2 * math.pi)) * math.sin(2 * math.pi * t)) if 0.06 < t < 0.94 else (h * 0.03 * (t / 0.06) if t <= 0.06 else h - h * 0.03 * ((1 - t) / 0.06))
        pts.append((r * math.cos(a), r * math.sin(a), -e))
    sp.points.add(len(pts) - 1)
    for p, c in zip(sp.points, pts): p.co = (*c, 1)
    cu.bevel_depth = 0.0085; cu.bevel_resolution = 3
    ob = bpy.data.objects.new(name, cu); link(ob)
    ob.data.materials.append(steel)
    return ob

sp0 = spring('spring')
sp0.location = (100, 0, 0)
for i in range(16):
    a = 2 * math.pi * i / 16 + 0.1
    o = sp0.copy(); link(o)
    o.location = (0.52 * math.cos(a), 0.52 * math.sin(a), -0.092)

# motor inside the column: finned body, flanges, shaft, terminal box, eccentric masses (half discs)
def cyl(name, r, z0, z1, mat, verts=96, bevel=0.002):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=z1 - z0, location=(0, 0, (z0 + z1) / 2))
    ob = bpy.context.object; ob.name = name
    if bevel:
        b = ob.modifiers.new('bev', 'BEVEL'); b.width = bevel; b.segments = 3; b.limit_method = 'ANGLE'
    ob.data.materials.append(mat)
    bpy.ops.object.shade_smooth(); ob.data.use_auto_smooth = True; ob.data.auto_smooth_angle = math.radians(35)
    return ob

cyl('motor', 0.085, 0.215, 0.405, paint)
cyl('flange_lo', 0.105, 0.205, 0.222, steel)
cyl('flange_hi', 0.105, 0.398, 0.415, steel)
cyl('shaft', 0.014, -0.22, 0.47, polished, verts=32, bevel=0.001)
for i in range(44):
    a = 2 * math.pi * i / 44
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0.1 * math.cos(a), 0.1 * math.sin(a), 0.31), rotation=(0, 0, a))
    f = bpy.context.object; f.scale = (0.032, 0.0035, 0.17)
    b = f.modifiers.new('bev', 'BEVEL'); b.width = 0.0008; b.segments = 2
    f.data.materials.append(paint)


def half_disc(name, z, r=0.13, t=0.034):
    bm = bmesh.new()
    pts = [(r * math.cos(a), r * math.sin(a)) for a in [(-math.pi / 2 + math.pi * i / 48) for i in range(49)]]
    pts += [(0.025 * math.cos(a), 0.025 * math.sin(a)) for a in [(math.pi / 2 - math.pi * i / 16) for i in range(17)]]
    vs = [bm.verts.new((x, y, 0)) for x, y in pts]
    f = bm.faces.new(vs)
    bmesh.ops.extrude_face_region(bm, geom=[f])
    for v in bm.verts:
        if abs(v.co.z) < 1e-9 and v not in vs: pass
    bm.verts.ensure_lookup_table()
    n = len(pts)
    for v in bm.verts[n:]: v.co.z = t
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); link(ob)
    ob.location = (0, 0, z - t / 2)
    b = ob.modifiers.new('bev', 'BEVEL'); b.width = 0.002; b.segments = 3; b.limit_method = 'ANGLE'
    me.materials.append(polished)
    for p in me.polygons: p.use_smooth = True
    me.use_auto_smooth = True; me.auto_smooth_angle = math.radians(35)
    return ob

half_disc('mass_hi', 0.445).rotation_euler = (0, 0, 1.2)
half_disc('mass_lo', -0.17).rotation_euler = (0, 0, 1.2)


# ───────── details that make it a machine: lifting eye, terminal box, drain valve ─────────
bpy.ops.mesh.primitive_torus_add(major_radius=0.03, minor_radius=0.008, location=(0.0, 0.0, TOP + 0.06), rotation=(math.pi / 2, 0, 0.6))
eye = bpy.context.object; eye.data.materials.append(steel); bpy.ops.object.shade_smooth()
cyl('eye_foot', 0.022, TOP + 0.022, TOP + 0.034, steel, verts=6)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0.095 * math.cos(2.2), 0.095 * math.sin(2.2), 0.33), rotation=(0, 0, 2.2))
tb = bpy.context.object; tb.scale = (0.05, 0.075, 0.07)
b_ = tb.modifiers.new('bev', 'BEVEL'); b_.width = 0.004; b_.segments = 3
tb.data.materials.append(paint)
va = math.radians(-60)   # the valve sits on the outer skin, at the bottom, where the camera sees it
vx, vy = (CX + CR + SH + 0.005) * math.cos(va), (CX + CR + SH + 0.005) * math.sin(va)
for nm, r_, l_, off in (('pipe', 0.017, 0.11, 0.055), ('valve', 0.03, 0.05, 0.12)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=r_, depth=l_, location=(vx + off * math.cos(va), vy + off * math.sin(va), 0.04), rotation=(0, math.pi / 2, va))
    o = bpy.context.object; o.name = nm
    bb = o.modifiers.new('bev', 'BEVEL'); bb.width = 0.003; bb.segments = 3; bb.limit_method = 'ANGLE'
    o.data.materials.append(steel); bpy.ops.object.shade_smooth()
bpy.ops.mesh.primitive_cube_add(size=1, location=(vx + 0.12 * math.cos(va), vy + 0.12 * math.sin(va), 0.085), rotation=(0, 0, va + 1.2))
lv = bpy.context.object; lv.scale = (0.012, 0.13, 0.008)
bb = lv.modifiers.new('bev', 'BEVEL'); bb.width = 0.003; bb.segments = 2
lv.data.materials.append(paint)

# ───────── media ─────────
def chip_mesh():
    """the catalogue's triangle preform, angle cut, ~20 mm, with rounded edges"""
    bm = bmesh.new()
    s = 0.0105
    tri = [(0, s * 1.15), (-s, -s * 0.58), (s, -s * 0.58)]
    v0 = [bm.verts.new((x, y, -0.006)) for x, y in tri]
    v1 = [bm.verts.new((x, y + 0.0 , 0.006 + 0.35 * y)) for x, y in tri]   # angle cut top
    bm.faces.new(v0[::-1]); bm.faces.new(v1)
    for i in range(3):
        j = (i + 1) % 3
        bm.faces.new((v0[i], v0[j], v1[j], v1[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bmesh.ops.bevel(bm, geom=bm.edges[:], offset=0.0016, segments=3, affect='EDGES', profile=0.5)
    me = bpy.data.meshes.new('chip'); bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = True
    me.use_auto_smooth = True; me.auto_smooth_angle = math.radians(50)
    return me

if A['media']:
    core = revolve('core', core_profile(), mat=coremat, capmat=packed, r=0)

chips = []
if A['media'] and A['chips'] > 0:
    cm = chip_mesh(); cm.materials.append(chipmat)
    coll = bpy.data.collections.new('chips_drop'); col_main.children.link(coll)
    # drop them in layers over the free surface, in the remaining 270° (physics only)
    for i in range(A['chips'] if A['sim'] else 0):
        while True:
            a = PHI0 + random.random() * PHIL
            rho = CX + (random.random() * 2 - 1) * (MR - 0.02)
            if not in_wedge(a, 0.04): break
        z = FILL - 0.015 + random.random() * float(A.get('drop', 0.08))
        o = bpy.data.objects.new('c%d' % i, cm); coll.objects.link(o)
        o.location = (rho * math.cos(a), rho * math.sin(a), z)
        o.rotation_euler = (random.random() * 6.28, random.random() * 6.28, random.random() * 6.28)
        sc_ = 0.85 + random.random() * 0.35
        o.scale = (sc_, sc_, sc_)
        chips.append(o)


# ───────── media placed on the free surface: dense, no overlaps, each chip resting on a stable face ─────────
def scatter_media(cm):
    t0 = time.time()
    surf = FILL - 0.03                    # the core's top
    rin, rout = CX - (MR - 0.012), CX + (MR - 0.012)
    cell = 0.012
    grid = {}
    placed = []
    def ok(p, d):
        gx, gy = int(math.floor(p.x / cell)), int(math.floor(p.y / cell))
        for i in range(gx - 2, gx + 3):
            for j in range(gy - 2, gy + 3):
                for q, dq, lay in grid.get((i, j), ()):
                    if lay == layer and (Vector((p.x, p.y)) - Vector((q.x, q.y))).length < (d + dq) * 0.5:
                        return False
        return True
    coll = bpy.data.collections.new('chips'); col_main.children.link(coll)
    out = []
    for layer, d, tries, z0 in ((0, 0.0165, 160000, 0.0), (1, 0.02, 90000, 0.008)):
        for _ in range(tries):
            a = PHI0 + random.random() * PHIL
            rho = math.sqrt(rin * rin + random.random() * (rout * rout - rin * rin))
            # keep clear of the cut faces (no chip hangs over the section)
            if min(abs(a - PHI0), abs(PHI0 + PHIL - a)) * rho < 0.013: continue
            p = Vector((rho * math.cos(a), rho * math.sin(a), 0))
            if not ok(p, d): continue
            # a gentle heave of the surface; the mass rides up the walls a little
            wall = max(0.0, (abs(rho - CX) - (MR - 0.07)) / 0.06)
            z = surf + 0.006 + z0 + 0.006 * math.sin(a * 9 + rho * 40) + 0.012 * wall * wall
            grid.setdefault((int(math.floor(p.x / cell)), int(math.floor(p.y / cell))), []).append((p, d, layer))
            o = bpy.data.objects.new('c', cm); coll.objects.link(o)
            o.location = (p.x, p.y, z)
            yaw = random.random() * 6.283
            if random.random() < 0.68:      # lying on its triangle
                tilt = Euler((random.gauss(0, 0.16), random.gauss(0, 0.16), yaw))
            else:                           # on one of its sides
                tilt = Euler((math.pi / 2 + random.gauss(0, 0.2), random.gauss(0, 0.15), yaw))
                o.location.z += 0.002
            o.rotation_euler = tilt
            k = 0.85 + random.random() * 0.3
            o.scale = (k, k, k)
            out.append(o)
    print('SCATTER', len(out), 'chips in', round(time.time() - t0, 1), 's')
    return out

# ───────── settle the media with rigid bodies ─────────
def settle(frames=70):
    t0 = time.time()
    bpy.ops.rigidbody.world_add()
    rw = sc.rigidbody_world
    rw.substeps_per_frame = 4; rw.solver_iterations = 8
    rw.point_cache.frame_end = frames
    sc.frame_end = frames
    # low-poly colliders: the channel inside the lining and the top of the core
    cl = revolve('col_lining', lining_profile(), steps=60, r=0, caps=False)
    cc = revolve('col_core', core_profile(), steps=60, r=0, caps=True)
    for o in (cl, cc): o.hide_render = True
    colliders = (cl, cc)
    for ob in colliders:
        bpy.context.view_layer.objects.active = ob; ob.select_set(True)
        bpy.ops.rigidbody.object_add(); ob.rigid_body.type = 'PASSIVE'; ob.rigid_body.collision_shape = 'MESH'
        ob.rigid_body.friction = 0.8; ob.select_set(False)
    for o in chips:
        rw.collection.objects.link(o) if False else None
    # add all chips as active convex hulls (via the operator on a selection: fastest)
    bpy.ops.object.select_all(action='DESELECT')
    bodies = chips + gears
    for o in bodies: o.select_set(True)
    bpy.context.view_layer.objects.active = chips[0]
    bpy.ops.rigidbody.objects_add(type='ACTIVE')
    for o in bodies:
        rb = o.rigid_body; rb.collision_shape = 'CONVEX_HULL'; rb.friction = 0.7; rb.mass = 0.2 if o in gears else 0.02
        rb.collision_margin = 0.0005; rb.linear_damping = 0.3; rb.angular_damping = 0.4
    for f in range(1, frames + 1):
        sc.frame_set(f)
    print('SETTLE seconds', time.time() - t0)
    # keep the settled pose
    bpy.ops.object.select_all(action='DESELECT')
    for o in bodies: o.select_set(True)
    bpy.ops.object.visual_transform_apply()
    bpy.ops.rigidbody.objects_remove()
    for ob in colliders:
        bpy.data.objects.remove(ob)
    # drop strays (outside the channel, or sitting in the wedge)
    for o in chips:
        p = o.location
        rho, a = math.hypot(p.x, p.y), math.atan2(p.y, p.x)
        if p.z < CY - CR or p.z > FILL + 0.06 or in_wedge(a, 0.012) or abs(rho - CX) > MR:
            bpy.data.objects.remove(o)

# ───────── the parts being finished: a few polished gears in the media ─────────
def gear_obj(name, teeth=14, ro=0.045, rr=0.037, t=0.016, bore=0.014):
    bm = bmesh.new()
    pts = []
    for i in range(teeth * 4):
        a = 2 * math.pi * i / (teeth * 4)
        r = ro if i % 4 in (1, 2) else rr
        pts.append((r * math.cos(a), r * math.sin(a)))
    outer = [bm.verts.new((x, y, 0)) for x, y in pts]
    f = bm.faces.new(outer)
    ext = bmesh.ops.extrude_face_region(bm, geom=[f])
    for v in [e for e in ext['geom'] if isinstance(e, bmesh.types.BMVert)]: v.co.z = t
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); link(ob)
    # bore
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=bore, depth=t * 3, location=(0, 0, t / 2))
    hole = bpy.context.object
    bo = ob.modifiers.new('bore', 'BOOLEAN'); bo.object = hole; bo.operation = 'DIFFERENCE'
    bpy.context.view_layer.objects.active = ob; bpy.ops.object.modifier_apply(modifier='bore')
    bpy.data.objects.remove(hole)
    b = ob.modifiers.new('bev', 'BEVEL'); b.width = 0.0012; b.segments = 3; b.limit_method = 'ANGLE'
    me.materials.append(polished)
    for p in me.polygons: p.use_smooth = True
    me.use_auto_smooth = True; me.auto_smooth_angle = math.radians(35)
    return ob

# angles chosen to sit near the cut face the camera looks at (-5°) and along the bowl
GEARS = [(math.radians(8), CX + 0.04, 0.4), (math.radians(30), CX - 0.06, 1.3), (math.radians(70), CX + 0.07, 2.4), (math.radians(140), CX - 0.02, 0.9)]
gears = []
if A['media']:
    for k, (a, rho, rot) in enumerate(GEARS):
        g = gear_obj('gear%d' % k)
        g.location = (rho * math.cos(a), rho * math.sin(a), FILL + 0.05)
        g.rotation_euler = (0.5 + 0.3 * k, -0.3, rot)
        gears.append(g)



if chips and A['sim']:
    settle()
elif A['media'] and A['chips'] > 0:
    chips = scatter_media(cm)
    # the gears sit on the bed: no chip inside their footprint
    for g in gears:
        g.location.z = FILL - 0.03 + 0.016
        for o in list(chips):
            if (Vector(o.location[:2]) - Vector(g.location[:2])).length < 0.05:
                bpy.data.objects.remove(o); chips.remove(o)

'''

SHOT = r'''

# ───────── material tuning (works on a loaded scene too) ─────────
def tune_materials():
    M = bpy.data.materials
    def bsdf(n):
        return M[n].node_tree.nodes['Principled BSDF'] if n in M else None
    b = bsdf('ceramic')
    if b and not any(n.type == 'OBJECT_INFO' for n in M['ceramic'].node_tree.nodes):
        nt = M['ceramic'].node_tree
        oi = nt.nodes.new('ShaderNodeObjectInfo')
        mr = nt.nodes.new('ShaderNodeMapRange'); mr.inputs['To Min'].default_value = float(A['chip']) * 0.72; mr.inputs['To Max'].default_value = float(A['chip']) * 1.18
        nt.links.new(oi.outputs['Random'], mr.inputs['Value'])
        cc = nt.nodes.new('ShaderNodeCombineColor')
        mw = nt.nodes.new('ShaderNodeMath'); mw.operation = 'MULTIPLY'; mw.inputs[1].default_value = 0.965   # a touch warm
        nt.links.new(mr.outputs['Result'], cc.inputs[0]); nt.links.new(mr.outputs['Result'], cc.inputs[1])
        nt.links.new(mr.outputs['Result'], mw.inputs[0]); nt.links.new(mw.outputs['Value'], cc.inputs[2])
        nt.links.new(cc.outputs['Color'], b.inputs['Base Color'])
        b.inputs['Roughness'].default_value = 0.68
    if bsdf('lining'):
        bsdf('lining').inputs['Base Color'].default_value = (*(float(A['lin']),) * 3, 1)
        bsdf('lining').inputs['Specular'].default_value = 0.25
    if bsdf('paint'):
        bsdf('paint').inputs['Base Color'].default_value = (*(float(A['paintc']),) * 3, 1)
        bsdf('paint').inputs['Clearcoat'].default_value = float(A['coat'])
        bsdf('paint').inputs['Clearcoat Roughness'].default_value = 0.22
        bsdf('paint').inputs['Specular'].default_value = 0.3
    if bsdf('cut'): bsdf('cut').inputs['Base Color'].default_value = (*(float(A['cutv']),) * 3, 1)

def reflection_cards():
    """big soft panels the camera never sees: something for polished steel to reflect"""
    for nm, loc, size, power in (('card_top', (0.3, 0.2, 1.6), (2.2, 1.2), 4.0), ('card_back', (0.4, 1.8, 0.8), (2.5, 1.0), 2.5),
                                 ('card_left', (-1.6, -0.4, 0.9), (0.6, 2.0), 3.0)):
        bpy.ops.mesh.primitive_plane_add(size=1, location=loc)
        p = bpy.context.object; p.name = nm; p.scale = (*size, 1)
        p.rotation_euler = (Vector((0.35, 0, 0.3)) - Vector(loc)).to_track_quat('Z', 'Y').to_euler()
        m = bpy.data.materials.new(nm); m.use_nodes = True
        nt = m.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
        e = nt.nodes.new('ShaderNodeEmission'); e.inputs['Strength'].default_value = power * float(A['cards'])
        nt.links.new(e.outputs['Emission'], nt.nodes['Material Output'].inputs['Surface'])
        p.data.materials.append(m)
        p.visible_camera = False; p.visible_diffuse = False; p.visible_shadow = False; p.visible_transmission = False

tune_materials()

# ───────── clean-ups on the built scene ─────────
def cleanups():
    O = bpy.data.objects
    # flat rings under the tub: matte paint (a clear coat turns them into mirrors under the top light)
    if 'paint_matte' not in bpy.data.materials:
        pm = bpy.data.materials['paint'].copy(); pm.name = 'paint_matte'
        b = pm.node_tree.nodes['Principled BSDF']
        b.inputs['Clearcoat'].default_value = 0.0; b.inputs['Specular'].default_value = 0.25
        for n in pm.node_tree.nodes:
            if n.type == 'MAP_RANGE': n.inputs['To Min'].default_value, n.inputs['To Max'].default_value = 0.55, 0.7
    for nm in ('seat', 'base_top', 'foot', 'drum'):
        if nm in O: O[nm].data.materials[0] = bpy.data.materials['paint_matte']
    # springs: closed ends
    if 'spring_steel' not in bpy.data.materials:
        ss = bpy.data.materials['steel'].copy(); ss.name = 'spring_steel'
        b = ss.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = (0.3, 0.3, 0.31, 1)
        for n in ss.node_tree.nodes:
            if n.type == 'MAP_RANGE': n.inputs['To Min'].default_value, n.inputs['To Max'].default_value = 0.42, 0.55
    for o in O:
        if o.type == 'CURVE' and o.data.bevel_depth > 0:
            o.data.use_fill_caps = True
            o.data.materials[0] = bpy.data.materials['spring_steel']
    # the drain valve read as a stray pipe: out
    for o in list(O):
        if o.name.startswith(('pipe', 'valve')): O.remove(o)
    for o in list(O):
        if o.type == 'MESH' and o.name.startswith('Cube') and abs(o.scale.y - 0.13) < 1e-4: O.remove(o)

cleanups()
if float(A['cards']) > 0: reflection_cards()

# ───────── the media's cut faces: chips sliced by the cut, as real flat sections on a dark mass ─────────
def section_chips():
    if 'section_chips' in bpy.data.collections: return
    rnd = random.Random(11)
    coll = bpy.data.collections.new('section_chips'); bpy.context.scene.collection.children.link(coll)
    r, f = MR - 0.004, FILL - 0.03
    def inside(u, z, m=0.0):
        if z > f - m: return False
        if z >= CY: return abs(u - CX) <= r - m
        return (u - CX) ** 2 + (z - CY) ** 2 <= (r - m) ** 2
    mat = bpy.data.materials.get('section_cut') or bpy.data.materials.new('section_cut')
    mat.use_nodes = True
    bb = mat.node_tree.nodes['Principled BSDF']
    oi = mat.node_tree.nodes.new('ShaderNodeObjectInfo')
    mr = mat.node_tree.nodes.new('ShaderNodeMapRange'); mr.inputs['To Min'].default_value = float(A['secv']) * 0.7; mr.inputs['To Max'].default_value = float(A['secv']) * 1.2
    for n in ('Base Color',): pass
    bb.inputs['Roughness'].default_value = 0.7
    for face_phi, sign in ((PHI0, 1.0), (PHI0 + PHIL, -1.0)):
        c, s_ = math.cos(face_phi), math.sin(face_phi)
        nrm = Vector((s_, -c, 0)) * sign            # out of the solid, into the wedge
        radial = Vector((c, s_, 0)); up = Vector((0, 0, 1))
        pts = []
        for _ in range(9000):
            u = CX - r + rnd.random() * 2 * r
            z = CY - r + rnd.random() * (f - CY + r)
            if not inside(u, z, 0.006): continue
            if all((u - pu) ** 2 + (z - pz) ** 2 > 0.0145 ** 2 for pu, pz, _ in pts):
                pts.append((u, z, rnd.random()))
        bm = bmesh.new()
        for u, z, k in pts:
            a = rnd.random() * 6.283
            if k < 0.5:     # a triangle
                sz = 0.006 + rnd.random() * 0.0045
                poly = [(sz * math.cos(a + i * 2.094), sz * math.sin(a + i * 2.094)) for i in range(3)]
            elif k < 0.85:  # a trapezoid: the cut went through a side
                w1, w2, h = 0.009 + rnd.random() * 0.005, 0.004 + rnd.random() * 0.004, 0.005 + rnd.random() * 0.003
                poly = [(-w1, -h), (w1, -h), (w2, h), (-w2, h)]
                poly = [(x * math.cos(a) - y * math.sin(a), x * math.sin(a) + y * math.cos(a)) for x, y in poly]
            else:           # a sliver
                l, t = 0.009 + rnd.random() * 0.005, 0.0018 + rnd.random() * 0.0015
                poly = [(-l, -t), (l, -t), (l, t), (-l, t)]
                poly = [(x * math.cos(a) - y * math.sin(a), x * math.sin(a) + y * math.cos(a)) for x, y in poly]
            base = radial * u + up * z + nrm * 0.0004
            vs0 = [bm.verts.new(base + radial * x + up * y) for x, y in poly]
            vs1 = [bm.verts.new(v.co + nrm * 0.0012) for v in vs0]
            bm.faces.new(vs1 if sign > 0 else vs1[::-1])
            for i in range(len(poly)):
                j = (i + 1) % len(poly)
                bm.faces.new((vs0[i], vs0[j], vs1[j], vs1[i]))
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        me = bpy.data.meshes.new('secchips'); bm.to_mesh(me); bm.free()
        ob = bpy.data.objects.new('secchips', me); coll.objects.link(ob)
        bev = ob.modifiers.new('bev', 'BEVEL'); bev.width = 0.00045; bev.segments = 2
        me.materials.append(bpy.data.materials['ceramic'])
        for p in me.polygons: p.use_smooth = False
        print('SECTION chips', len(pts))
    # the mass behind them goes dark: the gaps between the chips
    core = bpy.data.objects.get('core')
    if core and len(core.data.materials) > 1:
        core.data.materials[1] = bpy.data.materials['core']
    if 'core' in bpy.data.materials:
        bpy.data.materials['core'].node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.012, 0.012, 0.012, 1)

if A['secchips']: section_chips()

# ───────── the hero part: a large polished gear on the bed, by the cut, in focus ─────────
def make_gear(name, ro, teeth, t):
    """a spur gear: rounded trapezoid teeth, a bore with a keyway, chamfered edges"""
    rr = ro * (1 - 2.2 / teeth)
    bore = ro * 0.3
    pts = []
    n = teeth * 24
    for i in range(n):
        a = 2 * math.pi * i / n
        ph = (i % 24) / 24
        def sstep(x): x = max(0.0, min(1.0, x)); return x * x * (3 - 2 * x)
        k = sstep((ph - 0.12) / 0.2) if ph < 0.5 else sstep((0.88 - ph) / 0.2)
        r = rr + (ro - rr) * k
        pts.append((r * math.cos(a), r * math.sin(a)))
    bm = bmesh.new()
    vs = [bm.verts.new((x, y, 0)) for x, y in pts]
    fc = bm.faces.new(vs)
    ext = bmesh.ops.extrude_face_region(bm, geom=[fc])
    for v in [e for e in ext['geom'] if isinstance(e, bmesh.types.BMVert)]: v.co.z = t
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    g = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(g)
    bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=bore, depth=t * 3, location=(0, 0, t / 2))
    hole = bpy.context.object
    bpy.ops.mesh.primitive_cube_add(size=1, location=(bore + bore * 0.18, 0, t / 2))
    key = bpy.context.object; key.scale = (bore * 0.5, bore * 0.5, t * 3)
    for c in (hole, key):
        m_ = g.modifiers.new('cut', 'BOOLEAN'); m_.object = c; m_.operation = 'DIFFERENCE'
        bpy.context.view_layer.objects.active = g; bpy.ops.object.modifier_apply(modifier='cut'); bpy.data.objects.remove(c)
    bv = g.modifiers.new('bev', 'BEVEL'); bv.width = min(0.0012, t * 0.08); bv.segments = 3; bv.limit_method = 'ANGLE'; bv.angle_limit = math.radians(30)
    bv.harden_normals = True                      # flat faces stay flat next to the rounded edges
    me.materials.append(bpy.data.materials['polished'])
    for p in me.polygons: p.use_smooth = True
    me.use_auto_smooth = True; me.auto_smooth_angle = math.radians(30)
    wn = g.modifiers.new('wn', 'WEIGHTED_NORMAL'); wn.keep_sharp = True
    return g

def place_on_bed(g, a, rho, tilt, spin, sink=0.0, clear=1.0):
    g.location = (rho * math.cos(a), rho * math.sin(a), FILL - 0.03 + 0.012 - sink)
    g.rotation_euler = (math.radians(tilt), math.radians(-6), spin)
    r = max(g.dimensions.x, g.dimensions.y) / 2
    for o in list(bpy.data.objects):
        if o.type == 'MESH' and o.data.name.startswith('chip') and (Vector(o.location[:2]) - Vector(g.location[:2])).length < r * 0.9 * clear:
            bpy.data.objects.remove(o)

def hero_gear():
    if 'hero_gear' in bpy.data.objects or not A['hero']: return
    for o in list(bpy.data.objects):          # the old little gears
        if o.name.startswith('gear'): bpy.data.objects.remove(o)
    g = make_gear('hero_gear', 0.058, 26, 0.022)
    place_on_bed(g, PHI0 + float(A['hg_a']), CX + float(A['hg_r']), float(A['hg_tilt']), PHI0 + 0.6)
    g2 = make_gear('gear_b', 0.04, 20, 0.018)
    place_on_bed(g2, PHI0 + 0.42, CX - 0.06, 22, 1.1, sink=0.006, clear=0.7)
    g3 = make_gear('gear_c', 0.032, 16, 0.016)
    place_on_bed(g3, PHI0 + 0.75, CX + 0.05, 35, 2.0, sink=0.008, clear=0.6)
    print('HERO gear at', tuple(round(x, 3) for x in g.location))

hero_gear()
def link(obj, coll=None):
    (coll or bpy.context.scene.collection).objects.link(obj)
    return obj
# ───────── lights ─────────
def area(name, loc, size, energy, look=(0, 0, 0.25), shape='RECTANGLE', sy=None):
    d = bpy.data.lights.new(name, 'AREA'); d.energy = energy * A['light']; d.shape = shape; d.size = size
    if sy: d.size_y = sy
    o = bpy.data.objects.new(name, d); link(o); o.location = loc
    dirv = Vector(look) - Vector(loc)
    o.rotation_euler = dirv.to_track_quat('-Z', 'Y').to_euler()
    return o

if A['rig'] == 'lowkey':
    # one soft source above and a little behind: the light falls off down the machine into black
    area('top', (0.15, 0.55, 2.2), float(A['topsize']), 520, look=(0.1, 0.0, 0.3), sy=float(A['topsize']) * 0.55)
    area('rim_l', (-2.2, 1.6, 1.1), 0.18, 650, look=(0, 0, 0.35), sy=2.4)     # a hard strip behind-left: the silhouette and the flange edge
    area('graze', (-1.2, -1.6, 0.55), 0.6, float(A['graze']), look=(0.35, 0.0, 0.25), sy=0.6)   # raking across the cut faces
elif A['rig'] == 'moody':
    area('top', (-0.3, 0.5, 3.4), 2.2, 700, look=(0, 0, 0.3), sy=1.3)          # overhead box: the gradient down the tub
    area('rim_l', (-2.4, 2.0, 1.5), 0.25, 1100, look=(0, 0, 0.3), sy=3.2)      # strips behind: silhouettes, flange edge
    area('rim_r', (2.5, 1.6, 0.9), 0.25, 800, look=(0, 0, 0.2), sy=3.2)
    area('kick', (-1.7, -2.3, 1.7), 1.2, 260, look=(0.2, -0.3, 0.3), sy=0.8)    # onto the cut faces
    area('fill', (0.9, -3.6, 0.6), 3.0, 50, look=(0, 0, 0.2), sy=2.0)          # barely there: keeps the front from going black
else:
    area('key', (-1.6, -2.6, 3.0), 2.4, 900, sy=1.4)          # big soft box, front-left, high
    area('rim_r', (2.4, 1.6, 1.2), 0.35, 700, sy=3.0)          # strip behind right: edges
    area('rim_l', (-2.6, 1.8, 1.6), 0.35, 500, sy=3.0)         # strip behind left
    area('top', (0.2, 0.3, 3.2), 1.6, 300, sy=1.6)             # into the bowl
    area('floor', (0.6, -2.2, -1.6), 3.0, 120, look=(0, 0, -0.2), sy=1.2)  # low bounce for the outer skin

w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True
w.node_tree.nodes['Background'].inputs['Color'].default_value = (0, 0, 0, 1)

# ───────── camera ─────────
cams = {
    # name: (location, target)
    'a': ((1.55, -3.35, 1.55), (0.05, -0.05, 0.12)),
    'b': ((0.9, -2.2, 0.95), (0.0, 0.0, 0.25)),
    'c': ((2.6, -2.5, 1.9), (0.0, 0.0, 0.05)),
}
loc, tgt = cams.get(A['cam'], cams['a'])
if A['camloc']: loc = tuple(float(x) for x in A['camloc'].split(','))
if A['camtgt']: tgt = tuple(float(x) for x in A['camtgt'].split(','))
cd = bpy.data.cameras.new('cam'); cd.lens = A['lens']; cd.sensor_width = 36
cam = bpy.data.objects.new('cam', cd); link(cam); cam.location = loc
cam.rotation_euler = (Vector(tgt) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
sc.camera = cam
cd.shift_x, cd.shift_y = A['sx'], A['sy']

# ───────── a card where the hero gear's face mirrors the camera: its gleam ─────────
hg = bpy.data.objects.get('hero_gear')
if hg and float(A['gcard']) > 0:
    nrm = (hg.matrix_world.to_3x3() @ Vector((0, 0, 1))).normalized()
    inc = (hg.location - cam.location).normalized()
    refl = inc - 2 * inc.dot(nrm) * nrm
    pos = hg.location + refl * float(A['gdist'])
    bpy.ops.mesh.primitive_plane_add(size=1, location=pos)
    card = bpy.context.object; card.name = 'card_gear'; card.scale = (float(A['gw']), float(A['gw']) * 0.35, 1)
    card.rotation_euler = (-refl).to_track_quat('Z', 'Y').to_euler()
    m = bpy.data.materials.new('card_gear'); m.use_nodes = True
    nt = m.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
    e = nt.nodes.new('ShaderNodeEmission'); e.inputs['Strength'].default_value = float(A['gcard'])
    # a soft edge: the strip fades out toward its ends, like a real softbox
    tc = nt.nodes.new('ShaderNodeTexCoord'); gr = nt.nodes.new('ShaderNodeTexGradient'); gr.gradient_type = 'QUADRATIC_SPHERE'
    mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (1.6, 4.0, 1)
    nt.links.new(tc.outputs['Generated'], mp.inputs['Vector']); mp.inputs['Location'].default_value = (-0.8, -2.0, 0)
    nt.links.new(mp.outputs['Vector'], gr.inputs['Vector'])
    nt.links.new(gr.outputs['Fac'], e.inputs['Strength'])
    mul = nt.nodes.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'; mul.inputs[1].default_value = float(A['gcard'])
    nt.links.new(gr.outputs['Fac'], mul.inputs[0]); nt.links.new(mul.outputs['Value'], e.inputs['Strength'])
    nt.links.new(e.outputs['Emission'], nt.nodes['Material Output'].inputs['Surface'])
    card.data.materials.append(m)
    card.visible_camera = False; card.visible_diffuse = False; card.visible_shadow = False
cd.dof.use_dof = A['fstop'] > 0
if cd.dof.use_dof:
    cd.dof.aperture_fstop = A['fstop']
    f = Vector((CX * math.cos(PHI0), CX * math.sin(PHI0), FILL - 0.05)) if A['focus'] == 'face' else Vector(tgt)
    if A['fx'] or A['fy'] or A['fz']: f = Vector((A['fx'], A['fy'], A['fz']))
    cd.dof.focus_distance = (f - Vector(loc)).length

# ───────── render ─────────
sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = A['spp']
sc.cycles.use_denoising = True
sc.cycles.denoiser = 'OPENIMAGEDENOISE'
sc.cycles.max_bounces = 8; sc.cycles.glossy_bounces = 4; sc.cycles.diffuse_bounces = 3; sc.cycles.transparent_max_bounces = 4
sc.cycles.caustics_reflective = False; sc.cycles.caustics_refractive = False
sc.cycles.blur_glossy = 0.5
sc.render.resolution_x, sc.render.resolution_y = A['w'], A['h']
sc.render.resolution_percentage = 100
sc.view_settings.view_transform = 'Filmic'
sc.view_settings.look = A['look']
sc.view_settings.exposure = A['exposure']
sc.render.image_settings.file_format = 'PNG'
sc.render.image_settings.color_depth = '16'
sc.render.filepath = A['out']
if A['glare'] > 0:
    sc.use_nodes = True
    nt = sc.node_tree
    rl = nt.nodes['Render Layers']; comp = nt.nodes['Composite']
    gl = nt.nodes.new('CompositorNodeGlare'); gl.glare_type = 'FOG_GLOW'; gl.quality = 'HIGH'; gl.threshold = 1.0; gl.size = 7
    gl.mix = -1 + A['glare']
    nt.links.new(rl.outputs['Image'], gl.inputs['Image'])
    nt.links.new(gl.outputs['Image'], comp.inputs['Image'])
t0 = time.time()
bpy.ops.render.render(write_still=True)
print('RENDER seconds', time.time() - t0)
'''

# ───────── build, or load what was built ─────────
if A['blendin']:
    bpy.ops.wm.open_mainfile(filepath=bpy.path.abspath(A['blendin']))
    sc = bpy.context.scene; col_main = sc.collection
else:
    exec(BUILD, globals())
    if A['blend']:
        bpy.ops.wm.save_as_mainfile(filepath=bpy.path.abspath(A['blend']))
exec(SHOT, globals())
