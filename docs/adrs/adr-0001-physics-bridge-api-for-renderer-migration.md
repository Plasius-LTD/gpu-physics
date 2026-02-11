# ADR 0001: Physics Bridge API for Renderer Migration

- Status: Accepted
- Date: 2026-02-11

## Context

Renderer code currently needs physics primitives while the broader runtime is migrating to dedicated `@plasius/gpu-*` packages.

## Decision

Expose a stable package boundary in `@plasius/gpu-physics` with `PhysicsRoot` and rigid body bridge components. The first implementation wraps existing runtime primitives so call sites can migrate immediately.

## Consequences

- Positive: Renderer no longer imports legacy physics package APIs directly.
- Positive: Future physics runtime changes are isolated to one package.
- Negative: Initial package version still depends on the legacy physics runtime internally.

## Alternatives Considered

- Keep direct imports in renderer: Rejected because migration progress stalls.
- Rewrite full physics runtime immediately: Rejected because risk and effort are too high for this migration slice.
