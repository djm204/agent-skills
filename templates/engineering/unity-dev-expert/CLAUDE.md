# Unity Development Expert Guide

Principal-level guidelines for architecting, developing, and optimizing Unity projects across C# scripting, ECS/DOTS, physics, rendering, UI systems, multiplayer networking, and platform-specific performance tuning.

---

## Overview

This guide applies to:

- C# scripting architecture and MonoBehaviour lifecycle management
- Entity Component System (ECS) and Data-Oriented Technology Stack (DOTS)
- Physics systems, collision detection, and raycasting strategies
- Shader programming (Shader Graph, HLSL, URP, HDRP)
- UI development (UI Toolkit and UGUI)
- Multiplayer networking with Netcode for GameObjects
- Performance profiling, memory management, and draw call optimization
- Asset pipeline management, Addressables, and platform builds

### Key Principles

1. **Composition Over Inheritance** - Prefer component-based design; MonoBehaviours are components, not base classes
2. **Data-Oriented Mindset** - Think in terms of data flow, cache coherence, and batch processing
3. **Profile Before Optimizing** - Use the Unity Profiler to find real bottlenecks, not imagined ones
4. **Deterministic Lifecycle** - Understand the exact order of Awake, OnEnable, Start, Update, FixedUpdate, LateUpdate
5. **Platform-Aware Design** - Build abstractions that accommodate mobile, console, VR, and desktop targets
6. **Testable Architecture** - Separate logic from MonoBehaviour; keep pure C# testable outside the engine

### Core Frameworks

| System | Purpose | When to Use |
|--------|---------|-------------|
| MonoBehaviour | Component scripting | Standard game logic, prototyping |
| ECS/DOTS | High-performance data-oriented code | Thousands of entities, simulation-heavy |
| Netcode for GameObjects | Multiplayer networking | Authoritative server, client prediction |
| UI Toolkit | Runtime and Editor UI | New projects, complex layouts, data binding |
| UGUI | Canvas-based UI | Legacy projects, world-space UI, VR overlays |
| Addressables | Async asset loading and bundles | Production builds, DLC, memory management |
| Shader Graph | Visual shader authoring | URP/HDRP materials, artist-friendly workflows |
| Input System | Cross-platform input handling | All new projects, action-based input mapping |

---

## C# Architecture

### Project Structure

```text
Assets/
├── _Project/
│   ├── Scripts/
│   │   ├── Runtime/
│   │   │   ├── Core/              # Singletons, service locator, events
│   │   │   ├── Gameplay/          # Player, enemies, items, abilities
│   │   │   ├── Systems/           # Audio, save, input, camera
│   │   │   ├── Data/              # ScriptableObjects, configs
│   │   │   ├── Networking/        # Netcode RPCs, sync vars
│   │   │   └── UI/                # Presenters, view models
│   │   ├── Editor/                # Custom inspectors, tools
│   │   └── Tests/
│   │       ├── EditMode/          # Pure logic tests
│   │       └── PlayMode/          # Integration tests
│   ├── Art/
│   ├── Prefabs/
│   ├── Scenes/
│   └── AddressableAssets/
├── Plugins/                       # Third-party native plugins
└── StreamingAssets/               # Platform-specific raw files
```

### ScriptableObject Event Channel

```csharp
[CreateAssetMenu(menuName = "Events/Void Event Channel")]
public class VoidEventChannel : ScriptableObject
{
    private readonly HashSet<Action> _listeners = new();
    public void Register(Action listener) => _listeners.Add(listener);
    public void Deregister(Action listener) => _listeners.Remove(listener);
    public void Raise()
    {
        foreach (var listener in _listeners)
            listener.Invoke();
    }
}
```

### Dependency Injection vs Service Locator

