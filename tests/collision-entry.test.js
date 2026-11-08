import test, { before } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import * as collision from "../src/collision.js";
import * as browser from "../src/browser.js";
import * as root from "../src/index.js";

// Build from source, so this test also works in a clean checkout with no dist.
before(() => execFileSync("npm", ["run", "build"], { encoding: "utf8", timeout: 60_000 }));
test("existing entrypoints expose additive collision queries", () => {
  for (const name of Object.keys(collision)) {
    assert.equal(browser[name], collision[name]); assert.equal(root[name], collision[name]);
  }
});
test("published collision subpath works in ESM and CJS without browser globals", async () => {
  const esm = await import("@plasius/gpu-physics/collision");
  const cjs = createRequire(import.meta.url)("@plasius/gpu-physics/collision");
  assert.deepEqual(Object.keys(esm).sort(), Object.keys(collision).sort());
  assert.deepEqual(Object.keys(cjs).sort(), Object.keys(collision).sort());
  for (const api of [esm, cjs]) {
    const result = api.sweepSphereAabb({ center: [-10,0,0], radius: 1 }, [20,0,0], { min: [-1,-1,-1], max: [1,1,1] });
    assert.equal(result.time,.4); assert.deepEqual(result.position,[-2,0,0]);
    assert.equal(typeof api.integrateKinematic,"function");
  }
});
