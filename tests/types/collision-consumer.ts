import { sweepSphereAabb, integrateKinematic, type CollisionSweepHit, type KinematicState } from "@plasius/gpu-physics/collision";
import { intersectAabbs } from "@plasius/gpu-physics/browser";
import { intersectSpheres, type CollisionVector3 } from "@plasius/gpu-physics";

const zero: CollisionVector3 = [0, 0, 0];
const state: KinematicState = integrateKinematic({ position: zero, velocity: zero }, zero, 1/60);
const result: CollisionSweepHit | null = sweepSphereAabb({ center: state.position, radius: 1 }, zero, { min: zero, max: zero });
intersectAabbs({ min: zero, max: zero }, { min: zero, max: zero });
intersectSpheres({ center: zero, radius: 1 }, { center: zero, radius: 2 });
if (result) { const time: number = result.time; const normal: CollisionVector3 = result.normal; void time; void normal; }
// @ts-expect-error A collision vector has exactly three components.
integrateKinematic({position:[0,0], velocity:zero}, zero, 1/60);
// @ts-expect-error A box cannot be passed as a sphere.
intersectSpheres({min:zero,max:zero}, {center:zero,radius:1});
