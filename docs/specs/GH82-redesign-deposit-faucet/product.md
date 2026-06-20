# Product Spec: Redesenho do Faucet de Depósito para Valores e Moedas Customizados

**Issue:** GH82 — [UX/UI] Redesign Deposit Faucet to Accept Custom Amount and Token
**Figma/Design:** N/A

---

## Resumo
Esta especificação descreve o redesenho e aprimoramento da ferramenta de simulação de depósito (Faucet). Atualmente, ao clicar em "Simular Depósito", o sistema sempre deposita uma quantia fixa de `1.000,00 BRL`. A nova funcionalidade permitirá que os usuários:
1. Escolham qual ativo desejam simular (BRL, BTC ou ETH).
2. Digitem uma quantia específica e personalizada para o depósito.
3. Obtenham feedback visual de sucesso dinâmico e correspondente ao valor/token depositado.

---

## Problema
O Faucet de simulação atual é limitado a depósitos de BRL. Se um usuário quiser testar o comportamento de sua carteira com saldos de BTC ou ETH diretamente (sem passar pela conversão interna), ou se quiser testar a conversão com valores diferentes de 1.000 BRL, ele não consegue injetar esses fundos diretamente. Isso restringe o escopo de testes e simulações na sandbox.

---

## Objetivos & Não-Objetivos

**Objetivos:**
- [ ] Atualizar o endpoint da API `POST /test/faucet` para aceitar um corpo de requisição com `amount` (string decimal) e `token` (`BRL`, `BTC` ou `ETH`).
- [ ] Implementar validação robusta no backend para garantir que apenas valores decimais positivos e tokens suportados sejam processados.
- [ ] Redesenhar o Drawer de Depósito (`DepositDrawer`) no frontend para incluir campos de entrada de formulário para seleção de moeda e entrada de valor.
- [ ] Usar `react-hook-form` e `zod` no frontend para validação de erros de preenchimento (ex: valor não-numérico ou menor/igual a zero).
- [ ] Atualizar a tela de sucesso do Drawer para exibir dinamicamente o valor e a moeda depositados (ex: "Você recebeu 0.50 BTC em sua conta.").

**Não-Objetivos:**
- Remover a chave de idempotência de segurança.
- Modificar o fluxo de verificação de autenticação (o endpoint deve continuar protegido por JWT).

---

## Experiência do Usuário & Invariantes

### Happy Path (Simulação de Depósito Customizado)
1. O usuário clica em "Depositar" (seja na Sidebar ou Bottom Nav).
2. O Drawer abre exibindo um formulário:
   - Seletor de Ativo: Dropdown contendo "BRL", "BTC" e "ETH".
   - Campo de Valor: Input de número onde o usuário digita a quantidade desejada.
3. O usuário seleciona "BTC" e digita "0.25".
4. Clica em "Simular Depósito".
5. O sistema processa o depósito, fecha a entrada do formulário e exibe a tela de sucesso:
   - Título: "Depósito Confirmado!"
   - Mensagem: "Você recebeu 0,25 BTC em sua conta."
6. O saldo do usuário no painel de Dashboard é atualizado refletindo o saldo real em BTC incrementado em `0.25`.

### Casos de Borda e Erros de Formulário
- **Valor Negativo ou Zero:** O input exibe uma mensagem de validação ("Valor deve ser maior que zero") e impede a submissão.
- **Entrada Não-Numérica:** Impede o envio com aviso apropriado.
- **Erro do Servidor:** Se o backend retornar falha, o Drawer exibe uma mensagem de erro vermelha no cabeçalho do formulário, permitindo nova tentativa.

---

## Critérios de Sucesso
- [ ] A rota `POST /test/faucet` aceita dados customizados no body e atualiza os saldos corretamente de acordo com o token passado.
- [ ] O formulário de simulação no frontend valida adequadamente os inputs antes de enviar a requisição ao servidor.
- [ ] A tela de sucesso do `DepositDrawer` exibe o valor formatado corretamente correspondente ao depósito executado.
- [ ] Os testes locais de integração para a rota de faucet passam sem erros.
