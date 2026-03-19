# ADR-0005: Stable World Snapshot Contract

- Status: Accepted
- Date: 2026-03-19

## Context

The ray-tracing-first renderer architecture depends on a stable handoff between
authoritative simulation and visual scene preparation. `@plasius/gpu-physics`
already exposes authoritative worker manifests, but it did not yet publish a
formal contract for the post-solve snapshot that downstream visual systems
consume.

Without that contract, secondary simulation and scene-preparation packages have
to infer when physics output is stable enough to use, which weakens ordering and
debug visibility.

## Decision

`@plasius/gpu-physics` will publish a stable world snapshot contract with three
parts:

1. a formal simulation plan describing the post-solve ordering,
2. a normalized world snapshot value object,
3. worker-manifest dependencies that route visual follow-up work through the
   snapshot stage instead of reading directly from the solver stage.

The stable snapshot is defined as post-authoritative-commit state. Visual
systems may consume it, and degradable secondary simulation may contribute to
the snapshot before scene-preparation work continues.

## Consequences

- Downstream packages can integrate against a single stable snapshot contract.
- Physics manifests now model the simulation-to-visual handoff explicitly.
- Debug and performance tooling can reason about snapshot age and handoff timing
  without package-local conventions.
