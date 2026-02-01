# Unity Dev Expert Overview

Principal-level guidelines for Unity game development covering architecture, performance, and cross-platform delivery.

## Scope

This template applies to:

- C# scripting architecture and MonoBehaviour lifecycle management
- Entity Component System (ECS) and Data-Oriented Technology Stack (DOTS)
- Physics simulation, collision detection, and raycasting
- Shader programming with Shader Graph and custom HLSL
- UI development with UI Toolkit and UGUI
- Multiplayer networking with Netcode for GameObjects
- Performance profiling, memory management, and optimization
- Asset pipeline management and Addressables
- Platform-specific builds (mobile, console, VR, WebGL)

## Core Principles

### 1. Composition Over Inheritance

Unity's component model is designed for composition. MonoBehaviours are components, not base classes. Build complex behaviours by combining small, focused components on a single GameObject rather than deep inheritance trees.

### 2. Data-Oriented Mindset

Think in terms of data layout, cache coherence, and batch processing. When performance matters, prefer structs over classes, arrays over lists, and linear iteration over scattered access patterns. ECS/DOTS formalizes this approach.

### 3. Profile Before Optimizing

Never guess where the bottleneck is. Use the Unity Profiler on the target device to find real problems. Premature optimization in Unity often means optimizing the wrong thing while the actual bottleneck goes unnoticed.

### 4. Deterministic Lifecycle

Understand the exact execution order of Awake, OnEnable, Start, Update, FixedUpdate, and LateUpdate. Bugs from initialization order are among the most common and hardest to debug in Unity projects.

### 5. Platform-Aware Design

Build abstractions that accommodate mobile, console, VR, and desktop targets from the start. Frame budgets, input methods, memory limits, and rendering capabilities vary dramatically across platforms.

### 6. Testable Architecture

Separate pure game logic from MonoBehaviour. Keep calculations, state machines, and data transformations in plain C# classes that can be unit tested without the Unity runtime.

## Technology Stack

| System | Primary | Alternatives |
|--------|---------|--------------|
| Scripting | C# / MonoBehaviour | ECS Systems, Visual Scripting |
| Physics | Built-in PhysX / Unity Physics | Custom, Havok for DOTS |
| Rendering | URP | HDRP, Built-in (legacy) |
| UI Runtime | UI Toolkit | UGUI, IMGUI (debug only) |
| Networking | Netcode for GameObjects | Mirror, Photon Fusion, Fish-Net |
| Input | Input System Package | Legacy Input (avoid) |
| Asset Loading | Addressables | Resources (avoid), AssetBundles |
| Audio | FMOD / Wwise | Built-in AudioSource |
| Animation | Animator / Playables | DOTween, custom tweening |
| Testing | Unity Test Framework | NUnit (edit mode), NSubstitute |
| CI/CD | Unity Cloud Build | GameCI, Jenkins, GitHub Actions |

## Project Structure

```text
Assets/
├── _Project/
│   ├── Scripts/
│   │   ├── Runtime/
│   │   │   ├── Core/           # Service locator, events, singletons
│   │   │   ├── Gameplay/       # Player, AI, items, abilities
│   │   │   ├── Systems/        # Audio, save, camera, input
│   │   │   ├── Data/           # ScriptableObjects, configs
│   │   │   ├── Networking/     # RPCs, sync, lobby
│   │   │   └── UI/             # Presenters, view models
│   │   ├── Editor/             # Custom inspectors, tools
│   │   └── Tests/
│   │       ├── EditMode/       # Pure logic unit tests
│   │       └── PlayMode/       # Runtime integration tests
│   ├── Art/
│   ├── Prefabs/
│   ├── Scenes/
│   └── AddressableAssets/
├── Plugins/
└── StreamingAssets/
```

## Principal Engineer Responsibilities

### Technical Leadership

- Define project-wide C# coding standards and architecture patterns
- Select render pipeline, networking stack, and input handling approach
- Make build vs buy decisions for middleware and plugins
- Establish performance budgets per platform target

### Cross-Team Enablement

- Create reusable ScriptableObject frameworks and event channels
- Build shared tooling (custom editors, debug overlays, profiling dashboards)
- Establish naming conventions, folder structure, and prefab workflows
- Mentor team on DOTS migration, shader authoring, and networking patterns

### Quality and Performance

- Own the profiling and optimization workflow
- Set and enforce frame budget, memory budget, and draw call targets
- Review shader complexity and material setup for rendering efficiency
- Ensure multiplayer code handles latency, prediction, and reconciliation correctly

## Common Pitfalls

### GC Allocations in Hot Paths

Wrong: Allocating strings, arrays, or LINQ in Update loops.
Right: Cache allocations, use StringBuilder, avoid LINQ in per-frame code.

### Ignoring Execution Order

Wrong: Assuming Start runs before another component's Awake.
Right: Use Script Execution Order settings or explicit initialization chains.

### Over-Networking

Wrong: Synchronizing visual-only state (particles, animations) over the network.
Right: Sync authoritative gameplay state; derive visuals locally from synced data.

### Skipping Target Device Profiling

Wrong: Profiling only in the Unity Editor and assuming production performance.
Right: Always profile on the actual target hardware with development builds.
