# Relatório de Avaliação: Nexus Wallet

Este relatório apresenta uma auditoria detalhada do projeto **Nexus Wallet** (monorepo composto por API Backend em Fastify/Prisma/PostgreSQL e Frontend em React) em relação às especificações do Teste Prático de Desenvolvedor Backend.

---

## 📊 Nota Final: 8.5 / 10

A arquitetura do projeto é excelente, demonstrando domínio sênior de TypeScript, segurança e boas práticas de banco de dados. No entanto, a nota foi afetada por **incompatibilidades críticas (mismatches)** entre o frontend e a API que impedem o funcionamento de funcionalidades fundamentais no ambiente web (especificamente o Saque), além de desvios da especificação do payload do Webhook e um bug de visualização na cotação.

---

## 🔍 Avaliação Detalhada por Requisito

### 1. Autenticação
*   **Requisitos Avaliados:** Cadastro de usuário, Login com JWT (Access Token + Refresh Token) e Rotas protegidas por middleware.
*   **Análise Técnica:** A implementação é de altíssimo nível. Utiliza criptografia segura com `bcrypt`, realiza a criação de usuário/carteira/saldos de forma atômica no banco por meio de uma transação do Prisma, e possui um sistema avançado de rotação de Refresh Tokens com detecção de reuso (revogação de todas as sessões se um token antigo for reusado) e hash SHA-256 no banco de dados para segurança em caso de vazamento.
*   **Nota:** **10 / 10** (Excelente)

### 2. Carteira e Saldos
*   **Requisitos Avaliados:** Carteira iniciada com saldo zero no cadastro, suporte a BRL, BTC e ETH, saldos no banco em modelo de ledger e endpoint de consulta de saldos.
*   **Análise Técnica:** A modelagem física do banco de dados usa o tipo `Decimal(36, 18)` no PostgreSQL para evitar imprecisões de ponto flutuante em valores financeiros. As tabelas `Wallet`, `WalletBalance` e `LedgerEntry` estão perfeitamente normalizadas. A API possui tratamento para recriar saldos caso ocorra alguma inconsistência catastrófica no banco.
*   **Nota:** **10 / 10** (Excelente)

### 3. Depósito via Webhook
*   **Requisitos Avaliados:** Endpoint `POST /webhooks/deposit`, validação de payload `{ userId, token, amount, idempotencyKey }`, idempotência e tratamento de erro.
*   **Análise Técnica:** O webhook é seguro e possui validação de assinatura HMAC SHA-256 (bônus excelente). O processamento usa transação `Serializable` para isolar a gravação e evitar corrida.
*   **Desvios / Problemas:**
    *   **Mismatch de Payload:** O PDF de especificações define que o webhook recebe `userId`. Contudo, o backend implementado no Zod Schema (`DepositWebhookInputSchema`) e no Service espera `walletId` em vez de `userId`. Um serviço externo que envie o payload especificado pelo teste receberá um erro `400 Bad Request`.
    *   **Assinatura HMAC:** A API calcula a assinatura em cima de `JSON.stringify(request.body)`. Em produção, diferenças na formatação de espaços ou ordenação de chaves geradas pelo webhook externo podem causar falhas na verificação. O ideal é usar o corpo bruto da requisição (`rawBody`).
*   **Nota:** **8.5 / 10** (Muito Bom, com desvio de especificação)

### 4. Swap (Conversão de Tokens)
*   **Requisitos Avaliados:** Endpoint de cotação integrado à CoinGecko (ou similar) com taxa de 1.5% e endpoint de execução validando saldo, debitando origem+taxa e creditando destino.
*   **Análise Técnica:** O fluxo transacional de Swap é extremamente robusto. A API executa a operação sob uma transação de nível de isolamento `Serializable` do Prisma para evitar corrida/double-spend e usa cache em Redis para evitar estourar limites da API externa da CoinGecko.
*   **Problemas:**
    *   **Bug de Visualização de Taxa:** No frontend (`SwapDrawer.tsx`), a fórmula exibe `1 {quote.toToken} = {1 / quote.rate}`. Ao converter BTC para BRL, a tela exibe `1 BRL = R$ 0,00` por conta da formatação monetária padrão BRL arredondar valores muito baixos para duas casas decimais, o que é confuso.
