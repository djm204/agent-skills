# C# Architecture

Guidelines for C# scripting patterns, MonoBehaviour lifecycle, dependency management, and testable code in Unity.

## Core Principles

- Prefer composition over inheritance for game object behaviour
- Keep MonoBehaviours thin; delegate logic to plain C# classes
- Use ScriptableObjects for shared data and event channels
- Favour async/await (UniTask) over coroutines for complex flows
- Design for testability: inject dependencies, avoid static singletons

## Lifecycle Method Usage

| Method | Use For | Avoid |
|--------|---------|-------|
| Awake | Cache component refs, self-init | Accessing other objects (order not guaranteed) |
| OnEnable | Subscribe to events, register | Heavy computation |
| Start | Cross-object init, first-frame setup | Anything needed by another Awake |
| Update | Per-frame game logic | Physics, heavy allocations |
| FixedUpdate | Physics forces, raycasts | Camera movement, input reading |
| LateUpdate | Camera follow, post-processing | Physics manipulation |
| OnDisable | Unsubscribe events, cleanup | Accessing destroyed objects |

## Component Communication

| Pattern | Coupling | Best For |
|---------|----------|----------|
| Direct reference | High | Parent-child, known structure |
| GetComponent<T> | Medium | Same-object access (cache in Awake) |
| UnityEvent | Low | Designer-configurable callbacks |
| ScriptableObject event | Very low | Cross-system communication |
| Interface + injection | Very low | Testable, swappable dependencies |

## ScriptableObject Patterns

| Pattern | Purpose | Example |
|---------|---------|---------|
| Data Container | Decouple config from behaviour | WeaponData, EnemyConfig |
| Event Channel | Decouple publishers from subscribers | OnPlayerDied, OnScoreChanged |
| Runtime Set | Track active instances without FindObjectsOfType | ActiveEnemies, SpawnPoints |
| Enum Replacement | Extensible type-safe categories | DamageType, ItemRarity |

## Async: Coroutines vs UniTask

| Feature | Coroutines | async/await (UniTask) |
|---------|------------|----------------------|
| Cancellation | StopCoroutine (fragile) | CancellationToken (robust) |
| Return values | Not supported | Full Task<T> support |
| Error handling | Silently swallowed | try/catch |
| GC allocation | IEnumerator allocates | Zero-alloc with UniTask |
| Best for | Simple delays | Complex async flows, I/O |

## Testable Code Structure

```text
THIN MonoBehaviour              PURE C# (testable)
┌───────────────────┐          ┌─────────────────────┐
│ Cache references  │          │ State machines       │
│ Forward input     │ -------> │ Damage calculation  │
│ Apply results     │          │ Inventory logic      │
│ Manage lifecycle  │ <------- │ Pathfinding helpers  │
└───────────────────┘          └─────────────────────┘

Test Type     | Framework               | What to Test
Edit Mode     | NUnit + Unity Test Fwk  | Pure C#, ScriptableObjects, math
Play Mode     | Unity Test Framework    | Component interactions, scenes
```

## Common Pitfalls

### Deep Inheritance Chains

Wrong: `BossEnemy : RangedEnemy : BaseEnemy : MonoBehaviour` with 5 levels of overrides.
Right: Compose behaviors from small components: HealthComponent, AttackComponent, MovementComponent.

### Singletons Everywhere

Wrong: Every manager is a static singleton, creating hidden dependencies and untestable code.
Right: Use a service locator or DI container; pass dependencies explicitly where possible.

### String-Based APIs

Wrong: `SendMessage("TakeDamage", 10)` or `Animator.SetTrigger("attack")`.
Right: Direct method calls, interfaces, or `AnimatorHash = Animator.StringToHash("attack")`.

### Not Caching GetComponent

Wrong: Calling `GetComponent<Rigidbody>()` every frame in Update.
Right: Cache the result in Awake and store it in a private field.
