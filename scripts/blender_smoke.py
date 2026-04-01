import bpy
import math
import os


OUTPUT = os.path.abspath("//renders/blender-smoke.png")


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def create_material(name, color, strength):
    material = bpy.data.materials.new(name=name)
    material.use_nodes = True
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    nodes.clear()

    output = nodes.new("ShaderNodeOutputMaterial")
    emission = nodes.new("ShaderNodeEmission")
    emission.inputs["Color"].default_value = color
    emission.inputs["Strength"].default_value = strength
    links.new(emission.outputs["Emission"], output.inputs["Surface"])

    return material


reset_scene()

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.eevee.taa_render_samples = 64
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.film_transparent = False
scene.render.image_settings.file_format = "PNG"
scene.render.filepath = OUTPUT

world = bpy.data.worlds.get("World")
if world is None:
    world = bpy.data.worlds.new("World")
scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.02, 0.025, 0.04, 1.0)
world.node_tree.nodes["Background"].inputs[1].default_value = 0.3

bpy.ops.object.camera_add(location=(0, -9.2, 0.2), rotation=(math.radians(90), 0, 0))
scene.camera = bpy.context.active_object
scene.camera.data.lens = 32

bpy.ops.object.light_add(type="AREA", location=(0, -2.5, 3.5))
light = bpy.context.active_object
light.data.energy = 1600
light.data.shape = "DISK"
light.data.size = 5

bpy.ops.mesh.primitive_uv_sphere_add(radius=0.92, location=(0, 0, 0))
body = bpy.context.active_object
body.scale[2] = 1.28
body.data.materials.append(create_material("Shell", (0.92, 0.78, 0.46, 1.0), 1.6))

for index, location in enumerate(
    [
        (0, 0, 1.45),
        (0, 0, 0.75),
        (0, 0, 0.1),
        (0, 0, -0.65),
        (0, 0, -1.35),
        (-0.75, 0, -0.05),
        (0.75, 0, -0.05),
    ]
):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=0.12 + index * 0.015, location=location)
    orb = bpy.context.active_object
    orb.data.materials.append(create_material(f"Orb{index}", (0.96, 0.98, 1.0, 1.0), 8 + index * 0.8))

bpy.ops.mesh.primitive_plane_add(size=16, location=(0, 3.2, 0))
backdrop = bpy.context.active_object
backdrop.rotation_euler[0] = math.radians(90)
backdrop.data.materials.append(create_material("Backdrop", (0.06, 0.09, 0.12, 1.0), 0.12))

bpy.ops.render.render(write_still=True)
print(f"Rendered Blender smoke frame to {OUTPUT}")
