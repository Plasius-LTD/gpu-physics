import { mountGpuShowcase } from "../node_modules/@plasius/gpu-shared/dist/index.js";

const root = globalThis.document?.getElementById("app");
if (!root) {
  throw new Error("Physics demo root element was not found.");
}

await mountGpuShowcase({
  root,
  focus: "physics",
  packageName: "@plasius/gpu-physics",
  title: "Stable Physics Snapshot Harbor",
  subtitle:
    "3D physics validation scene with GLTF ships, authoritative collisions, stable world snapshots, and downstream cloth, fluid, and lighting context.",
});
