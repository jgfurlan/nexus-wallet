# Product Spec: Conversão de Moedas (Swap Module)

**Issue:** NXS-6 — Swap module (quote endpoint + execute endpoint)

---

## Resumo
O Módulo de Swap permite que usuários autenticados convertam seus saldos entre diferentes ativos suportados (BRL, BTC, ETH) em tempo real. O processo é composto por dois fluxos: a solicitação de uma cotação atualizada (`GET /swap/quote`) que garante o preço por 30 segundos, e a execução garantida da conversão (`POST /swap/execute`) executada de forma atômica no banco de dados.

---

## O Problema
O NexusWallet é uma plataforma multimoedas. Para que o usuário possa rebalancear sua carteira ou adquirir criptoativos a partir de fiat, ele precisa de uma funcionalidade de swap. Como os preços de mercado de BTC e ETH são extremamente voláteis, precisamos fornecer cotações garantidas por um curto período de tempo e executar a transferência física de valores entre os saldos de forma rápida, segura e transacional para evitar perdas financeiras (tanto do usuário quanto da plataforma).

---

## Objetivos & Não-Objetivos

**Objetivos:**
- [ ] Criar um endpoint privado `GET /swap/quote` para calcular a conversão de um ativo origem para um ativo destino.
- [ ] Aplicar uma taxa administrativa (swap fee) de 1.5% retida diretamente no token de **origem**.
- [ ] Criar um endpoint privado `POST /swap/execute` que recebe a cotação e realiza a conversão atômica dos saldos.
- [ ] Garantir que a execução do swap crie exatamente uma `Transaction` de tipo `SWAP` e três `LedgerEntry` correspondentes (`SWAP_FEE`, `SWAP_OUT`, `SWAP_IN`) para rastreabilidade contábil total.
- [ ] Proteger ambos os endpoints com `authGuard`.

**Não-Objetivos:**
- Realizar ordens de swap parciais ou programadas (apenas swaps a mercado imediatos).
- Integrar com livros de ofertas (order books) externos (todas as conversões ocorrem contra o saldo de liquidez fictício da plataforma).

---

## Experiência do Usuário & Invariantes

### Etapa 1: Cotação (`GET /swap/quote`)
1. O usuário solicita a conversão informando `fromToken`, `toToken` e o montante de origem `amount` (ex: `fromToken: BRL`, `toToken: BTC`, `amount: 100`).
2. O sistema busca a cotação de mercado (via CoinGecko cacheado no Redis).
3. O sistema calcula a taxa de swap de 1.5% no token de origem:
   - `feeAmount = amount * 0.015` (BRL)
   - `netAmount = amount - feeAmount` (98.5 BRL)
4. O sistema calcula o valor de destino convertido:
   - `destinationAmount = netAmount * rate`
5. O sistema salva a cotação no Redis e retorna um `quoteId` e as informações calculadas (taxa, cotação final, valores líquidos e expiração de 30 segundos).

### Etapa 2: Execução (`POST /swap/execute`)
1. O usuário envia um `POST /swap/execute` contendo o `quoteId`.
2. O sistema valida que a cotação existe no Redis e não expirou.
3. O sistema executa a validação e as mutações na mesma transação atômica do banco:
   - Busca o saldo de origem do usuário e verifica se `balance >= amount`.
   - Debita a taxa (`feeAmount`) do token de origem gerando a entrada `SWAP_FEE` no ledger.
   - Debita o montante líquido (`netAmount`) do token de origem gerando a entrada `SWAP_OUT` no ledger.
   - Credita o montante convertido (`destinationAmount`) no token de destino gerando a entrada `SWAP_IN` no ledger.
   - Cria o registro de `Transaction` do tipo `SWAP` vinculando as 3 entradas.
4. O sistema retorna HTTP `200 OK` com os dados da transação efetuada.

### Cenários de Erro e Casos de Borda

| Cenário | Comportamento Esperado |
|---------|------------------|
| Saldo de origem insuficiente | Retorna `422 Unprocessable Entity` com `{ error: "INSUFFICIENT_BALANCE" }` |
| Cotação expirada ou inválida | Retorna `410 Gone` ou `400 Bad Request` com `{ error: "QUOTE_EXPIRED" }` |
| Token origem idêntico ao de destino | Retorna `400 Bad Request` com `{ error: "SAME_TOKENS_PROHIBITED" }` |
| Usuário não autenticado | Retorna `401 Unauthorized` |

---

## Critérios de Sucesso
- [ ] Implementação de testes de integração e contabilidade em `apps/api/src/modules/swap/__tests__/swap.test.ts`.
- [ ] Verificação de que a taxa de 1.5% é deduzida com precisão decimal arbitrária no token de origem.
- [ ] Confirmação de que o swap falha graciosamente com erro de saldo se o usuário tentar gastar mais do que possui.
- [ ] Garantia de que a auditoria do ledger e da carteira continuam 100% consistentes e rastreáveis pós-swap.