*   **Nota:** **9.0 / 10** (Muito bom, com pequeno bug visual no frontend)

### 5. Saque (Withdrawal)
*   **Requisitos Avaliados:** Endpoint para solicitar saque, validação de saldo, débito no ledger e log de transação.
*   **Análise Técnica:** A lógica do backend no service está correta e segura (nível `Serializable`).
*   **Problemas Críticos (Bloqueantes no Frontend):**
    A funcionalidade está **completamente quebrada** no frontend devido a incompatibilidades graves de contrato com a API:
    1.  **Rota Incorreta:** O frontend envia POST para `/withdrawals`, mas o backend registrou a rota como `/wallet/withdraw` (Erro `404 Not Found`).
    2.  **Nome de Parâmetro Incompatível:** O frontend envia o endereço de destino sob a chave `destinationAddress`, mas o backend espera `address` (Erro `400 Bad Request`).
    3.  **Falta de Parâmetro Obrigatório:** O backend exige um `externalId` (UUID) para idempotência no saque. O frontend não gera e não envia esse campo (Erro `400 Bad Request`).
*   **Nota:** **6.5 / 10** (Funcionalidade quebrada devido ao desacoplamento de contratos)

### 6. Ledger e Histórico de Transações
*   **Requisitos Avaliados:** Registro de todas as movimentações, auditabilidade (reconstrução de saldo), extrato de movimentações e histórico de transações com paginação.
*   **Análise Técnica:** A API possui um endpoint de auditoria administrativa que reconstrói com sucesso e confere os saldos comparando a soma acumulada de `LedgerEntry.delta` com o saldo da tabela `WalletBalance`.
*   **Problemas:**
    *   **Bug do Token nulo/undefined no Extrato:** O modelo `LedgerEntry` no banco de dados não armazena a coluna `token` diretamente (ele se conecta a `WalletBalance`, que possui o token). No endpoint `/wallet/history`, o backend retorna as transações com suas `ledgerEntries`, mas não faz o join com a tabela de saldos (`walletBalance`) para buscar o token. Com isso, o frontend tenta ler `entry.token` e exibe `undefined` no extrato detalhado.
    *   **Falta de Endpoint de Ledger Direto:** O projeto não possui um endpoint específico para consultar o histórico bruto de movimentações da conta de forma sequencial com paginação (requisito 6 do PDF), apenas o histórico de transações macro (requisito 7) que embute as linhas de ledger de cada transação.
*   **Nota:** **7.5 / 10** (Faltam joins críticos na API para exibição correta e endpoint de ledger dedicado)

### 7. Interface Mobile (UX/UI)
*   **Pontos Fortes:** A aplicação é totalmente responsiva, ocultando a sidebar em mobile e inserindo uma barra de navegação inferior (`bottom nav`) ergonômica. Os Drawers abrem em largura completa (`w-full`), operando como subpáginas nativas. O widget do Fale Conosco tem margem dinâmica (`bottom-20`) para não conflitar com a barra inferior.
*   **Pontos de Melhoria:** Falta de atalhos rápidos diretos na bottom nav e falta de suporte a `inputMode="decimal"` nos campos financeiros para invocar o teclado numérico do celular.
*   **Nota:** **9.0 / 10**

### 8. Diferenciais (Bônus)
*   **Redis para cache:** Implementado com sucesso nas cotações (TTL 30s).
*   **Frontend integrado:** Implementado em React com navegação moderna (drawers).
*   **Deploy funcional:** Disponibilizado em produção (Railway + Vercel).
*   **Pontos de Melhoria:**
    *   **Poluição do Redis:** O Dashboard carrega os valores equivalentes em BRL chamando `/swap/quote` para cada moeda com saldo. Isso gera um registro de cotação temporário (UUID) no Redis que expira sem nunca ser executado. O ideal seria ter uma rota de cotação simples `/prices` ou `/rates` sem geração de estado de quote.
*   **Bônus Aplicado:** **+1.0 ponto** na média geral.

---

