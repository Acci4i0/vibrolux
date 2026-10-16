"""Materia: the media Vibrolux works with, one study each (T1's "Material" series, translated).

  corindone   fused alumina grit for sandblasting — one grain, on Carta
  microsfere  glass beads (microsfere) — a dense carpet, on Nero
  chips       angle-cut ceramic chips for vibrofinitura — suspended, on Carta
  sfere       steel burnishing balls — a heap, on Nero
  granulato   corn-cob granulate for drying — a heap, on Carta

blender -b -P brand/blender/materia.py -- <name> [width height samples]
"""
import math
import os
import random
import sys

import bpy
from mathutils import Euler, Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as C  # noqa: E402


def link_copy(src, name):
    o = src.copy()
    o.name = name
    bpy.context.collection.objects.link(o)
    return o


def drop_pile(objs, shape='CONVEX_HULL', frames=110, friction=0.7, damping=(0.35, 0.85)):
    """Let Bullet settle the objects on the floor, then bake their final pose and drop the physics."""
    s = bpy.context.scene
    bpy.ops.rigidbody.world_add()
    w = s.rigidbody_world
    w.point_cache.frame_start, w.point_cache.frame_end = 1, frames
    w.substeps_per_frame = 12
    w.solver_iterations = 20
    bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, 0))
    ground = bpy.context.active_object
    bpy.ops.rigidbody.object_add()
    ground.rigid_body.type = 'PASSIVE'
    ground.rigid_body.friction = friction
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.rigidbody.objects_add(type='ACTIVE')
    for o in objs:
        rb = o.rigid_body
        rb.collision_shape = shape
        rb.friction = friction
        rb.restitution = 0.05
        rb.linear_damping, rb.angular_damping = damping
        rb.collision_margin = 0.002
    for f in range(1, frames + 1):
        s.frame_set(f)
    bpy.ops.object.visual_transform_apply()
    bpy.ops.rigidbody.objects_remove()
    bpy.data.objects.remove(ground)
    bpy.ops.rigidbody.world_remove()
    s.frame_set(1)


def column(i, n, radius, z0, dz):
    """Spawn points spiralling up a narrow column, so the heap builds from the middle."""
    a = i * 2.39996
    r = radius * math.sqrt(random.random())
    return Vector((r * math.cos(a), r * math.sin(a), z0 + i * dz))


# ───────────── Corindone ─────────────

def grain_points(n, scale, sharp=1.0):
    pts = []
    for _ in range(n):
        v = Vector((random.gauss(0, 1), random.gauss(0, 1), random.gauss(0, 1))).normalized()
        v *= 1 + random.uniform(-0.18, 0.18) * sharp
        pts.append(Vector((v.x * scale[0], v.y * scale[1], v.z * scale[2])))
    return pts


def rock(name, scale, n=60, sharp=1.2, crack=0.07, seed=0):
    """A fractured grain: an irregular hull, subdivided, then pushed by Voronoi cells so it breaks into facets."""
    random.seed(seed)
    o = C.mesh_object(name, C.convex_hull(grain_points(n, scale, sharp)), smooth=False)
    C.modifier(o, 'SUBSURF', subdivision_type='SIMPLE', levels=4, render_levels=4)
    t = bpy.data.textures.new(name + '-cells', 'VORONOI')
    t.noise_scale = 0.32 * max(scale)
    t.distance_metric = 'DISTANCE'
    t.noise_intensity = 1.0
    d = C.modifier(o, 'DISPLACE', texture=t, strength=crack * max(scale), mid_level=0.5, texture_coords='LOCAL')
    t2 = bpy.data.textures.new(name + '-grain', 'CLOUDS')
    t2.noise_scale = 0.12 * max(scale)
    t2.noise_depth = 3
    C.modifier(o, 'DISPLACE', texture=t2, strength=0.012 * max(scale), mid_level=0.5, texture_coords='LOCAL')
    return o


