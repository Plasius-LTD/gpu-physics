# TDR-0001: Authoritative Worker Budget Levels

- Status: Accepted
- Date: 2026-03-13

## Context

The adaptive performance governor needs level-based budgets for worker jobs, but
physics has a stricter requirement than most visual packages: authoritative
simulation cannot drop fidelity simply because the frame budget is tight.

## Decision

Use profile-driven worker manifests with two job classes:

- Authoritative jobs:
  `broadphase`, `narrowphase`, and `solver`
- Degradable jobs:
  `transforms`, `contactVisuals`, `clothAssist`, and `fracturePreview`

Authoritative jobs expose `low`, `medium`, and `high` budget levels, but those
levels vary dispatch headroom rather than simulation cadence or workgroup scale.

Degradable jobs may change cadence, workgroup scale, dispatch count, and queue
depth so the governor has real levers during sustained pressure.

## Implementation Notes

- `gameplay` is the default profile.
- `cinematic` extends the same baseline with cloth-assist and fracture-preview
  jobs.
- All manifests publish `schedulerMode: "dag"` plus priority/dependency data so
  the authoritative stage chain stays explicit.
- Queue classes stay within the shared worker/debug vocabulary:
  `simulation` and `render`.
- All manifests emit `debug` metadata so `@plasius/gpu-debug` can correlate
  queue, dispatch, and allocation samples when the client enables it.

## Consequences

- Positive: authoritative gameplay stays stable while physics-adjacent visual
  work remains budget-aware.
- Positive: physics consumers can use
  `createWorkerJobBudgetAdaptersFromManifest(...)` directly.
- Negative: future authoritative sub-stepping or rollback models may require
  additional manifest dimensions.
