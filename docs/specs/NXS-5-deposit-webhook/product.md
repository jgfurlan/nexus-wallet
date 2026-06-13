# Product Spec: Webhook de Depósito (Deposit Webhook)

**Issue:** NXS-5 — Deposit webhook (idempotency, credit, error handling)

---

## Resumo
O Módulo de Webhook de Depósito é responsável por receber e processar notificações de créditos externos (depósitos fictícios em BRL, BTC ou ETH) enviados por um gateway de pagamento ou adquirente parceiro. Este endpoint público, porém seguro, atualiza o saldo do usuário correspondente e garante que cada evento de crédito seja processado exatamente uma vez através de chaves de idempotência.

---

## O Problema
Para que os usuários possam utilizar a plataforma (fazer swaps, saques, etc.), eles precisam creditar saldo em suas contas. O gateway de pagamento enviará notificações assíncronas (webhooks) contendo o valor creditado. Como a rede pode retransmitir esses webhooks devido a timeouts ou instabilidade, precisamos de um mecanismo robusto para impedir o duplo crédito (double crediting) e assegurar a auditoria de cada depósito.

---

## Objetivos & Não-Objetivos

**Objetivos:**
- [ ] Criar um endpoint público `POST /webhooks/deposit` para processar depósitos.
- [ ] Validar a autenticidade e integridade do webhook via assinatura HMAC SHA256 no cabeçalho `X-Webhook-Signature`.
- [ ] Garantir idempotência estrita usando a chave `idempotencyKey` enviada no payload.
- [ ] Creditar o valor exato no saldo (`WalletBalance`) do token do usuário na mesma transação atômica.
- [ ] Inserir uma única entrada no ledger (`LedgerEntry`) do tipo `DEPOSIT` justificando o crédito.

**Não-Objetivos:**
- Tratar a expiração ou o cancelamento do pagamento (o webhook sempre representa um depósito já efetuado e confirmado com sucesso).
- Integrar com chaves Pix reais ou chaves criptográficas on-chain (os depósitos são representados de forma custodial fictícia pela API).

---

## Experiência do Usuário & Invariantes

### Fluxo Feliz (Happy Path)
1. O gateway de pagamento envia um `POST /webhooks/deposit` com a assinatura HMAC correta e o payload contendo `walletId`, `token` (BRL, BTC, ETH), `amount` e `idempotencyKey`.
2. O sistema verifica que a assinatura é válida e que o `idempotencyKey` é inédito.
3. O sistema atualiza o saldo do usuário adicionando `amount`.
4. O sistema cria uma entrada de `Transaction` (tipo `DEPOSIT`) e uma `LedgerEntry` (tipo `DEPOSIT`) associando `balanceBefore` (saldo antigo) e `balanceAfter` (saldo atualizado).
5. O sistema responde com HTTP `201 Created` e os dados da transação criada.

### Idempotência (Retentativas)
Se o gateway reenviar o mesmo payload com o mesmo `idempotencyKey`:
1. O sistema verifica que o `idempotencyKey` já foi registrado na tabela de `Transaction`.
2. O sistema responde imediatamente com HTTP `200 OK` retornando a transação original criada, sem alterar o saldo ou criar novas entradas no ledger.

### Cenários de Erro e Casos de Borda

| Cenário | Comportamento Esperado |
|---------|------------------|
| Assinatura HMAC inválida ou ausente | Retorna `401 Unauthorized` com `{ error: "INVALID_SIGNATURE" }` |
| Token inválido ou não suportado | Retorna `400 Bad Request` com `{ error: "INVALID_TOKEN" }` |
| Carteira correspondente ao `walletId` não existe | Retorna `404 Not Found` com `{ error: "WALLET_NOT_FOUND" }` |
| Valor de depósito negativo ou zero | Retorna `400 Bad Request` com erro de validação do Zod |
| Corpo JSON malformado | Retorna `400 Bad Request` |

### Restrições (Constraints)
- O processamento de verificação de idempotência, criação da transação, inserção do ledger e atualização do saldo do usuário deve ocorrer de forma 100% atômica dentro de um bloco transacional do banco de dados.

---

## Critérios de Sucesso
- [ ] Implementação de testes de integração robustos em `apps/api/src/modules/webhook/__tests__/deposit.test.ts`.
- [ ] Garantia de que a verificação de assinatura HMAC SHA256 impede chamadas maliciosas.
- [ ] Confirmação de que retentativas com o mesmo `idempotencyKey` retornam a transação original de forma idêntica e sem duplicar o crédito (idempotência verde).
- [ ] Validação contábil da auditoria do ledger após múltiplos depósitos bem-sucedidos.
