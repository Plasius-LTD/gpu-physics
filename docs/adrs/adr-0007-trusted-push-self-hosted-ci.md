# ADR-0007: Trusted Push Self-Hosted CI

- Status: Accepted
- Date: 2026-10-29
- Project: gpu-physics Task28, site Story1626 / Feature1597
- Supersedes: ADR-0006 only for CI scheduling; its hosted publication decision remains.

## Context

Task28 requires approved self-hosted CI and isolation from untrusted fork code.
The existing workflow instead used hosted runners and allowed same-repository
pull requests. Its workflow test encoded that obsolete policy.

## Decision

Run both CI jobs only for trusted repository branch pushes and manual branch
validation. Guard each job by the literal `Plasius-LTD/gpu-physics` repository,
`push` or `workflow_dispatch` event and `branch` ref type. Use the approved
`Public CI - Quarantined` group with literal `[self-hosted, Linux, X64]` labels.
Remove PR triggers; reject `pull_request_target`, forks and tags independently
at each job. There are no runner inputs, hosted fallback or dynamic selectors.

Feature branches require approved immutable-source runner admission. Lock the
reviewed branch before any narrow admission, retain existing group policies,
selected repositories and workflow entries, and remove temporary entries after
validation. A missing admission is an operational blocker, never a reason to
widen runner access or substitute hosted CI.

Disable checkout credential persistence and package-manager caches; bound jobs
by timeouts and per-ref cancellation. Keep source/package admission and the 80%
coverage threshold unconditional. The inherited remote distribution flag
`platform.public-artifact-integrity.enabled` governs staged restoration only;
enabled/disabled/rollback state cannot bypass integrity validation. No product
capability is involved.

Publication remains the existing hosted `main` / `cd.yml` / `production` route,
with exact-SHA successful push CI, phase-isolated immutable tarballs, npm OIDC,
provenance and no long-lived write-token fallback. Verify current publisher and
never-used version admission before enabling or dispatching CD (Task37).

## Alternatives

Hosted CI conflicts with Task28. Same-repository PR execution increases the
runner admission surface unnecessarily. Caller-selected runners and unguarded
manual execution weaken the trusted-source boundary. None is adopted.

## Tests and impact

Workflow regressions evaluate each actual job guard for trusted push/manual
branches and denied same-repository PR, fork PR, privileged PR, fork push and
tag events. Contract checks retain hosted token-free publication, approved
labels, cache/credential isolation and mandatory coverage/artifact gates.
Validate pinned Node24.18.0, frozen lockfile, full tests/coverage, lint/types,
build, audit/tree, package manifests and actionlint. No runtime API or source
changes are required. The baseline full audit exposed brace-expansion5.0.9;
advance only its compatible override/resolution to5.0.12, then repeat validation.

## Release and rollback

Verify actual trusted pushed CI before review/merge. After Task37 admission,
verify merged-main CI and ordinary approved CD, public tarball provenance and
installed consumer checks before Task28 completion. No local publishing.
Rollback disables the affected workflow/distribution channel and removes any
temporary branch admission; it never restores the prohibited administrative
artifact path, PR execution, hosted CI or token-based publication.
