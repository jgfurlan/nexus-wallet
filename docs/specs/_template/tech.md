# Technical Spec: [Feature Name]

**See `product.md` for user-facing behavior and invariants.**
**Issue:** NXS-[id]

---

## 1. Context
*(Describe the current system state. Link to relevant files and line references. What exists today that this change builds on or modifies?)*

**Relevant files:**
- `apps/api/src/modules/<module>/`
- `apps/api/prisma/schema.prisma` — relevant models

---

## 2. Proposed Changes

### Architecture / Data Flow
*(Describe how data flows through the system for this feature. ASCII diagram if helpful.)*

### Modules Touched
| File | Change Type | Description |
|------|-------------|-------------|
| `apps/api/src/modules/X/X.service.ts` | New | Service function |
| `apps/api/src/modules/X/X.routes.ts` | New | Fastify route registration |
| `apps/api/prisma/schema.prisma` | Modified | New model or field |

### New Types / APIs / State
```typescript
// New Zod schema
export const ExampleSchema = z.object({ ... });
export type ExampleDto = z.infer<typeof ExampleSchema>;

// New route
POST /example
```

### Tradeoffs
| Option | Chose | Reason |
|--------|-------|--------|
| Option A | ✅ | Reason |
| Option B | ❌ | Reason |

---

## 3. Implementation Checklist
*(Agent follows this list atomically — one checkbox at a time)*

- [ ] Write failing tests for each invariant in `product.md`
- [ ] Run `pnpm test` — confirm RED
- [ ] Implement Zod schema in `<module>.schemas.ts`
- [ ] Implement service function in `<module>.service.ts`
- [ ] Register Fastify route in `<module>.routes.ts`
- [ ] Add schema migration if DB changes: `pnpm prisma migrate dev`
- [ ] Run `pnpm test` — confirm GREEN
- [ ] Run `pnpm lint && pnpm typecheck` — confirm clean
- [ ] Update `progress-tracker.md`
- [ ] Commit: `feat: [NXS-<id>] <description>`

---

## 4. Testing and Validation

| Invariant (from product.md) | Test Location | Verification Method |
|-----------------------------|---------------|---------------------|
| Happy path | `__tests__/<module>.test.ts` | Supertest integration test |
| Duplicate idempotency key | `__tests__/<module>.test.ts` | Send same key twice, assert 200 + no double credit |
| Insufficient balance | `__tests__/<module>.test.ts` | Assert 422 + `INSUFFICIENT_BALANCE` |

**Manual smoke test steps:**
1. Start server: `pnpm dev`
2. Step 1
3. Step 2
4. Verify expected outcome
