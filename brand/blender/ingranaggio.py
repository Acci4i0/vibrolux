"""Prima | Dopo: one gear, split down the middle — the left half as it arrives (machined, dull),
the right half as it leaves after tribofinitura isotropica (mirror, Ra 0,01). Plus the turned part.

  gear      the gear standing on Nero, three-quarter, 16:9   → hero-ingranaggio.png
  gear45    the same, 4:5                                    → hero-ingranaggio-45.png
  pezzo     a turned shaft lying on Nero, mirror finish, 4:5 → materia-acciaio.png

blender -b -P brand/blender/ingranaggio.py -- gear|gear45|pezzo [width height samples]
"""
import math
import os
import sys

import bmesh
import bpy
from mathutils import Euler, Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as C  # noqa: E402


def smooth(e0, e1, x):
    t = min(1.0, max(0.0, (x - e0) / (e1 - e0)))
    return t * t * (3 - 2 * t)


def tooth(u):
    """0 at the root, 1 at the tip, over one tooth period u ∈ [0, 1)."""
    return smooth(0.16, 0.36, u) * (1 - smooth(0.64, 0.84, u))


def teeth_ring(n=28, ra=1.0, rr=0.88, ri=0.74, t=0.32, per=28):
    """The toothed rim as a closed solid made only of quads: outer profile and inner circle, top and bottom."""
    bm = bmesh.new()
    m = n * per
    prof = []
    for k in range(m):
        phi = 2 * math.pi * k / m
        u = (k % per) / per
        r = rr + (ra - rr) * tooth(u)
        prof.append((r * math.cos(phi), r * math.sin(phi)))
    circ = [(ri * math.cos(2 * math.pi * k / m), ri * math.sin(2 * math.pi * k / m)) for k in range(m)]
    ob = [bm.verts.new((x, y, 0)) for x, y in prof]
    ot = [bm.verts.new((x, y, t)) for x, y in prof]
    ib = [bm.verts.new((x, y, 0)) for x, y in circ]
    it = [bm.verts.new((x, y, t)) for x, y in circ]
    for k in range(m):
        j = (k + 1) % m
        bm.faces.new((ob[k], ob[j], ot[j], ot[k]))  # flank
        bm.faces.new((it[k], it[j], ib[j], ib[k]))  # bore of the rim
        bm.faces.new((ot[k], ot[j], it[j], it[k]))  # top
        bm.faces.new((ib[k], ib[j], ob[j], ob[k]))  # bottom
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def split_material():
    """Object X < 0: prima (machined, dull). X > 0: dopo (mirror)."""
    m = bpy.data.materials.new('prima-dopo')
    m.use_nodes = True
    nt = m.node_tree
    out = nt.nodes['Material Output']
    nt.nodes.remove(nt.nodes['Principled BSDF'])
    prima = nt.nodes.new('ShaderNodeBsdfPrincipled')
    prima.inputs['Base Color'].default_value = (0.26, 0.26, 0.27, 1)
    prima.inputs['Metallic'].default_value = 1
    prima.inputs['Roughness'].default_value = 0.55
    tc = nt.nodes.new('ShaderNodeTexCoord')
    nz = nt.nodes.new('ShaderNodeTexNoise')
    nz.inputs['Scale'].default_value = 900
    nz.inputs['Detail'].default_value = 4
    nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
    bump = nt.nodes.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = 0.35
    bump.inputs['Distance'].default_value = 0.002
    nt.links.new(nz.outputs['Fac'], bump.inputs['Height'])
    nt.links.new(bump.outputs['Normal'], prima.inputs['Normal'])
    dopo = nt.nodes.new('ShaderNodeBsdfPrincipled')
    dopo.inputs['Base Color'].default_value = (0.86, 0.86, 0.87, 1)
    dopo.inputs['Metallic'].default_value = 1
    dopo.inputs['Roughness'].default_value = 0.025
    sep = nt.nodes.new('ShaderNodeSeparateXYZ')
    nt.links.new(tc.outputs['Object'], sep.inputs['Vector'])
    gt = nt.nodes.new('ShaderNodeMath')
    gt.operation = 'GREATER_THAN'
    gt.inputs[1].default_value = 0.0
    nt.links.new(sep.outputs['X'], gt.inputs[0])
    mix = nt.nodes.new('ShaderNodeMixShader')
    nt.links.new(gt.outputs[0], mix.inputs['Fac'])
    nt.links.new(prima.outputs[0], mix.inputs[1])
    nt.links.new(dopo.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs['Surface'])
    return m