def corindone(w, h, samples):
    C.reset(11)
    C.render_settings(w, h, samples)
    C.studio('carta', target=(0, 0, 0.6), ambient=0.06)
    mat = C.material('corindone', (0.02, 0.009, 0.007, 1), roughness=0.26, specular=0.6, coat=0.35, coat_rough=0.12,
                     bump=0.08, bump_scale=30, rough_var=0.12)
    big = rock('grain', (0.62, 0.5, 0.82), n=80, sharp=1.4, crack=0.03, seed=11)
    big.rotation_euler = Euler((math.radians(8), math.radians(-12), math.radians(28)))
    C.assign(big, mat)
    crumbs = []
    for i, (x, y, s) in enumerate([(1.05, -0.4, 0.1), (-0.92, -0.6, 0.065), (0.62, -0.95, 0.05), (-0.4, -1.05, 0.04)]):
        g = rock(f'crumb{i}', (s, s * 0.8, s * 0.9), n=24, crack=0.03, seed=40 + i)
        g.location = (x, y, s * 0.8)
        g.rotation_euler = Euler([random.uniform(0, 3) for _ in range(3)])
        C.assign(g, mat)
        crumbs.append(g)
    # the big one rests on its lowest point
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    ev = big.evaluated_get(dg)
    low = min((big.matrix_world @ v.co).z for v in ev.data.vertices)
    big.location.z -= low + 0.015
    C.shadow_floor(tone=0.12)
    C.camera((0.2, -6.6, 1.3), (0, 0, 0.78), lens=64)
    C.save('materia-corindone')


# ───────────── Sfere d'acciaio ─────────────

def sfere(w, h, samples):
    """Burnishing balls stacked as a square pyramid: seven layers, 140 balls, every one touching four below."""
    C.reset(5)
    C.render_settings(w, h, samples)
    C.studio('nero', target=(0, 0, 0.45), key_glossy=True)  # bright steel: the balls need the key in them
    steel = C.material('acciaio-lucido', (0.8, 0.8, 0.8, 1), metallic=1, roughness=0.03)
    r = 0.1
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=64, ring_count=32)
    proto = bpy.context.active_object
    bpy.ops.object.shade_smooth()
    C.assign(proto, steel)
    n = 7
    first = True
    for layer in range(n):
        k = n - layer
        z = r + layer * r * math.sqrt(2)
        for i in range(k):
            for j in range(k):
                o = proto if first else link_copy(proto, f'ball{layer}-{i}-{j}')
                first = False
                o.location = ((i - (k - 1) / 2) * 2 * r, (j - (k - 1) / 2) * 2 * r, z)
    root = bpy.data.objects.new('pyramid', None)
    bpy.context.collection.objects.link(root)
    for o in bpy.data.objects:
        if o.type == 'MESH':
            o.parent = root
    root.rotation_euler.z = math.radians(30)
    C.black_floor()
    C.camera((0.0, -5.4, 1.9), (0, 0, 0.42), lens=85)
    C.save('materia-sfere')


# ───────────── Microsfere di vetro ─────────────

def microsfere(w, h, samples):
    C.reset(3)
    C.render_settings(w, h, samples, glass=True)
    C.studio('nero', target=(0, 0, 0.2))
    # glass needs something to refract: two tall soft panels behind the heap
    C.area('back_l', (-1.6, 3.2, 1.2), (0, 0, 0.3), 700, (0.6, 3))
    C.area('back_r', (1.8, 3.0, 0.9), (0, 0, 0.3), 500, (0.6, 3))
    glass = C.material('vetro', (0.97, 0.98, 1, 1), roughness=0.0, transmission=1.0, ior=1.52, specular=0.5)
    beads = []
    for i in range(170):
        r = random.choice((0.07, 0.085, 0.1, 0.12, 0.14))
        bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=48, ring_count=24)
        b = bpy.context.active_object
        bpy.ops.object.shade_smooth()
        b.location = column(i, 170, 0.9, 0.3, 0.035)
        C.assign(b, glass)
        beads.append(b)
    drop_pile(beads, shape='SPHERE', friction=0.9, damping=(0.5, 0.95))
    C.black_floor()
    C.camera((0.0, -3.6, 2.9), (0, 0, 0.1), lens=85)
    C.save('materia-microsfere')


# ───────────── Chips ceramici ─────────────

