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

## Demo

`@plasius/gpu-physics` now ships a browser-backed 3D harbor demo instead of only a
CLI export example. The scene uses GLTF ships with collision metadata, exposes
the stable `worldSnapshot` handoff, and keeps cloth, fluid, and lighting as
downstream visual consumers of the resolved physics state.

The shared harbor runtime is now sourced from `@plasius/gpu-shared`, and the
browser-safe physics planning surface is also available as a dedicated subpath:

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
