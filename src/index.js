import React from "react";
import {
  Physics as RapierPhysics,
  RigidBody as RapierRigidBody,
} from "@react-three/rapier";

export const DEFAULT_GRAVITY = Object.freeze([0, -9.81, 0]);

export function PhysicsRoot({ gravity = DEFAULT_GRAVITY, children, ...props }) {
  return React.createElement(RapierPhysics, { gravity, ...props }, children);
}

export function StaticRigidBody({
  colliders = "trimesh",
  children,
  ...props
}) {
  return React.createElement(
    RapierRigidBody,
    {
      type: "fixed",
      colliders,
      ...props,
    },
    children
  );
}

export function DynamicRigidBody({ colliders = "hull", children, ...props }) {
  return React.createElement(
    RapierRigidBody,
    {
      type: "dynamic",
      colliders,
      ...props,
    },
    children
  );
}

export function KinematicRigidBody({
  colliders = "hull",
  children,
  ...props
}) {
  return React.createElement(
    RapierRigidBody,
    {
      type: "kinematicPosition",
      colliders,
      ...props,
    },
    children
  );
}
