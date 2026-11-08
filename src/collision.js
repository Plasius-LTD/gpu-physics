/** Portable CPU collision queries. No scheduling, ambient state or renderer. */
export const collisionLimits = Object.freeze({
  maxCoordinate: 1_000_000,
  maxVelocity: 100_000,
  maxAcceleration: 1_000_000,
  maxStepSeconds: 0.25,
  contactTolerance: 1e-8,
});
const EPSILON = collisionLimits.contactTolerance;

function number(value, limit, label, minimum = -limit) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < minimum || value > limit) {
    throw new RangeError(`${label} must be finite and within [${minimum}, ${limit}].`);
  }
  return value;
}
function vector(value, limit, label) {
  if (!Array.isArray(value) || value.length !== 3) throw new TypeError(`${label} must be a three-component array.`);
  for (let i = 0; i < 3; i++) number(value[i], limit, `${label}[${i}]`);
  return value;
}
function record(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${label} must be a shape or state object.`);
}
function sphere(value) {
  record(value, "sphere");
  vector(value.center, collisionLimits.maxCoordinate, "sphere.center");
  number(value.radius, collisionLimits.maxCoordinate, "sphere.radius", 0);
}
function box(value) {
  record(value, "box");
  vector(value.min, collisionLimits.maxCoordinate, "box.min");
  vector(value.max, collisionLimits.maxCoordinate, "box.max");
  if (value.min.some((x, i) => x > value.max[i])) throw new RangeError("box.min must not exceed box.max.");
}
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const at = (start, displacement, time) => start.map((x, i) => x + displacement[i] * time);
const dot = (a, b) => a.reduce((sum, x, i) => sum + x * b[i], 0);
const centerOf = (value) => value.min.map((x, i) => (x + value.max[i]) / 2);
function path(start, displacement) {
  vector(displacement, collisionLimits.maxCoordinate, "displacement");
  vector(at(start, displacement, 1), collisionLimits.maxCoordinate, "path endpoint");
}

function spheresContact(a, b) {
  const offset = a.center.map((x, i) => x - b.center[i]);
  const distance = Math.sqrt(dot(offset, offset));
  const radius = a.radius + b.radius;
  if (distance > radius + EPSILON) return null;
  const normal = distance > 0 ? offset.map(x => x / distance) : [1, 0, 0];
  return { normal, point: b.center.map((x, i) => x + normal[i] * b.radius), penetration: Math.max(0, radius - distance) };
}

function sphereBoxContact(a, b) {
  const point = a.center.map((x, i) => clamp(x, b.min[i], b.max[i]));
  const offset = a.center.map((x, i) => x - point[i]);
  const distance = Math.sqrt(dot(offset, offset));
  if (distance > a.radius + EPSILON) return null;
  if (distance > 0) return { point, normal: offset.map(x => x / distance), penetration: Math.max(0, a.radius - distance) };

  // Inside the box: choose the nearest exit face; strict comparison fixes ties.
  let depth = Infinity, axis = 0, direction = -1;
  for (let i = 0; i < 3; i++) {
    const lower = a.center[i] - b.min[i], upper = b.max[i] - a.center[i];
    if (lower < depth) { depth = lower; axis = i; direction = -1; }
    if (upper < depth) { depth = upper; axis = i; direction = 1; }
  }
  const normal = [0, 0, 0]; normal[axis] = direction;
  point[axis] = direction < 0 ? b.min[axis] : b.max[axis];
  return { point, normal, penetration: a.radius + depth };
}

function boxesContact(a, b) {
  if (a.min.some((x, i) => x > b.max[i] + EPSILON || a.max[i] < b.min[i] - EPSILON)) return null;
  let depth = Infinity, axis = 0, direction = -1;
  for (let i = 0; i < 3; i++) {
    const lower = a.max[i] - b.min[i], upper = b.max[i] - a.min[i];
    if (lower < depth) { depth = lower; axis = i; direction = -1; }
    if (upper < depth) { depth = upper; axis = i; direction = 1; }
  }
  const normal = [0, 0, 0]; normal[axis] = direction;
  const point = centerOf(a).map((x, i) => clamp(x, b.min[i], b.max[i]));
  point[axis] = direction < 0 ? b.min[axis] : b.max[axis];
  return { normal, point, penetration: Math.max(0, depth) };
}

/** Contact normal points from b toward a; touching counts as contact. */
export function intersectSpheres(a, b) { sphere(a); sphere(b); return spheresContact(a, b); }
export function intersectSphereAabb(a, b) { sphere(a); box(b); return sphereBoxContact(a, b); }
export function intersectAabbs(a, b) { box(a); box(b); return boxesContact(a, b); }

// Solve distance²(t) = radius² around closest approach, avoiding subtraction of
// huge quadratic coefficients when the path is long relative to the radius.
function firstContact(offset, velocity, radius, maximum) {
  const radiusSquared = radius * radius;
  if (dot(offset, offset) <= radiusSquared) return 0;
  const speedSquared = dot(velocity, velocity);
  if (speedSquared === 0) return null;
  const closestTime = -dot(offset, velocity) / speedSquared;
  if (closestTime < 0) return null;
  const closestOffset = at(offset, velocity, closestTime);
  const distanceSquared = dot(closestOffset, closestOffset);
  const remainder = radiusSquared - distanceSquared;
  const roundoff = Number.EPSILON * 8 * (radiusSquared + distanceSquared);
  if (remainder < -roundoff) return null;
  const time = closestTime - Math.sqrt(Math.max(0, remainder) / speedSquared);
  return time < -1e-12 || time > maximum + 1e-12 ? null : clamp(time, 0, maximum);
}
const hit = (contact, time, position, startsInContact) => ({ ...contact, time, position, startsInContact });

/** Sweep a moving sphere over displacement against a stationary sphere. */
export function sweepSphere(moving, displacement, target) {
  sphere(moving); sphere(target); path(moving.center, displacement);
  const initial = spheresContact(moving, target);
  if (initial) return hit(initial, 0, [...moving.center], true);
  const offset = moving.center.map((x, i) => x - target.center[i]);
  const radius = moving.radius + target.radius;
  const time = firstContact(offset, displacement, radius, 1);
  if (time === null) return null;
  const position = at(moving.center, displacement, time);
  const contact = spheresContact({ center: position, radius: moving.radius }, target);
  return contact ? hit(contact, time, position, false) : null;
}

function sweepRoundedBox(moving, displacement, target) {
  const initial = sphereBoxContact(moving, target);
  if (initial) return hit(initial, 0, [...moving.center], true);
  const boundaries = [0, 1];
  for (let axis = 0; axis < 3; axis++) {
    if (displacement[axis] === 0) continue;
    for (const plane of [target.min[axis], target.max[axis]]) {
      const time = (plane - moving.center[axis]) / displacement[axis];
      if (time > 0 && time < 1) boundaries.push(time);
    }
  }
  boundaries.sort((a, b) => a - b);
  for (let segment = 0; segment < boundaries.length - 1; segment++) {
    const start = boundaries[segment], end = boundaries[segment + 1];
    if (end === start) continue;
    const midpoint = at(moving.center, displacement, (start + end) / 2);
    const origin = at(moving.center, displacement, start);
    const offset = [0, 0, 0], velocity = [0, 0, 0];
    for (let axis = 0; axis < 3; axis++) {
      const value = midpoint[axis];
      if (value >= target.min[axis] && value <= target.max[axis]) continue;
      const plane = value < target.min[axis] ? target.min[axis] : target.max[axis];
      offset[axis] = origin[axis] - plane; velocity[axis] = displacement[axis];
    }
    const localTime = firstContact(offset, velocity, moving.radius, end - start);
    if (localTime === null) continue;
    const time = start + localTime, position = at(moving.center, displacement, time);
    const contact = sphereBoxContact({ center: position, radius: moving.radius }, target);
    if (contact) return hit(contact, time, position, false);
  }
  return null;
}

/** Exact rounded-box sweep, including face, edge and corner contacts. */
export function sweepSphereAabb(moving, displacement, target) {
  sphere(moving); box(target); path(moving.center, displacement);
  return sweepRoundedBox(moving, displacement, target);
}

/** Sweep an axis-aligned box; the result position is its centre at contact. */
export function sweepAabb(moving, displacement, target) {
  box(moving); box(target); path(moving.min, displacement); path(moving.max, displacement);
  const center = centerOf(moving), initial = boxesContact(moving, target);
  if (initial) return hit(initial, 0, center, true);
  const half = moving.min.map((x, i) => (moving.max[i] - x) / 2);
  const expanded = { min: target.min.map((x, i) => x - half[i]), max: target.max.map((x, i) => x + half[i]) };
  const result = sweepRoundedBox({ center, radius: 0 }, displacement, expanded);
  if (!result) return null;
  result.point = result.position.map((x, i) => clamp(x - result.normal[i] * half[i], target.min[i], target.max[i]));
  return result;
}

/** One semi-implicit Euler step. Hosts supply a fixed dt and resolve contacts. */
export function integrateKinematic(state, acceleration, deltaSeconds) {
  record(state, "state");
  vector(state.position, collisionLimits.maxCoordinate, "position");
  vector(state.velocity, collisionLimits.maxVelocity, "velocity");
  vector(acceleration, collisionLimits.maxAcceleration, "acceleration");
  number(deltaSeconds, collisionLimits.maxStepSeconds, "deltaSeconds", 0);
  const velocity = at(state.velocity, acceleration, deltaSeconds);
  const position = at(state.position, velocity, deltaSeconds);
  vector(velocity, collisionLimits.maxVelocity, "next velocity");
  vector(position, collisionLimits.maxCoordinate, "next position");
  return { position, velocity };
}
