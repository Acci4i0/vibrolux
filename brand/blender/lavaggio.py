"""The two washing processes, in the same studio as the rest.

  acqua   water beading on oiled, turned steel — what dewatering oil does — on Nero   → materia-acqua.png
  cesto   a perforated basket of banjo bolts, as in the lavaggio statico (brochure p. 23), on Carta → lavaggio-cesto.png

blender -b -P brand/blender/lavaggio.py -- acqua|cesto [width height samples]
"""
import math
import os
import random
import sys

import bpy
from mathutils import Euler, Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as C  # noqa: E402
import materia  # noqa: E402


def acqua(w, h, samples):
    """Droplets standing up on a turned steel face, seen at a grazing angle, shallow focus."""
    C.reset(31)
    C.render_settings(w, h, samples, glass=True, exposure=-1.4)
    C.studio('nero', target=(0, 0, 0.0), scale=0.9)
    # a wide soft panel behind: every drop gets a bright rim and a light inside
    C.area('back', (0, 3.2, 1.0), (0, 0, 0), 160, (5, 1.2), shadow=False)
    bpy.ops.mesh.primitive_cylinder_add(radius=2.6, depth=0.06, vertices=192, location=(0, 0, -0.03))
    plate = bpy.context.active_object
    C.bevel(plate, width=0.01, segments=3)
    steel = C.material('acciaio-oliato', (0.3, 0.3, 0.31, 1), metallic=1, roughness=0.22)
    p = steel.node_tree.nodes['Principled BSDF']
    p.inputs['Anisotropic'].default_value = 0.8  # the turning marks: highlights run in circles
    C.assign(plate, steel)
    water = C.material('acqua', (1, 1, 1, 1), roughness=0.0, transmission=1.0, ior=1.33, specular=0.5)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=48, ring_count=24)
    proto = bpy.context.active_object
    bpy.ops.object.shade_smooth()
    C.assign(proto, water)
    placed = []
    tries = 0
    while len(placed) < 260 and tries < 20000:
        tries += 1
        r = 0.012 + 0.085 * random.random() ** 3
        x, y = random.uniform(-1.6, 1.6), random.uniform(-0.9, 2.2)
        if any((x - a) ** 2 + (y - b) ** 2 < (r + c + 0.006) ** 2 for a, b, c in placed):
            continue
        placed.append((x, y, r))
    for i, (x, y, r) in enumerate(placed):
        o = proto if i == 0 else materia.link_copy(proto, f'goccia{i}')
        flat = 0.62 + 0.15 * (1 - r / 0.1)  # small drops stand rounder
        o.scale = (r, r * random.uniform(0.92, 1.0), r * flat)
        o.location = (x, y, r * flat * 0.35)
    cam = C.camera((0.0, -2.35, 0.42), (0, 0.25, 0.0), lens=100)
    cam.data.dof.use_dof = True
    cam.data.dof.focus_distance = (Vector((0, 0.05, 0)) - cam.location).length
    cam.data.dof.aperture_fstop = 2.2
    C.save('materia-acqua')


