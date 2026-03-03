---
sidebar_position: 1
---

# Introduction

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

**CameraShaker** is a lightweight, flexible camera-shake library for Roblox. It supports both **roblox-ts** (TypeScript) and **Luau**, giving you procedural shake effects with full control over magnitude, roughness, fade timing, position & rotation influence, and FOV zoom.

---

### Features

- **Plug and play** -> works out of the box with `Workspace.CurrentCamera`, or bring your own callback.
- **One-shot & sustained shakes** -> fire-and-forget impacts or continuous effects like earthquakes and handheld sway.
- **Per-axis influence** -> control how much each axis is affected for position and rotation independently.
- **FOV zoom** -> built-in field-of-view oscillation for extra punch on explosions and heavy impacts.
- **Preset library** -> ready-to-use presets: `LightImpact`, `MediumImpact`, `StrongImpact`, `Explosion`, `Earthquake`, and `Handheld`.
- **Render-step bound** -> updates via `RunService.BindToRenderStep` at a configurable priority.

---

### Quick start

<Tabs groupId="languages">
  <TabItem value="ts" label="TypeScript">
    ```ts
    import { CameraShaker, Presets } from "@rbxts/camerashaker";

    const shaker = new CameraShaker();
    shaker.start();

    // Fire a one-shot explosion shake
    shaker.shake(Presets.Explosion());
    ```
  </TabItem>
  <TabItem value="lua" label="Luau">
    ```lua
    local CameraShakerModule = require(path.to.CameraShaker)
    local CameraShaker = CameraShakerModule.CameraShaker
    local Presets = CameraShakerModule.Presets

    local shaker = CameraShaker.new()
    shaker:start()

    -- Fire a one-shot explosion shake
    shaker:shake(Presets.Explosion())
    ```
  </TabItem>
</Tabs>

---

### How it works

1. **Create** a `CameraShaker` instance (optionally with a custom render priority and callback).
2. **Start** the shaker, it binds to the render loop and begins processing.
3. **Shake** -> add shake instances via `shakeOnce()`, `shakeSustained()`, or `shake()` with a preset.
4. Every frame, the shaker **combines** all active instances into a single offset, rotation, and zoom value, then applies it to the camera (or passes it to your callback).
5. Instances **auto-remove** when they become inactive (configurable via `deleteOnInactive`).
