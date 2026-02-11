import type { ReactNode, ReactElement } from "react";

export type Vec3 = [number, number, number];

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

export function PhysicsRoot(props: PhysicsRootProps): ReactElement;
export function StaticRigidBody(props: RigidBodyBridgeProps): ReactElement;
export function DynamicRigidBody(props: RigidBodyBridgeProps): ReactElement;
export function KinematicRigidBody(props: RigidBodyBridgeProps): ReactElement;
