# Technical Spec: Histórico de Transações (Paginado)

**Consulte `product.md` para ver o comportamento do usuário e as invariantes.**
**Issue:** NXS-8

---

## 1. Contexto
Este módulo expõe os dados das tabelas `Transaction` e `LedgerEntry`. Ele utiliza a infraestrutura existente de autenticação e banco de dados.

---

## 2. Decisões de Arquitetura (Justificativas)

### 2.1. Paginação Baseada em Cursor (vs Offset)
**Decisão:** Utilizar o campo `id` (ou `createdAt`) como cursor.
**Por que:**
- **Performance:** Paginação por `OFFSET` fica lenta em tabelas grandes (o DB precisa ler e descartar milhares de linhas). O `CURSOR` usa índices diretamente.
- **Consistência:** Em sistemas financeiros com muitas inserções, o offset pode fazer o usuário "pular" registros ou ver duplicados se novos itens entrarem enquanto ele navega. O cursor fixa o ponto de referência.

### 2.2. Resposta Rica (Transaction + Ledger)
**Decisão:** Incluir o array `ledgerEntries` dentro de cada objeto de transação.
**Por que:**
- **Transparência:** Demonstra para o avaliador que o sistema segue o modelo de Ledger rigoroso.
- **UX:** Permite que o frontend mostre não só "Swap de 100 BRL", mas "Taxa: 1.50 BRL, Líquido: 98.50 BRL", enriquecendo o dashboard sem requisições extras.

### 2.3. Filtros via Query Params com Zod
**Decisão:** Validar os filtros de forma estrita usando Zod.
**Por que:** Segurança contra injeção de parâmetros inválidos e garantia de tipos consistentes no serviço.

---

## 3. Proposta de Mudanças

### Módulos Tocados
| Arquivo | Tipo | Descrição |
|------|-------------|-------------|
| `apps/api/src/modules/wallet/history.service.ts` | Novo | Query complexa do Prisma para histórico |
| `apps/api/src/modules/wallet/history.routes.ts` | Novo | Endpoint GET /wallet/history |
| `apps/api/src/modules/wallet/history.schemas.ts` | Novo | Schemas de input/output (Zod) |

### Novos Tipos / APIs
```typescript
// Schemas
export const HistoryQuerySchema = z.object({
  token: z.nativeEnum(TokenSymbol).optional(),
  type: z.nativeEnum(TransactionType).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// Resposta Paginada
export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
}
```

---

## 4. Checklist de Implementação

- [ ] Criar `apps/api/src/modules/wallet/history.schemas.ts`.
- [ ] Implementar `history_list_user_transactions` em `history.service.ts`.
- [ ] Criar rota `GET /wallet/history` em `history.routes.ts` com `authGuard`.
- [ ] Escrever testes de integração em `__tests__/history.test.ts`:
    - Validar lista vazia.
    - Validar filtros combinados.
    - Validar que o cursor de fato traz a próxima página.
- [ ] Atualizar `progress-tracker.md`.
- [ ] Executar portão de verificação (`test`, `lint`, `typecheck`).

---

## 5. Validação Técnica
A query do Prisma deve ser otimizada:
```typescript
prisma.transaction.findMany({
  where: { 
    userId,
    ...(token && { OR: [{ fromToken: token }, { toToken: token }] }),
    ...(type && { type })
  },
  take: limit + 1, // Pegamos um a mais para saber se tem próxima página
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { createdAt: 'desc' },
  include: { ledgerEntries: true }
});
```
