# Documento de Design de Arquitetura — NexusWallet

**Data de Criação:** 2026-06-12  
**Autor:** Candidato (Design Individual)  
**Status:** Aprovado para Implementação  

---

## 1. Visão Geral & Missão

A minha missão com o **NexusWallet** é construir uma API REST robusta, segura e totalmente auditável para gerenciamento de carteira simplificada de criptoativos. O sistema deve permitir que usuários se cadastrem, mantenham saldos em diferentes moedas (BRL, BTC, ETH), recebam créditos via webhook de depósitos fictícios, realizem conversões (swaps) em tempo real integrados com cotações externas, executem saques e tenham um extrato imutável de todas as movimentações.

Desenhei a arquitetura sob três pilares inegociáveis:
1. **Rastreabilidade Absoluta (Ledger Imutável):** Cada variação de saldo deve ser justificada por uma linha imutável no ledger.
2. **Consistência e Segurança:** Uso de isolamento transacional rigoroso para evitar double-spending ou inconsistência de saldos.
3. **Simplicidade Técnica (Evitar Overengineering):** Preferência por Fastify e Prisma direto, evitando complexidades como repositórios fictícios ou eventos assíncronos onde a sincronia do banco relacional resolve com elegância.

---

## 2. Estrutura do Projeto (Monorepo)

Optei por organizar o código em um monorepo gerenciado via `pnpm workspaces` estruturado da seguinte forma:

```
nexus-wallet/
├── apps/
│   ├── api/                         # Backend Fastify + TypeScript
│   │   ├── src/
│   │   │   ├── modules/             # Divisão modular de negócios
│   │   │   │   ├── auth/            # Registro, login e JWT
│   │   │   │   ├── wallet/          # Consulta de saldos
│   │   │   │   ├── swap/            # Cotação e execução de conversões
│   │   │   │   ├── withdrawal/      # Solicitação de saques
│   │   │   │   └── ledger/          # Trilha imutável e extrato
│   │   │   ├── lib/                 # Singletons de integração (Prisma, Redis, CoinGecko)
│   │   │   ├── middleware/          # Guardas de autenticação e validação
│   │   │   └── app.ts               # Inicialização da API Fastify
│   │   ├── prisma/                  # Configurações do Prisma ORM
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── vitest.config.ts
│   └── web/                         # Frontend React + Vite + TailwindCSS
│       ├── src/
│       │   ├── pages/               # Dashboard, Login, Histórico
│       │   ├── components/          # Elementos visuais (Rose Pine theme)
│       │   └── lib/                 # Chamadas HTTP usando Axios/Fetch
└── docs/
    ├── decisions/                   # Architectural Decision Records (ADRs)
    └── superpowers/                 # Documentos de design técnico
```

---

## 3. Modelo de Dados & Invariantes de Negócio

Decidi modelar o banco de dados PostgreSQL usando o Prisma ORM. O esquema reflete as entidades essenciais e garante integridade referencial:

### 3.1. Entidades do Banco de Dados
- **User:** Cadastro básico com e-mail e hash da senha. Guarda a referência da Wallet associada e o refresh token criptografado para autenticação stateless.
- **Wallet:** Agrupador de saldos. Cada usuário possui exatamente uma Wallet, criada de forma automática e atômica durante o registro.
- **WalletBalance:** Registro físico do saldo de um determinado token (BRL, BTC ou ETH) de uma carteira específica. Possui uma constraint única composta por `(walletId, token)`.
- **LedgerEntry:** Tabela append-only imutável. Cada movimentação física no saldo de um usuário insere uma linha aqui com o valor da alteração (`delta`), o saldo antes da movimentação (`balanceBefore`) e o saldo resultante (`balanceAfter`). **Registros nunca são deletados ou atualizados.**
- **Transaction:** Registro macro que agrupa operações de negócio (Depósito, Saque, Swap). Permite correlacionar múltiplas LedgerEntries correspondentes a um mesmo evento.

### 3.2. Regras de Invariantes
- **Precisão Numérica:** Todos os valores numéricos de saldo, cotação e taxas são guardados como `Decimal` com 36 dígitos de precisão e 18 casas decimais (compatível com os limites padrão do Ethereum e do Bitcoin). No runtime, utilizo a biblioteca `decimal.js` para cálculos, mitigando riscos de arredondamento inerentes ao tipo de ponto flutuante do JavaScript.
- **Isolamento de Transações:** Operações de débito, crédito ou swap executam em nível de isolamento **Serializable** usando `$transaction` do Prisma. Isso previne qualquer condição de corrida onde dois requests de débito paralelos pudessem ignorar a verificação de saldo mínimo.

