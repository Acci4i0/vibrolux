"""Shared studio for the Vibrolux identity renders (Blender 3.4, Cycles on CPU).

Every scene script imports this: an empty scene, the render settings, the studio lights,
the camera, the materials and a few mesh helpers. Objects live at roughly 1 unit = 1 m.
Renders come out with a transparent film; compose/ lays them on Carta or Nero.
"""
import math
import os
import random
import sys

import bmesh
import bpy
from mathutils import Euler, Matrix, Vector

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'brand', 'renders')

# Palette, linear-ish values for the shaders (sRGB tokens are in brand/README.md)
NAVY = (0.0152, 0.0513, 0.1590, 1)  # #21406E
CARTA = (0.871, 0.863, 0.815, 1)  # #F0EFE9


def args():
    argv = sys.argv
    return argv[argv.index('--') + 1:] if '--' in argv else []


def reset(seed=7):
    random.seed(seed)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    return bpy.context.scene


def render_settings(w, h, samples=128, threshold=0.02, transparent=True, glass=False, exposure=0.0):
    s = bpy.context.scene
    s.render.engine = 'CYCLES'
    s.render.resolution_x, s.render.resolution_y = w, h
    s.render.resolution_percentage = 100
    s.render.film_transparent = transparent
    s.render.image_settings.file_format = 'PNG'
    s.render.image_settings.color_mode = 'RGBA'
    s.render.image_settings.color_depth = '8'
    c = s.cycles
    c.device = 'CPU'
    c.samples = samples
    c.use_adaptive_sampling = True
    c.adaptive_threshold = threshold
    c.use_denoising = True
    c.denoiser = 'OPENIMAGEDENOISE'
    c.max_bounces = 12 if glass else 6
    c.diffuse_bounces = 2
    c.glossy_bounces = 6 if glass else 4
    c.transmission_bounces = 12 if glass else 2
    c.transparent_max_bounces = 4
    c.caustics_reflective = False
    c.caustics_refractive = False
    c.blur_glossy = 0.5
    c.use_auto_tile = True
    c.tile_size = 512
    s.view_settings.view_transform = 'Filmic'
    s.view_settings.exposure = exposure
    for look in ('Filmic - Medium High Contrast', 'Medium High Contrast'):
        try:
            s.view_settings.look = look
            break
        except TypeError:
            pass
    return s


def world(strength=0.25, color=(0.5, 0.5, 0.5)):
    w = bpy.data.worlds.new('World')
    bpy.context.scene.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes['Background']
    bg.inputs['Color'].default_value = (*color, 1)
    bg.inputs['Strength'].default_value = strength
    return w


def look_at(obj, target):
    d = Vector(target) - obj.location
    obj.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()


def area(name, loc, target, power, size=(1, 1), color=(1, 1, 1), shadow=True):
    data = bpy.data.lights.new(name, 'AREA')
    data.energy = power
    data.color = color
    data.cycles.cast_shadow = shadow
    if size[0] == size[1]:
        data.shape = 'SQUARE'
        data.size = size[0]
    else:
        data.shape = 'RECTANGLE'
        data.size, data.size_y = size
    o = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(o)
    o.location = loc
    look_at(o, target)
    return o


def studio(kind='carta', target=(0, 0, 0.3), scale=1.0, ambient=None, key_glossy=False):
    """Soft key from above-left, two strip rims behind, a low fill. Strips read as long highlights on metal.
    Only key and top cast shadows, so the floor gets one soft shadow and not a star of them."""
    k = scale
    t = Vector(target)
    area('key', t + Vector((-2.2, -2.6, 3.6)) * k, t, 900 * k * k, (2.6 * k, 2.6 * k))
    area('top', t + Vector((0.4, 0.2, 4.2)) * k, t, 500 * k * k, (3 * k, 3 * k))
    area('rim_l', t + Vector((-2.8, 2.2, 1.4)) * k, t, 650 * k * k, (0.25 * k, 3.2 * k), shadow=False)
    area('rim_r', t + Vector((2.8, 2.0, 1.2)) * k, t, 650 * k * k, (0.25 * k, 3.2 * k), shadow=False)
    area('fill', t + Vector((2.6, -3.0, 0.6)) * k, t, 160 * k * k, (2 * k, 2 * k), shadow=False)
    if kind == 'nero' and not key_glossy:
        # on the black floor the key would show as a pool of glare: metal keeps the strips, the floor stays dark
        bpy.data.objects['key'].visible_glossy = False
    if kind == 'carta':
        world(0.3 if ambient is None else ambient, (0.9, 0.89, 0.86))
    else:
        world(0.04 if ambient is None else ambient, (0.6, 0.62, 0.7))


def camera(loc, target, lens=85, ortho=None, shift=(0, 0)):
    data = bpy.data.cameras.new('cam')
    data.lens = lens
    data.clip_start, data.clip_end = 0.01, 200
    if ortho:
        data.type = 'ORTHO'
        data.ortho_scale = ortho
    data.shift_x, data.shift_y = shift
    o = bpy.data.objects.new('cam', data)
    bpy.context.collection.objects.link(o)
    o.location = loc
    look_at(o, target)
    bpy.context.scene.camera = o
    return o


def black_floor(roughness=0.45, specular=0.14):
    """For Nero: a real floor, near-black and a little glossy, under a black world and an opaque film.
    Objects get a soft reflection beneath them; compose/ lifts pure black to Nero (#0F0E12)."""
    bpy.context.scene.render.film_transparent = False
    w = bpy.context.scene.world
    w.node_tree.nodes['Background'].inputs['Color'].default_value = (0, 0, 0, 1)
    bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 0, 0))
    f = bpy.context.active_object
    f.name = 'floor'
    assign(f, material('nero', (0.002, 0.002, 0.0025, 1), roughness=roughness, specular=specular))
    return f


