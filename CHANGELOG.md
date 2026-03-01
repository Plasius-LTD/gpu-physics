# Changelog

## 0.1.0 - 2026-02-11

- Initial public release of `@plasius/gpu-physics`.
- Added `PhysicsRoot`, `StaticRigidBody`, `DynamicRigidBody`, and `KinematicRigidBody` bridge components.
- Added baseline tests and migration documentation.

## [Unreleased]

- **Added**
  - `lint`, `typecheck`, and security audit scripts for local and CI enforcement.

- **Changed**
  - CI now fails early on lint/typecheck/runtime dependency audit before build/test.

- **Fixed**
  - Pack-check regex cleanup to remove an unnecessary path escape.

- **Security**
  - Runtime dependency vulnerability checks are now enforced in CI.

## [0.1.1] - 2026-02-28

- **Added**
  - (placeholder)

- **Changed**
  - Removed direct `@react-three/rapier` bridge dependency and switched to framework-neutral physics boundary components.
  - Removed legacy Three.js stack dev dependencies from the package.

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.0] - 2026-02-11

- **Added**
  - Initial release.

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)
[0.1.1]: https://github.com/Plasius-LTD/gpu-physics/releases/tag/v0.1.1
