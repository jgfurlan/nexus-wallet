# Technical Spec: Módulo de Saque (Withdrawal)

**Consulte `product.md` para ver o comportamento do usuário e as invariantes.**
**Issue:** GH7

---

## 1. Contexto
Este módulo se baseia na infraestrutura de Ledger e Wallet existente. Ele deve seguir o padrão de transações Serializable para garantir que o saldo debitado seja consistente com as entradas do Ledger.

**Arquivos relevantes:**
- `apps/api/src/modules/withdrawal/` (Novo módulo)
- `apps/api/prisma/schema.prisma` — Modelos `Transaction` e `LedgerEntry`

---

## 2. Proposta de Mudanças

### Arquitetura / Fluxo de Dados
1. `withdrawal.routes.ts` recebe o POST.
2. Validação via Zod (`WithdrawalInputSchema`).
3. `WithdrawalService.withdrawal_request` executa:
    - Início de `$transaction` (Serializable).
    - Verificação de idempotência via `externalId` na tabela `Transaction`.
    - Busca do saldo atual da Wallet.
    - Validação de saldo >= amount.
    - Criação do registro em `Transaction` (type: WITHDRAWAL).
    - Chamada ao `LedgerService.recordEntry` para registrar o débito (delta negativo).
    - Retorno da transação.

### Módulos Tocados
| Arquivo | Tipo | Descrição |
|------|-------------|-------------|
| `apps/api/src/modules/withdrawal/withdrawal.service.ts` | Novo | Lógica de negócio do saque |
| `apps/api/src/modules/withdrawal/withdrawal.routes.ts` | Novo | Registro de rotas Fastify |
| `apps/api/src/modules/withdrawal/withdrawal.schemas.ts` | Novo | Schemas Zod e tipos TS |
| `apps/api/src/app.ts` | Modificado | Registro do novo módulo |

### Novos Tipos / APIs / Estado
```typescript
// apps/api/src/modules/withdrawal/withdrawal.schemas.ts
const PixKeySchema = z.string().min(1).refine((val) => {
  // Regex simples para Email, CPF, Telefone ou UUID (PIX)
  return /.+@.+\..+|^\d{11}$|^\d{13}$|^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(val);
}, { message: 'Chave PIX inválida' });

const CryptoAddressSchema = z.string().min(26).max(62); // Formato básico BTC/ETH

export const WithdrawalInputSchema = z.discriminatedUnion('token', [
  z.object({
    token: z.literal(TokenSymbol.BRL),
    amount: z.string().refine(/* positive decimal */),
    address: PixKeySchema,
    externalId: z.string().uuid(),
  }),
  z.object({
    token: z.literal(TokenSymbol.BTC),
    amount: z.string().refine(/* positive decimal */),
    address: CryptoAddressSchema,
    externalId: z.string().uuid(),
  }),
  z.object({
    token: z.literal(TokenSymbol.ETH),
    amount: z.string().refine(/* positive decimal */),
    address: CryptoAddressSchema,
    externalId: z.string().uuid(),
  }),
]);

// Nova rota
POST /wallet/withdraw
```

---

## 3. Checklist de Implementação

- [ ] Criar `apps/api/src/modules/withdrawal/withdrawal.schemas.ts`
- [ ] Escrever testes de integração falhando em `__tests__/withdrawal.test.ts`
- [ ] Implementar `withdrawal_request` em `withdrawal.service.ts`
- [ ] Implementar rotas em `withdrawal.routes.ts`
- [ ] Registrar o módulo em `apps/api/src/app.ts`
- [ ] Executar `pnpm test` — confirmar GREEN
- [ ] Executar `pnpm lint && pnpm typecheck` — confirmar limpo
- [ ] Atualizar `progress-tracker.md`
- [ ] Commit: `feat: [GH7] implementa módulo de saque com idempotência e ledger`

---

## 4. Testes e Validação

| Invariante (do product.md) | Local do Teste | Método de Verificação |
|-----------------------------|---------------|---------------------|
| Fluxo principal | `__tests__/withdrawal.test.ts` | Supertest integration test |
| Saldo insuficiente | `__tests__/withdrawal.test.ts` | Assert 422 + `INSUFFICIENT_BALANCE` |
| Idempotência | `__tests__/withdrawal.test.ts` | Enviar mesmo externalId, assert 200 + sem débito extra |
| Token inválido | `__tests__/withdrawal.test.ts` | Assert 400 + `ZodError` |