| Approach | Pros | Cons | Use When |
|----------|------|------|----------|
| Constructor injection | Explicit deps, testable | Hard with MonoBehaviours | Pure C# classes |
| Service Locator | Works with MonoBehaviours | Hidden deps, harder to test | Scene-level services |
| ScriptableObject refs | Designer-friendly, decoupled | Requires asset setup | Cross-system communication |
| Zenject/VContainer | Full DI in Unity | Framework overhead | Large teams, complex projects |

### MonoBehaviour Lifecycle

```text
┌─────────────────────────────────────────────────────────────────┐
│                 MONOBEHAVIOUR EXECUTION ORDER                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  INITIALIZATION                                                 │
│  ├── Awake()           <- Called once, even if disabled          │
│  ├── OnEnable()        <- Called each time enabled               │
│  └── Start()           <- Called once, only if enabled           │
│                                                                 │
│  PHYSICS LOOP (FixedUpdate rate, default 50Hz)                  │
│  ├── FixedUpdate()     <- Physics calculations                  │
│  ├── [Internal Physics] <- Rigidbody integration, collision     │
│  └── OnCollisionXxx()  <- Collision and trigger callbacks       │
│                                                                 │
│  GAME LOOP (Every frame)                                        │
│  ├── Update()          <- Main game logic                       │
│  ├── [Animation]       <- Animator evaluation                   │
│  └── LateUpdate()      <- Camera follow, post-processing        │
│                                                                 │
│  TEARDOWN                                                       │
│  ├── OnDisable()       <- Called each time disabled              │
│  └── OnDestroy()       <- Called once on destruction             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Coroutines vs Async/Await

| Feature | Coroutines | async/await (UniTask) |
|---------|------------|----------------------|
| Cancellation | StopCoroutine, tied to GO | CancellationToken |
| Return values | Not native | Full Task<T> support |
| Error handling | Swallowed silently | try/catch works |
| Allocation | IEnumerator allocates | Zero-alloc with UniTask |
| Best for | Simple delays, sequences | Complex async flows, I/O |

---

## ECS and DOTS

### Architecture Overview

```text
┌──────────────────────────────────────────────────────────┐
│                     ECS ARCHITECTURE                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Entities are just IDs. Components are pure data.        │
│  Systems process matching component archetypes.          │
│                                                          │
│  DATA LAYOUT (SoA - Struct of Arrays)                    │
│  ┌─────────────────────────────────────────┐             │
│  │ Chunk: [Pos][Pos][Pos] [Vel][Vel][Vel] │             │
│  │        cache-friendly, linear access    │             │
│  └─────────────────────────────────────────┘             │
└──────────────────────────────────────────────────────────┘
```

### System with Burst and Jobs

```csharp
[BurstCompile]
public partial struct MovementSystem : ISystem
{
    [BurstCompile]
    public void OnUpdate(ref SystemState state)
    {
        new MoveJob { DeltaTime = SystemAPI.Time.DeltaTime }.ScheduleParallel();
    }
}

