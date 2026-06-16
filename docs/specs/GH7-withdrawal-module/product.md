# Product Spec: Módulo de Saque (Withdrawal)

**Issue:** GH7 — [Withdrawal Module](https://github.com/users/jgfurlan/projects/nexus-wallet/issues/7)
**Figma/Design:** N/A

---

## Sumário
Permite que o usuário retire fundos de sua carteira para uma conta externa (mockada). O sistema valida o saldo disponível, debita o valor e registra a transação para auditoria.

---

## Problema
Atualmente, o usuário pode depositar e converter fundos, mas não tem como retirar o valor da plataforma, o que é essencial para um fluxo completo de carteira.

---

## Objetivos & Não-Objetivos

**Objetivos:**
- [ ] Implementar endpoint para solicitação de saque de qualquer token suportado (BRL, BTC, ETH).
- [ ] Validar saldo suficiente antes de processar o débito.
- [ ] Registrar a transação do tipo `WITHDRAWAL`.
- [ ] Criar entrada no Ledger para manter a integridade do extrato.
- [ ] Suportar idempotência via `externalId` ou `idempotencyKey` para evitar saques duplicados em caso de erro de rede.

**Não-Objetivos:**
- Integração real com gateways de pagamento ou redes blockchain (o envio é mockado).
- Validação de endereço de destino (campos mockados são aceitos).

---

## Experiência do Usuário & Invariantes

### Fluxo Principal (Happy Path)
1. Usuário envia `token`, `amount` e `address` (destino).
2. Sistema verifica se o saldo do `token` é >= `amount`.
3. Sistema debita o saldo de forma atômica.
4. Transação de `WITHDRAWAL` é criada.
5. Entrada no Ledger de tipo `WITHDRAWAL` é registrada com o delta negativo.
6. Sistema retorna sucesso (200 OK).

### Casos de Borda
| Cenário | Comportamento Esperado |
|----------|------------------|
| Saldo insuficiente | 422 com `{ error: "INSUFFICIENT_BALANCE" }` |
| Token não suportado | 400 com `{ error: "INVALID_TOKEN" }` |
| Valor zero ou negativo | 400 com `{ error: "INVALID_AMOUNT" }` |
| Idempotência (mesmo externalId) | 200 com a transação original, sem novo débito |
| Usuário não autenticado | 401 |

### Restrições
- Não quebrar invariantes de precisão decimal (36,18).
- Garantir atomicidade via transação Serializable.

---

## Critérios de Sucesso
- [ ] Todos os testes em `__tests__/withdrawal.test.ts` passam.
- [ ] Sinal RLVR de **Correção**: todos os invariantes acima possuem testes.
- [ ] Sinal RLVR de **Auditabilidade**: entradas no Ledger presentes para cada saque.
- [ ] Nenhuma regressão na suite de testes atual.
