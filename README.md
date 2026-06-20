# 🌌 NexusWallet

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Fastify](https://img.shields.io/badge/fastify-%23000000.svg?style=for-the-badge&logo=fastify&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)

Uma plataforma financeira moderna construída sobre arquitetura de microserviços e *Spec-Driven Development*. O NexusWallet suporta múltiplas moedas (Fiat e Crypto), webhook idempotente para depósitos, cotações em tempo real com Redis e um livro-razão (Ledger) append-only para auditoria garantida.

---

## 🏗 Estrutura do Repositório (Monorepo)
O projeto utiliza **pnpm workspaces** para dividir as responsabilidades:

- 📁 `apps/api/` — Backend de alta performance (Fastify, Prisma, Zod, Swagger)
- 📁 `apps/web/` — Frontend SPA (React, Vite, Tailwind CSS)
- 📁 `docs/` — Documentação Técnica e Specs

👉 Para entender profundamente a estrutura, padrões de código e decisões técnicas, acesse a nossa **[Documentação de Arquitetura](./docs/guidelines/architecture.md)**.

## 🛡️ Arquitetura e Resiliência

Para compreender em detalhes como a plataforma garante consistência financeira, controle de concorrência rigoroso e resiliência contra falhas, consulte o nosso **[Blueprint de Evolução Arquitetural e Resiliência](./docs/architecture/evolution-blueprint.md)**. O blueprint cobre:
- **Ledger Imutável (Double-Entry):** Registro histórico à prova de fraudes para todas as contas de saldo.
- **Isolamento SERIALIZABLE:** Prevenção absoluta contra race conditions de concorrência e falhas de duplo saque/depósito.
- **Transactional Outbox:** Garantia de entrega at-least-once para callbacks assíncronos e processamentos em background.
- **Redis & Token Bucket:** Cache estratégico de cotações em tempo real e limitação distribuída de requisições.

## 🚀 Pré-requisitos
Certifique-se de ter os seguintes componentes instalados na sua máquina local:
- **Node.js** (v20+)
- **pnpm** (v9+)
- **Docker e Docker Compose** (Para rodar o PostgreSQL e Redis localmente)

## 🛠 Instalação e Execução (Local)

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/jgfurlan/nexus-wallet.git
   cd nexus-wallet
   ```

2. **Instale todas as dependências do Monorepo:**
   ```bash
   pnpm install
   ```

3. **Suba a infraestrutura local (Bancos de Dados):**
   ```bash
   # Dentro de apps/api
   docker-compose up -d
   ```

4. **Configure as variáveis de ambiente e rode as migrações:**
   ```bash
   cd apps/api
   cp .env.example .env
   pnpm prisma migrate dev
   ```

5. **Inicie o servidor de desenvolvimento global:**
   ```bash
   # Na raiz do projeto, roda API e WEB simultaneamente
   pnpm dev
   ```

- **Frontend:** http://localhost:5173
- **API (Documentação Swagger):** http://localhost:3000/docs

## 🧪 Comandos Úteis (Workspaces)

A partir da **raiz** do projeto, você pode gerenciar toda a aplicação:
- `pnpm dev` — Inicia API e Web via *concurrently*.
- `pnpm test` — Roda a suíte completa de testes no Vitest.
- `pnpm lint` — Executa o Biome/ESLint em todo o projeto.
- `pnpm build` — Gera a versão de produção (tsc para backend, vite build para frontend).

## 📄 Governança e Metodologia
Nós seguimos o **Spec-Driven Development** sob rígida supervisão detalhada no `CLAUDE.md`. Nenhuma linha de código é alterada sem antes passar por um ciclo de Especificação (Spec), Revisão, e Implementação.
