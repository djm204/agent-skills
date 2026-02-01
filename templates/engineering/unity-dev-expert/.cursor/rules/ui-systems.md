# UI Systems

Guidelines for building runtime user interfaces in Unity using UI Toolkit and UGUI.

## Core Principles

- Separate UI logic (presenter) from layout (view) and game state (model)
- Choose UI Toolkit for new projects with complex layouts; UGUI for world-space and VR
- Design responsive layouts that adapt to different screen sizes and safe areas
- Minimize Canvas rebuilds in UGUI; minimize USS recalculations in UI Toolkit

## System Selection

| Criteria | UI Toolkit | UGUI |
|----------|-----------|------|
| New runtime UI | Preferred | Acceptable |
| Editor extensions | Preferred | Not supported |
| World-space UI | Limited | Preferred |
| VR/AR interfaces | Not recommended | Preferred |
| Data binding | Built-in | Manual or third-party |
| Layout system | Flexbox (USS) | RectTransform anchors |
| Asset store support | Growing | Extensive |

## MVP Architecture

```text
┌──────────────────────────────────────────────────┐
│              MODEL-VIEW-PRESENTER                 │
├──────────────────────────────────────────────────┤
│                                                   │
│  MODEL (ScriptableObject / C# class)              │
│  ├── Holds game state, raises change events       │
│  └── No references to UI elements                 │
│                                                   │
│  PRESENTER (MonoBehaviour)                        │
│  ├── Queries view elements in OnEnable            │
│  ├── Subscribes to model changes                  │
│  └── Forwards user input to model/systems         │
│                                                   │
│  VIEW (UXML + USS / Canvas hierarchy)             │
│  ├── Pure layout and style, no game logic         │
│  └── Exposes elements via names/classes            │
└──────────────────────────────────────────────────┘
```

## UGUI Canvas Splitting

| Canvas | Contents | Why Separate |
|--------|----------|-------------|
| Canvas_HUD | Health bar, ammo, minimap | Static except ammo; split dynamic into sub-canvas |
| Canvas_Menus | Pause, inventory, dialog | Hidden most of the time |
| Canvas_WorldSpace | Enemy health bars, prompts | Per-entity, proximity-based |

Rule: Elements that change together share a Canvas. Elements that change at different rates get separate Canvases.

## UGUI Performance Rules

| Problem | Cause | Solution |
|---------|-------|----------|
| Canvas rebuild spikes | Any child element changes | Split into sub-canvases |
| Layout rebuild stutter | Nested LayoutGroups | Avoid nesting > 2 levels |
| Overdraw on mobile | Overlapping transparent images | Reduce layers, sprite packing |
| Raycast on everything | Default Raycast Target on | Disable on non-interactive elements |

## Responsive Design

| Platform | Strategy | Key Consideration |
|----------|----------|-------------------|
| Mobile portrait | Flex column layout | Touch target min 44x44 dp |
| Mobile landscape | Side panels | Safe area insets |
| Desktop | Fixed or scaled | Mouse hover states |
| Console TV | Overscan safe area | Large text, 10-foot UI |
| VR | World-space at 2-3m | No small text, gaze targets |

## Common Pitfalls

### Rebuilding Entire Canvas

Wrong: All HUD elements on one Canvas. Changing any element triggers full rebuild.
Right: Split static and dynamic elements into separate Canvases or sub-canvases.

### Querying UI Elements Every Frame

Wrong: Calling `root.Q<Label>("score")` in Update to set the text.
Right: Cache the reference in OnEnable and reuse it.

### Ignoring Raycast Target

Wrong: Leaving Raycast Target enabled on all Image and Text components.
Right: Disable Raycast Target on every non-interactive element.

### Hardcoded Pixel Sizes

Wrong: Setting font size to 24px and button width to 200px for all platforms.
Right: Use USS relative units, CanvasScaler with reference resolution, or runtime DPI scaling.
