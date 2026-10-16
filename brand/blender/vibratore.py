"""Il vibratore: the round vibratory bowl of Vibrolux's vibrofinitura department, built once and shown three ways.

  beauty   assembled, full of ceramic chips and steel parts, on Nero (Cycles)      → hero-vibratore[-45].png
  specs    exploded into its five parts, lines only (Freestyle)                   → specs-vibratore.png
  loop     close above the trough, the media circulating, a seamless 8 s loop (Eevee)    → loop/####.png

Proportions follow the bowls in the brochure (pp. 14–17): navy base on springs, orange PU lining,
a discharge chute on the side.

blender -b -y -P brand/blender/vibratore.py -- beauty|beauty45|specs|loop [width height samples]
"""
import math
import os
import random
import sys

import bmesh
import bpy
from mathutils import Euler, Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as C  # noqa: E402

ORANGE = (0.72, 0.085, 0.01, 1)  # the PU lining, sampled from the brochure photos: #F55A0A

# (r, z) of the lining, centre → lip: a domed column, a round trough, a straight wall
INNER = [(0.0, 1.0), (0.07, 0.995), (0.13, 0.975), (0.17, 0.94), (0.19, 0.9), (0.21, 0.8), (0.235, 0.7), (0.26, 0.62)]
TROUGH_C, TROUGH_R = (0.5, 0.62), 0.24
for i in range(1, 24):
    a = math.pi + math.pi * i / 24
    INNER.append((TROUGH_C[0] + TROUGH_R * math.cos(a), TROUGH_C[1] + TROUGH_R * math.sin(a)))
INNER += [(0.74, 0.62), (0.745, 0.8), (0.75, 1.02)]
SHELL = [(0.0, 0.4), (0.62, 0.4), (0.72, 0.41), (0.775, 0.45), (0.8, 0.5), (0.8, 1.0), (0.79, 1.02), (0.75, 1.02)]


def ring(name, r0, r1, z0, z1, mat, seg=160):
    o = C.mesh_object(name, C.lathe([(r0, z0), (r1, z0), (r1, z1), (r0, z1), (r0, z0)], seg), smooth=True, auto_smooth=40)
    C.bevel(o, width=0.003, segments=2)
    C.assign(o, mat)
    return o


def bolts(name, r, z, n, mat, size=0.013):
    out = []
    for i in range(n):
        a = 2 * math.pi * (i + 0.5) / n
        bpy.ops.mesh.primitive_cylinder_add(radius=size, depth=size * 1.4, vertices=6, location=(r * math.cos(a), r * math.sin(a), z + size * 0.7))
        b = bpy.context.active_object
        b.name = f'{name}{i}'
        C.bevel(b, width=0.002, segments=1)
        C.assign(b, mat)
        out.append(b)
    return out


def tub(navy, lining, steel=None):
    """The tub: painted shell (navy), PU lining inside (orange), a rolled rubber lip, the bottom flange
    the springs bolt to, and the discharge chute."""
    steel = steel or navy
    shell = C.mesh_object('vasca', C.lathe(SHELL, 160), smooth=True, auto_smooth=50)
    C.assign(shell, navy)
    inner = C.mesh_object('rivestimento', C.lathe(INNER, 160), smooth=True, auto_smooth=50)
    C.modifier(inner, 'SOLIDIFY', thickness=0.018, offset=1)
    C.assign(inner, lining)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.775, minor_radius=0.032, major_segments=160, minor_segments=24, location=(0, 0, 1.03))
    lip = bpy.context.active_object
    lip.name = 'bordo'
    bpy.ops.object.shade_smooth()
    C.assign(lip, lining)
    flange = ring('flangia', 0.6, 0.88, 0.385, 0.415, navy)
    bb = bolts('bullone', 0.85, 0.415, 20, steel)
    # the discharge chute, on the front-right of the wall: a box with a frame
    a = math.radians(-32)
    bpy.ops.mesh.primitive_cube_add(size=1)
    ch = bpy.context.active_object
    ch.name = 'scarico'
    ch.scale = (0.16, 0.34, 0.12)
    ch.location = (0.86 * math.cos(a), 0.86 * math.sin(a), 0.78)
    ch.rotation_euler = Euler((0, math.radians(-14), a))
    C.bevel(ch, width=0.012, segments=3, angle=30)
    C.assign(ch, navy)
    return [shell, inner, ch, lip, flange] + bb


