import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_GRAVITY,
  DynamicRigidBody,
  KinematicRigidBody,
  PhysicsRoot,
  StaticRigidBody,
} from "../src/index.js";

test("exports physics bridge entrypoints", () => {
  assert.deepEqual(DEFAULT_GRAVITY, [0, -9.81, 0]);
  assert.equal(typeof PhysicsRoot, "function");
  assert.equal(typeof StaticRigidBody, "function");
  assert.equal(typeof DynamicRigidBody, "function");
  assert.equal(typeof KinematicRigidBody, "function");
});