def perforated(name):
    """Sheet steel with a grid of round holes, cut by the shader: object X/Y, 22 mm pitch."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    m.blend_method = 'CLIP'
    nt = m.node_tree
    out = nt.nodes['Material Output']
    metal = nt.nodes['Principled BSDF']
    metal.inputs['Base Color'].default_value = (0.42, 0.42, 0.43, 1)
    metal.inputs['Metallic'].default_value = 1
    metal.inputs['Roughness'].default_value = 0.38
    clear = nt.nodes.new('ShaderNodeBsdfTransparent')
    tc = nt.nodes.new('ShaderNodeTexCoord')
    sep = nt.nodes.new('ShaderNodeSeparateXYZ')
    nt.links.new(tc.outputs['Object'], sep.inputs['Vector'])
    comb = nt.nodes.new('ShaderNodeCombineXYZ')
    nt.links.new(sep.outputs['X'], comb.inputs['X'])
    nt.links.new(sep.outputs['Y'], comb.inputs['Y'])
    mul = nt.nodes.new('ShaderNodeVectorMath')
    mul.operation = 'SCALE'
    mul.inputs['Scale'].default_value = 1 / 0.022
    nt.links.new(comb.outputs[0], mul.inputs[0])
    fr = nt.nodes.new('ShaderNodeVectorMath')
    fr.operation = 'FRACTION'
    nt.links.new(mul.outputs[0], fr.inputs[0])
    sub = nt.nodes.new('ShaderNodeVectorMath')
    sub.operation = 'SUBTRACT'
    sub.inputs[1].default_value = (0.5, 0.5, 0)
    nt.links.new(fr.outputs[0], sub.inputs[0])
    ln = nt.nodes.new('ShaderNodeVectorMath')
    ln.operation = 'LENGTH'
    nt.links.new(sub.outputs[0], ln.inputs[0])
    lt = nt.nodes.new('ShaderNodeMath')
    lt.operation = 'LESS_THAN'
    lt.inputs[1].default_value = 0.31
    nt.links.new(ln.outputs['Value'], lt.inputs[0])
    mix = nt.nodes.new('ShaderNodeMixShader')
    nt.links.new(lt.outputs[0], mix.inputs['Fac'])
    nt.links.new(metal.outputs[0], mix.inputs[1])
    nt.links.new(clear.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs['Surface'])
    return m


def sheet(name, size, loc, rot, mat):
    """A flat panel whose local X/Y are metres on the sheet, so the holes keep their pitch."""
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.name = name
    o.scale = (size[0], size[1], 1)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    C.assign(o, mat)
    return o


def banjo():
    """A banjo bolt like the ones in the brochure's basket: hex head, collar, threaded shank with a cross hole."""
    prof = [(0.0, 0.0), (0.016, 0.0), (0.018, 0.002)]
    for k in range(14):
        z = 0.004 + k * 0.0042
        prof += [(0.018, z), (0.0165, z + 0.0021)]
    prof += [(0.018, 0.064), (0.02, 0.066), (0.02, 0.078), (0.027, 0.08), (0.027, 0.086), (0.0, 0.086)]
    shank = C.mesh_object('gambo', C.lathe(prof, 48), smooth=True, auto_smooth=35)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.03, depth=0.026, vertices=6, location=(0, 0, 0.099))
    head = bpy.context.active_object
    C.bevel(head, width=0.002, segments=2)
    C.apply_all(head)
    bpy.ops.object.select_all(action='DESELECT')
    shank.select_set(True)
    head.select_set(True)
    bpy.context.view_layer.objects.active = shank
    bpy.ops.object.join()
    shank.name = 'banjo'
    return shank


