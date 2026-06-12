# Code Standards: Agent-Legibility & Compliance

## Agent-Legibility (Mandatory)
The LLM is the primary consumer of this codebase. Optimize for searchability and deterministic discovery.

### 1. Global Uniqueness — `module_action` Naming
Prefix every exported function with its module name to eliminate search ambiguity.

```typescript
// ✅ Correct
export async function auth_register_user(dto: RegisterDto) { ... }
export async function wallet_get_balances(userId: string) { ... }
export async function ledger_append_entry(payload: LedgerEntryPayload) { ... }
export async function swap_quote(from: TokenSymbol, to: TokenSymbol, amount: Decimal) { ... }

// ❌ Wrong — ambiguous, unsearchable
export async function register(dto: RegisterDto) { ... }
export async function getBalances(userId: string) { ... }
```

### 2. Explicit Error Paths
No bare catch-alls. Every `try/catch` must catch a typed error and return a meaningful Fastify error reply.

```typescript
// ✅ Correct
try {
  const user = await prisma.user.findUniqueOrThrow({ where: { id } });
} catch (e) {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
    throw fastify.httpErrors.notFound('User not found');
  }
  throw e; // re-throw unknown errors — never swallow them
}

// ❌ Wrong
try { ... } catch (e) { return null; }
```

### 3. No Magic Strings
Use enums or const maps for every status, token, or config key.

```typescript
// ✅ Correct — TokenSymbol and LedgerEntryType are Prisma enums, import and reuse them
import { TokenSymbol, LedgerEntryType } from '@prisma/client';

// ❌ Wrong
if (entry.type === 'SWAP_FEE') { ... }
```

## Type Compliance
- `any` is **strictly prohibited**. ESLint rule `@typescript-eslint/no-explicit-any` is set to `error`.
- Use Zod schemas for all request validation; infer TypeScript types from Zod: `type RegisterDto = z.infer<typeof RegisterSchema>`.
- Use `Decimal` from `decimal.js` for all monetary arithmetic. Never use `number` or `parseFloat` on amounts.
- All Fastify route handlers must declare `Request` and `Reply` generics.

## RLVR Reward Signals
These four signals define what "good code" means in this project. Agents use them for self-evaluation before submitting any change:

| Signal | What to Check |
|--------|--------------|
| **Correctness** | Does the implementation satisfy every invariant in `product.md`? Do all tests pass? |
| **Legibility** | Are all exported functions prefixed? No `any`? No magic strings? Types inferred from Zod? |
| **Auditability** | Is there a `LedgerEntry` for every balance change? Does the commit message include the Linear issue ID? |
| **Safety** | Are auth guards in place? Is the idempotency key validated before crediting? Are secrets in `.env`, never hardcoded? |

## Linting & Formatting
```json
// .eslintrc — key rules
{
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/no-floating-promises": "error",
  "no-console": ["warn", { "allow": ["error"] }]
}
```
Formatter: `prettier` with default config. Run `pnpm lint` and `pnpm format` before every commit.

## Testing Standards (TDD — RED → GREEN → REFACTOR)

- **RED:** Write a failing test that directly encodes a `product.md` invariant.
- **GREEN:** Implement the minimal code to pass — no gold-plating.
- **REFACTOR:** Clean up naming, extract helpers, remove duplication while staying GREEN.

### Test File Conventions
```
src/modules/auth/__tests__/auth_register_user.test.ts
src/modules/wallet/__tests__/wallet_get_balances.test.ts
src/modules/ledger/__tests__/ledger_append_entry.test.ts
```

### Required Coverage
Every PR must include tests covering:
1. The happy path
2. At least one error path (e.g., insufficient balance, duplicate idempotency key)
3. The relevant RLVR **Correctness** signal

No PR merges without all three.
