# ADR-0002: Public Package Governance Baseline

- Status: Accepted
- Date: 2026-02-12

## Context

`@plasius/gpu-physics` is now part of the public `@plasius/gpu-*` package family. We need a consistent governance baseline with `@plasius/schema` so external consumers can rely on documentation and release quality.

## Decision

Apply schema-level package governance in this repo:

- Keep schema-style README badges for release status and policy visibility.
- Record architecture-impacting decisions in ADRs under `docs/adrs`.
- Keep legal and security policy documents current with releases.
- Publish via CI/CD with automated testing and coverage reporting.

## Consequences

- Positive: Unified quality bar across GPU packages.
- Positive: Better external trust and easier package comparison.
- Negative: Documentation upkeep increases for maintainers.

## Alternatives Considered

- Keep governance lightweight for physics only: Rejected due to inconsistent standards.
- Capture governance in issue threads only: Rejected because decisions become hard to track long-term.
