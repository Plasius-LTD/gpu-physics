import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));
const packageJson = JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8"));
const browserSource = readFileSync(path.join(repoRoot, "src", "browser.js"), "utf8");
const readme = readFileSync(path.join(repoRoot, "README.md"), "utf8");

test("package exports expose the browser-safe physics entrypoint", () => {
  assert.deepEqual(packageJson.exports["./browser"], {
    types: "./src/browser.d.ts",
    import: "./dist/browser.js",
    require: "./dist/browser.cjs",
  });
});

test("browser-safe physics entrypoint stays free of React imports", () => {
  assert.doesNotMatch(browserSource, /from\s+["']react["']/);
  assert.doesNotMatch(browserSource, /from\s+["'][^"']*react[^"']*["']/);
});

test("readme documents the browser-safe planning subpath", () => {
  assert.match(readme, /@plasius\/gpu-physics\/browser/);
  assert.match(readme, /browser-safe physics planning surface/i);
});
