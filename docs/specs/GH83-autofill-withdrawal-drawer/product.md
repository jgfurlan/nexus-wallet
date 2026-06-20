# Product Spec: Botão de Autopreenchimento de Dados no Drawer de Saque

**Issue:** GH83 — [UX/UI] Add Autofill Mock Data Button to Withdrawal Drawer
**Figma/Design:** N/A

---

## Resumo
Esta especificação descreve a adição de um botão de conveniência ("Autopreencher Dados de Teste") no Drawer de Saque (`WithdrawDrawer`). Como a validação de endereços de saque é rígida (exige chaves PIX válidas para BRL e endereços blockchain específicos para BTC e ETH), digitar dados fictícios manualmente toda vez torna-se trabalhoso para testes rápidos. O novo botão preencherá automaticamente o valor e o endereço correto para teste de acordo com a moeda selecionada no formulário.

---

## Problema
Para simular um saque na sandbox do Nexus Wallet, o usuário precisa:
- Digitar um valor positivo válido.
- Fornecer um endereço compatível com a rede (por exemplo, um email/CPF válido no caso de PIX para BRL, ou chaves públicas longas no formato correto para BTC e ETH).

Inserir repetidamente endereços mockados válidos atrasa a velocidade de desenvolvimento e testes manuais da interface e do fluxo transacional.

---

## Objetivos & Não-Objetivos

**Objetivos:**
- [ ] Adicionar um botão proeminente de "Autopreencher" ou "Preencher Dados de Teste" dentro do formulário do `WithdrawDrawer`.
- [ ] Fazer com que o comportamento do botão mude dinamicamente com base no token selecionado (BRL, BTC ou ETH) no momento do clique.
- [ ] Garantir que o preenchimento automático atualize o estado interno do formulário (reatividade no React Hook Form) e limpe quaisquer erros de validação anteriores.
- [ ] Utilizar valores decimais adequados e chaves reais/válidas na sandbox para evitar falhas de validação.

**Não-Objetivos:**
- Ignorar as regras reais de validação do backend (o saque simulado ainda deve passar por todas as validações reais da API).
- Salvar esses dados mockados no banco de dados do usuário de forma permanente.

---

## Experiência do Usuário & Invariantes

### Caminho Feliz (Autopreenchimento)
1. O usuário clica em "Sacar" na interface.
2. O formulário de saque abre com "BRL" selecionado por padrão.
3. O usuário clica no botão "Preencher Dados de Teste" (representado por um ícone de varinha/faísca).
4. O formulário é imediatamente preenchido com:
   - Valor: `150.00`
   - Endereço de Destino: `faucet@nexuswallet.com` (chave PIX válida).
5. O usuário altera o seletor de moeda para "BTC".
6. Clica em "Preencher Dados de Teste" novamente.
7. O formulário é atualizado com:
   - Valor: `0.005`
   - Endereço de Destino: `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa` (endereço de carteira BTC válido).
8. O usuário clica em "Confirmar Saque" e executa a transação com sucesso.

---

## Critérios de Sucesso
- [ ] O botão de autopreenchimento é renderizado dentro do `WithdrawDrawer` e está estilizado de forma harmoniosa com a paleta do Rose Pine.
- [ ] O clique no botão popula corretamente os campos `amount` e `address` conforme a moeda atualmente selecionada.
- [ ] As mensagens de erro de validação (ex: "Valor inválido" ou "Endereço inválido") desaparecem automaticamente após o clique no botão devido ao preenchimento correto.
- [ ] Nenhuma alteração é feita na validação de segurança do backend.