def cesto(w, h, samples):
    C.reset(37)
    s = C.render_settings(w, h, samples, exposure=-1.6)
    s.cycles.transparent_max_bounces = 16
    C.studio('carta', target=(0, 0, 0.25), ambient=0.12)
    W, D, H = 1.2, 0.85, 0.42
    sheetmat = perforated('lamiera-forata')
    sheet('fondo', (W, D), (0, 0, 0.004), (0, 0, 0), sheetmat)
    sheet('fronte', (W, H), (0, -D / 2, H / 2), (math.pi / 2, 0, 0), sheetmat)
    sheet('retro', (W, H), (0, D / 2, H / 2), (math.pi / 2, 0, 0), sheetmat)
    sheet('sinistra', (D, H), (-W / 2, 0, H / 2), (math.pi / 2, 0, math.pi / 2), sheetmat)
    sheet('destra', (D, H), (W / 2, 0, H / 2), (math.pi / 2, 0, math.pi / 2), sheetmat)
    # the frame: a bar round the top, posts in the corners
    frame = C.material('telaio', (0.4, 0.4, 0.41, 1), metallic=1, roughness=0.3)
    for (x, y, sx, sy) in [(0, -D / 2, W, 0.03), (0, D / 2, W, 0.03), (-W / 2, 0, 0.03, D), (W / 2, 0, 0.03, D)]:
        bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, H))
        b = bpy.context.active_object
        b.scale = (sx + 0.03, sy + 0.03, 0.03)
        C.bevel(b, width=0.004, segments=2)
        C.assign(b, frame)
    for x in (-W / 2, W / 2):
        for y in (-D / 2, D / 2):
            bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, H / 2))
            b = bpy.context.active_object
            b.scale = (0.03, 0.03, H)
            C.bevel(b, width=0.004, segments=2)
            C.assign(b, frame)
    # collision walls for the drop, removed after
    walls = []
    for (x, y, z, sx, sy, sz) in [(0, 0, -0.05, W + 0.2, D + 0.2, 0.1), (0, -D / 2 - 0.05, 0.5, W + 0.2, 0.1, 1.2),
                                  (0, D / 2 + 0.05, 0.5, W + 0.2, 0.1, 1.2), (-W / 2 - 0.05, 0, 0.5, 0.1, D + 0.2, 1.2),
                                  (W / 2 + 0.05, 0, 0.5, 0.1, D + 0.2, 1.2)]:
        bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, z))
        c = bpy.context.active_object
        c.scale = (sx, sy, sz)
        walls.append(c)
    bolt = banjo()
    zinc = C.material('zincato', (0.5, 0.5, 0.51, 1), metallic=1, roughness=0.3)
    C.assign(bolt, zinc)
    random.seed(37)
    parts = []
    for i in range(420):
        o = bolt if i == 0 else materia.link_copy(bolt, f'banjo{i}')
        o.location = (random.uniform(-W / 2 + 0.08, W / 2 - 0.08), random.uniform(-D / 2 + 0.08, D / 2 - 0.08), 0.15 + i * 0.005)
        o.rotation_euler = Euler([random.uniform(0, 2 * math.pi) for _ in range(3)])
        parts.append(o)
    bpy.ops.rigidbody.world_add()
    rw = s.rigidbody_world
    rw.point_cache.frame_start, rw.point_cache.frame_end = 1, 120
    rw.substeps_per_frame = 12
    rw.solver_iterations = 20
    for c in walls:
        bpy.ops.object.select_all(action='DESELECT')
        c.select_set(True)
        bpy.context.view_layer.objects.active = c
        bpy.ops.rigidbody.object_add()
        c.rigid_body.type = 'PASSIVE'
        c.rigid_body.collision_shape = 'BOX'
    bpy.ops.object.select_all(action='DESELECT')
    for o in parts:
        o.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.rigidbody.objects_add(type='ACTIVE')
    for o in parts:
        o.rigid_body.collision_shape = 'CONVEX_HULL'
        o.rigid_body.friction = 0.6
        o.rigid_body.restitution = 0.05
        o.rigid_body.linear_damping, o.rigid_body.angular_damping = 0.3, 0.6
        o.rigid_body.collision_margin = 0.001
    for f in range(1, 121):
        s.frame_set(f)
    bpy.ops.object.visual_transform_apply()
    bpy.ops.rigidbody.objects_remove()
    for c in walls:
        bpy.data.objects.remove(c)
    bpy.ops.rigidbody.world_remove()
    s.frame_set(1)
    C.shadow_floor(tone=0.45)
    C.camera((1.05, -1.75, 1.6), (0, 0.04, 0.2), lens=46)
    C.save('lavaggio-cesto')


if __name__ == '__main__':
    a = C.args()
    mode = a[0]
    dims = [int(x) for x in a[1:4]] if len(a) >= 4 else (1440, 1800, 128)
    {'acqua': acqua, 'cesto': cesto}[mode](*dims)