## 🛠️ Proposta de Issues para Correção e Melhoria

Abaixo estão descritas as 9 Issues recomendadas para corrigir os bugs e implementar novos diferenciais (como temas e melhoria no feedback).

---

### Issue 1: `[BUG] Fix Withdrawal contract mismatch between Web and API`
*   **Prioridade:** Alta / Bloqueante
*   **Área:** Frontend & API (Contratos)
*   **Descrição:**
    A funcionalidade de saque no frontend falha sistematicamente com erros de validação e rota. É necessário alinhar a chamada do frontend com o Zod schema e rotas da API.
*   **Ações Necessárias:**
    1.  Em `apps/web/src/services/withdrawal.service.ts`, atualizar a rota de chamada do POST de `/withdrawals` para `/wallet/withdraw`.
    2.  No mesmo arquivo e no formulário `apps/web/src/components/drawers/WithdrawDrawer.tsx`, mudar o nome do parâmetro enviado de `destinationAddress` para `address`.
    3.  Na submissão do formulário, gerar dinamicamente um UUID para o parâmetro `externalId` (usando `crypto.randomUUID()` ou biblioteca externa) e enviá-lo na requisição para atender à exigência de idempotência do backend.

---

### Issue 2: `[BUG] Fix missing Token in Ledger Entries returned by History API`
*   **Prioridade:** Média
*   **Área:** API (Backend)
*   **Descrição:**
    O extrato expandido no frontend exibe o símbolo do token como `undefined` para todas as linhas de auditoria interna (Ledger). Isso ocorre porque a tabela `LedgerEntry` não possui campo `token` nativo e a API não inclui o relacionamento de `walletBalance` no retorno.
*   **Ações Necessárias:**
    1.  Em `apps/api/src/modules/wallet/history.service.ts`, atualizar o include do Prisma para carregar o token através do relacionamento com `walletBalance`:
        ```ts
        include: {
          ledgerEntries: {
            include: {
              walletBalance: true
            }
          }
        }
        ```
    2.  Mapear o retorno da query no Service para injetar a propriedade `token` em cada objeto do array `ledgerEntries` a partir de `ledgerEntry.walletBalance.token`.

---

### Issue 3: `[COMPLIANCE] Align Deposit Webhook payload with Test Specifications`
*   **Prioridade:** Média
*   **Área:** API (Webhook)
*   **Descrição:**
    O webhook de depósitos espera `walletId` no payload, violando a especificação do teste prático que define explicitamente o payload como `{ userId, token, amount, idempotencyKey }`.
*   **Ações Necessárias:**
    1.  Atualizar o esquema de validação `DepositWebhookInputSchema` em `apps/api/src/modules/webhook/deposit.schemas.ts` para receber `userId` (string) em vez de `walletId`.
    2.  No service `deposit.service.ts`, buscar a carteira do usuário de forma segura através do relacionamento de unicidade com o `userId`:
        ```ts
        const wallet = await tx.wallet.findUnique({
          where: { userId: input.userId }
        });
        ```

---

### Issue 4: `[UX/UI] Improve Swap rate formula display in SwapDrawer`
*   **Prioridade:** Baixa / Cosmética
*   **Área:** Frontend (UX)
*   **Descrição:**
    A cotação de moedas no formulário de conversão exibe uma representação matemática confusa (ex: `1 BRL = R$ 0,00` em conversões BTC -> BRL). O usuário final espera ver a cotação padrão da moeda base (ex: `1 BTC = R$ 350.000,00`).
*   **Ações Necessárias:**
    1.  Em `apps/web/src/components/drawers/SwapDrawer.tsx` (linha 235), alterar a exibição da taxa de conversão para o formato padrão do mercado:
        ```tsx
        1 {quote.fromToken} = {quote.toToken === 'BRL' ? formatCurrency(quote.rate) : `${formatToken(quote.rate)} ${quote.toToken}`}
        ```

---

