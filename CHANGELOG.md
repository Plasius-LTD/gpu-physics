# Changelog

## 0.1.0 - 2026-02-11

- Initial public release of `@plasius/gpu-physics`.
- Added `PhysicsRoot`, `StaticRigidBody`, `DynamicRigidBody`, and `KinematicRigidBody` bridge components.
- Added baseline tests and migration documentation.

## [Unreleased]

- **Added**
  - Stable world snapshot exports with a normalized simulation-to-visual handoff
    contract.
  - A browser-safe `@plasius/gpu-physics/browser` entrypoint for planning,
    manifest, and snapshot helpers without React imports.
  - Simulation plan helpers that describe authoritative commit, optional
    secondary simulation, and snapshot routing before visual follow-up work.
  - ADR, TDR, design docs, and tests for the stable world snapshot architecture.
  - A browser-backed 3D physics demo that mounts the shared harbor showcase in
    a physics-focused validation mode.

- **Changed**
  - Physics worker manifests now route visual follow-up work through explicit
    `authoritativeCommit`, `animationStateInputs`, and `worldSnapshot` stages.
  - The browser demo now consumes `@plasius/gpu-shared` as the shared harbor
    runtime instead of importing private viewer files.
  - Package docs now direct users to the browser demo first, while retaining the
    CLI example for quick export checks.

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.8] - 2026-03-14

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.7] - 2026-03-13

- **Added**
  - Added worker-governance manifest exports for `gameplay` and `cinematic`
    physics profiles.
  - Added authoritative vs degradable job metadata compatible with
    `@plasius/gpu-performance` and `@plasius/gpu-debug`.
  - Added ADR, TDR, and design docs for physics worker-budget integration.
  - Added DAG scheduler metadata for authoritative physics stage ordering and
    post-solver visual or assistive follow-up jobs.

- **Changed**
  - Clarified package guidance for worker-first physics scheduling and optional
    debug instrumentation.
  - Documented the authoritative dependency chain that physics manifests publish
    into the shared worker-governance model.
  - Updated GitHub Actions workflows to run JavaScript actions on Node 24,
    refreshed core workflow action versions, and switched Codecov uploads to
    the Codecov CLI.

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.6] - 2026-03-04

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.2] - 2026-03-01

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
[0.1.2]: https://github.com/Plasius-LTD/gpu-physics/releases/tag/v0.1.2
[0.1.6]: https://github.com/Plasius-LTD/gpu-physics/releases/tag/v0.1.6
[0.1.7]: https://github.com/Plasius-LTD/gpu-physics/releases/tag/v0.1.7
[0.1.8]: https://github.com/Plasius-LTD/gpu-physics/releases/tag/v0.1.8
