# Physics Worker Governance

## Overview

`@plasius/gpu-physics` now publishes package-owned worker-governance manifests
for adaptive performance and opt-in debug instrumentation.

The design goal is simple:

- keep gameplay-authoritative simulation stable
- let visual and assistive physics work scale with device pressure
- avoid app-specific redefinition of physics job priorities

## Profiles

### `gameplay`

Optimized for core gameplay loops.

- Keeps `broadphase`, `narrowphase`, and `solver` authoritative.
- Allows `transforms` and `contactVisuals` to degrade first.

### `cinematic`

Optimized for higher-end scenes that may include secondary simulation detail.

- Preserves the same authoritative rigid-body baseline.
- Adds degradable `clothAssist` and `fracturePreview` jobs.

## Manifest Shape

Each manifest job publishes three views of the same work unit:

- `worker`
  Runtime-facing job identity and queue class.
- `performance`
  Budget-governor metadata, including authority, importance, and levels.
- `debug`
  Owner, queue class, job type, tags, and suggested allocation identifiers.

This keeps the contract aligned with `@plasius/gpu-performance` and
`@plasius/gpu-debug` without coupling `gpu-physics` to either runtime.

## Budget Policy

Authoritative physics jobs keep:

- `cadenceDivisor = 1`
- `workgroupScale = 1`

across all levels.

That means frame-pressure adaptation can rebalance headroom, queue depth, and
dispatch packaging, but it does not reduce authoritative simulation fidelity.

Visual and assistive jobs may lower cadence and workgroup scale under pressure.

## Debug Policy

`gpu-physics` does not start a debug session by itself.

Clients opt in by creating a `@plasius/gpu-debug` session and sampling queues,
dispatches, frames, and tracked allocations with the metadata exported in the
physics manifests.
