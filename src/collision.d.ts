export type CollisionVector3 = readonly [number, number, number];
export interface CollisionSphere { readonly center: CollisionVector3; readonly radius: number }
export interface CollisionAabb { readonly min: CollisionVector3; readonly max: CollisionVector3 }
export interface CollisionContact {
  /** Unit normal pointing from the stationary shape toward the moving shape. */
  readonly normal: CollisionVector3;
  /** Contact point on the stationary shape. */
  readonly point: CollisionVector3;
  readonly penetration: number;
}
export interface CollisionSweepHit extends CollisionContact {
  /** Fraction of displacement travelled, in [0, 1]. */
  readonly time: number;
  /** Moving sphere/box centre at first contact. */
  readonly position: CollisionVector3;
  readonly startsInContact: boolean;
}
export interface KinematicState { readonly position: CollisionVector3; readonly velocity: CollisionVector3 }
export const collisionLimits: Readonly<{
  maxCoordinate: 1000000; maxVelocity: 100000; maxAcceleration: 1000000;
  maxStepSeconds: 0.25; contactTolerance: 1e-8;
}>;
/** All queries reject invalid/nonfinite/out-of-bounds inputs. Touching is contact. */
export function intersectSpheres(a: CollisionSphere, b: CollisionSphere): CollisionContact | null;
export function intersectSphereAabb(a: CollisionSphere, b: CollisionAabb): CollisionContact | null;
export function intersectAabbs(a: CollisionAabb, b: CollisionAabb): CollisionContact | null;
export function sweepSphere(moving: CollisionSphere, displacement: CollisionVector3, target: CollisionSphere): CollisionSweepHit | null;
export function sweepSphereAabb(moving: CollisionSphere, displacement: CollisionVector3, target: CollisionAabb): CollisionSweepHit | null;
export function sweepAabb(moving: CollisionAabb, displacement: CollisionVector3, target: CollisionAabb): CollisionSweepHit | null;
/** One semi-implicit Euler step, without mutation. Throws if the result exceeds bounds. */
export function integrateKinematic(state: KinematicState, acceleration: CollisionVector3, deltaSeconds: number): KinematicState;
