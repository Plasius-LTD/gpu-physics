import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import {
  DEFAULT_GRAVITY,
  DynamicRigidBody,
  KinematicRigidBody,
  PhysicsRoot,
  StaticRigidBody,
} from "../src/index.js";

function runWithPatchedUseMemo(fn) {
  const originalUseMemo = React.useMemo;
  React.useMemo = (factory) => factory();
  try {
    return fn();
  } finally {
    React.useMemo = originalUseMemo;
  }
}

test("exports physics bridge entrypoints", () => {
  assert.deepEqual(DEFAULT_GRAVITY, [0, -9.81, 0]);
  assert.equal(typeof PhysicsRoot, "function");
  assert.equal(typeof StaticRigidBody, "function");
  assert.equal(typeof DynamicRigidBody, "function");
  assert.equal(typeof KinematicRigidBody, "function");
});

test("PhysicsRoot provides gravity and options through context provider", () =>
  runWithPatchedUseMemo(() => {
    const child = React.createElement("span", null, "child");
    const element = PhysicsRoot({
      gravity: [0, -3.7, 0],
      children: child,
      solver: "substep",
    });

    assert.ok(element);
    assert.deepEqual(element.props.value.gravity, [0, -3.7, 0]);
    assert.deepEqual(element.props.value.options, { solver: "substep" });
    assert.equal(element.props.children, child);
  }));

test("StaticRigidBody uses fixed type and default trimesh colliders", () =>
  runWithPatchedUseMemo(() => {
    const element = StaticRigidBody({
      children: "mesh",
      friction: 0.6,
    });

    assert.equal(element.props.value.type, "fixed");
    assert.equal(element.props.value.colliders, "trimesh");
    assert.deepEqual(element.props.value.options, { friction: 0.6 });
    assert.equal(element.props.children, "mesh");
  }));

test("DynamicRigidBody defaults to hull colliders and forwards options", () =>
  runWithPatchedUseMemo(() => {
    const element = DynamicRigidBody({
      children: "mesh",
      mass: 10,
    });

    assert.equal(element.props.value.type, "dynamic");
    assert.equal(element.props.value.colliders, "hull");
    assert.deepEqual(element.props.value.options, { mass: 10 });
  }));

test("KinematicRigidBody uses kinematicPosition type and supports collider override", () =>
  runWithPatchedUseMemo(() => {
    const element = KinematicRigidBody({
      colliders: "cuboid",
      children: "mesh",
      axisLock: "y",
    });

    assert.equal(element.props.value.type, "kinematicPosition");
    assert.equal(element.props.value.colliders, "cuboid");
    assert.deepEqual(element.props.value.options, { axisLock: "y" });
  }));
