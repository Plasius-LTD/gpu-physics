# ADR-0008: Portable spatial collision queries

- Status: Accepted
- Date: 2026-11-08
- Work: Task #39, site Feature #2384 / Story #2416
- Host rollout flag: `arcade.runtime.enabled` (initially disabled)

## Context and decision

The physics package owns simulation contracts but lacks reusable deterministic
collision queries for spatial games. Existing scene showcase collisions are
scene-specific. Add a pure CPU reference here rather than a third-party engine
or duplicate game-specific geometry. Export `collision` independently of React
and re-export it from the existing root/browser surfaces without removing APIs.

Explicit sphere/AABB queries and bounded kinematic steps work on browser and
server hosts. Sweep against exact rounded-box faces/edges/corners using at most
seven piecewise quadratic segments. Solve near closest approach to retain
precision for long paths and tiny colliders. Absolute contact tolerance is
1e-8 units; normalized sweep bounds tolerate 1e-12 rounding. Initial touching
returns time zero and deterministic tie normals. No clocks, random state,
renderer, network or I/O is part of the collision entry.

## Consequences

Hosts supply a fixed time step and resolve contact response, multiple colliders,
moving-target relative motion, scoring and authority. These functions are not a
rigid-body solver and do not qualify cross-device gameplay, GPU performance or
ten-hour game content. Validation bounds inputs and integrated state; contact
points can lie on a shape surface beyond its centre's coordinate bound.

Node requirement, published Plasius dependencies and package release boundary
stay intact. The host evaluates its remote flag and capabilities. No environment
override, route, public exposure or saved-state deletion is introduced.

## Validation and delivery

Requirement tests failed before source existed. Geometry and sampled-path tests
cover tunnelling, boundaries, tangency, corner false positives, precision,
finite/bounded state, repeatability and nonmutation. Consumer tests exercise
source re-exports, built ESM/CJS subpaths and strict TypeScript declarations.
Source must appear in LCOV and meet the existing 80% gate.

This change depends on the reviewed trusted-CI transition in PR #38; retain its
release hold #37 until the npm maintainer verifies current publisher and an
unused version. Do not enable CD, use hosted CI as a fallback, publish locally or
claim release completion while that prerequisite is open.
