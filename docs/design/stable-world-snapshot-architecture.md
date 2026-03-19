# Stable World Snapshot Architecture

`@plasius/gpu-physics` now treats the simulation-to-visual handoff as a first
class package concern.

## Ordering

The exported simulation plan follows this shape:

1. intent resolution
2. broadphase
3. narrowphase
4. solver
5. authoritative commit
6. degradable secondary simulation where present
7. animation state input resolution
8. stable world snapshot
9. visual follow-up work such as transform sync and contact visuals

## Snapshot semantics

The snapshot is not raw in-flight simulation data. It is the stable state that
downstream visual systems should consume for:

- scene preparation
- secondary visual simulation integration
- render-side animation input selection
- debug and performance handoff telemetry

## Worker integration

The package worker manifests now express this handoff directly by inserting the
snapshot stage into the DAG and routing visual jobs through it.