def chip_mesh(size=0.16, cut=28):
    """Angle-cut triangle: a triangular prism with both ends sheared."""
    import bmesh
    bm = bmesh.new()
    tri = [Vector((math.cos(a), math.sin(a), 0)) * size for a in (math.pi / 2, math.pi / 2 + 2 * math.pi / 3, math.pi / 2 + 4 * math.pi / 3)]
    length = size * 1.9
    sh = math.tan(math.radians(cut))
    lo = [bm.verts.new((p.x, p.y, p.y * sh - length / 2)) for p in tri]
    hi = [bm.verts.new((p.x, p.y, p.y * sh + length / 2)) for p in tri]
    bm.faces.new(list(reversed(lo)))
    bm.faces.new(hi)
    for i in range(3):
        j = (i + 1) % 3
        bm.faces.new((lo[i], lo[j], hi[j], hi[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def chips(w, h, samples):
    C.reset(19)
    C.render_settings(w, h, samples, exposure=-1.1)
    C.studio('carta', target=(0, 0, 1.1), ambient=0.15)
    cer = C.material('ceramica', (0.105, 0.1, 0.092, 1), roughness=0.8, specular=0.3, bump=0.45, bump_scale=120, rough_var=0.08)
    proto = C.mesh_object('chip', chip_mesh(size=0.2, cut=30), smooth=False)
    C.bevel(proto, width=0.022, segments=4, angle=30)
    C.modifier(proto, 'WEIGHTED_NORMAL', keep_sharp=True)
    proto.data.use_auto_smooth = True
    C.assign(proto, cer)
    # a loose vertical cloud, denser in the middle: media caught mid-vibration
    n = 36
    for i in range(n):
        o = proto if i == 0 else link_copy(proto, f'chip{i}')
        t = i / (n - 1)
        z = 0.35 + t * 1.75 + random.uniform(-0.06, 0.06)
        spread = 0.3 + 0.42 * math.sin(math.pi * t)
        a = random.uniform(0, 2 * math.pi)
        r = spread * math.sqrt(random.random())
        o.location = (r * math.cos(a), r * math.sin(a) * 0.7, z)
        o.rotation_euler = Euler([random.uniform(0, 2 * math.pi) for _ in range(3)])
        s = random.uniform(0.75, 1.15)
        o.scale = (s, s, s)
    C.shadow_floor(tone=0.5)
    C.camera((0, -7.2, 1.4), (0, 0, 1.2), lens=72)
    C.save('materia-chips')


# ───────────── Granulato vegetale ─────────────

def granule(seed):
    random.seed(seed)
    pts = []
    for _ in range(40):
        v = Vector((random.gauss(0, 1), random.gauss(0, 1), random.gauss(0, 1))).normalized()
        v *= 1 + random.uniform(-0.25, 0.25)
        pts.append(v)
    bm = C.convex_hull(pts)
    return bm


def granulato(w, h, samples):
    C.reset(23)
    C.render_settings(w, h, samples, exposure=-1.0)
    C.studio('carta', target=(0, 0, 0.25), ambient=0.15)
    mat = C.material('tutolo', (0.30, 0.17, 0.065, 1), roughness=0.85, specular=0.25, subsurface=0.03,
                     bump=0.9, bump_scale=55, rough_var=0.1)
    protos = []
    for k in range(8):
        o = rock(f'g{k}', (1.0, 0.85, 0.75), n=22, sharp=1.8, crack=0.05, seed=100 + k)
        C.assign(o, mat)
        protos.append(o)
    random.seed(23)
    objs = []
    for i in range(340):
        o = protos[i] if i < len(protos) else link_copy(protos[i % len(protos)], f'gr{i}')
        s = random.uniform(0.05, 0.08)
        o.scale = (s, s * random.uniform(0.8, 1.1), s * random.uniform(0.75, 1.0))
        o.location = column(i, 340, 0.16, 0.25, 0.026)
        o.rotation_euler = Euler([random.uniform(0, 3) for _ in range(3)])
        objs.append(o)
    drop_pile(objs, shape='CONVEX_HULL', friction=1.0, damping=(0.6, 0.95))
    C.shadow_floor(tone=0.4)
    C.camera((0.2, -4.4, 1.5), (0, 0, 0.16), lens=85)
    C.save('materia-granulato')


SCENES = dict(corindone=corindone, sfere=sfere, microsfere=microsfere, chips=chips, granulato=granulato)

if __name__ == '__main__':
    a = C.args()
    name = a[0]
    w, h, samples = (int(x) for x in (a[1:4] if len(a) >= 4 else (1600, 2000, 128)))
    SCENES[name](w, h, samples)
