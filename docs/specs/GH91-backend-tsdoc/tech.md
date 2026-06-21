# Technical Spec: Documentação de Código Backend com JSDoc/TSDoc

**Veja `product.md` para o comportamento esperado pelo usuário e invariantes.**
**Issue:** GH91

---

## 1. Contexto
As classes e middlewares do backend estão em `apps/api/src/modules/` e `apps/api/src/middleware/`. O objetivo é preencher todos esses módulos com TSDoc apropriado.

**Arquivos que receberão comentários:**
- `apps/api/src/modules/auth/auth.service.ts`
- `apps/api/src/modules/wallet/wallet.service.ts`
- `apps/api/src/modules/wallet/history.service.ts`
- `apps/api/src/modules/swap/swap.service.ts`
- `apps/api/src/modules/withdrawal/withdrawal.service.ts`
- `apps/api/src/modules/webhook/deposit.service.ts`
- `apps/api/src/modules/feedback/feedback.service.ts`
- `apps/api/src/modules/test/faucet.routes.ts` (ou a lógica associada)
- `apps/api/src/middleware/auth_guard.ts`

---

## 2. Mudanças Propostas

### Padrão de Comentário a ser Adotado
Adotaremos comentários `/** ... */` multilinha contendo tags TSDoc estruturadas:
- `@class` ou descrição geral do serviço.
- `@param` descrevendo cada parâmetro de entrada.
- `@returns` detalhando o objeto ou Promise de retorno.
- `@throws` listando erros de negócio conhecidos (como `WALLET_NOT_FOUND`, `INSUFFICIENT_BALANCE`, `INVALID_SIGNATURE`).

#### Exemplo nos Serviços Financeiros:
```typescript
/**
 * Processes the deposit webhook within an atomic Serializable transaction.
 * Ensures idempotency by checking if the idempotencyKey has already been processed.
 * 
 * @param input - The deposit webhook payload including userId, token, amount, and idempotencyKey.
 * @returns A promise that resolves to the created transaction and a flag indicating if it was a duplicate.
 * @throws {Error} WALLET_NOT_FOUND if the wallet does not exist for the user.
 * @transactional Requires SERIALIZABLE isolation level to prevent balance update race conditions.
 */
static async deposit_process_webhook(input: DepositWebhookInput) { ... }
```

#### Exemplo em Middlewares:
```typescript
/**
 * Fastify preHandler guard that validates the Bearer JWT token from the Authorization header.
 * Extracts the token payload and attaches it to the request object as `request.user`.
 * 
 * @param request - The Fastify request object.
 * @param reply - The Fastify reply object.
 * @throws {Reply} 401 Unauthorized if the token is missing, expired, or invalid.
 */
export const authGuard = async (request: FastifyRequest, reply: FastifyReply) => { ... }
```

---

## 3. Cronograma de Implementação
*(Executar passo a passo)*

- [ ] Adicionar comentários TSDoc/JSDoc em `auth.service.ts`.
- [ ] Adicionar comentários TSDoc/JSDoc em `wallet.service.ts` e `history.service.ts`.
- [ ] Adicionar comentários TSDoc/JSDoc em `swap.service.ts`.
- [ ] Adicionar comentários TSDoc/JSDoc em `withdrawal.service.ts` e `deposit.service.ts`.
- [ ] Adicionar comentários TSDoc/JSDoc em `feedback.service.ts` e `faucet.routes.ts`.
- [ ] Adicionar comentários TSDoc/JSDoc no middleware `auth_guard.ts`.
- [ ] Validar a build e tipagem rodando: `pnpm typecheck` na raiz e linters.

---

## 4. Testes e Validação
- **TypeScript Typecheck:** Rodar `pnpm typecheck` para garantir que nenhuma sintaxe de comentário causou quebra na análise do compilador.
- **Linter Check:** Garantir que o linter passe sem acusar erros ou avisos adicionais.
