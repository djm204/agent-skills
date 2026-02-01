# Physics and Rendering

Guidelines for physics system usage, collision management, render pipeline configuration, and shader development in Unity.

## Core Principles

- Use the physics engine for physics, not for gameplay triggers (prefer overlap queries)
- Always set collision layers and layer masks to avoid unnecessary collision checks
- Select the render pipeline at project start; switching later is costly
- Profile GPU performance on target hardware, not in the Editor

## Physics System Selection

| Need | Recommended | Notes |
|------|-------------|-------|
| Player movement (arcade) | CharacterController | Built-in slopes, steps, no jitter |
| Player movement (realistic) | Rigidbody + capsule | Responds to forces, interacts with world |
| Hitscan weapons | Physics.Raycast | Instant, zero allocation with NonAlloc |
| Slow projectiles | Rigidbody + collider | Gravity, bounce, drag for free |
| Fast projectiles | Raycast per frame | Prevents tunneling through thin walls |
| Area detection | OverlapSphere / Box | No rigidbody needed, query on demand |

## Collision Layer Strategy

```text
Recommended Layer Assignment:

Layer 0:  Default      Layer 7:  Projectile
Layer 3:  Player       Layer 8:  Environment
Layer 6:  Enemy        Layer 9:  Trigger

Configure: Edit > Project Settings > Physics > Layer Collision Matrix
Disable all pairs that never need to interact.
```

## Render Pipeline Comparison

| Feature | URP | HDRP | Built-in |
|---------|-----|------|----------|
| Target platforms | All | PC, Console | Legacy |
| SRP Batcher | Yes | Yes | No |
| Ray tracing | Limited | Full | No |
| 2D Renderer | Yes | No | Partial |
| Custom passes | RenderFeature | CustomPass | CommandBuffer |

## Shader Graph vs Custom HLSL

| Scenario | Use Shader Graph | Use Custom HLSL |
|----------|-----------------|-----------------|
| Standard PBR variations | Yes | No |
| Toon/cel shading | Yes | Sometimes |
| Compute shaders | No | Yes |
| Custom lighting models | Difficult | Yes |
| Post-processing effects | No (use Volume) | Yes |

## Lighting Decision Tree

```text
Does the light move at runtime?
├── NO  --> Baked lightmaps (best performance)
└── YES --> Does it affect many objects?
            ├── NO  --> Realtime point/spot (limit range)
            └── YES --> Mixed lighting (bake indirect, realtime direct)

VR NOTE: Baked lighting strongly preferred. Realtime shadows are expensive at 90 FPS.
```

## LOD Setup Guidelines

| LOD Level | Screen % | Mesh Detail | Extras |
|-----------|----------|-------------|--------|
| LOD0 | 0-15% | Full detail | All VFX, all bones |
| LOD1 | 15-30% | 50% polys | Simplified VFX |
| LOD2 | 30-60% | 25% polys | No VFX, simple material |
| Culled | > 60% | Nothing | Not rendered |

## Common Pitfalls

### Moving Static Colliders

Wrong: Moving a collider without a Rigidbody. Unity rebuilds the static collision tree every frame.
Right: Add a Rigidbody (set to Kinematic if no physics needed) to any collider that moves.

### Mesh Colliders on Moving Objects

Wrong: Using MeshCollider on dynamic Rigidbodies (expensive, limited support).
Right: Approximate with box, sphere, or capsule colliders. Use compound colliders for complex shapes.

### Ignoring Overdraw

Wrong: Stacking transparent particles and UI without measuring fill rate.
Right: Use Scene view overdraw visualization. Reduce particle count, use opaque when possible.

### Not Setting Layer Masks on Raycasts

Wrong: `Physics.Raycast(ray, out hit, 100f)` with no layer mask (checks everything).
Right: Always pass a layer mask parameter to filter irrelevant layers.
