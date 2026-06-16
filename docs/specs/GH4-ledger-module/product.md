# Product Spec: Módulo de Ledger e Auditoria (Ledger Module)

**Issue:** GH4 — Ledger module (append-only entries, audit endpoint)

---

## Resumo
O Módulo de Ledger é o livro-razão contábil e imutável do sistema. Ele é responsável por registrar todas as alterações de saldo (créditos e débitos) e por disponibilizar um endpoint administrativo para auditoria matemática (`GET /admin/audit/:walletId`), que recalcula os saldos a partir do histórico de transações para provar a integridade financeira das carteiras.

---

## O Problema
Em sistemas financeiros, a consistência de saldos é crítica. Confiar apenas em uma coluna de saldo acumulado na tabela de carteiras é um risco de segurança (pode ser adulterado por bugs ou SQL injection). É necessário manter um registro histórico detalhado de cada movimentação (Ledger Entry) que nunca pode ser alterado ou excluído. Com isso, podemos auditar a qualquer momento se o saldo armazenado é igual à soma matemática de todas as movimentações históricas.

---

## Objetivos & Não-Objetivos

**Objetivos:**
- [ ] Implementar a lógica interna (serviço) para criar entradas de Ledger imutáveis a cada mutação de saldo.
- [ ] Garantir que o cálculo de `balanceBefore` e `balanceAfter` de cada Ledger Entry seja atômico e imune a condições de corrida contábeis.
- [ ] Expor o endpoint `GET /admin/audit/:walletId` para validação matemática dos saldos acumulados versus a soma dos deltas do ledger.
- [ ] Proteger o endpoint de auditoria com `authGuard`.

**Não-Objetivos:**
- Criar rotas para inserção manual de Ledger Entries (entradas do ledger são geradas apenas como efeitos colaterais de depósitos, saques e swaps).
- Prever permissões complexas de Administrador (como o modelo simplificado de usuário não possui papéis/roles, qualquer usuário autenticado pode auditar carteiras).

---

## Invariantes & Regras de Negócio

1. **Imutabilidade Contábil:**
   - Registros na tabela `LedgerEntry` são estritamente de inserção (*append-only*).
   - Não devem existir rotas de update/delete e o serviço não deve expor métodos de alteração sobre essas tabelas.
2. **Consistência Atômica:**
   - Toda alteração de saldo em `WalletBalance` deve ser acompanhada de uma `LedgerEntry` criada na mesma transação bancária (`$transaction`).
   - O cálculo contábil é: `balanceAfter = balanceBefore + delta`.
3. **Invariante de Auditoria:**
   - Para qualquer carteira consistente, o saldo atual armazenado em `WalletBalance.amount` deve ser igual à soma de todos os `delta` das suas respectivas `LedgerEntry`.
   - Se houver divergência em algum token, o status geral da auditoria deve retornar `isConsistent: false`.

---

## Experiência do Usuário (Auditoria)

### Fluxo Feliz (Happy Path)
1. O administrador (usuário autenticado) faz um request para `GET /admin/audit/:walletId`.
2. O sistema busca todos os saldos da carteira (`BRL`, `BTC`, `ETH`).
3. Para cada moeda, o sistema calcula a soma cumulativa dos `delta` no Ledger.
4. O sistema retorna o status de consistência geral e os detalhes de cada moeda:
   ```json
   {
     "walletId": "cuid_da_carteira",
     "isConsistent": true,
     "audit": [
       {
         "token": "BRL",
         "storedBalance": "150.000000000000000000",
         "calculatedBalance": "150.000000000000000000",
         "isConsistent": true
       },
       {
         "token": "BTC",
         "storedBalance": "0.000000000000000000",
         "calculatedBalance": "0.000000000000000000",
         "isConsistent": true
       },
       {
         "token": "ETH",
         "storedBalance": "0.000000000000000000",
         "calculatedBalance": "0.000000000000000000",
         "isConsistent": true
       }
     ]
   }
   ```

### Casos de Inconsistência (Falha na Auditoria)
Se um saldo armazenado for alterado indevidamente (por exemplo, saldo = `200.00` mas a soma de deltas = `150.00`):
- O token auditado retorna `{ isConsistent: false }`.
- O payload de resposta geral retorna `{ isConsistent: false }`.

---

## Critérios de Sucesso
- [ ] Criação dos testes de integração em `apps/api/src/modules/ledger/__tests__/ledger.test.ts`.
- [ ] Todos os testes passando com sucesso.
- [ ] Linter e Typecheck limpos.
- [ ] Endpoint `/admin/audit/:walletId` documentado no Swagger.
