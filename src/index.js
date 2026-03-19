import React from "react";

export const DEFAULT_GRAVITY = Object.freeze([0, -9.81, 0]);

const PhysicsContext = React.createContext({
  gravity: DEFAULT_GRAVITY,
  options: {},
});

const RigidBodyContext = React.createContext({
  type: "fixed",
  colliders: "trimesh",
  options: {},
});

export function PhysicsRoot({ gravity = DEFAULT_GRAVITY, children, ...props }) {
  const value = React.useMemo(
    () => ({
      gravity,
      options: props,
    }),
    [gravity, props]
  );
  return React.createElement(PhysicsContext.Provider, { value }, children);
}

export function StaticRigidBody({
  colliders = "trimesh",
  children,
  ...props
}) {
  const value = React.useMemo(
    () => ({
      type: "fixed",
      colliders,
      options: props,
    }),
    [colliders, props]
  );
  return React.createElement(RigidBodyContext.Provider, { value }, children);
}

export function DynamicRigidBody({ colliders = "hull", children, ...props }) {
  const value = React.useMemo(
    () => ({
      type: "dynamic",
      colliders,
      options: props,
    }),
    [colliders, props]
  );
  return React.createElement(RigidBodyContext.Provider, { value }, children);
}

export function KinematicRigidBody({
  colliders = "hull",
  children,
  ...props
}) {
  const value = React.useMemo(
    () => ({
      type: "kinematicPosition",
      colliders,
      options: props,
    }),
    [colliders, props]
  );
  return React.createElement(RigidBodyContext.Provider, { value }, children);
}

export const physicsDebugOwner = "physics";
export const physicsWorkerQueueClasses = Object.freeze({
  simulation: "simulation",
  render: "render",
});
export const defaultPhysicsWorkerProfile = "gameplay";
export const physicsSimulationStageOrder = Object.freeze([
  "intentResolution",
  "broadphase",
  "narrowphase",
  "solver",
  "authoritativeCommit",
  "secondarySimulation",
  "animationStateInputs",
  "worldSnapshot",
  "visualFollowUp",
]);

function assertIdentifier(name, value) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${name} must be a non-empty string.`);
  }

  return value;
}

function assertNonNegativeInteger(name, value) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be an integer greater than or equal to zero.`);
  }

  return value;
}

