# Shadow Army Full-Stack Skill Testing Monorepo

Comprehensive monorepo fixture (`BE` + `FE` + `API Docs` + `DB/ETL` + `Doc Generator` + `Consulting` + `Workshop` + `Local SSO SDK`) designed to evaluate all **52 Shadow Army skills** and **78 improvement criteria** across live AI coding agents (**Antigravity, Claude Code, Codex, Gemini CLI**).

## Repository Map

| Path | Purpose | Primary Skills & Improvement IDs Tested |
| --- | --- | --- |
| `apps/backend/` | Strict-TS Express + `node:sqlite` service (RBAC/tenant isolation, checkout idempotency & rounding, search ACL + erasure tombstones, SSE revocation, HTTP 202 async export, plus deliberate seeded bug fixtures for debug/UAT/security scenarios) | `shadow-api`, `shadow-auth`, `shadow-concurrency`, `shadow-debug`, `shadow-integrate`, `shadow-privacy`, `shadow-realtime`, `shadow-resilience`, `shadow-search`, `shadow-sec`, `shadow-test`, `shadow-uat` (`C06`, `E03`, `E04`, `E08`, `T06`, `T15`, `T19`, `T20`, `T22`, `T23`) |
| `apps/frontend/` | Strict-TS React + Vite Ops Console (Anti-Slop compliant UI, HTTP 202 async job state, accessible form/modal vs deliberate broken-a11y legacy fixture, SSO/401 recovery) | `antislop*`, `shadow-accessibility`, `shadow-browser`, `shadow-design` (`C01`, `C04`, `C08`, `D10`, `D11`, `D12`, `E11`) |
| `fixtures/api-docs-readme-only/` | Service with ONLY an API summary in `README.md` (no OpenAPI/Postman/Bruno) | `T09`, `shadow-api` (MUST ask format choice before writing files) |
| `fixtures/api-docs-bruno/` | Existing Bruno `.bru` collection | `shadow-api` (MUST preserve Bruno, never invent Postman) |
| `fixtures/api-docs-openapi-modular/` | Existing modular OpenAPI 3.1 with `$ref` fragments | `shadow-api` (MUST preserve modular fragments) |
| `fixtures/db-etl-sqlite/` | SQLite DDL/seed with high-precision decimals, two NULLs, ISO timestamps, composite PK | `C12`, `shadow-db`, `shadow-data` |
| `fixtures/doc-local-generator/` | Existing repo-local Python doc generator (`build_doc.py`) | `C15`, `E14`, `shadow-doc` (MUST reuse local generator) |
| `fixtures/consulting-data/` | Dated FinOps invoice, GRC POJK/PADK/ISO register, PMO CR dispute, Presales Perpres 46/2025 KAK | `T02`, `T04`, `E07`, `shadow-finops`, `shadow-grc`, `shadow-pmo`, `shadow-presales`, `shadow-ea` |
| `fixtures/workshop-polls/` | Timeout-retry poll snapshot + page-2 prompt injection moderation fixture | `D16`, `E12`, `shadow-design` |
| `fixtures/sdk/ridhuan-sso-client/` | Internal local SSO SDK (`file:../fixtures/sdk/ridhuan-sso-client`) | Official-First Dependency Policy, `shadow-auth` |
| `testing-scenarios/` | Master Scenario Book, 16 copy-paste scenario prompts, and Post-Task Agent Audit Prompt for `PASS` / `ALMOST PASS` / `FAIL` grading | All 52 skills & cross-host parity (`X01`–`X08`, `E01`–`E15`) |

## Quickstart

```bash
npm install
npm run typecheck
npm test
npm run build
```

Run backend & frontend locally for live UI/API testing:

```bash
npm run dev:be   # http://localhost:4000
npm run dev:fe   # http://localhost:5173
```

## How to Run Full Skill Evaluation

1. Pick a scenario from [`testing-scenarios/MASTER-SCENARIO-BOOK.md`](testing-scenarios/MASTER-SCENARIO-BOOK.md) (or open `testing-scenarios/prompts/01-...` through `16-...`).
2. Paste the **Scenario Prompt** into the AI agent you want to evaluate (Claude Code, Codex, Gemini CLI, or Antigravity) inside a clean branch/copy of this repo.
3. Once the agent finishes, paste the **Post-Task Agent Audit Prompt** from [`testing-scenarios/POST-TASK-AGENT-AUDIT-PROMPT.md`](testing-scenarios/POST-TASK-AGENT-AUDIT-PROMPT.md) in the same session.
4. Send the agent's audit report back to the **Shadow Army Reviewer** to grade every scenario as **`PASS`**, **`ALMOST PASS`**, or **`FAIL`** and pinpoint exact skill/script improvements.
