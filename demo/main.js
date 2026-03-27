import { mountGpuShowcase } from "@plasius/gpu-shared";
import {
  createPhysicsSimulationPlan,
  createPhysicsWorldSnapshot,
  defaultPhysicsWorkerProfile,
  getPhysicsWorkerManifest,
} from "../dist/browser.js";

const root = globalThis.document?.getElementById("app");
if (!root) {
  throw new Error("Physics demo root element was not found.");
}

function createState() {
  return {
    profile: defaultPhysicsWorkerProfile,
  };
}

function updateState(state, scene) {
  state.profile = scene.stress ? "cinematic" : defaultPhysicsWorkerProfile;
  return state;
}

function describeState(state, scene) {
  const manifest = getPhysicsWorkerManifest(state.profile);
  const plan = createPhysicsSimulationPlan(state.profile);
  const snapshot = createPhysicsWorldSnapshot({
    frameId: `physics-demo-${scene.frame}`,
    tick: scene.frame,
    simulationTimeMs: Number((scene.time * 1000).toFixed(2)),
    profile: state.profile,
    authoritativeTransformRevision: scene.frame,
    secondarySimulationRevision: scene.frame,
    animationInputRevision: scene.frame,
    bodyCount: scene.ships.length + 2,
    dynamicBodyCount: scene.ships.length,
    contactCount: scene.collisions,
    metadata: {
      collisionCount: scene.collisionCount,
      snapshotStageId: plan.snapshotStageId,
      rigidBodyShape: scene.shipPhysics?.shape ?? "box",
      rigidBodyMassKg: scene.shipPhysics?.mass ?? null,
    },
  });

  const authoritativeJobs = manifest.jobs.filter(
    (job) => job.worker.authority === "authoritative"
  ).length;
  const visualJobs = manifest.jobs.filter(
    (job) => job.worker.authority === "visual"
  ).length;
  const heavyHullMass = typeof scene.shipPhysics?.mass === "number" ? scene.shipPhysics.mass : 0;

  return {
    status: `Physics live · ${state.profile} profile · ${snapshot.contactCount ?? 0} active contacts`,
    details:
      `Stable world snapshots are emitted from ${plan.snapshotStageId} after the authoritative solver, while the heavier hull carries more momentum through the shared moonlit harbor collision loop.`,
    sceneMetrics: [
      `profile: ${state.profile}`,
      `ships: ${scene.ships.length} rigid bodies`,
      `active contacts: ${snapshot.contactCount ?? 0}`,
      `total collisions: ${scene.collisionCount}`,
      `hull shape: ${scene.shipPhysics?.shape ?? "box"}`,
    ],
    qualityMetrics: [
      `worker jobs: ${manifest.jobs.length}`,
      `authoritative jobs: ${authoritativeJobs}`,
      `visual follow-up jobs: ${visualJobs}`,
      `snapshot stage: ${plan.snapshotStageId}`,
      `secondary stages: ${plan.secondarySimulationStageIds.length}`,
    ],
    debugMetrics: [
      `stage order: ${plan.stageOrder.length}`,
      `tracked allocations: ${manifest.suggestedAllocationIds.length}`,
      `snapshot stability: ${snapshot.stability}`,
      `secondary simulation: ${snapshot.includesSecondarySimulation ? "included" : "omitted"}`,
      `base hull mass: ${heavyHullMass > 0 ? `${(heavyHullMass / 1000).toFixed(1)} t` : "unknown"}`,
    ],
    notes: [
      "gpu-physics now owns real demo state here instead of only wrapping the shared harbor runtime.",
      "The moonlit scene is still shared, but the worker manifest, simulation plan, and world snapshot all come from gpu-physics public APIs.",
      "Stress mode switches to the cinematic profile so secondary simulation and visual follow-up stages expand without breaking authoritative collision order.",
    ],
    textState: {
      profile: state.profile,
      manifestJobTypes: manifest.jobs.map((job) => job.worker.jobType),
      snapshot,
      stageOrder: plan.stageOrder,
    },
    visuals: {
      waveAmplitude: state.profile === "cinematic" ? 0.82 : 0.7,
      flagMotion: state.profile === "cinematic" ? 0.62 : 0.52,
      reflectionStrength: scene.collisions > 0 ? 0.26 : 0.16,
      shadowAccent: scene.collisions > 0 ? 0.11 : 0.07,
      lanternReflectionStrength: state.profile === "cinematic" ? 0.58 : 0.44,
      ambientMist:
        state.profile === "cinematic"
          ? "rgba(67, 83, 124, 0.22)"
          : "rgba(41, 63, 97, 0.16)",
      moonHalo:
        state.profile === "cinematic"
          ? "rgba(190, 205, 255, 0.3)"
          : "rgba(160, 184, 238, 0.22)",
      waterNear: scene.collisions > 0 ? { r: 0.11, g: 0.28, b: 0.39 } : { r: 0.08, g: 0.24, b: 0.34 },
      waterFar: { r: 0.18, g: 0.36, b: 0.49 },
      collisionFlash: "rgba(255, 202, 146, 0.18)",
    },
  };
}

await mountGpuShowcase({
  root,
  focus: "physics",
  packageName: "@plasius/gpu-physics",
  title: "Stable Physics Snapshot Harbor",
  subtitle:
    "Moonlit physics validation with GLTF ships, mass-aware collisions, stable world snapshots, and downstream cloth, fluid, and lighting context.",
  createState,
  updateState,
  describeState,
});
