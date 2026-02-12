# @plasius/gpu-physics

[![npm version](https://img.shields.io/npm/v/@plasius/gpu-physics.svg)](https://www.npmjs.com/package/@plasius/gpu-physics)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Plasius-LTD/gpu-physics/ci.yml?branch=main&label=build&style=flat)](https://github.com/Plasius-LTD/gpu-physics/actions/workflows/ci.yml)
[![coverage](https://img.shields.io/codecov/c/github/Plasius-LTD/gpu-physics)](https://codecov.io/gh/Plasius-LTD/gpu-physics)
[![License](https://img.shields.io/github/license/Plasius-LTD/gpu-physics)](./LICENSE)
[![Code of Conduct](https://img.shields.io/badge/code%20of%20conduct-yes-blue.svg)](./CODE_OF_CONDUCT.md)
[![Security Policy](https://img.shields.io/badge/security%20policy-yes-orange.svg)](./SECURITY.md)
[![Changelog](https://img.shields.io/badge/changelog-md-blue.svg)](./CHANGELOG.md)

Framework-ready physics bridge package for Plasius GPU migration paths.

## Why

`@plasius/gpu-physics` provides a stable physics API surface while renderer code migrates away from direct legacy integration points. It is framework-neutral and keeps call sites isolated from any specific scene runtime.

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
