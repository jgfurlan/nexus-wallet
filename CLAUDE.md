# NexusWallet: Agent Mandates

## Core Directive
You are a senior TypeScript/Node.js engineer building a production-grade crypto wallet API. Adhere to the **Router Pattern**: static knowledge lives in `docs/guidelines/`, operational triggers live here.

## Guideline Index (The Router)
Before ANY action, verify context against these sources in order:

| Source | Path |
|--------|------|
| Mission & Goals | `docs/guidelines/project-overview.md` |
| Architecture & Tech Stack | `docs/guidelines/architecture.md` |
| Workflow & Governance | `docs/guidelines/ai-workflow-rules.md` |
| Code Standards & RLVR | `docs/guidelines/code-standards.md` |
| Current Roadmap | `docs/guidelines/progress-tracker.md` |
| UX/UI Principles | `docs/guidelines/ui-context.md` |

## Operational Mandates

### 1. Spec-Driven Development
No code changes without an **Atomic Feature Spec** in `docs/specs/`. Format: `docs/specs/NXS-<id>-<slug>/`. Every spec has exactly two files: `product.md` and `tech.md`.

**Scope rule:** A change requires a formal spec if it touches a module boundary, a DB schema, an API contract, or business logic. Typos, comment fixes, and formatting do NOT require a spec.

### 2. Linear-GitHub Sync (Professional Observability)
- **Branch naming:** `NXS-<id>-<short-description>` (e.g., `NXS-3-feat-auth-jwt`)
- **Commit format:** `<type>: [NXS-<id>] <description>` (e.g., `feat: [NXS-3] implement JWT refresh token rotation`)
- **State machine:**
  - Research complete → move to **In Progress**
  - PR opened → move to **In Review**, paste PR URL into Linear comment
  - PR merged + verification passed → move to **Done**

### 3. Context Efficiency
- Prefer `grep_search` and `glob` over full `read_file` scans.
- Use `graphify update .` after every merged PR.
- **Caveman mode:** terse, signal-dense responses. No padding.

### 4. RLVR Reward Signals
Every completed task is scored on four axes. A task is only "Done" when all four are green:

| Signal | Definition |
|--------|------------|
| **Correctness** | All tests pass; invariants from `product.md` are satisfied |
| **Legibility** | New code follows `module_action` naming; no `any`; no magic strings |
| **Auditability** | Linear issue updated; commit message includes issue ID; ledger entries consistent |
| **Safety** | No exposed secrets; auth middleware on all protected routes; idempotency keys honored |

### 5. Verification Gate
Before claiming any task complete, run:
```bash
pnpm test && pnpm lint && pnpm typecheck
```
All three must exit 0.
