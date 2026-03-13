import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import {
  DEFAULT_GRAVITY,
  DynamicRigidBody,
  getPhysicsWorkerManifest,
  KinematicRigidBody,
  PhysicsRoot,
  StaticRigidBody,
  defaultPhysicsWorkerProfile,
  physicsDebugOwner,
  physicsWorkerManifests,
  physicsWorkerProfileNames,
  physicsWorkerQueueClasses,
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
  assert.equal(defaultPhysicsWorkerProfile, "gameplay");
  assert.equal(physicsDebugOwner, "physics");
  assert.deepEqual(physicsWorkerQueueClasses, {
    simulation: "simulation",
    render: "render",
  });
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

test("physics worker manifests preserve authoritative jobs for gameplay profile", () => {
  assert.deepEqual(physicsWorkerProfileNames, ["gameplay", "cinematic"]);

  const manifest = getPhysicsWorkerManifest();
  const jobKeys = manifest.jobs.map((job) => job.key);

  assert.equal(manifest.profile, "gameplay");
  assert.equal(manifest.owner, "physics");
  assert.equal(manifest.schedulerMode, "dag");
  assert.deepEqual(jobKeys, [
    "broadphase",
    "narrowphase",
    "solver",
    "transforms",
    "contactVisuals",
  ]);

  const authoritativeJobs = manifest.jobs.filter(
    (job) => job.performance.authority === "authoritative"
  );

  assert.deepEqual(
    authoritativeJobs.map((job) => job.key),
    ["broadphase", "narrowphase", "solver"]
  );

  for (const job of authoritativeJobs) {
    assert.equal(job.worker.queueClass, physicsWorkerQueueClasses.simulation);
    assert.equal(job.debug.owner, physicsDebugOwner);
    assert.equal(job.performance.domain, "physics");
    if (job.key === "broadphase") {
      assert.deepEqual(job.worker.dependencies, []);
    }
    if (job.key === "narrowphase") {
      assert.deepEqual(job.worker.dependencies, ["physics.gameplay.broadphase"]);
    }
    if (job.key === "solver") {
      assert.deepEqual(job.worker.dependencies, ["physics.gameplay.narrowphase"]);
      assert.equal(job.worker.priority, 4);
    }
    for (const level of job.performance.levels) {
      assert.equal(level.config.cadenceDivisor, 1);
      assert.equal(level.config.workgroupScale, 1);
    }
  }
});

test("cinematic physics worker profile adds degradable cloth and fracture jobs", () => {
  const manifest = getPhysicsWorkerManifest("cinematic");
  const clothJob = manifest.jobs.find((job) => job.key === "clothAssist");
  const fractureJob = manifest.jobs.find((job) => job.key === "fracturePreview");
  const transformsJob = manifest.jobs.find((job) => job.key === "transforms");

  assert.ok(clothJob);
  assert.ok(fractureJob);
  assert.ok(transformsJob);

  assert.equal(clothJob.performance.authority, "non-authoritative-simulation");
  assert.equal(clothJob.performance.domain, "cloth");
  assert.equal(fractureJob.performance.authority, "non-authoritative-simulation");
  assert.equal(fractureJob.performance.domain, "geometry");
  assert.equal(transformsJob.performance.authority, "visual");
  assert.equal(transformsJob.worker.queueClass, physicsWorkerQueueClasses.render);
  assert.deepEqual(clothJob.worker.dependencies, ["physics.cinematic.solver"]);
  assert.deepEqual(fractureJob.worker.dependencies, ["physics.cinematic.solver"]);
  assert.equal(
    transformsJob.performance.levels[0].config.cadenceDivisor,
    2
  );
  assert.equal(
    transformsJob.performance.levels[0].config.workgroupScale,
    0.5
  );
  assert.equal(
    transformsJob.performance.levels.at(-1).config.workgroupScale,
    1
  );
});

test("physics worker manifests expose performance-compatible metadata", () => {
  const manifest = physicsWorkerManifests.gameplay;
  const solver = manifest.jobs.find((job) => job.key === "solver");

  assert.ok(solver);
  assert.equal(solver.worker.jobType, "physics.gameplay.solver");
  assert.equal(solver.performance.id, "physics.gameplay.solver");
  assert.equal(
    solver.performance.levels[1].config.metadata.queueClass,
    physicsWorkerQueueClasses.simulation
  );
  assert.equal(
    solver.performance.levels[1].config.metadata.owner,
    physicsDebugOwner
  );
  assert.ok(
    solver.debug.tags.includes("authoritative"),
    "expected authoritative debug tag"
  );
  assert.ok(
    solver.debug.suggestedAllocationIds.includes("physics.gameplay.contacts")
  );
});

test("getPhysicsWorkerManifest rejects unknown profiles", () => {
  assert.throws(
    () => getPhysicsWorkerManifest("invalid"),
    /Unknown physics worker profile "invalid"/
  );
});
