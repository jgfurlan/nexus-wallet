# Technical Spec: Webhook de Depósito (Deposit Webhook)

**Consulte `product.md` para ver o comportamento do usuário e as invariantes.**
**Issue:** GH5

---

## 1. Contexto
A rota `/webhooks/deposit` processará créditos externos na carteira custodial. Por ser um endpoint exposto publicamente, a autenticação por assinatura criptográfica baseada em HMAC SHA256 garante que apenas a adquirente oficial do NexusWallet possa originar depósitos.

**Arquivos Relacionados:**
- [`apps/api/prisma/schema.prisma`](file:///home/jgfurlan/dev/projects/nexus-wallet/apps/api/prisma/schema.prisma) (Modelos `Transaction` e `LedgerEntry`)
- [`apps/api/src/modules/ledger/ledger.service.ts`](file:///home/jgfurlan/dev/projects/nexus-wallet/apps/api/src/modules/ledger/ledger.service.ts) (Lógica do ledger de créditos/débitos)

---

## 2. Mudanças Propostas

### 2.1. Fluxo de Dados e Segurança (HMAC SHA256)

```
[Gateway de Pagamento]
          │ 
          │  POST /webhooks/deposit
          │  Header: X-Webhook-Signature = HMAC-SHA256(RawBody, WEBHOOK_SECRET)
          ▼
   [Fastify Endpoint]
          │
          ├──► 1. Calcula HMAC do payload cru com process.env.WEBHOOK_SECRET
          ├──► 2. Compara as duas hashes em tempo constante (crypto.timingSafeEqual)
          ├──► 3. Se incompatível: lança 401 Unauthorized
          ▼
    [Validação Zod]
          │
          ├──► Valida tipos (walletId, token, amount, idempotencyKey)
          ▼
   [Database Transaction] (Serializable)
          │
          ├──► 1. Busca se a transação com idempotencyKey já existe
          │      ├──► Sim: Retorna a transação original existente (HTTP 200)
          │
          ├──► 2. Executa a inserção da Transaction (tipo DEPOSIT)
          ├──► 3. Executa LedgerService.recordEntry(...)
          │      ├──► Atualiza o saldo do WalletBalance
          │      └──► Insere a LedgerEntry do tipo DEPOSIT
          ▼
     [Resposta API]
  HTTP 201 Created (ou 200 se duplicada)
```

### 2.2. Contratos e Schemas Zod (`deposit.schemas.ts`)
```typescript
import { z } from 'zod';
import { TokenSymbol } from '@prisma/client';

export const DepositWebhookInputSchema = z.object({
  walletId: z.string(),
  token: z.enum([TokenSymbol.BRL, TokenSymbol.BTC, TokenSymbol.ETH]),
  amount: z.string().refine((val) => {
    try {
      const d = new Decimal(val);
      return d.greaterThan(0);
    } catch {
      return false;
    }
  }, { message: 'Amount must be a positive decimal string' }),
  idempotencyKey: z.string().min(1),
});

export type DepositWebhookInput = z.infer<typeof DepositWebhookInputSchema>;
```

### 2.3. Lógica do Webhook Service (`deposit.service.ts`)
```typescript
export class DepositService {
  /**
   * Processa o webhook de depósito com segurança de idempotência e transação atômica.
   */
  static async deposit_process_webhook(input: DepositWebhookInput): Promise<{
    transaction: any;
    isDuplicate: boolean;
  }>;
}
```

**Comportamento detalhado do `deposit_process_webhook`:**
1. Abre uma transação Prisma `$transaction` com nível de isolamento **Serializable**.
2. Consulta se existe uma transação com `idempotencyKey` igual ao informado.
3. Se existir, aborta a transação e sinaliza ao handler para retornar `200 OK` com os dados existentes.
4. Se não existir:
   - Cria o registro de `Transaction` com tipo `DEPOSIT`, `idempotencyKey`, `toToken`, `toAmount` (igual ao amount).
   - Chama `LedgerService.recordEntry` passando a transação Prisma ativa, os dados da carteira, token, tipo `DEPOSIT` e o `delta` correspondente.
   - Retorna a transação criada.

---

## 3. Lista de Implementação (Checklist)

- [ ] Criar a pasta do módulo `apps/api/src/modules/webhook/`.
- [ ] Criar o arquivo de testes de integração em `__tests__/deposit.test.ts`.
- [ ] Implementar Zod schemas em `deposit.schemas.ts`.
- [ ] Implementar a lógica de negócio em `deposit.service.ts` (`deposit_process_webhook`).
- [ ] Implementar o helper de validação de assinatura HMAC em `apps/api/src/lib/crypto.ts` ou diretamente no handler usando `crypto.createHmac`.
- [ ] Criar a rota `POST /webhooks/deposit` em `deposit.routes.ts` (sem `authGuard` corporativo, mas validando a assinatura do webhook).
- [ ] Registrar a rota no arquivo `apps/api/src/app.ts`.
- [ ] Validar a suite completa de testes contendo todas as garantias de integridade e idempotência.

---

## 4. Testes e Validação

| Invariante | Localização do Teste | Método de Verificação |
|-----------------------------|---------------|---------------------|
| Validação de assinatura HMAC | `__tests__/deposit.test.ts` | Chamadas com cabeçalho de assinatura inválido ou ausente devem retornar `401 Unauthorized`. |
| Idempotência funcional | `__tests__/deposit.test.ts` | Envia o mesmo webhook de depósito duas vezes consecutivas. A segunda resposta deve ser HTTP 200 com a mesma transação da primeira chamada, sem duplicar o saldo. |
| Integridade contábil | `__tests__/deposit.test.ts` | Após depósitos válidos, verifica se a carteira possui o saldo esperado e se a auditoria (`LedgerService.auditWallet`) retorna consistente. |
| Parâmetros inválidos | `__tests__/deposit.test.ts` | Envia depósitos com valores negativos, tokens não suportados, e valida que retorna HTTP 400. |
