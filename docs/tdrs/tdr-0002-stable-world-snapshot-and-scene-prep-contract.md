# TDR-0002: Stable World Snapshot and Scene-Prep Contract

## Summary

`@plasius/gpu-physics` exports:

- `physicsSimulationStageOrder`
- `createPhysicsSimulationPlan(profile?)`
- `createPhysicsWorldSnapshot(input)`

The worker manifests also add explicit `authoritativeCommit`,
`animationStateInputs`, and `worldSnapshot` stages so visual jobs depend on the
snapshot handoff rather than the solver directly.

## Contract

### Simulation plan

The plan exposes:

- the high-level stage order,
- the stable snapshot stage id,
- the stage ids that count as secondary simulation,
- the per-stage queue class, authority, dependencies, and optional worker job id.

### World snapshot

The world snapshot is a normalized immutable record with:

- `frameId`
- `tick`
- `simulationTimeMs`
- `profile`
- `authoritativeTransformRevision`
- optional `secondarySimulationRevision`
- optional `animationInputRevision`
- optional world counts and metadata

The snapshot stability is always `post-authoritative-commit`.

### Worker manifest routing

- `transforms` and other visual follow-up jobs depend on `worldSnapshot`
- cinematic assistive jobs depend on `authoritativeCommit`
- the snapshot depends on animation inputs and any degradable secondary
  simulation stages that must feed the visual handoff

## Rationale

This keeps authoritative simulation stable while giving scene preparation a
single explicit handoff point.
