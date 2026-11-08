# @plasius/gpu-physics

[![npm version](https://img.shields.io/npm/v/@plasius/gpu-physics.svg)](https://www.npmjs.com/package/@plasius/gpu-physics)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Plasius-LTD/gpu-physics/ci.yml?branch=main&label=build&style=flat)](https://github.com/Plasius-LTD/gpu-physics/actions/workflows/ci.yml)
[![coverage](https://img.shields.io/codecov/c/github/Plasius-LTD/gpu-physics)](https://codecov.io/gh/Plasius-LTD/gpu-physics)
[![License](https://img.shields.io/github/license/Plasius-LTD/gpu-physics)](./LICENSE)
[![Code of Conduct](https://img.shields.io/badge/code%20of%20conduct-yes-blue.svg)](./CODE_OF_CONDUCT.md)
[![Security Policy](https://img.shields.io/badge/security%20policy-yes-orange.svg)](./SECURITY.md)
[![Changelog](https://img.shields.io/badge/changelog-md-blue.svg)](./CHANGELOG.md)

Framework-ready physics bridge package for Plasius GPU migration paths.

## Portable collision queries

Use `@plasius/gpu-physics/collision` for pure CPU geometry in Node or a browser,
without importing React or a renderer. The same exports are available from the
root and browser entries. ESM and CommonJS are supported.

```js
import { sweepSphereAabb, integrateKinematic } from '@plasius/gpu-physics/collision';

const contact = sweepSphereAabb(
  { center: [-10, 0, 0], radius: 1 },
  [20, 0, 0],
  { min: [-1, -1, -1], max: [1, 1, 1] },
);
// contact.time === 0.4; contact.position is [-2, 0, 0].
const next = integrateKinematic(
  { position: [0, 0, 0], velocity: [2, 0, 0] },
  [0, -9.81, 0],
  1 / 60,
);
```

`intersectSpheres`, `intersectSphereAabb` and `intersectAabbs` return a contact
or `null`. `sweepSphere`, `sweepSphereAabb` and `sweepAabb` return the first
contact over a displacement against a stationary target: `time` in [0,1],
moving-centre `position`, stationary-surface `point`, outward `normal`,
`penetration` and `startsInContact`. Touching includes endpoints and time zero.
Normals point from the target toward the moving shape. Interior box ties select
X/Y/Z in order, lower face first; coincident spheres select positive X.

`collisionLimits` documents finite input bounds and the 1e-8 contact tolerance.
Coordinates, displacement and radii are at most 1,000,000 units in magnitude;
radii are nonnegative and box minima must not exceed maxima. Path endpoints must
stay in coordinate bounds. Velocity is at most 100,000 units/s, acceleration
1,000,000 units/s² and integration steps 0–0.25 seconds. Invalid input or an
out-of-bounds integrated state throws. Inputs are not mutated. Hosts choose a
fixed step and own contact response, world scheduling and authority.

See [collision design](docs/design/arcade-collisions.md) and
[ADR-0008](docs/adrs/adr-0008-portable-spatial-collision-queries.md).

The package targets Node.js 24 and currently consumes the stable
`@plasius/gpu-shared` 1.x runtime line (`^1.0.12`). Development tooling is
validated against TypeScript 7 and the current ESLint 10 release.

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

## Demo

`@plasius/gpu-physics` now ships a browser-backed 3D harbor demo instead of only a
CLI export example. The scene uses GLTF ships with collision metadata, exposes
the stable `worldSnapshot` handoff, and keeps cloth, fluid, and lighting as
downstream visual consumers of the resolved physics state.

The shared harbor runtime is now sourced from the public
`@plasius/gpu-shared` package surface, and the browser-safe physics planning surface
is also available as a dedicated subpath:

```js
import {
  createPhysicsSimulationPlan,
  createPhysicsWorldSnapshot,
  getPhysicsWorkerManifest,
} from "@plasius/gpu-physics/browser";
```

```bash
npm run demo
```

Open `http://localhost:8000/gpu-physics/demo/` after starting the server.

The original CLI export example remains available at
`demo/example.mjs` when you only need a quick package sanity check.

For static browser demos, prefer the dedicated `@plasius/gpu-physics/browser`
subpath for planning, manifest, and snapshot helpers so consumers avoid any
React-bound surface while still using the published package contract.

## Worker Governance

`@plasius/gpu-physics` now publishes worker-governance manifests so physics
consumers can feed authoritative and degradable jobs into
`@plasius/gpu-performance` without recreating package-local policy.

```ts
import { createWorkerJobBudgetAdaptersFromManifest } from "@plasius/gpu-performance";
import { createGpuDebugSession } from "@plasius/gpu-debug";
import { getPhysicsWorkerManifest } from "@plasius/gpu-physics";

const manifest = getPhysicsWorkerManifest("cinematic");
const debug = createGpuDebugSession({ enabled: true });

const workerBudgetAdapters = createWorkerJobBudgetAdaptersFromManifest(manifest);
const solverJob = manifest.jobs.find((job) => job.key === "solver");

debug.recordQueue({
  owner: manifest.owner,
  queueClass: solverJob.worker.queueClass,
  depth: 4,
  frameId: "frame-128",
});
```

The default `gameplay` profile keeps broadphase, narrowphase, and solver work
authoritative across all budget levels. Visual sync, contact presentation, cloth
assist, and fracture preview jobs remain degradable.

Physics worker manifests also publish `schedulerMode: "dag"` plus stage
priorities and dependencies:

- `broadphase -> narrowphase -> solver`
- visual and assistive jobs unlock after `solver`

This preserves authoritative ordering while still letting downstream packages
scale visual follow-up work under pressure.

## Stable World Snapshots

`@plasius/gpu-physics` now exports a stable simulation-to-visual handoff
contract. Downstream packages should consume the normalized world snapshot
instead of reading raw in-flight solve state.

```js
import {
  createPhysicsSimulationPlan,
  createPhysicsWorldSnapshot,
  physicsSimulationPlans,
} from "@plasius/gpu-physics";

const plan = createPhysicsSimulationPlan("cinematic");
const cinematicContract = physicsSimulationPlans.cinematic;
const snapshot = createPhysicsWorldSnapshot({
  frameId: "frame-240",
  tick: 240,
  simulationTimeMs: 4000,
  authoritativeTransformRevision: 240,
  secondarySimulationRevision: 240,
  animationInputRevision: 240,
  bodyCount: 1824,
});

console.log(plan.snapshotStageId);
console.log(snapshot.stability);
console.log(cinematicContract.secondarySimulationStageIds);
```

`physicsSimulationPlans` exposes the docs-first per-profile scene-preparation
ordering contract directly, while `createPhysicsSimulationPlan(...)` returns the
same normalized shape for a selected profile at runtime.

## Exports

- `DEFAULT_GRAVITY`
- `PhysicsRoot`
- `StaticRigidBody`
- `DynamicRigidBody`
- `KinematicRigidBody`
- `physicsDebugOwner`
- `physicsWorkerQueueClasses`
- `defaultPhysicsWorkerProfile`
- `physicsWorkerManifests`
- `physicsWorkerProfileNames`
- `getPhysicsWorkerManifest(profile?)`
- `physicsSimulationStageOrder`
- `physicsSimulationPlans`
- `createPhysicsSimulationPlan(profile?)`
- `createPhysicsWorldSnapshot(input)`
- `@plasius/gpu-physics/browser`

## Worker Profiles

- `gameplay`: preserves authoritative rigid-body stability and scales visual
  transform sync plus contact presentation.
- `cinematic`: keeps authoritative rigid-body work stable while adding
  degradable cloth-assist and fracture-preview jobs.

## Development Checks

```sh
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npm run pack:check
```

## Architecture Docs

- `docs/adrs/adr-0004-authoritative-worker-budget-manifests.md`
- `docs/adrs/adr-0005-stable-world-snapshot-contract.md`
- `docs/tdrs/tdr-0001-authoritative-worker-budget-levels.md`
- `docs/tdrs/tdr-0002-stable-world-snapshot-and-scene-prep-contract.md`
- `docs/design/physics-worker-governance.md`
- `docs/design/stable-world-snapshot-architecture.md`

## License

Apache-2.0

<!-- BEGIN PLASIUS RELEASE INTEGRITY -->
## Release integrity

CI keeps the administrative contributor registry outside Git and npm package
artifacts using exact, case-normalised path checks. CI runs trusted repository
branch pushes (including `main`) and manual branch
validation on `Public CI - Quarantined` with literal `[self-hosted, Linux, X64]`
labels. Both jobs reject pull requests, fork repositories and tags; there is no
caller-controlled runner selector. Package-manager caching and checkout credential
persistence are disabled. Per-ref concurrency and bounded job timeouts constrain
runner use. A feature branch must have an approved immutable-source admission in
the runner group before it can execute; never widen the group or use hosted CI
as a fallback. See [ADR-0007](docs/adrs/adr-0007-trusted-push-self-hosted-ci.md).
Mandatory coverage and artifact admission do not depend on the remote
`platform.public-artifact-integrity.enabled` distribution flag. Disabling that
flag stops staged distribution, not integrity validation.
Publication uses the GitHub-hosted `production` job with Node 24 and a pinned
npm 11.6.2 client. It is token-free and proceeds only while the prepared SHA
is the exact `main` head after successful push-triggered CI. Do not dispatch CD
until the npm trusted-publisher binding is verified.
<!-- END PLASIUS RELEASE INTEGRITY -->
