# Padrões de Código: Legibilidade e Conformidade

## Legibilidade para Agentes (Mandatório)
O LLM é o consumidor primário deste código. Otimize para busca e descoberta determinística.

### 1. Unicidade Global — Nomenclatura `module_action`
Prefixe toda função exportada com o nome do seu módulo para eliminar ambiguidade na busca.

```typescript
// ✅ Correto
export async function auth_register_user(dto: RegisterDto) { ... }
export async function wallet_get_balances(userId: string) { ... }
export async function ledger_append_entry(payload: LedgerEntryPayload) { ... }
export async function swap_quote(from: TokenSymbol, to: TokenSymbol, amount: Decimal) { ... }

// ❌ Errado — ambíguo, difícil de buscar
export async function register(dto: RegisterDto) { ... }
export async function getBalances(userId: string) { ... }
```

### 2. Caminhos de Erro Explícitos
Sem `catch-alls` genéricos. Todo `try/catch` deve capturar um erro tipado e retornar uma resposta de erro significativa do Fastify.

```typescript
// ✅ Correto
try {
  const user = await prisma.user.findUniqueOrThrow({ where: { id } });
} catch (e) {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
    throw fastify.httpErrors.notFound('Usuário não encontrado');
  }
  throw e; // re-lança erros desconhecidos — nunca silencie erros
}

// ❌ Errado
try { ... } catch (e) { return null; }
```

### 3. Sem "Magic Strings"
Use enums ou mapas de constantes para cada status, token ou chave de configuração.

```typescript
// ✅ Correto — TokenSymbol e LedgerEntryType são enums do Prisma, importe e reuse-os
import { TokenSymbol, LedgerEntryType } from '@prisma/client';

// ❌ Errado
if (entry.type === 'SWAP_FEE') { ... }
```

## Conformidade de Tipos
- `any` é **estritamente proibido**. A regra ESLint `@typescript-eslint/no-explicit-any` está definida como `error`.
- Use schemas Zod para toda validação de request; infira tipos TypeScript do Zod: `type RegisterDto = z.infer<typeof RegisterSchema>`.
- Use `Decimal` de `decimal.js` para toda aritmética monetária. Nunca use `number` ou `parseFloat` em valores financeiros.
- Todos os handlers de rota Fastify devem declarar os genéricos `Request` e `Reply`.

## Sinais de Recompensa RLVR
Estes quatro sinais definem o que é "código bom" neste projeto. Agentes usam estes sinais para auto-avaliação antes de submeter qualquer mudança:

| Sinal | O que verificar |
|--------|--------------|
| **Correção** | A implementação satisfaz todos os invariantes do `product.md`? Todos os testes passam? |
| **Legibilidade** | Todas as funções exportadas estão prefixadas? Sem `any`? Sem strings mágicas? Tipos inferidos do Zod? |
| **Auditabilidade** | Existe um `LedgerEntry` para cada alteração de saldo? A mensagem de commit inclui o ID da issue do GitHub? |
| **Segurança** | Auth guards estão ativos? A chave de idempotência é validada antes de creditar? Segredos no `.env`, nunca hardcoded? |

## Linting e Formatação
```json
// .eslintrc — regras principais
{
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/no-floating-promises": "error",
  "no-console": ["warn", { "allow": ["error"] }]
}
```
Formatador: `prettier` com configuração padrão. Execute `pnpm lint` e `pnpm format` antes de cada commit.

## Padrões de Teste (TDD — RED → GREEN → REFACTOR)

- **RED:** Escreva um teste que falha e codifica diretamente um invariante do `product.md`.
- **GREEN:** Implemente o código mínimo para passar — sem excessos.
- **REFACTOR:** Limpe nomes, extraia helpers, remova duplicação mantendo o teste GREEN.

### Convenções de Arquivos de Teste
```
src/modules/auth/__tests__/auth_register_user.test.ts
src/modules/wallet/__tests__/wallet_get_balances.test.ts
src/modules/ledger/__tests__/ledger_append_entry.test.ts
```

### Cobertura Requerida
Cada PR deve incluir testes cobrindo:
1. O caminho feliz (happy path)
2. Pelo menos um caminho de erro (ex: saldo insuficiente, chave de idempotência duplicada)
3. O sinal de **Correção** do RLVR correspondente

Nenhum PR é mesclado sem estes três itens.