def base(navy, steel):
    """Foot ring, motor housing with its terminal box, top flange, and ten springs up to the tub."""
    parts = []
    piede = C.mesh_object('basamento', C.lathe([(0.0, 0.0), (0.72, 0.0), (0.72, 0.035), (0.6, 0.05), (0.56, 0.065),
                                                 (0.56, 0.235), (0.88, 0.235), (0.88, 0.265), (0.0, 0.265)], 160),
                          smooth=True, auto_smooth=40)
    C.assign(piede, navy)
    parts.append(piede)
    bpy.ops.mesh.primitive_cube_add(size=1)
    box = bpy.context.active_object
    box.name = 'morsettiera'
    box.scale = (0.1, 0.14, 0.1)
    a = math.radians(-70)
    box.location = (0.59 * math.cos(a), 0.59 * math.sin(a), 0.15)
    box.rotation_euler.z = a
    C.bevel(box, width=0.008, segments=2)
    C.assign(box, navy)
    parts.append(box)
    parts += bolts('vite', 0.85, 0.265, 20, steel)
    for i in range(10):
        a = 2 * math.pi * i / 10 + 0.15
        cu = bpy.data.curves.new(f'molla{i}', 'CURVE')
        cu.dimensions = '3D'
        cu.bevel_depth = 0.009
        cu.bevel_resolution = 4
        sp = cu.splines.new('POLY')
        n = 140
        sp.points.add(n - 1)
        for k in range(n):
            t = k / (n - 1)
            th = t * 2 * math.pi * 5.5
            sp.points[k].co = (0.038 * math.cos(th), 0.038 * math.sin(th), 0.268 + t * 0.114, 1)
        o = bpy.data.objects.new(f'molla{i}', cu)
        bpy.context.collection.objects.link(o)
        o.location = (0.74 * math.cos(a), 0.74 * math.sin(a), 0)
        o.data.materials.append(steel)
        parts.append(o)
    return parts


def motor(dark, steel):
    body = C.mesh_object('motore', C.lathe([(0.0, 0.06), (0.17, 0.06), (0.19, 0.08), (0.19, 0.3), (0.17, 0.32), (0.0, 0.32)], 96),
                         smooth=True, auto_smooth=40)
    C.assign(body, dark)
    parts = [body]
    for z in (0.02, 0.335):  # the eccentric weights, top and bottom: a disc cut almost in half
        bpy.ops.mesh.primitive_cylinder_add(radius=0.15, depth=0.035, vertices=48, location=(0, 0, z + 0.0175))
        w = bpy.context.active_object
        w.name = 'massa'
        for v in w.data.vertices:
            if v.co.y < 0:
                v.co.y *= 0.25
        C.bevel(w, width=0.006, segments=2)
        C.assign(w, steel)
        parts.append(w)
    return parts


def media(ceramic, steel, n_chips=1500, n_parts=220, seed=3):
    """Angle-cut chips and small turned rings filling the trough as a rolling ring of media."""
    random.seed(seed)
    import materia
    chip = C.mesh_object('chip', materia.chip_mesh(size=0.034), smooth=False)
    C.bevel(chip, width=0.004, segments=2, angle=30)
    chip.data.use_auto_smooth = True
    C.assign(chip, ceramic)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.016, minor_radius=0.007, major_segments=32, minor_segments=12)
    ring = bpy.context.active_object
    bpy.ops.object.shade_smooth()
    C.assign(ring, steel)
    objs = []

    def place(o):
        r = math.sqrt(random.uniform(0.27 ** 2, 0.72 ** 2))
        a = random.uniform(0, 2 * math.pi)
        # the surface of the rolling mass: higher against the outer wall, lower by the column
        z = 0.82 + 0.08 * ((r - 0.27) / 0.45) ** 1.6 + random.uniform(-0.04, 0.01)
        o.location = (r * math.cos(a), r * math.sin(a), z)
        o.rotation_euler = Euler([random.uniform(0, 2 * math.pi) for _ in range(3)])
        s = random.uniform(0.8, 1.2)
        o.scale = (s, s, s)
        objs.append(o)

    place(chip)
    for i in range(n_chips - 1):
        o = chip.copy()
        bpy.context.collection.objects.link(o)
        place(o)
    place(ring)
    for i in range(n_parts - 1):
        o = ring.copy()
        bpy.context.collection.objects.link(o)
        place(o)
    return objs


