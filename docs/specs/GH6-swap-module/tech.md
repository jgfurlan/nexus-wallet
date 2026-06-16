# Technical Spec: Conversão de Moedas (Swap Module)

**Consulte `product.md` para ver o comportamento do usuário e as invariantes.**
**Issue:** GH6

---

## 1. Contexto
A funcionalidade de Swap requer integração com serviços de preços externos (CoinGecko) e armazenamento temporário rápido de cotações geradas (Redis). A execução da conversão de ativos exige atomicidade total via transações Serializable ou bloqueio de linha.

**Arquivos Relacionados:**
- [`apps/api/src/modules/ledger/ledger.service.ts`](file:///home/jgfurlan/dev/projects/nexus-wallet/apps/api/src/modules/ledger/ledger.service.ts)
- [`apps/api/src/lib/redis.ts`](file:///home/jgfurlan/dev/projects/nexus-wallet/apps/api/src/lib/redis.ts) (Singleton de cache Redis)
- [`apps/api/src/lib/coingecko.ts`](file:///home/jgfurlan/dev/projects/nexus-wallet/apps/api/src/lib/coingecko.ts) (Client do CoinGecko)

---

## 2. Mudanças Propostas

### 2.1. Fluxo de Cotação (`GET /swap/quote`)
1. O usuário chama `GET /swap/quote?fromToken=BRL&toToken=BTC&amount=100`.
2. O handler valida a entrada usando Zod.
3. O `SwapService` busca o preço atual do par na API CoinGecko:
   - Para evitar exceder os limites de requisição públicos, o serviço utiliza cache no Redis com TTL de **30 segundos**.
4. Calcula:
   - `feeAmount = amount * 0.015` (BRL)
   - `netAmount = amount - feeAmount` (98.5 BRL)
   - `destinationAmount = netAmount * rate`
5. O `SwapService` gera um `quoteId` (UUID) e salva o objeto da cotação no Redis com TTL de **30 segundos**:
   ```json
   {
     "id": "uuid-da-cotacao",
     "userId": "user-id-do-request",
     "fromToken": "BRL",
     "toToken": "BTC",
     "sourceAmount": "100.000000000000000000",
     "feeAmount": "1.500000000000000000",
     "netAmount": "98.500000000000000000",
     "destinationAmount": "0.000328330000000000",
     "rate": "0.000003333300000000",
     "expiresAt": 1774888200000
   }
   ```
6. Retorna a cotação gerada.

### 2.2. Fluxo de Execução (`POST /swap/execute`)
1. O usuário submete `POST /swap/execute` com o payload contendo o `quoteId`.
2. O handler recupera a cotação correspondente no Redis.
   - Se não existir ou tiver expirado, retorna `410 Gone` com `{ error: "QUOTE_EXPIRED" }`.
   - Se o `userId` da cotação for diferente do usuário logado, retorna `403 Forbidden`.
3. Executa a conversão dentro de uma transação Prisma `$transaction` Serializable:
   - **Locks e Consistência Contábil:**
     - Busca e trava (`findUniqueOrThrow`) os saldos de origem (`fromToken`) e destino (`toToken`) da carteira do usuário.
     - Valida se o saldo de origem é maior ou igual ao `sourceAmount` da cotação.
     - Se o saldo for insuficiente, aborta a transação e lança erro `INSUFFICIENT_BALANCE`.
   - **Mutações Contábeis:**
     - Cria o registro em `Transaction` com tipo `SWAP`, registrando `fromToken`, `toToken`, `fromAmount = sourceAmount`, `toAmount = destinationAmount`, `feeAmount` e `rate`.
     - Chama `LedgerService.recordEntry` para registrar o débito da taxa: `SWAP_FEE` (delta = `-feeAmount` no `fromToken`).
     - Chama `LedgerService.recordEntry` para registrar o débito do swap líquido: `SWAP_OUT` (delta = `-netAmount` no `fromToken`).
     - Chama `LedgerService.recordEntry` para registrar o crédito convertido: `SWAP_IN` (delta = `+destinationAmount` no `toToken`).
4. Apaga a cotação do Redis para impedir reutilização do mesmo `quoteId`.
5. Retorna `200 OK` com os detalhes da transação de swap efetuada.

---

## 3. Contratos e Schemas Zod (`swap.schemas.ts`)

```typescript
import { z } from 'zod';
import { TokenSymbol } from '@prisma/client';

export const SwapQuoteQuerySchema = z.object({
  fromToken: z.enum([TokenSymbol.BRL, TokenSymbol.BTC, TokenSymbol.ETH]),
  toToken: z.enum([TokenSymbol.BRL, TokenSymbol.BTC, TokenSymbol.ETH]),
  amount: z.string().refine((val) => {
    try {
      const d = new Decimal(val);
      return d.greaterThan(0);
    } catch {
      return false;
    }
  }, { message: 'Amount must be a positive decimal string' }),
});

export const SwapExecuteInputSchema = z.object({
  quoteId: z.string().uuid(),
});
```

---

## 4. Lista de Implementação (Checklist)

- [ ] Criar a pasta do módulo `apps/api/src/modules/swap/`.
- [ ] Criar o arquivo de testes de integração e concorrência em `__tests__/swap.test.ts`.
- [ ] Implementar Zod schemas em `swap.schemas.ts`.
- [ ] Implementar a lógica de cotação e de execução em `swap.service.ts`:
  - `swap_get_quote`: integra com o CoinGecko client e salva a cotação calculada no Redis.
  - `swap_execute`: valida a cotação no Redis e executa a transação Serializable de débito e crédito no banco de dados.
- [ ] Criar rotas protegidas em `swap.routes.ts` com `authGuard`.
- [ ] Registrar as rotas no `apps/api/src/app.ts`.
- [ ] Validar a suite completa de testes e verificar se os saldos e o ledger de swap batem com exatidão matemática.

---

## 5. Testes e Validação

| Invariante | Localização do Teste | Método de Verificação |
|-----------------------------|---------------|---------------------|
| Cotação de Swap com Taxa | `__tests__/swap.test.ts` | Solicita cotação e valida se a taxa de 1.5% foi deduzida corretamente da moeda de origem na resposta matemática da cotação. |
| Execução feliz com 3 entradas no ledger | `__tests__/swap.test.ts` | Executa o swap, verifica se a rota retorna 200 e se o banco de dados contém a transação de swap e 3 linhas correspondentes no ledger (`SWAP_FEE`, `SWAP_OUT`, `SWAP_IN`) com valores exatos. |
| Rejeição por Saldo Insuficiente | `__tests__/swap.test.ts` | Tenta executar swap sem saldo de origem e valida se lança HTTP 422 `INSUFFICIENT_BALANCE`, garantindo que nenhuma alteração de saldo ou ledger ocorra. |
| Rejeição de Quote Expirado | `__tests__/swap.test.ts` | Aguarda expiração da cotação no Redis (ou manipula tempo de expiração) e valida se o execute retorna HTTP 410 `QUOTE_EXPIRED`. |
| Concorrência estrita (Double-spend swap) | `__tests__/swap.test.ts` | Dispara múltiplos requests de execução concorrentes do mesmo ou diferentes quotes que excedem o saldo total do usuário e garante que apenas um passe e os outros retornem erro, sem inconsistência de saldos. |
