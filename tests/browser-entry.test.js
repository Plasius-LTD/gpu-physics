import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  createPhysicsSimulationPlan,
  createPhysicsWorldSnapshot,
  defaultPhysicsWorkerProfile,
  getPhysicsWorkerManifest,
  physicsSimulationPlans,
} from "../src/browser.js";

test("browser entry exposes gameplay physics planning without React", () => {
  const plan = createPhysicsSimulationPlan();
  const manifest = getPhysicsWorkerManifest();

  assert.equal(defaultPhysicsWorkerProfile, "gameplay");
  assert.equal(plan.snapshotStageId, "worldSnapshot");
  assert.equal(manifest.profile, "gameplay");
  assert.equal(manifest.jobs.length > 0, true);
  assert.deepEqual(
    physicsSimulationPlans.gameplay.stages.map((stage) => stage.id),
    plan.stageOrder
  );
});

test("browser demo uses the public gpu-shared package surface", () => {
  const demoSource = fs.readFileSync(
    path.resolve(process.cwd(), "demo", "main.js"),
    "utf8"
  );
  const demoHtml = fs.readFileSync(
    path.resolve(process.cwd(), "demo", "index.html"),
    "utf8"
  );

  assert.match(demoSource, /from "@plasius\/gpu-shared"/);
  assert.doesNotMatch(demoSource, /node_modules\/@plasius\/gpu-shared\/dist/);
  assert.match(demoHtml, /<script type="importmap">/);
  assert.match(
    demoHtml,
    /"@plasius\/gpu-shared": "\.\.\/node_modules\/@plasius\/gpu-shared\/dist\/index\.js"/
  );
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