def shadow_floor(size=40, z=0.0, tone=0.2):
    """Catches shadows on the transparent film. Its own material only shows in reflections:
    `tone` is how bright the paper reads on glossy objects (0.2 keeps dark stones dark)."""
    bpy.ops.mesh.primitive_plane_add(size=size, location=(0, 0, z))
    f = bpy.context.active_object
    f.name = 'floor'
    f.is_shadow_catcher = True
    assign(f, material('floor', (tone, tone, tone * 0.97, 1), roughness=0.9, specular=0.1))
    return f


# ───────────── Materials ─────────────

def _principled(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    p = nt.nodes['Principled BSDF']
    return m, nt, p


def material(name, color, metallic=0.0, roughness=0.4, specular=0.5, transmission=0.0, ior=1.45,
             coat=0.0, coat_rough=0.05, subsurface=0.0, bump=0.0, bump_scale=60.0, rough_var=0.0):
    m, nt, p = _principled(name)
    p.inputs['Base Color'].default_value = color
    p.inputs['Metallic'].default_value = metallic
    p.inputs['Roughness'].default_value = roughness
    p.inputs['Specular'].default_value = specular
    p.inputs['Transmission'].default_value = transmission
    p.inputs['IOR'].default_value = ior
    p.inputs['Clearcoat'].default_value = coat
    p.inputs['Clearcoat Roughness'].default_value = coat_rough
    if subsurface:
        p.inputs['Subsurface'].default_value = subsurface
        p.inputs['Subsurface Color'].default_value = color
        p.inputs['Subsurface Radius'].default_value = (0.05, 0.03, 0.02)
    if bump or rough_var:
        tc = nt.nodes.new('ShaderNodeTexCoord')
        nz = nt.nodes.new('ShaderNodeTexNoise')
        nz.inputs['Scale'].default_value = bump_scale
        nz.inputs['Detail'].default_value = 8
        nz.inputs['Roughness'].default_value = 0.6
        nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
        if bump:
            b = nt.nodes.new('ShaderNodeBump')
            b.inputs['Strength'].default_value = bump
            b.inputs['Distance'].default_value = 0.02
            nt.links.new(nz.outputs['Fac'], b.inputs['Height'])
            nt.links.new(b.outputs['Normal'], p.inputs['Normal'])
        if rough_var:
            mr = nt.nodes.new('ShaderNodeMapRange')
            mr.inputs['To Min'].default_value = max(0.0, roughness - rough_var)
            mr.inputs['To Max'].default_value = min(1.0, roughness + rough_var)
            nt.links.new(nz.outputs['Fac'], mr.inputs['Value'])
            nt.links.new(mr.outputs['Result'], p.inputs['Roughness'])
    return m


def assign(obj, mat):
    obj.data.materials.clear()
    obj.data.materials.append(mat)


# ───────────── Mesh helpers ─────────────

def mesh_object(name, bm, smooth=True, auto_smooth=None):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    if smooth:
        for poly in me.polygons:
            poly.use_smooth = True
    if auto_smooth:
        me.use_auto_smooth = True
        me.auto_smooth_angle = math.radians(auto_smooth)
    return o


def convex_hull(points):
    bm = bmesh.new()
    for p in points:
        bm.verts.new(p)
    res = bmesh.ops.convex_hull(bm, input=bm.verts)
    loose = {g for g in res['geom_interior'] + res['geom_unused'] if isinstance(g, bmesh.types.BMVert)}
    bmesh.ops.delete(bm, geom=list(loose), context='VERTS')
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def lathe(profile, segments=128, close_top=False, close_bottom=False):
    """Revolve [(r, z), ...] around Z. r=0 points collapse to the axis."""
    bm = bmesh.new()
    rings = []
    for r, z in profile:
        if r <= 1e-6:
            rings.append([bm.verts.new((0, 0, z))])
            continue
        ring = []
        for i in range(segments):
            a = 2 * math.pi * i / segments
            ring.append(bm.verts.new((r * math.cos(a), r * math.sin(a), z)))
        rings.append(ring)
    for ra, rb in zip(rings, rings[1:]):
        if len(ra) == 1 and len(rb) == 1:
            continue
        for i in range(segments):
            j = (i + 1) % segments
            if len(ra) == 1:
                bm.faces.new((ra[0], rb[i], rb[j]))
            elif len(rb) == 1:
                bm.faces.new((ra[i], rb[0], ra[j]))
            else:
                bm.faces.new((ra[i], rb[i], rb[j], ra[j]))
    if close_bottom and len(rings[0]) > 1:
        bm.faces.new(list(reversed(rings[0])))
    if close_top and len(rings[-1]) > 1:
        bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def modifier(obj, kind, **props):
    m = obj.modifiers.new(kind.lower(), kind)
    for k, v in props.items():
        setattr(m, k, v)
    return m


def bevel(obj, width=0.004, segments=3, angle=40):
    return modifier(obj, 'BEVEL', width=width, segments=segments, limit_method='ANGLE',
                    angle_limit=math.radians(angle), harden_normals=False)


def apply_all(obj):
    bpy.context.view_layer.objects.active = obj
    for m in list(obj.modifiers):
        bpy.ops.object.modifier_apply(modifier=m.name)


def save(name):
    os.makedirs(OUT, exist_ok=True)
    s = bpy.context.scene
    s.render.filepath = os.path.join(OUT, name + '.png')
    bpy.ops.render.render(write_still=True)
    print('RENDERED', s.render.filepath)