---

## 4. Fluxos e Casos de Uso Detalhados

### 4.1. Cadastro e Criação de Carteira (Auth & Wallet)
Quando um usuário realiza o cadastro pelo endpoint `POST /auth/register`:
1. Valido os dados usando Zod.
2. Crio o hash da senha usando `bcrypt`.
3. Em uma transação atômica do Prisma:
   - Crio o registro do `User`.
   - Crio a `Wallet` associada a ele.
   - Inicializo três registros de `WalletBalance` (BRL, BTC, ETH) com saldo igual a `0`.

### 4.2. Depósito via Webhook (Idempotência e Segurança)
O webhook `POST /webhooks/deposit` recebe notificações de depósitos fictícios vindos de adquirentes ou gateways:
1. Valido a assinatura do webhook (se configurada) e os dados via Zod.
2. Verifico se o `idempotencyKey` enviado pelo gateway já existe na tabela de `Transaction`.
   - Se já existir: Retorno imediatamente HTTP `200 OK` com os dados da transação existente, sem realizar novos créditos.
3. Se for uma transação inédita, inicio uma `$transaction`:
   - Crio a `Transaction` do tipo `DEPOSIT` contendo o `idempotencyKey`.
   - Localizo o `WalletBalance` correspondente ao token depositado.
   - Registro uma `LedgerEntry` do tipo `DEPOSIT`:
     - `delta` = valor do depósito.
     - `balanceBefore` = saldo atual.
     - `balanceAfter` = saldo atual + delta.
   - Incremento o valor de `WalletBalance.amount` com o montante depositado.
4. Retorno HTTP `201 Created`.

### 4.3. Execução de Swap (Cotação e Atomicidade)
O swap de moedas ocorre em duas etapas para garantir a melhor experiência do usuário e proteção contra volatilidade:

#### Etapa 1: Cotação (`GET /swap/quote`)
1. O usuário solicita converter `X` BRL em BTC.
2. O backend consulta a taxa no Redis. Se não houver cache:
   - Consulta a API CoinGecko para obter a cotação atual.
   - Salva a cotação no Redis com TTL de **30 segundos** (protege os limites da API externa).
3. Aplico a taxa administrativa configurada (ex: 1%).
4. Retorno a cotação calculada contendo um `quoteId` temporário.

#### Etapa 2: Execução (`POST /swap/execute`)
1. O usuário submete o `quoteId` e o montante a ser convertido.
2. Executo a validação dentro de uma `$transaction` Serializable:
   - Consulto o saldo do token de origem (ex: BRL).
   - Valido se `saldo_origem >= montante_origem`.
   - Calculo a taxa de swap. Optei por debitá-la diretamente no token de **origem** para simplificar a validação e impedir saldos finais de destino negativos.
   - Crio o registro principal na tabela de `Transaction` do tipo `SWAP`.
   - Registro e atualizo três movimentações no ledger:
     - **LedgerEntry 1 (SWAP_FEE):** Debita o valor da taxa do token de origem. Atualiza o saldo correspondente.
     - **LedgerEntry 2 (SWAP_OUT):** Debita o valor líquido da conversão do token de origem. Atualiza o saldo correspondente.
     - **LedgerEntry 3 (SWAP_IN):** Credita o valor convertido no saldo do token de destino (ex: BTC). Atualiza o saldo correspondente.
3. Confirmo a transação no banco de dados e retorno sucesso.

### 4.4. Auditoria de Saldos (GET /admin/audit/:walletId)
Como medida extra de segurança e rastreabilidade, implementei um endpoint de auditoria administrativa:
1. O administrador solicita a auditoria de uma carteira específica.
2. O sistema executa uma consulta agregada que soma todos os `delta` das `LedgerEntry` de cada token da carteira (`SUM(delta)`).
3. Compara o valor calculado com o saldo atual mantido na tabela `WalletBalance`.
4. Se houver discrepância, o endpoint sinaliza a quebra de integridade imediatamente e lista quais tokens sofreram divergência.

---

## 5. Infraestrutura & Estratégia de Deploy

- **Hospedagem da API & Banco de Dados:** Optei por realizar o deploy do backend Fastify, do banco PostgreSQL e do Redis na **Railway**. A plataforma oferece integração nativa entre serviços na mesma rede interna de baixa latência e se enquadra nas cotas de desenvolvimento/teste de forma otimizada.
- **Hospedagem do Frontend:** A interface web em React será hospedada de forma estática na **Vercel**, aproveitando a rede global de CDNs e garantindo carregamentos de página sub-segundo. A comunicação com a API será parametrizada via variáveis de ambiente (`VITE_API_URL`).