def gear(mat):
    rim = C.mesh_object('corona', teeth_ring(), smooth=True, auto_smooth=35)
    C.bevel(rim, width=0.006, segments=3, angle=55)
    rim.location.z = -0.16
    # web and hub, turned: a thinner disc, a raised hub, the bore
    body = C.mesh_object('mozzo', C.lathe([(0.2, -0.24), (0.36, -0.24), (0.38, -0.22), (0.4, -0.08), (0.75, -0.06),
                                            (0.75, 0.06), (0.4, 0.08), (0.38, 0.22), (0.36, 0.24), (0.2, 0.24),
                                            (0.2, -0.24)], 192), smooth=True, auto_smooth=35)
    C.bevel(body, width=0.004, segments=2, angle=40)
    root = bpy.data.objects.new('ingranaggio', None)
    bpy.context.collection.objects.link(root)
    for o in (rim, body):
        C.assign(o, mat)
        o.parent = root
    return root


def gear_scene(w, h, samples, portrait=False):
    C.reset(1)
    C.render_settings(w, h, samples)
    # the dull half is lit by what it reflects: it needs the key in it, or both halves go dark
    C.studio('nero', target=(0, 0, 1.0), scale=1.3, key_glossy=True)
    root = gear(split_material())
    # standing on its teeth, facing the camera at three quarters; the split runs vertical
    root.rotation_euler = Euler((math.radians(90), 0, math.radians(-24)))
    root.location = (0, 0, 1.0)
    C.black_floor(roughness=0.25)
    if portrait:
        C.camera((1.3, -7.6, 1.55), (0, 0, 1.0), lens=72)
        C.save('hero-ingranaggio-45')
    else:
        C.camera((1.7, -8.2, 1.5), (0, 0, 0.98), lens=62)
        C.save('hero-ingranaggio')


def pezzo(w, h, samples):
    """A turned shaft standing on Nero, mirror finish, filling the frame — the strips run down it as lines of light."""
    C.reset(2)
    C.render_settings(w, h, samples)
    C.studio('nero', target=(0, 0, 1.1), scale=1.2)
    C.area('strip_c', (0.9, -3.2, 1.2), (0, 0, 1.1), 260, (0.12, 3.4), shadow=False)
    steel = C.material('specchio', (0.86, 0.86, 0.87, 1), metallic=1, roughness=0.025)
    prof = [(0.0, 0.0), (0.2, 0.0), (0.22, 0.02), (0.22, 0.3), (0.2, 0.32), (0.2, 0.36), (0.22, 0.38), (0.22, 0.7),
            (0.27, 0.74), (0.27, 1.18), (0.25, 1.2), (0.25, 1.24), (0.27, 1.26), (0.27, 1.5), (0.23, 1.54), (0.17, 1.56)]
    for k in range(12):  # the thread at the top
        z = 1.58 + k * 0.035
        prof += [(0.17, z), (0.155, z + 0.0175)]
    prof += [(0.17, 2.0), (0.15, 2.03), (0.0, 2.03)]
    o = C.mesh_object('albero', C.lathe(prof, 192), smooth=True, auto_smooth=30)
    C.assign(o, steel)
    C.black_floor()
    C.camera((0.0, -6.4, 1.2), (0, 0, 1.0), lens=90)
    C.save('materia-acciaio')


if __name__ == '__main__':
    a = C.args()
    mode = a[0]
    dims = [int(x) for x in a[1:4]] if len(a) >= 4 else None
    if mode == 'gear':
        gear_scene(*(dims or (2400, 1350, 160)))
    elif mode == 'gear45':
        gear_scene(*(dims or (1600, 2000, 160)), portrait=True)
    elif mode == 'pezzo':
        pezzo(*(dims or (1600, 2000, 160)))
