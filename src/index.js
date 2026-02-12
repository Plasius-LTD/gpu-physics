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