def materials():
    navy = C.material('blu-vibrolux', (0.009, 0.03, 0.1, 1), roughness=0.38, specular=0.45, coat=0.3, coat_rough=0.15)
    lining = C.material('pu-arancio', ORANGE, roughness=0.5, specular=0.35, bump=0.04, bump_scale=200)
    steel = C.material('acciaio', (0.75, 0.75, 0.76, 1), metallic=1, roughness=0.18)
    dark = C.material('grafite', (0.025, 0.025, 0.028, 1), roughness=0.5)
    ceramic = C.material('ceramica', (0.105, 0.1, 0.092, 1), roughness=0.8, specular=0.3, bump=0.35, bump_scale=400)
    return navy, lining, steel, dark, ceramic


def beauty(w, h, samples, angle=False):
    C.reset(5)
    C.render_settings(w, h, samples, exposure=-0.5)
    C.studio('nero', target=(0, 0, 0.6), scale=1.3)
    navy, lining, steel, dark, ceramic = materials()
    tub(navy, lining, steel)
    base(navy, steel)
    media(ceramic, steel)
    # a matte black floor: the rim strips would otherwise pool on it beside the machine
    C.black_floor(roughness=0.7, specular=0.04)
    if angle:  # 4:5, from higher up: the ring of media reads
        C.camera((1.25, -3.3, 3.7), (0, 0, 0.56), lens=55)
        C.save('hero-vibratore-45')
    else:  # 16:9, three-quarter, the machine right of centre so the page title has the left
        C.camera((2.6, -5.6, 2.7), (0, 0, 0.55), lens=55, shift=(-0.12, 0.02))
        C.save('hero-vibratore')


def specs(w, h, samples):
    C.reset(5)
    s = C.render_settings(w, h, 1)
    s.render.engine = 'BLENDER_EEVEE'
    s.eevee.taa_render_samples = 8
    s.view_settings.view_transform = 'Standard'
    hold = bpy.data.materials.new('holdout')
    hold.use_nodes = True
    nt = hold.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    ho = nt.nodes.new('ShaderNodeHoldout')
    nt.links.new(ho.outputs[0], out.inputs['Surface'])
    C.world(0.0)
    groups = {
        'basamento': 0.0,
        'motore': 0.42,
        'molle': 0.86,
        'vasca': 1.36,
        'rivestimento': 2.05,
    }
    tparts = tub(hold, hold)
    inner = tparts[1]
    parts = base(hold, hold)
    mot = motor(hold, hold)
    for o in tparts:
        if o is not inner:
            o.location.z += groups['vasca']
    inner.location.z += groups['rivestimento']
    for o in parts:
        if o.name.startswith('molla'):
            o.location.z += groups['molle'] - 0.25
    for o in mot:
        o.location.z += groups['motore']
    # Freestyle: silhouettes, borders and creases, one weight, ink close to Nero
    s.render.use_freestyle = True
    s.render.line_thickness_mode = 'ABSOLUTE'
    s.render.line_thickness = max(1.0, w / 1100)
    fs = bpy.context.view_layer.freestyle_settings
    fs.crease_angle = math.radians(150)
    ls = fs.linesets[0] if len(fs.linesets) else fs.linesets.new('lines')
    ls.select_by_visibility = True
    ls.visibility = 'VISIBLE'
    ls.select_silhouette = ls.select_border = ls.select_crease = ls.select_external_contour = True
    if ls.linestyle is None:
        ls.linestyle = bpy.data.linestyles.new('inchiostro')
    ls.linestyle.color = (0.06, 0.055, 0.07)
    ls.linestyle.thickness = 1.0
    cam = C.camera((5.2, -7.6, 5.0), (0, 0, 1.18), lens=50, ortho=5.2, shift=(0.07, 0))
    callouts(cam, {
        'rivestimento': (0.75, groups['rivestimento'] + 1.0),
        'vasca': (0.8, groups['vasca'] + 0.8),
        'molle': (0.778, groups['molle'] - 0.25 + 0.32),
        'motore': (0.19, groups['motore'] + 0.19),
        'basamento': (0.88, groups['basamento'] + 0.25),
    }, 'specs-vibratore')
    C.save('specs-vibratore')


def callouts(cam, rings, name):
    """Where each part sits on the picture: for every (radius, height) ring, its right-most point on screen,
    as fractions of the frame from the top-left. compose/ hangs the labels on these."""
    import json
    from bpy_extras.object_utils import world_to_camera_view
    s = bpy.context.scene
    bpy.context.view_layer.update()
    out = {}
    for key, (r, z) in rings.items():
        best = None
        for k in range(360):
            a = math.radians(k)
            p = world_to_camera_view(s, cam, Vector((r * math.cos(a), r * math.sin(a), z)))
            if best is None or p.x > best[0]:
                best = (p.x, 1 - p.y)
        out[key] = [round(best[0], 4), round(best[1], 4)]
    with open(os.path.join(C.OUT, name + '.json'), 'w') as f:
        json.dump(out, f, indent=1)


