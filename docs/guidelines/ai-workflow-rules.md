# AI Workflow Rules: Execution Governance

## Core Mandate
One task. One module boundary. One spec. No multi-tasking.

---

## Methodology: Spec-Driven Development

Every change that touches a module boundary, DB schema, API contract, or business logic requires a formal spec **before any code is written**.

### When a Spec is Required vs. Not

| Requires Spec | Does NOT Require Spec |
|---------------|-----------------------|
| New API endpoint | Typo / comment fix |
| Schema migration | Formatting change |
| New module or service | Dependency version bump |
| Business logic change | Log message wording |
| Auth or security change | Test description rename |

### Spec Location
```
docs/specs/NXS-<id>-<slug>/
├── product.md   ← user-facing behavior, invariants, edge cases
└── tech.md      ← implementation plan, modules touched, verification method
```

### The Two-File Contract
- **`product.md`** defines *what* the system does. No implementation details. Written as testable invariants.
- **`tech.md`** defines *how* to build it. References actual file paths. Contains the implementation checklist the agent follows line by line.

Once both files are approved, the agent implements exactly what is written — no improvisation.

---

## Spec Lifecycle

```
[enter_plan_mode] → draft product.md + tech.md
       ↓
[human approval or self-approval if solo]
       ↓
[implementation] → follow tech.md checklist atomically
       ↓
[verification] → pnpm test && pnpm lint && pnpm typecheck
       ↓
[PR opened] → Linear moved to "In Review"
       ↓
[merged] → graphify update . → Linear moved to "Done"
```

---

## Session Governance

### Starting a Session
1. Read `docs/guidelines/progress-tracker.md` — identify the active task.
2. Run `graphify query "active implementation"` to restore context.
3. Read the spec in `docs/specs/NXS-<id>/` for the active task.
4. Do not touch any file outside the spec's **Modules Touched** list.

### Ending a Session
1. Run the verification gate: `pnpm test && pnpm lint && pnpm typecheck`.
2. Update `progress-tracker.md` with current status.
3. Run `graphify update .`.
4. Commit with proper message format.

---

## Linear-GitHub Synchronization

Linear = source of truth for **project state**.
GitHub = source of truth for **code**.

| Event | Action |
|-------|--------|
| Starting work | Branch from `main` as `NXS-<id>-<slug>`; move issue to **In Progress** |
| Opening PR | Move to **In Review**; paste PR URL in Linear comment |
| PR merged | Move to **Done**; run `graphify update .` |
| Milestone complete | Write a Linear project update |

**Commit format:** `<type>: [NXS-<id>] <imperative description>`

```bash
# Examples
feat: [NXS-3] implement JWT refresh token rotation
fix: [NXS-7] prevent duplicate deposit via idempotency key
test: [NXS-5] add ledger audit invariant tests
```

---

## Prohibited Actions

| Prohibited | Why |
|------------|-----|
| Fixing unrelated bugs during a feature branch | Causes spec drift; creates untraceable changes |
| Using `pass`, empty catch, or swallowing errors | Silent failures corrupt ledger state |
| Using `number` for monetary values | Floating-point errors in financial math |
| Hardcoding secrets or API keys | Security invariant |
| Touching generated Prisma client directly | Use the `prisma` singleton in `lib/prisma.ts` |
| Calling CoinGecko directly from a module | Must go through `lib/coingecko.ts` (Delegator pattern) |
