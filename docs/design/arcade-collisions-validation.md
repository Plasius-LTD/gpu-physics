# Collision reference validation

Task #39, site Feature #2384. Recorded 8 November 2026.

The requirement suite failed before the collision module existed. A separate
long-path/small-radius regression failed against the initial quadratic formula
before the closest-approach solution was introduced. The final suite has 42
passing tests and no skips, including the existing trusted-CI policy tests.

Coverage: 98.81% combined lines, 93.88% branches, 97.67% functions. The new
collision source has 100% lines, 97.72% branches and 96.55% functions. Changed
runtime JS and build configuration are present in LCOV. Strict consumer type
checks exercise the new declarations through root, browser and collision
subpaths, including invalid-shape/vector cases. Source re-exports and built
ESM/CommonJS behavior agree. The test builds from a clean checkout; no prebuilt
artifact is assumed.

On Node 24.18.0, typecheck, lint, build, full tests/coverage and package checks
pass. Full npm audit reports zero vulnerabilities. Runtime dependencies remain
the existing Plasius GPU package. Development-only updates use the inherited
brace-expansion 5.0.12 fix, minimatch 11.0.5 and glob 14.0.4; the latter satisfies
the published patch boundary for
[GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4).
React declarations enable strict consumer checks; no game engine was added.

The branch is based on reviewed CI-hardening PR #38 and preserves its policy.
CI and public-artifact results belong on Task #39 after push. Existing Task #37
blocks publication pending current trusted-publisher and unused-version evidence;
this validation does not authorize CD dispatch, merge of the held prerequisite,
local publishing or a claim that the package has been released.

There is no browser/GPU rendering change in this portable geometry entry.
Cross-device game replay, performance, scene integration and gameplay duration
remain separate acceptance gates for the consuming games.
