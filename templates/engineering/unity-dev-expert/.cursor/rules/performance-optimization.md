# Performance and Optimization

Guidelines for profiling, memory management, draw call reduction, and platform-specific tuning in Unity.

## Core Principles

- Profile on the target device, not the Editor; Editor overhead distorts results
- Fix the biggest bottleneck first; do not scatter-shot optimize
- Set explicit frame budgets per platform before development starts
- Measure before and after every optimization to prove it worked

## Frame Budget Targets

| Platform | Target FPS | Budget | Max Draw Calls | Max Tris |
|----------|-----------|--------|----------------|----------|
| Mobile (low) | 30 | 33.3 ms | < 100 | < 100K |
| Mobile (high) | 60 | 16.6 ms | < 200 | < 300K |
| Console | 60 | 16.6 ms | < 2,000 | < 2M |
| PC (mid) | 60 | 16.6 ms | < 3,000 | < 5M |
| VR (Quest) | 72 | 13.8 ms | < 100 | < 150K |
| VR (PCVR) | 90 | 11.1 ms | < 1,000 | < 1M |

## Profiling Decision Tree

```text
Frame time above budget?
├── CPU bound (Profiler > CPU module)
│   ├── Scripts too slow? --> Deep Profile, add Profiler.BeginSample
│   ├── Physics too slow? --> Reduce colliders, simplify layers
│   ├── GC spikes?        --> Find allocations in GC.Alloc column
│   └── Animation / UI?   --> Reduce Animator complexity, split canvases
└── GPU bound (Profiler > GPU / RenderDoc)
    ├── Too many draw calls? --> Batch, atlas, SRP Batcher
    ├── Overdraw?            --> Reduce transparency, lower res
    ├── Shader complexity?   --> Simplify shaders, fewer samples
    └── Shadows / lighting?  --> Bake lights, reduce shadow distance
```

## GC Allocation Hotspots

| Source | Fix |
|--------|-----|
| String concatenation in Update | Use StringBuilder once |
| LINQ in hot paths | Replace with manual loops |
| Boxing value types | Use generic collections |
| Lambda captures | Cache delegate, avoid captures |
| FindObjectsOfType | Cache results, use runtime sets |
| foreach on non-List | Use for-loop or List<T> |

## Draw Call Reduction

| Technique | How It Works |
|-----------|-------------|
| SRP Batcher | Batches by shader, not material (auto with URP/HDRP) |
| GPU Instancing | Renders identical meshes in one call |
| Static Batching | Combines static meshes at build time |
| Texture Atlasing | Reduces material switches |

## Memory Budget Guidelines

| Platform | Recommended Budget | Texture Budget |
|----------|-------------------|----------------|
| Mobile (2GB) | < 600 MB | < 200 MB |
| Mobile (4GB) | < 1.2 GB | < 400 MB |
| Console | Per TRC/Lotcheck | < 3 GB |
| Quest 2/3 | < 1.5 GB | < 512 MB |

## Texture Format Selection

| Platform | Format | Notes |
|----------|--------|-------|
| iOS / Android (modern) | ASTC 6x6 | Best quality/size for mobile |
| Android (old) | ETC2 | Fallback for older devices |
| PC / Console | BC7 | Best desktop format |

## Platform-Specific Settings

| Platform | Critical Settings |
|----------|------------------|
| iOS | Metal API, ASTC textures, IL2CPP |
| Android | Vulkan primary, GLES 3.2 fallback |
| Quest VR | Single-pass instanced, fixed foveated rendering |
| WebGL | Code stripping, compressed textures, no threads |

## Common Pitfalls

### Profiling Only in the Editor

Wrong: Checking frame time in the Editor and assuming it reflects device performance.
Right: Deploy a development build to target device, connect Profiler via USB or IP.

### Premature Optimization

Wrong: Writing Burst jobs for UI button handlers and menu screens.
Right: Identify actual bottlenecks via Profiler first. Optimize only the top offenders.

### Forgetting to Release Addressables

Wrong: Loading assets with Addressables but never calling `Addressables.Release()`.
Right: Track every handle and release in OnDestroy or when no longer needed.

### Texture Import Defaults

Wrong: Importing all textures at full resolution with no compression override.
Right: Set per-platform texture overrides. Most mobile textures: 512 or 1024 max.

### GC in Hot Loops

Wrong: Using LINQ, string concat, or `new List<T>()` inside Update or FixedUpdate.
Right: Pre-allocate everything. Profile GC.Alloc column regularly.
