import type { ReactNode, ReactElement } from "react";

export type Vec3 = [number, number, number];
export type PhysicsWorkerQueueClass = "simulation" | "render";
export type PhysicsWorkerAuthority =
  | "authoritative"
  | "non-authoritative-simulation"
  | "visual";
export type PhysicsWorkerImportance = "low" | "medium" | "high" | "critical";
export type PhysicsWorkerProfile = "gameplay" | "cinematic";

export const DEFAULT_GRAVITY: Readonly<Vec3>;

export interface PhysicsRootProps {
  gravity?: Vec3;
  children?: ReactNode;
  [key: string]: unknown;
}

export interface RigidBodyBridgeProps {
  colliders?: string | false;
  children?: ReactNode;
  [key: string]: unknown;
}

export interface PhysicsWorkerBudgetLevelConfig {
  readonly maxDispatchesPerFrame: number;
  readonly maxJobsPerDispatch: number;
  readonly cadenceDivisor: number;
  readonly workgroupScale: number;
  readonly maxQueueDepth: number;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface PhysicsWorkerBudgetLevel {
  readonly id: "low" | "medium" | "high";
  readonly estimatedCostMs: number;
  readonly config: PhysicsWorkerBudgetLevelConfig;
}

export interface PhysicsWorkerJobManifest {
  readonly key: string;
  readonly label: string;
  readonly worker: Readonly<{
    jobType: string;
    queueClass: PhysicsWorkerQueueClass;
  }>;
  readonly performance: Readonly<{
    id: string;
    jobType: string;
    queueClass: PhysicsWorkerQueueClass;
    domain: string;
    authority: PhysicsWorkerAuthority;
    importance: PhysicsWorkerImportance;
    levels: readonly PhysicsWorkerBudgetLevel[];
  }>;
  readonly debug: Readonly<{
    owner: string;
    queueClass: PhysicsWorkerQueueClass;
    jobType: string;
    tags: readonly string[];
    suggestedAllocationIds: readonly string[];
  }>;
}

export interface PhysicsWorkerManifest {
  readonly schemaVersion: 1;
  readonly owner: string;
  readonly profile: PhysicsWorkerProfile;
  readonly description: string;
  readonly suggestedAllocationIds: readonly string[];
  readonly jobs: readonly PhysicsWorkerJobManifest[];
}

export function PhysicsRoot(props: PhysicsRootProps): ReactElement;
export function StaticRigidBody(props: RigidBodyBridgeProps): ReactElement;
export function DynamicRigidBody(props: RigidBodyBridgeProps): ReactElement;
export function KinematicRigidBody(props: RigidBodyBridgeProps): ReactElement;
export const physicsDebugOwner: "physics";
export const physicsWorkerQueueClasses: Readonly<{
  simulation: "simulation";
  render: "render";
}>;
export const defaultPhysicsWorkerProfile: "gameplay";
export const physicsWorkerManifests: Readonly<
  Record<PhysicsWorkerProfile, PhysicsWorkerManifest>
>;
export const physicsWorkerProfileNames: readonly PhysicsWorkerProfile[];
export function getPhysicsWorkerManifest(
  profile?: PhysicsWorkerProfile
): PhysicsWorkerManifest;