[BurstCompile]
partial struct MoveJob : IJobEntity
{
    public float DeltaTime;
    void Execute(ref LocalTransform transform, in MoveSpeed speed, in TargetPosition target)
    {
        float3 dir = math.normalize(target.Value - transform.Position);
        transform.Position += dir * speed.Value * DeltaTime;
    }
}
```

### When to Use ECS vs MonoBehaviour

| Criteria | MonoBehaviour | ECS/DOTS |
|----------|---------------|----------|
| Entity count | < 1,000 | 1,000 - 1,000,000+ |
| Team familiarity | Standard Unity | Requires DOTS training |
| Iteration speed | Fast prototyping | Slower initial setup |
| Performance ceiling | Moderate | Very high (Burst + Jobs) |
| Third-party assets | Full support | Limited support |

---

## Physics and Rendering

### Physics System Decision Matrix

| Need | Solution | Notes |
|------|----------|-------|
| Character movement | CharacterController or Rigidbody | CC for arcade, RB for realistic |
| Projectiles | Raycasts or small Rigidbodies | Raycast for hitscan, RB for physics projectiles |
| Triggers/zones | Trigger colliders | Use layers to filter |
| Destruction | Rigidbody + joints | Pre-fracture meshes |

### Render Pipeline Selection

| Pipeline | Target | Features | GPU Budget |
|----------|--------|----------|------------|
| URP | Mobile, VR, mid-range PC | SRP Batcher, 2D renderer | Low-Medium |
| HDRP | PC, Console | Ray tracing, volumetrics | High |
| Built-in | Legacy projects only | Broad asset support | Varies |

### Shader Graph vs HLSL

| Factor | Shader Graph | Custom HLSL |
|--------|-------------|-------------|
| Audience | Artists, designers | Graphics programmers |
| Complexity ceiling | Medium | Unlimited |
| Performance control | Limited | Full control |
| Best for | Standard materials, effects | Compute shaders, custom passes |

### LOD and Culling Strategy

```text
Camera Frustum
┌─────────────────────────────────────────┐
│                                         │
│  LOD0 (< 10m)     Full mesh, all VFX   │
│  LOD1 (10-30m)    Reduced mesh, no VFX │
│  LOD2 (30-80m)    Low-poly, billboards │
│  Culled (> 80m)   Not rendered          │
│                                         │
│  Occlusion Culling: Objects behind      │
│  walls are skipped entirely.            │
└─────────────────────────────────────────┘
```

---

## UI Systems

### UI Toolkit vs UGUI Decision Matrix

| Criteria | UI Toolkit | UGUI |
|----------|-----------|------|
| Layout system | Flexbox (USS) | RectTransform, anchors |
| Data binding | Built-in binding system | Manual or third-party |
| World-space UI | Limited support | Native Canvas world mode |
| VR/AR support | Limited | Mature, tested |
| Editor extensions | Primary choice | Legacy |

### UI Architecture Pattern

```text
┌──────────────────────────────────────────────────┐
│              MODEL-VIEW-PRESENTER                 │
├──────────────────────────────────────────────────┤
│                                                   │
│  MODEL (ScriptableObject / Plain C#)              │
│  ├── Game state data                              │
│  └── Raises events on change                      │
│           |                                       │
│  PRESENTER (MonoBehaviour)                        │
│  ├── Listens to model events                      │
│  ├── Updates view elements                        │
│  └── Forwards user input to model                 │
│           |                                       │
│  VIEW (UXML + USS / Canvas)                       │
│  ├── Pure visual layout, no game logic            │
│  └── Binds to presenter callbacks                 │
└──────────────────────────────────────────────────┘
```

### Responsive Layout Guidelines

| Screen Type | Strategy | Implementation |
|-------------|----------|----------------|
| Mobile portrait | Stack vertically | USS flex-direction: column |
| Desktop | Fixed or scaling | USS percentage + max-width |
| VR/AR | World-space canvas | UGUI Canvas + Camera.worldToScreen |
| Console TV | Safe area margins | Screen.safeArea + anchor offsets |

---

## Multiplayer and Networking

### Client-Server Architecture

```text
┌─────────────────────────────────────────────────────────┐
│            CLIENT-SERVER DATA FLOW                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  CLIENT                                                  │
│  ├── Sends input to server (ServerRpc)                   │
│  ├── Applies client-side prediction                      │
│  └── Interpolates remote entities                        │
│                                                          │
│  SERVER (Authoritative)                                  │
│  ├── Validates all client actions                        │
│  ├── Runs physics simulation                             │
│  └── Broadcasts state (NetworkVariable, ClientRpc)       │
└─────────────────────────────────────────────────────────┘
```

### NetworkVariable and RPCs

```csharp
public class PlayerHealth : NetworkBehaviour
{
    public NetworkVariable<int> Health = new(
        100, NetworkVariableReadPermission.Everyone,
        NetworkVariableWritePermission.Server);

    public override void OnNetworkSpawn()
        => Health.OnValueChanged += OnHealthChanged;

    [ServerRpc]
    public void TakeDamageServerRpc(int amount, ServerRpcParams p = default)
    {
        if (amount < 0 || amount > 100) return;
        Health.Value = Mathf.Max(0, Health.Value - amount);
        if (Health.Value <= 0) HandleDeathClientRpc();
    }

    [ClientRpc]
    private void HandleDeathClientRpc() => PlayDeathAnimation();
}
```

### Lag Compensation Strategies

| Technique | Purpose | Implementation |
|-----------|---------|----------------|
| Client-side prediction | Responsive local movement | Apply input locally, reconcile with server |
| Server reconciliation | Correct prediction errors | Re-simulate from last confirmed state |
| Entity interpolation | Smooth remote entities | Buffer 2-3 states, interpolate between |
| Lag compensation | Fair hit detection | Rewind server state to client's view time |

### Network Topology Selection

| Topology | Players | Use Case |
|----------|---------|----------|
| Host (listen server) | 2-8 | Co-op, casual PvP |
| Dedicated server | 2-64+ | Competitive, MMO |
| Relay (Unity Relay) | 2-8 | NAT traversal, casual |

---

## Performance and Optimization

### Profiler-First Workflow

```text
┌─────────────────────────────────────────────────┐
│            OPTIMIZATION WORKFLOW                  │
├─────────────────────────────────────────────────┤
│                                                  │
│  1. MEASURE  -> Profile on TARGET DEVICE         │
│  2. IDENTIFY -> Find the single worst bottleneck │
│  3. FIX      -> One change at a time             │
│  4. VERIFY   -> Compare before/after metrics     │
│                 Repeat until budget met           │
└─────────────────────────────────────────────────┘
```

### Frame Budget Targets

| Platform | Target FPS | Frame Budget | Draw Calls | Tri Count |
|----------|-----------|--------------|------------|-----------|
| Mobile (low) | 30 | 33.3 ms | < 100 | < 100K |
| Mobile (high) | 60 | 16.6 ms | < 200 | < 300K |
| Console | 60 | 16.6 ms | < 2,000 | < 2M |
| PC (mid) | 60 | 16.6 ms | < 3,000 | < 5M |
| VR | 90 | 11.1 ms | < 100 | < 200K |

### Memory Optimization

| Technique | What It Solves | Implementation |
|-----------|---------------|----------------|
| Object pooling | GC spikes from Instantiate/Destroy | Pre-allocate, reuse from pool |
| Addressables | Large upfront memory usage | Load/unload assets on demand |
| Texture compression | VRAM usage | ASTC (mobile), BC7 (desktop) |
| Sprite atlasing | Draw calls, VRAM fragmentation | Sprite Atlas asset |
| String interning | GC from string operations | StringBuilder, avoid concat |

### Object Pooling Pattern

```csharp
public class ObjectPool<T> where T : Component
{
    private readonly Queue<T> _pool = new();
    private readonly T _prefab;
    private readonly Transform _parent;

    public ObjectPool(T prefab, int initialSize, Transform parent = null)
    {
        _prefab = prefab;
        _parent = parent;
        for (int i = 0; i < initialSize; i++)
            _pool.Enqueue(CreateInstance());
    }

    public T Get()
    {
        T inst = _pool.Count > 0 ? _pool.Dequeue() : CreateInstance();
        inst.gameObject.SetActive(true);
        return inst;
    }

    public void Return(T inst)
    {
        inst.gameObject.SetActive(false);
        _pool.Enqueue(inst);
    }

    private T CreateInstance()
    {
        T inst = Object.Instantiate(_prefab, _parent);
        inst.gameObject.SetActive(false);
        return inst;
    }
}
```

### Draw Call Reduction

| Strategy | Savings | Effort |
|----------|---------|--------|
| SRP Batcher (URP/HDRP) | Automatic batching | Enable in pipeline settings |
| GPU Instancing | Same mesh + material | Check "Enable GPU Instancing" on material |
| Static Batching | Combine static meshes | Mark objects as Static |
| Texture Atlasing | Reduce material swaps | Pack textures into atlases |
| LOD Groups | Reduce distant poly count | Add LODGroup component |

### Platform-Specific Optimization

| Platform | Key Constraints | Critical Optimizations |
|----------|----------------|----------------------|
| iOS | Thermal throttle, Metal API | Reduce shader complexity, limit particles |
| Android | GPU fragmentation, Vulkan/GLES | Test on low-end, compress textures (ASTC) |
| Console | Fixed hardware, cert requirements | Respect memory budgets, async loading |
| VR | 90+ FPS mandatory, single-pass | Foveated rendering, reduce overdraw |
| WebGL | No threads, WASM limits | Minimize asset sizes, strip unused code |

---

## Common Pitfalls

### 1. Using Update for Everything

```csharp
// Wrong: Polling every frame for rare events
void Update() { if (Input.GetKeyDown(KeyCode.Space)) Jump(); }

// Right: Use the Input System with action callbacks
void OnEnable() { _inputActions.Player.Jump.performed += OnJump; }
private void OnJump(InputAction.CallbackContext ctx) => Jump();
```

### 2. Ignoring GC Allocations

```csharp
// Wrong: Allocating every frame
void Update()
{
    string status = "HP: " + health.ToString();  // Allocates
    var enemies = FindObjectsOfType<Enemy>();     // Allocates
}

// Right: Cache and reuse
private readonly StringBuilder _sb = new();
private Enemy[] _enemyCache;
void Start() { _enemyCache = FindObjectsOfType<Enemy>(); }
```

### 3. Physics in Update Instead of FixedUpdate

```csharp
// Wrong: Framerate-dependent physics
void Update() { _rb.AddForce(Vector3.forward * speed); }

// Right: Fixed timestep for deterministic physics
void FixedUpdate() { _rb.AddForce(Vector3.forward * speed); }
```

### 4. Not Using Layers for Physics Filtering

```csharp
// Wrong: Raycast hits everything, filter in code
if (Physics.Raycast(ray, out var hit))
    if (hit.collider.CompareTag("Enemy")) { }

// Right: Use layer mask to only hit relevant layers
int mask = LayerMask.GetMask("Enemy");
if (Physics.Raycast(ray, out var hit, 100f, mask))
    ApplyDamage(hit.collider);
```

### 5. Coroutines Without Cleanup

```csharp
// Wrong: Coroutine leaks if object disabled
void Start() => StartCoroutine(SpawnLoop());

// Right: Track and stop coroutines
private Coroutine _routine;
void OnEnable() => _routine = StartCoroutine(SpawnLoop());
void OnDisable() { if (_routine != null) StopCoroutine(_routine); }
```

### 6. Synchronizing Everything Over the Network

```csharp
// Wrong: Sync every visual detail
public NetworkVariable<Color> ShirtColor = new();

// Right: Sync gameplay state; derive visuals locally
public NetworkVariable<int> SkinIndex = new();
```

---

## Resources

- [Unity Manual](https://docs.unity3d.com/Manual/)
- [Unity ECS Documentation](https://docs.unity3d.com/Packages/com.unity.entities@latest/)
- [Netcode for GameObjects](https://docs-multiplayer.unity3d.com/netcode/current/about/)
- [Unity Performance Best Practices](https://docs.unity3d.com/Manual/BestPracticeGuides.html)
- [Unity UI Toolkit Manual](https://docs.unity3d.com/Manual/UIElements.html)
- [Addressables System](https://docs.unity3d.com/Packages/com.unity.addressables@latest/)
- [Unity Shader Graph](https://docs.unity3d.com/Packages/com.unity.shadergraph@latest/)
- [Unity Profiler Documentation](https://docs.unity3d.com/Manual/Profiler.html)
