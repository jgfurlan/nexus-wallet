# Technical Spec: Redesenho do Faucet de Depósito para Valores e Moedas Customizados

**Veja `product.md` para o comportamento esperado pelo usuário e invariantes.**
**Issue:** GH82

---

## 1. Contexto
- A rota [`faucet.routes.ts`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/api/src/modules/test/faucet.routes.ts) atualmente ignora qualquer payload de requisição e executa um depósito fixo (`1000` de `BRL`).
- O frontend [`DepositDrawer.tsx`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/web/src/components/drawers/DepositDrawer.tsx) é apenas informativo e envia uma requisição `POST` vazia para a rota.

---

## 2. Mudanças Propostas

### Mudanças nos Módulos

| Arquivo | Tipo de Alteração | Descrição |
|------|-------------|-------------|
| [`apps/api/src/modules/test/faucet.routes.ts`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/api/src/modules/test/faucet.routes.ts) | Modificado | Adicionar validação de corpo com `FaucetInputSchema` via Fastify/Zod. Modificar a lógica para usar os valores vindos do body com fallbacks (defaults) se vazios. |
| [`apps/api/src/modules/test/__tests__/faucet.test.ts`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/api/src/modules/test/__tests__/faucet.test.ts) | [NEW] | Testes de integração para validar depósitos de Faucet para BRL, BTC, ETH com valores customizados e validações de input. |
| [`apps/web/src/components/drawers/DepositDrawer.tsx`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/web/src/components/drawers/DepositDrawer.tsx) | Modificado | Redesenhar o Drawer para usar formulário com `react-hook-form` e `zod`. Permitir selecionar token e valor customizado. Enviar os dados no body da requisição `POST`. |

### Novo Schema e Rota de API (faucet.routes.ts)
```typescript
import { TokenSymbol } from '@prisma/client';

export const FaucetInputSchema = z.object({
  amount: z.string().refine(
    (val) => {
      try {
        const d = new Decimal(val);
        return d.greaterThan(0);
      } catch {
        return false;
      }
    },
    { message: 'Amount must be a positive decimal string' }
  ).default('1000'),
  token: z.nativeEnum(TokenSymbol).default(TokenSymbol.BRL),
});

export type FaucetInput = z.infer<typeof FaucetInputSchema>;
```
No manipulador da rota:
```typescript
// Registramos no fastify:
schema: {
  body: FaucetInputSchema,
  ...
}

// Lógica interna:
const { amount, token } = request.body as FaucetInput;
const idempotencyKey = `faucet_${userId}_${crypto.randomUUID()}`;

await DepositService.deposit_process_webhook({
  userId,
  token,
  amount,
  idempotencyKey,
});
```

### Redesenho do Drawer no Frontend (DepositDrawer.tsx)
Usaremos `react-hook-form` e Zod no frontend:
```typescript
const depositSchema = z.object({
  token: z.enum(['BRL', 'BTC', 'ETH']),
  amount: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Valor inválido'),
});
type DepositForm = z.infer<typeof depositSchema>;
```
No JSX do Drawer, renderizaremos:
1. Um formulário `<form onSubmit={handleSubmit(onSubmit)}>`
2. Um campo `<select {...register('token')}>` com as opções BRL, BTC, ETH.
3. Um `<Input placeholder="0.00" {...register('amount')} error={errors.amount?.message} />`
4. Na tela de sucesso, leremos os valores do estado do formulário para exibir a mensagem dinâmica:
   - "Você recebeu {formatToken(amount)} {token} em sua conta." ou formatação apropriada.

---

## 3. Cronograma de Implementação
*(Executar passo a passo)*

- [ ] Modificar [`faucet.routes.ts`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/api/src/modules/test/faucet.routes.ts) para incluir validação de body e suporte a valores dinâmicos.
- [ ] Criar arquivo de teste [`faucet.test.ts`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/api/src/modules/test/__tests__/faucet.test.ts) no backend e validar que depósitos customizados funcionam perfeitamente.
- [ ] Modificar [`DepositDrawer.tsx`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/web/src/components/drawers/DepositDrawer.tsx) no frontend para integrar o formulário e passar valores no body.
- [ ] Rodar testes locais no backend: `pnpm test` e garantir conformidade.
- [ ] Rodar `pnpm lint && pnpm typecheck` no frontend e backend.

---

## 4. Testes e Validação

### Testes de Integração Backend:
- Deve permitir depósito padrão (1000 BRL) se o body for enviado vazio (via valores padrão).
- Deve creditar a quantia exata de BTC se solicitado (ex: `0.5` BTC).
- Deve creditar a quantia exata de ETH se solicitado (ex: `1.25` ETH).
- Deve retornar `400` caso seja enviado um valor negativo ou um token inválido.

### Testes Manuais de Fumaça Frontend:
1. Abra o Drawer de depósito.
2. Selecione "BTC", preencha com "0.5" e envie.
3. Garanta que a tela de sucesso mostra "Você recebeu 0.50000000 BTC em sua conta" e que o painel do Dashboard atualize o saldo de BTC.
