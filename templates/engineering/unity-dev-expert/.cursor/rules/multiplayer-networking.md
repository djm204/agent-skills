# Multiplayer and Networking

Guidelines for building multiplayer games with Netcode for GameObjects.

## Core Principles

- Server is authoritative for all gameplay state; never trust the client
- Synchronize only what matters: gameplay state, not visual effects
- Design for latency from day one; add prediction and interpolation early
- Test with simulated latency and packet loss, not just localhost

## Networking Stack Selection

| Solution | Model | Best For | Players |
|----------|-------|----------|---------|
| Netcode for GameObjects | Client-server | Unity-native, medium scale | 2-64 |
| Netcode for Entities | Client-server (DOTS) | High entity count | 2-64 |
| Mirror | Client-server | Community, mature | 2-200 |
| Photon Fusion | Client-server | Tick-based, competitive | 2-200 |

## Client-Server Data Flow

```text
┌─────────────────────────────────────────────────────┐
│           AUTHORITATIVE SERVER MODEL                 │
├─────────────────────────────────────────────────────┤
│                                                      │
│  CLIENT                SERVER               CLIENT   │
│  Input ----ServerRpc--> Validate --ClientRpc-> Apply │
│  Predict               Simulate              Interp │
│  Render <---NetVar---- State -----NetVar---> Render │
│                                                      │
│  1. Client sends input (ServerRpc)                   │
│  2. Server validates and simulates                   │
│  3. Server updates NetworkVariables                  │
│  4. Clients receive state, reconcile, render         │
└─────────────────────────────────────────────────────┘
```

## RPC and Sync Guidelines

| Type | Direction | Use For |
|------|-----------|---------|
| ServerRpc | Client -> Server | Player input, action requests |
| ClientRpc | Server -> Client(s) | VFX triggers, audio cues |
| NetworkVariable | Server -> All | Gameplay state (health, position) |

### What to Sync vs Not Sync

| Sync Over Network | Do NOT Sync |
|--------------------|-------------|
| Position, rotation (gameplay) | Particle effects |
| Health, ammo, score | Animation blend trees |
| Equipped weapon/item ID | Footstep sounds, camera shake |
| Match timer, round state | UI animations |

## Lag Compensation

| Technique | Purpose |
|-----------|---------|
| Client-side prediction | Responsive local movement; apply input immediately |
| Server reconciliation | Correct prediction errors from last confirmed state |
| Entity interpolation | Smooth remote entities; buffer 2-3 states |
| Lag compensation | Fair hit detection; rewind server to client view time |

## Network Simulation Testing

| Condition | Simulate | Expected Behavior |
|-----------|----------|-------------------|
| 50ms RTT | Typical broadband | Smooth with prediction |
| 150ms RTT | Mobile / cross-region | Noticeable but playable |
| 5% packet loss | Unstable WiFi | Interpolation hides gaps |

Use Unity Transport simulator pipeline or Clumsy/NetEm for testing.

## Security

| Threat | Mitigation |
|--------|-----------|
| Speed hacking | Server validates movement delta per tick |
| Packet injection | Validate all ServerRpc parameters on server |
| State spoofing | Only server writes NetworkVariables |
| Denial of service | Rate-limit client RPCs per connection |

## Common Pitfalls

### Trusting Client State

Wrong: Client sends `TakeDamageServerRpc(999)` and server applies it directly.
Right: Server calculates damage from weapon data, range, and hit validation.

### Syncing Visual-Only Data

Wrong: NetworkVariable for every particle color and animation parameter.
Right: Sync gameplay state; clients derive all visuals locally.

### No Prediction on Owned Objects

Wrong: Waiting for server confirmation before moving the local player.
Right: Apply input immediately on the owning client. Reconcile when server state arrives.

### Testing Only on Localhost

Wrong: Testing only on localhost and shipping. Players experience rubber-banding.
Right: Test with 100-200ms simulated latency and 2-5% packet loss from day one.