def loop(w, h, samples, frames=200):
    """Close above the trough, the media turning: inner ring two turns, outer ring one, every chip trembling
    40 times — all whole numbers of cycles, so frame 201 is frame 1 again (8 s at 25 fps)."""
    C.reset(5)
    s = C.render_settings(w, h, samples, exposure=-0.7)
    s.render.engine = 'BLENDER_EEVEE'
    e = s.eevee
    e.taa_render_samples = samples
    e.use_soft_shadows = True
    e.use_gtao = True
    e.gtao_distance = 0.15
    e.use_ssr = True
    e.shadow_cube_size = '2048'
    e.shadow_cascade_size = '2048'
    s.render.film_transparent = False
    s.frame_start, s.frame_end = 1, (int(os.environ['LOOP_UNTIL']) if 'LOOP_UNTIL' in os.environ else frames)
    s.render.fps = 25
    C.world(0.02, (0.6, 0.62, 0.7))
    s.world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.0045, 0.0042, 0.0058, 1)
    C.studio('nero', target=(0, 0, 0.6), scale=1.3, ambient=0.0)
    for l in bpy.data.lights:
        l.energy *= 0.8
        l.use_shadow = l.cycles.cast_shadow
        l.use_contact_shadow = True
    bpy.data.lights['top'].energy *= 0.35
    # a low light raking across the trough, so every chip throws a shadow on the next
    g = C.area('radente', (-2.6, 1.4, 1.75), (0, 0, 0.85), 1400, (1.2, 1.2))
    g.data.use_contact_shadow = True
    navy, lining, steel, dark, ceramic = materials()
    tub(navy, lining, steel)
    base(navy, steel)
    objs = media(ceramic, steel, n_chips=2300, n_parts=300)
    bands = []
    for k, (turns, rlo, rhi) in enumerate([(2, 0, 0.47), (1, 0.47, 9)]):
        e_ = bpy.data.objects.new(f'flusso{k}', None)
        bpy.context.collection.objects.link(e_)
        e_.rotation_euler = (0, 0, 0)
        e_.keyframe_insert('rotation_euler', index=2, frame=1)
        e_.rotation_euler = (0, 0, -2 * math.pi * turns)
        e_.keyframe_insert('rotation_euler', index=2, frame=frames + 1)
        for fc in e_.animation_data.action.fcurves:
            for kp in fc.keyframe_points:
                kp.interpolation = 'LINEAR'
        bands.append((e_, rlo, rhi))
    random.seed(9)
    for o in objs:
        r = Vector((o.location.x, o.location.y)).length
        for e_, rlo, rhi in bands:
            if rlo <= r < rhi:
                o.parent = e_
                break
        # the tremble: drivers on z and on the tilt, whole numbers of cycles over the loop
        z0 = o.location.z
        ph = random.uniform(0, 2 * math.pi)
        amp = random.uniform(0.002, 0.006)
        d = o.driver_add('location', 2).driver
        d.type = 'SCRIPTED'
        d.expression = f'{z0:.4f} + {amp:.4f} * sin(frame * {2 * math.pi * 40 / frames:.6f} + {ph:.3f})'
        rx = o.driver_add('rotation_euler', 0).driver
        rx.type = 'SCRIPTED'
        rx.expression = f'{o.rotation_euler.x:.4f} + 0.12 * sin(frame * {2 * math.pi * 20 / frames:.6f} + {ph:.3f})'
    C.camera((0.0, -0.55, 2.75), (0, 0.08, 0.82), lens=40)
    out = os.path.join(C.OUT, 'loop')
    os.makedirs(out, exist_ok=True)
    s.render.filepath = os.path.join(out, '')
    s.render.image_settings.file_format = 'PNG'
    s.render.image_settings.color_mode = 'RGB'
    bpy.ops.render.render(animation=True)


if __name__ == '__main__':
    a = C.args()
    mode = a[0]
    dims = [int(x) for x in a[1:4]] if len(a) >= 4 else None
    if mode == 'beauty':
        beauty(*(dims or (2400, 1350, 160)))
    elif mode == 'beauty45':
        beauty(*(dims or (1600, 2000, 160)), angle=True)
    elif mode == 'specs':
        specs(*(dims or (1600, 2000, 1)))
    elif mode == 'loop':
        loop(*(dims or (1600, 900, 16)), *([int(a[4])] if len(a) > 4 else []))
