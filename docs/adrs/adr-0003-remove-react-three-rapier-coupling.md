# ADR-0003: Remove React Three Rapier Coupling

- Status: Accepted
- Date: 2026-02-12

## Context

`@plasius/gpu-physics` initially depended on `@react-three/rapier` as a bridge
layer to speed migration. This kept a direct Three.js runtime dependency in the
physics package, which conflicts with the zero-Three migration target.

## Decision

Replace runtime coupling with framework-neutral bridge components:

- Remove direct dependency on `@react-three/rapier`.
- Keep the public API (`PhysicsRoot`, rigid body components) stable.
- Provide context-based boundary components so consuming renderers can wire any
  physics backend without changing call sites.

## Consequences

- Positive: Package no longer depends directly on Three.js stack.
- Positive: Future backend swaps are isolated from consumer APIs.
- Negative: Adapter behavior is now intentionally minimal until a new runtime
  backend adapter is selected.

## Alternatives Considered

- Keep rapier coupling until a full rewrite: Rejected due to zero-Three target.
- Introduce a new breaking API: Rejected to avoid unnecessary migration churn.
