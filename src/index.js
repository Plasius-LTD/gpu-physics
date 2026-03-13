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

function buildPhysicsWorkerManifestJob(profileName, key, spec) {
  const label = `physics.${profileName}.${key}`;

  return Object.freeze({
    key,
    label,
    worker: Object.freeze({
      jobType: label,
      queueClass: spec.queueClass,
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
