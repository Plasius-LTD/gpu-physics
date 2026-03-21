import test from "node:test";
import assert from "node:assert/strict";

import {
  createPhysicsSimulationPlan,
  createPhysicsWorldSnapshot,
  defaultPhysicsWorkerProfile,
  getPhysicsWorkerManifest,
} from "../src/browser.js";

test("browser entry exposes gameplay physics planning without React", () => {
  const plan = createPhysicsSimulationPlan();
  const manifest = getPhysicsWorkerManifest();

  assert.equal(defaultPhysicsWorkerProfile, "gameplay");
  assert.equal(plan.snapshotStageId, "worldSnapshot");
  assert.equal(manifest.profile, "gameplay");
  assert.equal(manifest.jobs.length > 0, true);
});

test("browser entry creates stable world snapshots", () => {
  const snapshot = createPhysicsWorldSnapshot({
    frameId: "frame-1",
    tick: 1,
    simulationTimeMs: 16.67,
    authoritativeTransformRevision: 3,
    secondarySimulationRevision: 2,
    animationInputRevision: 2,
    bodyCount: 4,
    dynamicBodyCount: 2,
    contactCount: 1,
  });

  assert.equal(snapshot.stage, "worldSnapshot");
  assert.equal(snapshot.profile, "gameplay");
  assert.equal(snapshot.includesSecondarySimulation, true);
  assert.equal(snapshot.bodyCount, 4);
});