### Issue 5: `[PERFORMANCE] Avoid Redis transaction quote writes during Dashboard balance loading`
*   **Prioridade:** Média / Arquitetura
*   **Área:** API & Frontend
*   **Descrição:**
    Para calcular e exibir o valor equivalente em BRL dos saldos no Dashboard, o frontend chama o endpoint `/swap/quote`. Isso faz o backend gerar registros transacionais UUID no Redis que poluem a memória temporária sem nunca serem executados.
*   **Ações Necessárias:**
    1.  Criar um endpoint simplificado na API (ex: `GET /swap/rates` ou `GET /prices`) que retorna apenas as taxas brutas atuais do cache do Redis (CoinGecko).
    2.  Atualizar o `DashboardPage.tsx` para buscar essas taxas gerais e efetuar a conversão de saldo no próprio cliente frontend, eliminando chamadas redundantes a `/swap/quote` no carregamento de tela.

---

### Issue 6: `[UX/UI] Optimize mobile inputs for numeric values`
*   **Prioridade:** Baixa / Mobile
*   **Área:** Frontend (Mobile UX)
*   **Descrição:**
    A experiência de usuário em dispositivos móveis pode ser aprimorada configurando o comportamento do teclado em campos numéricos de quantidade nos formulários de transações.
*   **Ações Necessárias:**
    1.  Adicionar o atributo `inputMode="decimal"` nos campos de input de quantidade monetária em `SwapDrawer.tsx`, `WithdrawDrawer.tsx` e `DepositDrawer.tsx` para que dispositivos móveis apresentem o teclado numérico adequado por padrão.

---

### Issue 7: `[UX/UI] Implement Light and Dark theme options using Nexus brand colors`
*   **Prioridade:** Média / Diferencial
*   **Área:** Frontend (UX)
*   **Descrição:**
    Implementar a alternância entre temas Claro (Light) e Escuro (Dark) adaptando a paleta de cores padrão para usar o Vermelho Corporativo/Carmim (`#b91c1c`) da Nexus como cor de destaque (`pine`).
*   **Ações Necessárias:**
    1.  Alterar `tailwind.config.js` para usar variáveis CSS baseadas em RGB e opacidade: `pine: 'rgb(var(--color-brand) / <alpha-value>)'` etc.
    2.  Declarar as variáveis RGB no `index.css` para os escopos `:root` (tema escuro padrão) e `:root[data-theme='light']` (tema claro).
    3.  Criar um contexto React `ThemeContext` para gerenciar a classe/atributo no `html` e persistir a escolha no `localStorage`.
    4.  Inserir um botão Sol/Lua no topo do cabeçalho móvel e na sidebar para desktop em `Layout.tsx`.

---

### Issue 8: `[UX/UI] Replace generic wallet icons with brand logo`
*   **Prioridade:** Baixa
*   **Área:** Frontend (Marca)
*   **Descrição:**
    A identidade visual pode ser fortalecida substituindo o ícone de carteira genérico (`Wallet`) da biblioteca `lucide-react` pela imagem oficial do logo da Nexus (`logo-nexus.jpg`) presente na pasta de imagens.
*   **Ações Necessárias:**
    1.  Importar e renderizar `logo-nexus.jpg` no cabeçalho/sidebar (`Layout.tsx`), na tela de login (`LoginPage.tsx`) e de registro (`RegisterPage.tsx`).

---

### Issue 9: `[UX/UI] Enhance Feedback module with 5-star rating selector`
*   **Prioridade:** Média / Diferencial
*   **Área:** Frontend & API
*   **Descrição:**
    *Verificação:* O encaminhamento dos feedbacks está funcionando perfeitamente (os tokens de autenticação são injetados pelo interceptor do Axios e a rota `/feedbacks` do backend cria o registro no DB com sucesso). 
    *Melhoria:* O banco de dados e a API já aceitam a gravação de uma nota opcional de 1 a 5 (`rating`). Devemos implementar um seletor visual de 5 estrelas no widget para enriquecer os dados coletados.
*   **Ações Necessárias:**
    1.  Em `ContactWidget.tsx`, adicionar um seletor interativo de 5 estrelas usando o ícone `Star` (com estados de hover e active coloridos com o vermelho da marca).
    2.  Ao submeter, incluir a nota (`rating`) selecionada no corpo do POST enviado para `/feedbacks`.
