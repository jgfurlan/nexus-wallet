# Technical Spec: Módulo de Carteira (Wallet Module)

**Consulte `product.md` para ver o comportamento do usuário e as invariantes.**
**Issue:** GH3

---

## 1. Contexto
A estrutura de banco de dados para a carteira (`Wallet` e `WalletBalance`) já existe no Prisma e a criação automática no registro de novos usuários já foi implementada no `AuthService.registerUser`. Esta especificação detalha a exposição destas informações de forma segura por meio de uma rota protegida.

**Arquivos Relevantes:**
- [`apps/api/src/modules/auth/auth.service.ts`](file:///home/jgfurlan/dev/projects/nexus-wallet/apps/api/src/modules/auth/auth.service.ts) (Referência de criação da carteira)
- [`apps/api/prisma/schema.prisma`](file:///home/jgfurlan/dev/projects/nexus-wallet/apps/api/prisma/schema.prisma) (Modelos `Wallet` e `WalletBalance`)
- [`apps/api/src/middleware/auth_guard.ts`](file:///home/jgfurlan/dev/projects/nexus-wallet/apps/api/src/middleware/auth_guard.ts) (Middleware de autenticação)

---

## 2. Mudanças Propostas

### Fluxo de Dados
```
[Client] --- (GET /wallet/balances + JWT) ---> [Fastify Router]
                                                      ↓
                                                [authGuard Hook] (Verifica Assinatura)
                                                      ↓
                                                [Wallet Handler] (Extrai request.user.sub)
                                                      ↓
                                                [WalletService]  (Consulta DB)
                                                      ↓
[Client] <--- (200 OK + JSON Balances) <------- [Fastify Router]
```

### Módulos Modificados / Novos
| Arquivo | Tipo de Alteração | Descrição |
|------|-------------|-------------|
| [`apps/api/src/modules/wallet/wallet.schemas.ts`](file:///home/jgfurlan/dev/projects/nexus-wallet/apps/api/src/modules/wallet/wallet.schemas.ts) | Novo | Definição de Schemas Zod de resposta |
| [`apps/api/src/modules/wallet/wallet.service.ts`](file:///home/jgfurlan/dev/projects/nexus-wallet/apps/api/src/modules/wallet/wallet.service.ts) | Novo | Classe de serviço para consulta de saldos com fallback resiliente |
| [`apps/api/src/modules/wallet/wallet.routes.ts`](file:///home/jgfurlan/dev/projects/nexus-wallet/apps/api/src/modules/wallet/wallet.routes.ts) | Novo | Registro de rotas e integração com `authGuard` |
| [`apps/api/src/app.ts`](file:///home/jgfurlan/dev/projects/nexus-wallet/apps/api/src/app.ts) | Modificado | Registro das rotas do módulo de carteira |

### Contratos e Schemas Zod
```typescript
import { z } from 'zod';

export const BalanceSchema = z.object({
  token: z.enum(['BRL', 'BTC', 'ETH']),
  amount: z.string(),
});

export const WalletBalancesResponseSchema = z.object({
  walletId: z.string(),
  balances: z.array(BalanceSchema),
});

export type WalletBalancesResponse = z.infer<typeof WalletBalancesResponseSchema>;
```

---

## 3. Lista de Implementação (Checklist)

- [ ] Criar a pasta do módulo `apps/api/src/modules/wallet/`.
- [ ] Criar testes falhando para cada invariante em `__tests__/wallet.test.ts`.
- [ ] Implementar Zod schemas em `wallet.schemas.ts`.
- [ ] Implementar a lógica de negócio no `WalletService` em `wallet.service.ts`:
  - Buscar a carteira vinculada ao `userId`.
  - Se a carteira não existir por alguma inconsistência de banco de dados, criá-la com saldos zerados sob demanda.
- [ ] Implementar a rota `GET /wallet/balances` em `wallet.routes.ts` com validação de schemas e proteção do `authGuard`.
- [ ] Registrar as novas rotas em `apps/api/src/app.ts`.
- [ ] Executar `pnpm test` e confirmar sucesso dos testes.
- [ ] Executar `pnpm lint && pnpm typecheck` para garantir conformidade estática.
- [ ] Atualizar o `progress-tracker.md` na raiz do projeto.

---

## 4. Testes e Validação

| Invariante | Localização do Teste | Método de Verificação |
|-----------------------------|---------------|---------------------|
| Consulta de saldos com sucesso (Happy path) | `__tests__/wallet.test.ts` | Registra, loga, consome `GET /wallet/balances` e valida se retorna BRL, BTC, ETH com saldos zerados. |
| Acesso sem token bloqueado (401) | `__tests__/wallet.test.ts` | Chamada sem cabeçalho Authorization espera 401. |
| Acesso com token inválido bloqueado (401) | `__tests__/wallet.test.ts` | Chamada com token expirado/adulterado espera 401. |
| Criação sob demanda resiliente | `__tests__/wallet.test.ts` | Cria usuário de teste, exclui sua carteira diretamente no banco de dados, faz a chamada de saldo e confirma que retornou 200 e recriou a carteira no banco. |