function assertNonNegativeNumber(name, value) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be a finite number greater than or equal to zero.`);
  }

  return value;
}

function normalizeMetadata(value) {
  if (value === undefined) {
    return Object.freeze({});
  }

  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("snapshot.metadata must be a plain object when provided.");
  }

  return Object.freeze({ ...value });
}

function buildWorkerBudgetLevels(jobType, queueClass, presets) {
  return Object.freeze([
    Object.freeze({
      id: "low",
      estimatedCostMs: presets.low.estimatedCostMs,
      config: Object.freeze({
        maxDispatchesPerFrame: presets.low.maxDispatchesPerFrame,
        maxJobsPerDispatch: presets.low.maxJobsPerDispatch,
        cadenceDivisor: presets.low.cadenceDivisor,
        workgroupScale: presets.low.workgroupScale,
        maxQueueDepth: presets.low.maxQueueDepth,
        metadata: Object.freeze({
          owner: physicsDebugOwner,
          queueClass,
          jobType,
          quality: "low",
        }),
      }),
    }),
    Object.freeze({
      id: "medium",
      estimatedCostMs: presets.medium.estimatedCostMs,
      config: Object.freeze({
        maxDispatchesPerFrame: presets.medium.maxDispatchesPerFrame,
        maxJobsPerDispatch: presets.medium.maxJobsPerDispatch,
        cadenceDivisor: presets.medium.cadenceDivisor,
        workgroupScale: presets.medium.workgroupScale,
        maxQueueDepth: presets.medium.maxQueueDepth,
        metadata: Object.freeze({
          owner: physicsDebugOwner,
          queueClass,
          jobType,
          quality: "medium",
        }),
      }),
    }),
    Object.freeze({
      id: "high",
      estimatedCostMs: presets.high.estimatedCostMs,
      config: Object.freeze({
        maxDispatchesPerFrame: presets.high.maxDispatchesPerFrame,
        maxJobsPerDispatch: presets.high.maxJobsPerDispatch,
        cadenceDivisor: presets.high.cadenceDivisor,
        workgroupScale: presets.high.workgroupScale,
        maxQueueDepth: presets.high.maxQueueDepth,
        metadata: Object.freeze({
          owner: physicsDebugOwner,
          queueClass,
          jobType,
          quality: "high",
        }),
      }),
    }),
  ]);
}

const physicsWorkerProfileSpecs = {
  gameplay: {
    description:
      "Authoritative gameplay profile that preserves rigid-body stability while scaling visual sync and contact presentation work.",
    suggestedAllocationIds: [
      "physics.gameplay.broadphase.grid",
      "physics.gameplay.contacts",
      "physics.gameplay.transforms",
    ],
    jobs: {
      broadphase: {
        queueClass: physicsWorkerQueueClasses.simulation,
        domain: "physics",
        authority: "authoritative",
        importance: "critical",
        levels: buildWorkerBudgetLevels(
          "physics.gameplay.broadphase",
          physicsWorkerQueueClasses.simulation,
          {
            low: {
              estimatedCostMs: 0.45,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 128,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 512,
            },
            medium: {
              estimatedCostMs: 0.7,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 256,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 768,
            },
            high: {
              estimatedCostMs: 0.95,
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 384,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 1024,
            },
          }
        ),
        suggestedAllocationIds: ["physics.gameplay.broadphase.grid"],
      },
      narrowphase: {
        queueClass: physicsWorkerQueueClasses.simulation,
        domain: "physics",
        authority: "authoritative",
        importance: "critical",
        levels: buildWorkerBudgetLevels(
          "physics.gameplay.narrowphase",
          physicsWorkerQueueClasses.simulation,
          {
            low: {
              estimatedCostMs: 0.65,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 128,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 384,
            },
            medium: {
              estimatedCostMs: 0.95,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 192,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 512,
            },
            high: {
              estimatedCostMs: 1.3,
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 256,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 768,
            },
          }
        ),
        suggestedAllocationIds: ["physics.gameplay.contacts"],
      },
      solver: {
        queueClass: physicsWorkerQueueClasses.simulation,
        domain: "physics",
        authority: "authoritative",
        importance: "critical",
        levels: buildWorkerBudgetLevels(
          "physics.gameplay.solver",
          physicsWorkerQueueClasses.simulation,
          {
            low: {
              estimatedCostMs: 0.9,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 96,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 256,
            },
            medium: {
              estimatedCostMs: 1.3,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 128,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 384,
            },
            high: {
              estimatedCostMs: 1.8,
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 192,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 512,
            },
          }
        ),
        suggestedAllocationIds: ["physics.gameplay.contacts"],
      },
      authoritativeCommit: {
        queueClass: physicsWorkerQueueClasses.simulation,
        domain: "physics",
        authority: "authoritative",
        importance: "critical",
        levels: buildWorkerBudgetLevels(
          "physics.gameplay.authoritativeCommit",
          physicsWorkerQueueClasses.simulation,
          {
            low: {
              estimatedCostMs: 0.2,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 96,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 192,
            },
            medium: {
              estimatedCostMs: 0.35,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 128,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 256,
            },
            high: {
              estimatedCostMs: 0.55,
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 192,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 384,
            },
          }
        ),
        suggestedAllocationIds: ["physics.gameplay.transforms"],
      },
      animationStateInputs: {
        queueClass: physicsWorkerQueueClasses.render,
        domain: "animation",
        authority: "visual",
        importance: "high",
        levels: buildWorkerBudgetLevels(
          "physics.gameplay.animationStateInputs",
          physicsWorkerQueueClasses.render,
          {
            low: {
              estimatedCostMs: 0.15,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 96,
              cadenceDivisor: 2,
              workgroupScale: 0.5,
              maxQueueDepth: 192,
            },
            medium: {
              estimatedCostMs: 0.3,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 160,
              cadenceDivisor: 1,
              workgroupScale: 0.75,
              maxQueueDepth: 256,
            },
            high: {
              estimatedCostMs: 0.5,
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 256,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 384,
            },
          }
        ),
        suggestedAllocationIds: ["physics.gameplay.transforms"],
      },
      worldSnapshot: {
        queueClass: physicsWorkerQueueClasses.render,
        domain: "physics",
        authority: "authoritative",
        importance: "critical",
        levels: buildWorkerBudgetLevels(
          "physics.gameplay.worldSnapshot",
          physicsWorkerQueueClasses.render,
          {
            low: {
              estimatedCostMs: 0.15,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 96,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 192,
            },
            medium: {
              estimatedCostMs: 0.3,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 160,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 256,
            },
            high: {
              estimatedCostMs: 0.45,
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 256,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 384,
            },
          }
        ),
        suggestedAllocationIds: [
          "physics.gameplay.contacts",
          "physics.gameplay.transforms",
        ],
      },
      transforms: {
        queueClass: physicsWorkerQueueClasses.render,
        domain: "animation",
        authority: "visual",
        importance: "high",
        levels: buildWorkerBudgetLevels(
          "physics.gameplay.transforms",
          physicsWorkerQueueClasses.render,
          {
            low: {
              estimatedCostMs: 0.2,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 128,
              cadenceDivisor: 2,
              workgroupScale: 0.5,
              maxQueueDepth: 256,
            },
            medium: {
              estimatedCostMs: 0.45,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 256,
              cadenceDivisor: 1,
              workgroupScale: 0.75,
              maxQueueDepth: 384,
            },
            high: {
              estimatedCostMs: 0.75,
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 384,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 512,
            },
          }
        ),
        suggestedAllocationIds: ["physics.gameplay.transforms"],
      },
      contactVisuals: {
        queueClass: physicsWorkerQueueClasses.render,
        domain: "post-processing",
        authority: "visual",
        importance: "medium",
        levels: buildWorkerBudgetLevels(
          "physics.gameplay.contactVisuals",
          physicsWorkerQueueClasses.render,
          {
            low: {
              estimatedCostMs: 0.15,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 64,
              cadenceDivisor: 4,
              workgroupScale: 0.4,
              maxQueueDepth: 128,
            },
            medium: {
              estimatedCostMs: 0.35,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 128,
              cadenceDivisor: 2,
              workgroupScale: 0.7,
              maxQueueDepth: 192,
            },
            high: {
              estimatedCostMs: 0.55,
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 192,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 256,
            },
          }
        ),
        suggestedAllocationIds: ["physics.gameplay.contacts"],
      },
    },
  },
  cinematic: {
    description:
      "Cinematic profile that keeps authoritative rigid-body work stable while enabling degradable cloth and fracture assistance passes.",
    suggestedAllocationIds: [
      "physics.cinematic.broadphase.grid",
      "physics.cinematic.contacts",
      "physics.cinematic.transforms",
      "physics.cinematic.cloth.state",
      "physics.cinematic.fracture.proxy",
    ],
    jobs: {
      broadphase: {
        queueClass: physicsWorkerQueueClasses.simulation,
        domain: "physics",
        authority: "authoritative",
        importance: "critical",
        levels: buildWorkerBudgetLevels(
          "physics.cinematic.broadphase",
          physicsWorkerQueueClasses.simulation,
          {
            low: {
              estimatedCostMs: 0.5,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 160,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 640,
            },
            medium: {
              estimatedCostMs: 0.8,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 256,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 896,
            },
            high: {
              estimatedCostMs: 1.05,
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 384,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 1152,
            },
          }
        ),
        suggestedAllocationIds: ["physics.cinematic.broadphase.grid"],
      },
      narrowphase: {
        queueClass: physicsWorkerQueueClasses.simulation,
        domain: "physics",
        authority: "authoritative",
        importance: "critical",
        levels: buildWorkerBudgetLevels(
          "physics.cinematic.narrowphase",
          physicsWorkerQueueClasses.simulation,
          {
            low: {
              estimatedCostMs: 0.75,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 160,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 512,
            },
            medium: {
              estimatedCostMs: 1.05,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 224,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 768,
            },
            high: {
              estimatedCostMs: 1.45,
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 320,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 960,
            },
          }
        ),
        suggestedAllocationIds: ["physics.cinematic.contacts"],
      },
      solver: {
        queueClass: physicsWorkerQueueClasses.simulation,
        domain: "physics",
        authority: "authoritative",
        importance: "critical",
        levels: buildWorkerBudgetLevels(
          "physics.cinematic.solver",
          physicsWorkerQueueClasses.simulation,
          {
            low: {
              estimatedCostMs: 1.05,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 128,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 384,
            },
            medium: {
              estimatedCostMs: 1.5,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 192,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 512,
            },
            high: {
              estimatedCostMs: 2.05,
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 256,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 768,
            },
          }
        ),
        suggestedAllocationIds: ["physics.cinematic.contacts"],
      },
      authoritativeCommit: {
        queueClass: physicsWorkerQueueClasses.simulation,
        domain: "physics",
        authority: "authoritative",
        importance: "critical",
        levels: buildWorkerBudgetLevels(
          "physics.cinematic.authoritativeCommit",
          physicsWorkerQueueClasses.simulation,
          {
            low: {
              estimatedCostMs: 0.25,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 96,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 256,
            },
            medium: {
              estimatedCostMs: 0.4,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 160,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 320,
            },
            high: {
              estimatedCostMs: 0.65,
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 224,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 448,
            },
          }
        ),
        suggestedAllocationIds: ["physics.cinematic.transforms"],
      },
      animationStateInputs: {
        queueClass: physicsWorkerQueueClasses.render,
        domain: "animation",
        authority: "visual",
        importance: "high",
        levels: buildWorkerBudgetLevels(
          "physics.cinematic.animationStateInputs",
          physicsWorkerQueueClasses.render,
          {
            low: {
              estimatedCostMs: 0.2,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 128,
              cadenceDivisor: 2,
              workgroupScale: 0.5,
              maxQueueDepth: 256,
            },
            medium: {
              estimatedCostMs: 0.4,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 192,
              cadenceDivisor: 1,
              workgroupScale: 0.75,
              maxQueueDepth: 384,
            },
            high: {
              estimatedCostMs: 0.6,
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 256,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 512,
            },
          }
        ),
        suggestedAllocationIds: ["physics.cinematic.transforms"],
      },
      transforms: {
        queueClass: physicsWorkerQueueClasses.render,
        domain: "animation",
        authority: "visual",
        importance: "high",
        levels: buildWorkerBudgetLevels(
          "physics.cinematic.transforms",
          physicsWorkerQueueClasses.render,
          {
            low: {
              estimatedCostMs: 0.3,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 160,
              cadenceDivisor: 2,
              workgroupScale: 0.5,
              maxQueueDepth: 320,
            },
            medium: {
              estimatedCostMs: 0.6,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 256,
              cadenceDivisor: 1,
              workgroupScale: 0.8,
              maxQueueDepth: 512,
            },
            high: {
              estimatedCostMs: 0.9,
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 384,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 640,
            },
          }
        ),
        suggestedAllocationIds: ["physics.cinematic.transforms"],
      },
      clothAssist: {
        queueClass: physicsWorkerQueueClasses.simulation,
        domain: "cloth",
        authority: "non-authoritative-simulation",
        importance: "medium",
        levels: buildWorkerBudgetLevels(
          "physics.cinematic.clothAssist",
          physicsWorkerQueueClasses.simulation,
          {
            low: {
              estimatedCostMs: 0.35,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 64,
              cadenceDivisor: 3,
              workgroupScale: 0.4,
              maxQueueDepth: 128,
            },
            medium: {
              estimatedCostMs: 0.75,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 128,
              cadenceDivisor: 2,
              workgroupScale: 0.7,
              maxQueueDepth: 256,
            },
            high: {
              estimatedCostMs: 1.2,
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 192,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 384,
            },
          }
        ),
        suggestedAllocationIds: ["physics.cinematic.cloth.state"],
      },
      fracturePreview: {
        queueClass: physicsWorkerQueueClasses.simulation,
        domain: "geometry",
        authority: "non-authoritative-simulation",
        importance: "low",
        levels: buildWorkerBudgetLevels(
          "physics.cinematic.fracturePreview",
          physicsWorkerQueueClasses.simulation,
          {
            low: {
              estimatedCostMs: 0.25,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 32,
              cadenceDivisor: 4,
              workgroupScale: 0.35,
              maxQueueDepth: 96,
            },
            medium: {
              estimatedCostMs: 0.5,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 96,
              cadenceDivisor: 2,
              workgroupScale: 0.65,
              maxQueueDepth: 160,
            },
            high: {
              estimatedCostMs: 0.85,
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 160,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 256,
            },
          }
        ),
        suggestedAllocationIds: ["physics.cinematic.fracture.proxy"],
      },
      worldSnapshot: {
        queueClass: physicsWorkerQueueClasses.render,
        domain: "physics",
        authority: "authoritative",
        importance: "critical",
        levels: buildWorkerBudgetLevels(
          "physics.cinematic.worldSnapshot",
          physicsWorkerQueueClasses.render,
          {
            low: {
              estimatedCostMs: 0.2,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 96,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 192,
            },
            medium: {
              estimatedCostMs: 0.35,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 160,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 320,
            },
            high: {
              estimatedCostMs: 0.5,
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 224,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 448,
            },
          }
        ),
        suggestedAllocationIds: [
          "physics.cinematic.contacts",
          "physics.cinematic.transforms",
          "physics.cinematic.cloth.state",
        ],
      },
      contactVisuals: {
        queueClass: physicsWorkerQueueClasses.render,
        domain: "post-processing",
        authority: "visual",
        importance: "medium",
        levels: buildWorkerBudgetLevels(
          "physics.cinematic.contactVisuals",
          physicsWorkerQueueClasses.render,
          {
            low: {
              estimatedCostMs: 0.2,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 64,
              cadenceDivisor: 4,
              workgroupScale: 0.4,
              maxQueueDepth: 128,
            },
            medium: {
              estimatedCostMs: 0.4,
              maxDispatchesPerFrame: 1,
              maxJobsPerDispatch: 128,
              cadenceDivisor: 2,
              workgroupScale: 0.75,
              maxQueueDepth: 224,
            },
            high: {
              estimatedCostMs: 0.65,
              maxDispatchesPerFrame: 2,
              maxJobsPerDispatch: 224,
              cadenceDivisor: 1,
              workgroupScale: 1,
              maxQueueDepth: 320,
            },
          }
        ),
        suggestedAllocationIds: ["physics.cinematic.contacts"],
      },
    },
  },
};

const physicsWorkerDagSpecs = {
  gameplay: {
    broadphase: { priority: 4, dependencies: [] },
    narrowphase: { priority: 4, dependencies: ["broadphase"] },
    solver: { priority: 4, dependencies: ["narrowphase"] },
    authoritativeCommit: { priority: 4, dependencies: ["solver"] },
    animationStateInputs: { priority: 3, dependencies: ["authoritativeCommit"] },
    worldSnapshot: { priority: 3, dependencies: ["animationStateInputs"] },
    transforms: { priority: 2, dependencies: ["worldSnapshot"] },
    contactVisuals: { priority: 1, dependencies: ["worldSnapshot"] },
  },
  cinematic: {
    broadphase: { priority: 4, dependencies: [] },
    narrowphase: { priority: 4, dependencies: ["broadphase"] },
    solver: { priority: 4, dependencies: ["narrowphase"] },
    authoritativeCommit: { priority: 4, dependencies: ["solver"] },
    animationStateInputs: { priority: 3, dependencies: ["authoritativeCommit"] },
    clothAssist: { priority: 2, dependencies: ["authoritativeCommit"] },
    fracturePreview: { priority: 1, dependencies: ["authoritativeCommit"] },
    worldSnapshot: {
      priority: 3,
      dependencies: [
        "animationStateInputs",
        "clothAssist",
        "fracturePreview",
      ],
    },
    transforms: { priority: 2, dependencies: ["worldSnapshot"] },
    contactVisuals: { priority: 1, dependencies: ["worldSnapshot"] },
  },
};

const physicsSimulationPlanSpecs = Object.freeze({
  gameplay: Object.freeze({
    description:
      "Gameplay simulation plan that hands off a stable post-commit world snapshot to visual preparation.",
    snapshotStageId: "worldSnapshot",
    secondarySimulationStageIds: Object.freeze([]),
    stages: Object.freeze([
      Object.freeze({
        id: "intentResolution",
        phase: "simulation",
        authority: "authoritative",
        dependencies: Object.freeze([]),
        output: "resolved-movement-intents",
      }),
      Object.freeze({
        id: "broadphase",
        phase: "simulation",
        authority: "authoritative",
        queueClass: physicsWorkerQueueClasses.simulation,
        jobType: "physics.gameplay.broadphase",
        dependencies: Object.freeze(["intentResolution"]),
        output: "broadphase-pairs",
      }),
      Object.freeze({
        id: "narrowphase",
        phase: "simulation",
        authority: "authoritative",
        queueClass: physicsWorkerQueueClasses.simulation,
        jobType: "physics.gameplay.narrowphase",
        dependencies: Object.freeze(["broadphase"]),
        output: "contacts",
      }),
      Object.freeze({
        id: "solver",
        phase: "simulation",
        authority: "authoritative",
        queueClass: physicsWorkerQueueClasses.simulation,
        jobType: "physics.gameplay.solver",
        dependencies: Object.freeze(["narrowphase"]),
        output: "resolved-motion",
      }),
      Object.freeze({
        id: "authoritativeCommit",
        phase: "simulation",
        authority: "authoritative",
        queueClass: physicsWorkerQueueClasses.simulation,
        jobType: "physics.gameplay.authoritativeCommit",
        dependencies: Object.freeze(["solver"]),
        output: "committed-authoritative-transforms",
      }),
      Object.freeze({
        id: "animationStateInputs",
        phase: "animation-inputs",
        authority: "visual",
        queueClass: physicsWorkerQueueClasses.render,
        jobType: "physics.gameplay.animationStateInputs",
        dependencies: Object.freeze(["authoritativeCommit"]),
        output: "resolved-animation-inputs",
      }),
      Object.freeze({
        id: "worldSnapshot",
        phase: "handoff",
        authority: "authoritative",
        queueClass: physicsWorkerQueueClasses.render,
        jobType: "physics.gameplay.worldSnapshot",
        dependencies: Object.freeze(["animationStateInputs"]),
        output: "stable-world-snapshot",
      }),
      Object.freeze({
        id: "transforms",
        phase: "visual-follow-up",
        authority: "visual",
        queueClass: physicsWorkerQueueClasses.render,
        jobType: "physics.gameplay.transforms",
        dependencies: Object.freeze(["worldSnapshot"]),
        output: "render-transform-sync",
      }),
      Object.freeze({
        id: "contactVisuals",
        phase: "visual-follow-up",
        authority: "visual",
        queueClass: physicsWorkerQueueClasses.render,
        jobType: "physics.gameplay.contactVisuals",
        dependencies: Object.freeze(["worldSnapshot"]),
        output: "visual-contact-effects",
      }),
    ]),
  }),
  cinematic: Object.freeze({
    description:
      "Cinematic simulation plan that runs degradable secondary simulation before publishing a stable world snapshot.",
    snapshotStageId: "worldSnapshot",
    secondarySimulationStageIds: Object.freeze([
      "clothAssist",
      "fracturePreview",
    ]),
    stages: Object.freeze([
      Object.freeze({
        id: "intentResolution",
        phase: "simulation",
        authority: "authoritative",
        dependencies: Object.freeze([]),
        output: "resolved-movement-intents",
      }),
      Object.freeze({
        id: "broadphase",
        phase: "simulation",
        authority: "authoritative",
        queueClass: physicsWorkerQueueClasses.simulation,
        jobType: "physics.cinematic.broadphase",
        dependencies: Object.freeze(["intentResolution"]),
        output: "broadphase-pairs",
      }),
      Object.freeze({
        id: "narrowphase",
        phase: "simulation",
        authority: "authoritative",
        queueClass: physicsWorkerQueueClasses.simulation,
        jobType: "physics.cinematic.narrowphase",
        dependencies: Object.freeze(["broadphase"]),
        output: "contacts",
      }),
      Object.freeze({
        id: "solver",
        phase: "simulation",
        authority: "authoritative",
        queueClass: physicsWorkerQueueClasses.simulation,
        jobType: "physics.cinematic.solver",
        dependencies: Object.freeze(["narrowphase"]),
        output: "resolved-motion",
      }),
      Object.freeze({
        id: "authoritativeCommit",
        phase: "simulation",
        authority: "authoritative",
        queueClass: physicsWorkerQueueClasses.simulation,
        jobType: "physics.cinematic.authoritativeCommit",
        dependencies: Object.freeze(["solver"]),
        output: "committed-authoritative-transforms",
      }),
      Object.freeze({
        id: "clothAssist",
        phase: "secondary-simulation",
        authority: "non-authoritative-simulation",
        queueClass: physicsWorkerQueueClasses.simulation,
        jobType: "physics.cinematic.clothAssist",
        dependencies: Object.freeze(["authoritativeCommit"]),
        output: "cloth-secondary-state",
      }),
      Object.freeze({
        id: "fracturePreview",
        phase: "secondary-simulation",
        authority: "non-authoritative-simulation",
        queueClass: physicsWorkerQueueClasses.simulation,
        jobType: "physics.cinematic.fracturePreview",
        dependencies: Object.freeze(["authoritativeCommit"]),
        output: "fracture-preview-state",
      }),
      Object.freeze({
        id: "animationStateInputs",
        phase: "animation-inputs",
        authority: "visual",
        queueClass: physicsWorkerQueueClasses.render,
        jobType: "physics.cinematic.animationStateInputs",
        dependencies: Object.freeze(["authoritativeCommit"]),
        output: "resolved-animation-inputs",
      }),
      Object.freeze({
        id: "worldSnapshot",
        phase: "handoff",
        authority: "authoritative",
        queueClass: physicsWorkerQueueClasses.render,
        jobType: "physics.cinematic.worldSnapshot",
        dependencies: Object.freeze([
          "animationStateInputs",
          "clothAssist",
          "fracturePreview",
        ]),
        output: "stable-world-snapshot",
      }),
      Object.freeze({
        id: "transforms",
        phase: "visual-follow-up",
        authority: "visual",
        queueClass: physicsWorkerQueueClasses.render,
        jobType: "physics.cinematic.transforms",
        dependencies: Object.freeze(["worldSnapshot"]),
        output: "render-transform-sync",
      }),
      Object.freeze({
        id: "contactVisuals",
        phase: "visual-follow-up",
        authority: "visual",
        queueClass: physicsWorkerQueueClasses.render,
        jobType: "physics.cinematic.contactVisuals",
        dependencies: Object.freeze(["worldSnapshot"]),
        output: "visual-contact-effects",
      }),
    ]),
  }),
});

function buildPhysicsWorkerManifestJob(profileName, key, spec) {
  const label = `physics.${profileName}.${key}`;
  const dag = physicsWorkerDagSpecs[profileName][key];
  const dependencies = dag.dependencies.map(
    (dependency) => `physics.${profileName}.${dependency}`
  );

  return Object.freeze({
    key,
    label,
    worker: Object.freeze({
      jobType: label,
      queueClass: spec.queueClass,
      priority: dag.priority,
      dependencies: Object.freeze(dependencies),
      schedulerMode: "dag",
    }),
    performance: Object.freeze({
      id: label,
      jobType: label,
      queueClass: spec.queueClass,
      domain: spec.domain,
      authority: spec.authority,
      importance: spec.importance,
      levels: spec.levels,
    }),
    debug: Object.freeze({
      owner: physicsDebugOwner,
      queueClass: spec.queueClass,
      jobType: label,
      tags: Object.freeze([
        "physics",
        profileName,
        key,
        spec.authority,
        spec.domain,
      ]),
      suggestedAllocationIds: Object.freeze([...spec.suggestedAllocationIds]),
    }),
  });
}

function buildPhysicsWorkerManifest(profileName, spec) {
  return Object.freeze({
    schemaVersion: 1,
    owner: physicsDebugOwner,
    profile: profileName,
    schedulerMode: "dag",
    description: spec.description,
    suggestedAllocationIds: Object.freeze([...spec.suggestedAllocationIds]),
    jobs: Object.freeze(
      Object.entries(spec.jobs).map(([key, jobSpec]) =>
        buildPhysicsWorkerManifestJob(profileName, key, jobSpec)
      )
    ),
  });
}

export const physicsWorkerManifests = Object.freeze(
  Object.fromEntries(
    Object.entries(physicsWorkerProfileSpecs).map(([profileName, spec]) => [
      profileName,
      buildPhysicsWorkerManifest(profileName, spec),
    ])
  )
);

export const physicsWorkerProfileNames = Object.freeze(
  Object.keys(physicsWorkerManifests)
);

export function getPhysicsWorkerManifest(
  profile = defaultPhysicsWorkerProfile
) {
  const manifest = physicsWorkerManifests[profile];
  if (!manifest) {
    const available = physicsWorkerProfileNames.join(", ");
    throw new Error(
      `Unknown physics worker profile "${profile}". Available: ${available}.`
    );
  }
  return manifest;
}

export function createPhysicsSimulationPlan(
  profile = defaultPhysicsWorkerProfile
) {
  const plan = physicsSimulationPlanSpecs[profile];
  if (!plan) {
    const available = physicsWorkerProfileNames.join(", ");
    throw new Error(
      `Unknown physics worker profile "${profile}". Available: ${available}.`
    );
  }

  return Object.freeze({
    profile,
    description: plan.description,
    snapshotStageId: plan.snapshotStageId,
    snapshotStability: "post-authoritative-commit",
    stageOrder: Object.freeze(plan.stages.map((stage) => stage.id)),
    secondarySimulationStageIds: plan.secondarySimulationStageIds,
    stages: plan.stages,
  });
}

export function createPhysicsWorldSnapshot(input) {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new Error("snapshot input must be a plain object.");
  }

  const profile = input.profile ?? defaultPhysicsWorkerProfile;
  if (!physicsWorkerManifests[profile]) {
    const available = physicsWorkerProfileNames.join(", ");
    throw new Error(
      `Unknown physics worker profile "${profile}". Available: ${available}.`
    );
  }

  const bodyCount =
    input.bodyCount === undefined
      ? undefined
      : assertNonNegativeInteger("snapshot.bodyCount", input.bodyCount);
  const dynamicBodyCount =
    input.dynamicBodyCount === undefined
      ? undefined
      : assertNonNegativeInteger(
          "snapshot.dynamicBodyCount",
          input.dynamicBodyCount
        );
  const contactCount =
    input.contactCount === undefined
      ? undefined
      : assertNonNegativeInteger("snapshot.contactCount", input.contactCount);

  return Object.freeze({
    schemaVersion: 1,
    stage: "worldSnapshot",
    stability: "post-authoritative-commit",
    profile,
    frameId: assertIdentifier("snapshot.frameId", input.frameId),
    tick: assertNonNegativeInteger("snapshot.tick", input.tick),
    simulationTimeMs: assertNonNegativeNumber(
      "snapshot.simulationTimeMs",
      input.simulationTimeMs
    ),
    authoritativeTransformRevision: assertNonNegativeInteger(
      "snapshot.authoritativeTransformRevision",
      input.authoritativeTransformRevision
    ),
    secondarySimulationRevision:
      input.secondarySimulationRevision === undefined
        ? undefined
        : assertNonNegativeInteger(
            "snapshot.secondarySimulationRevision",
            input.secondarySimulationRevision
          ),
    animationInputRevision:
      input.animationInputRevision === undefined
        ? undefined
        : assertNonNegativeInteger(
            "snapshot.animationInputRevision",
            input.animationInputRevision
          ),
    bodyCount,
    dynamicBodyCount,
    contactCount,
    includesSecondarySimulation: input.secondarySimulationRevision !== undefined,
    metadata: normalizeMetadata(input.metadata),
  });
}
