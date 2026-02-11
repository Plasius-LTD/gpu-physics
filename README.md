# @plasius/gpu-physics

Framework-ready physics bridge package for Plasius GPU migration paths.

## Why

`@plasius/gpu-physics` provides a stable physics API surface while renderer code migrates away from direct legacy integration points. It currently wraps proven runtime primitives and keeps call sites isolated.

## Install

```bash
npm install @plasius/gpu-physics
```

## Usage

```tsx
import { PhysicsRoot, StaticRigidBody } from "@plasius/gpu-physics";

<PhysicsRoot gravity={[0, -9.81, 0]}>
  <StaticRigidBody colliders="trimesh">
    {/* scene mesh */}
  </StaticRigidBody>
</PhysicsRoot>
```

## Exports

- `DEFAULT_GRAVITY`
- `PhysicsRoot`
- `StaticRigidBody`
- `DynamicRigidBody`
- `KinematicRigidBody`

## License

Apache-2.0
