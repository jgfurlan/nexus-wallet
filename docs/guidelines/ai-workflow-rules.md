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

## Linear-GitHub Synchronization & Issue Workflow

Linear/GitHub Issues = source of truth for **project state & requirements**.
GitHub PRs = source of truth for **code**.

### Branch Naming Convention
Every issue must be resolved in a branch prefixed with `spec/`:
`spec/NXS-<id>-<slug>` (e.g., `spec/NXS-2-auth-jwt`)

### GitHub Labels & Issue State Machine
We use GitHub Labels to track issue state:
- **`in-spec`**: The issue's product and technical specifications are being drafted/refined in `docs/specs/NXS-<id>-<slug>/`.
- **`ready-to-implement`**: Specifications are complete and approved by the user. Ready for code implementation.
- **`in-progress`**: The branch code is actively being implemented and tests are being written.
- **`in-review`**: Code implementation is complete. PR has been opened and checks are running.
- **`done`**: PR successfully merged and verified.

> [!IMPORTANT]
> **VERIFICATION GATE REQUIREMENT:**
> Do NOT merge any pull request until the code is fully implemented, verified locally (via lint, typecheck, and tests), and has successfully passed all automated GitHub Actions CI/CD checks.

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
