# Technical Spec: Módulo de Ledger e Auditoria (Ledger Module)

**Consulte `product.md` para ver o comportamento do usuário e as invariantes.**
**Issue:** GH4

---

## 1. Contexto
Os modelos `LedgerEntry` e `Transaction` já estão mapeados no banco de dados. Este módulo cria a camada de serviços contábeis compartilhados (que serão consumidos pelos futuros módulos de Depósito, Saque e Swap) e a rota administrativa de auditoria.

**Arquivos Relacionados:**
- [`apps/api/prisma/schema.prisma`](file:///home/jgfurlan/dev/projects/nexus-wallet/apps/api/prisma/schema.prisma)
- [`apps/api/src/modules/wallet/wallet.service.ts`](file:///home/jgfurlan/dev/projects/nexus-wallet/apps/api/src/modules/wallet/wallet.service.ts)

---

## 2. Mudanças Propostas

### Lógica de Serviços Contábeis (`LedgerService`)

Precisamos expor funções estáticas no `LedgerService` para realizar o débito e o crédito no ledger com controle transacional e concorrência:
```typescript
import { Prisma, LedgerEntryType } from '@prisma/client';
import Decimal from 'decimal.js';

export class LedgerService {
  /**
   * Registra uma entrada contábil no ledger e atualiza o saldo da carteira na mesma transação.
   */
  static async recordEntry(
    tx: Prisma.TransactionClient,
    data: {
      walletId: string;
      token: 'BRL' | 'BTC' | 'ETH';
      type: LedgerEntryType;
      delta: Decimal;
      transactionId?: string;
    }
  ): Promise<any>;
}
```

**Comportamento do `recordEntry`:**
1. Realiza busca com lock (`select ... for update` ou isolamento Serializable via `$transaction`) para ler o saldo atual da carteira (`WalletBalance`) para o `token` e `walletId` especificados.
2. Armazena o saldo atual como `balanceBefore`.
3. Calcula `balanceAfter = balanceBefore + delta`.
4. Atualiza o saldo em `WalletBalance` com o novo valor `balanceAfter`.
5. Insere o registro em `LedgerEntry` com os valores calculados (`delta`, `balanceBefore`, `balanceAfter`, `type`, `transactionId`).

---

### Módulos Modificados / Novos
| Arquivo | Tipo de Alteração | Descrição |
|------|-------------|-------------|
| [`apps/api/src/modules/ledger/ledger.schemas.ts`](file:///home/jgfurlan/dev/projects/nexus-wallet/apps/api/src/modules/ledger/ledger.schemas.ts) | Novo | Definições Zod para resposta de Auditoria |
| [`apps/api/src/modules/ledger/ledger.service.ts`](file:///home/jgfurlan/dev/projects/nexus-wallet/apps/api/src/modules/ledger/ledger.service.ts) | Novo | Implementação do core contábil (`recordEntry` e `auditWallet`) |
| [`apps/api/src/modules/ledger/ledger.routes.ts`](file:///home/jgfurlan/dev/projects/nexus-wallet/apps/api/src/modules/ledger/ledger.routes.ts) | Novo | Registro de rotas privadas Fastify (`GET /admin/audit/:walletId`) |
| [`apps/api/src/app.ts`](file:///home/jgfurlan/dev/projects/nexus-wallet/apps/api/src/app.ts) | Modificado | Registro das rotas do módulo de ledger |

### Contratos e Schemas Zod
```typescript
import { z } from 'zod';

export const AuditItemSchema = z.object({
  token: z.enum(['BRL', 'BTC', 'ETH']),
  storedBalance: z.string(),
  calculatedBalance: z.string(),
  isConsistent: z.boolean(),
});

export const WalletAuditResponseSchema = z.object({
  walletId: z.string(),
  isConsistent: z.boolean(),
  audit: z.array(AuditItemSchema),
});

export type WalletAuditResponse = z.infer<typeof WalletAuditResponseSchema>;
```

---

## 3. Lista de Implementação (Checklist)

- [ ] Criar a pasta do módulo `apps/api/src/modules/ledger/`.
- [ ] Criar testes de integração contendo cenários de inconsistência e contabilidade em `__tests__/ledger.test.ts`.
- [ ] Implementar Zod schemas em `ledger.schemas.ts`.
- [ ] Implementar `LedgerService` em `ledger.service.ts`:
  - `recordEntry`: realiza a movimentação no banco de forma atômica e atualiza o saldo.
  - `auditWallet`: soma todos os deltas do histórico do ledger e compara com `WalletBalance`.
- [ ] Implementar a rota `GET /admin/audit/:walletId` em `ledger.routes.ts` com proteção do `authGuard`.
- [ ] Registrar as rotas no `apps/api/src/app.ts`.
- [ ] Executar os testes locais (`pnpm test`) e validar se a auditoria e as entradas de ledger contábeis funcionam perfeitamente.
- [ ] Executar o linter e typecheck (`pnpm lint && pnpm typecheck`) e verificar conformidade estática.
- [ ] Atualizar o arquivo `progress-tracker.md` na raiz do projeto.

---

## 4. Testes e Validação

| Invariante | Localização do Teste | Método de Verificação |
|-----------------------------|---------------|---------------------|
| Inserção no ledger e cálculo correto de Before/After | `__tests__/ledger.test.ts` | Cria usuário, realiza créditos via `recordEntry` dentro de uma transação Prisma, e valida se `balanceBefore` e `balanceAfter` estão matematicamente corretos no banco. |
| Auditoria bem sucedida (Consistente) | `__tests__/ledger.test.ts` | Realiza múltiplas inserções de crédito/débito via ledger, chama `GET /admin/audit/:walletId` e verifica se retorna `isConsistent: true` com valores batendo. |
| Auditoria malsucedida (Inconsistente) | `__tests__/ledger.test.ts` | Adiciona movimentações de ledger, adultera o saldo de `WalletBalance` diretamente via DB (violando a invariante), chama `GET /admin/audit/:walletId` e valida se retorna `isConsistent: false` para a moeda alterada e para a carteira no geral. |
| Proteção de Rota sem Token | `__tests__/ledger.test.ts` | Chamada sem token para a rota de auditoria deve retornar 401. |
