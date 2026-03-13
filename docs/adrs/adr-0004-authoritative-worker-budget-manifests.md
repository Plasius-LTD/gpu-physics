# ADR-0004: Authoritative Worker Budget Manifests

- Status: Accepted
- Date: 2026-03-13

## Context

`@plasius/gpu-performance` now governs quality through worker-job budget
adapters, and `@plasius/gpu-debug` exposes opt-in runtime instrumentation. The
physics package needs to participate in that contract without allowing gameplay
stability to be degraded by frame-pressure decisions.

## Decision

Publish worker-governance manifests directly from `@plasius/gpu-physics`.

- Separate authoritative rigid-body jobs from degradable visual and assistive
  jobs.
- Keep authoritative jobs present across all budget levels with fixed cadence
  and full workgroup scale.
- Publish `schedulerMode: "dag"` with explicit stage dependencies so
  authoritative rigid-body phases remain ordered.
- Mark cloth-assist, fracture-preview, transform sync, and contact visuals as
  degradable work for budget control.
- Keep debug integration metadata opt-in and route analytics/export concerns to
  `@plasius/gpu-debug` and `@plasius/analytics`, not this package.

## Consequences

- Positive: consumers can plug physics governance into
  `@plasius/gpu-performance` with no package-local manifest translation.
- Positive: gameplay-authoritative physics is clearly protected from the first
  wave of adaptive budget changes.
- Positive: downstream packages can preserve broadphase/narrowphase/solver
  ordering without reconstructing the physics graph.
- Positive: future cloth, fluid, or destruction work can extend the same
  manifest contract.
- Negative: the package now owns another public contract surface that must stay
  versioned and documented.

## Alternatives Considered

- Leave worker-governance policy entirely to consuming apps: Rejected because it
  duplicates authoritative-vs-visual decisions in every app.
- Put physics governance into `@plasius/gpu-performance` only: Rejected because
  package-local knowledge about authoritative jobs belongs with physics.
