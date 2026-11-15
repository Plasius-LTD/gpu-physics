# Portable spatial collision reference

Task #39, site Feature #2384 / Story #2416. Host rollout flag:
`arcade.runtime.enabled`, initially disabled; hosts own capability decisions.

The existing package provides React bridges and physics scheduling/snapshot
contracts, but no portable collision implementation. Add a dependency-free
`@plasius/gpu-physics/collision` entry and re-export it from existing entries.
It must run in Node and browser authority without React, DOM, GPU or wall clocks.
Preserve existing exports and use the existing build, test and release tooling.

Provide sphere/sphere, sphere/AABB and AABB/AABB intersection contacts; swept
versions against static shapes over a displacement; and bounded semi-implicit
Euler kinematic integration. Inputs are explicit vectors and shapes. Normals
point from the stationary shape toward the moving shape. Sweeps return the first
normalized time in [0,1], moving centre position and contact, or null. Touching
is contact, including at time zero and at the endpoint. Interior/coincident ties
choose X before Y before Z and the negative box face before its positive face.
Sphere coincidence uses positive X. Inputs are never mutated.

Swept sphere/box must test rounded edges/corners accurately; simply inflating a
box produces false hits. Partition the path at its six possible slab-plane
crossings and solve the squared point-to-box distance on each quadratic segment.
This bounds work independently of speed and avoids discretization/tunnelling.
Use the same geometric core for a point against a Minkowski-expanded box when
sweeping an AABB. There is no unbounded iterative collision solver.

Reject nonfinite/oversized coordinates, invalid bounds/radii and invalid time
steps. Coordinates/displacements/radii are bounded by 1,000,000 units; velocity
by 100,000 units/s; acceleration by 1,000,000 units/s²; step by 0.25s. Reject
integration that leaves those bounds. The game host chooses a fixed step,
resolves multiple contacts and defines response/friction; this is a reference
query library, not a rigid-body world or a replacement for game rules.

Tests are defined first: exact faces/corners/tangency, initial contact, stationary
queries, tunnelling, rounded-corner false positives, ordering, repeatability,
nonmutation, bounds and finite outputs; deterministic sampled-path checks;
browser/root/subpath export and ESM/CJS package parity. Validate all changed JS
in LCOV, >=80% coverage, declarations, lint, build, package/artifact checks and
audits. Document numerical tolerance and host integration limits honestly.
