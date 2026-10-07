# ADR 0001: Baseline assessment for crypto-trading-bot

- Status: Accepted for Phase 1 planning baseline
- Date: 2026-10-07
- Owners: maildlmcash (repository owner), engineering lead TBD before implementation
- Reviewers: TBD

## Context

This repository already exists and is a live Vite + React + TypeScript front-end for a crypto trading/market scanner application. The target Phase 1 plan expects a multi-service control platform (`apps/control-web`, `services/control-api`, `services/market-gateway`, `services/scoring`, `services/paper-engine`, `packages/contracts`, `packages/ui`, `data/migrations`, `infra`, `docs/adr`). This repository does not currently match that target map.

We are recording the observed reality first, without assuming a monorepo structure that does not exist. This ADR captures the actual repository shape, runtime, toolchain, evidence, known gaps, and only the proposed next-step boundaries before any Phase 1 implementation work begins.

## Observed repository inventory

At baseline, the repository contains the following top-level files and directories:

- `README.md`
- `index.html`
- `package.json`
- `tsconfig.json`
- `tsconfig.node.json`
- `vite.config.ts`
- `src/`
  - `src/App.tsx`
  - `src/main.tsx`
  - `src/styles.css`
  - `src/data/`
  - `src/pages/`
- `server/`
  - `server/index.ts`
- `.gitignore`

The repo currently presents as a single-app TypeScript front-end with a bundled server-side entry for local/demo backend logic, not a full multi-package monorepo.

## Actual runtime and toolchain

Observed from the current project manifests and repository structure:

- Runtime: Vite-based frontend with React and TypeScript
- Primary app shell: `src/App.tsx`
- Styling: `src/styles.css`
- Entry point: `src/main.tsx`
- Build tool: Vite
- TypeScript config: `tsconfig.json` and `tsconfig.node.json`
- Local dev command from README: `npm install` then `npm run dev -- --host 0.0.0.0 --port 8080`
- Build command from README: `npm run build`
- Observed actual build script in `package.json`: `vite`, TypeScript build, and Vite production build (`tsc -b && vite build`)

### Dependency audit

- A package lockfile was not identified in the baseline repository root listing.
- No workspace manifests (`pnpm-workspace.yaml`, `turbo.json`, `lerna.json`, or `nx.json`) were found in the current repository root.
- No `apps/`, `services/`, or `packages/` tree exists yet in this baseline repo.
- No `data/migrations/` or `infra/` layout is present in the baseline state.

## Build and verification baseline

### Commands currently defined

- `npm install`
- `npm run dev -- --host 0.0.0.0 --port 8080`
- `npm run build`

### Baseline status

This repository is not yet in the target Phase 1 architecture state. It is a single-app, TypeScript-based crypto desk prototype and should not be treated as a verified multi-service control plane.

Observed gaps versus the Phase 1 target map:

- Missing `apps/control-web/` structure
- Missing `services/control-api/` and other service directories
- Missing `packages/contracts/` and `packages/ui/` workspaces
- Missing `docs/adr/` and `docs/architecture/` structure
- Missing `data/migrations/` and `infra/` directories
- No role/tenant model or authorization service yet
- No provider registry/checklist/health dashboards exist in the current tree
- No explicit test runner or test suite is visible in the current root manifest baseline

## Decision

We will keep the current repo as the source of truth and treat it as the starting implementation state, not as a completed Phase 1 platform. The proposed path is:

1. Preserve the current app and runtime while documenting the actual baseline.
2. Adopt the target phase architecture only in a reviewed, explicit migration step.
3. Add the required Phase 1 structures under `docs/adr/`, `docs/architecture/`, and the future app/service/package directories only when the implementation scope is approved.
4. Treat any future security or tenant boundary implementation as requiring explicit proven evidence before enabling live data or production claims.

## Risk and blockers

Known unresolved blockers before moving to Phase 1 implementation:

- Repository structure does not yet match the Phase 1 target map
- No distributed monorepo or workspace tooling is present
- No role/tenant authorization model exists in the current codebase
- No test suite, backend authz service, or provider registry is currently implemented
- No evidence-backed production/live status should be assigned to any data path

## Data labeling

All data in this baseline assessment is labeled as:

- `MOCK` for prototype UI/demo logic
- `REPLAY` for sample or mocked market data flows if introduced later
- `BLOCKED` for any Phase 1 feature that requires a non-existent service boundary or missing evidence

No claim is made that live exchange connections, production balances, or authenticated tenant data are active in this repository.

## Implementation note

This ADR intentionally does not broaden scope into service scaffolding, provider registry, authorization, or UI implementation. The next code work should begin only after this baseline is reviewed and the Phase 1 plan is approved against the actual repo state.

## Acceptance gate for this ADR

This baseline document is acceptable when all of the following are true:

- It matches the repository as actually observed
- It records real commands and real file structure
- It names the mismatch against the target Phase 1 map
- It identifies owners and unresolved blockers
- It avoids fabricated live data claims or unsupported runtime statements

