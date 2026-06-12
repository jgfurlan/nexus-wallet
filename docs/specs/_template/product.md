# Product Spec: [Feature Name]

**Issue:** NXS-[id] — [Link to Linear Issue]
**Figma/Design:** [Link if applicable, or N/A]

---

## Summary
*(1-2 paragraphs describing the feature from the user's perspective. What does it do? Who benefits?)*

---

## Problem
What is the current behavior and why does it fall short? Who experiences this pain point?

---

## Goals & Non-Goals

**Goals:**
- [ ] Goal 1
- [ ] Goal 2

**Non-Goals:**
- Not in scope: X
- Not in scope: Y

---

## User Experience & Invariants

### Happy Path
1. User does X
2. System responds with Y
3. Ledger entry created for Z *(if balance-affecting)*

### Edge Cases
| Scenario | Expected Behavior |
|----------|------------------|
| Insufficient balance | 422 with `{ error: "INSUFFICIENT_BALANCE" }` |
| Duplicate idempotency key | 200 with original transaction, no new credit |
| Invalid token symbol | 400 with `{ error: "INVALID_TOKEN" }` |
| Unauthenticated request | 401 |

### Constraints
- Must not break existing invariants listed in `architecture.md`
- Must generate ledger entries for every balance mutation

---

## Success Criteria
*(Verifiable outcomes that prove this feature is complete)*

- [ ] All tests in `__tests__/<module>.test.ts` pass
- [ ] RLVR Correctness signal green: every invariant above has a test
- [ ] RLVR Auditability signal green: ledger entries present for all balance changes
- [ ] No regression in existing test suite
