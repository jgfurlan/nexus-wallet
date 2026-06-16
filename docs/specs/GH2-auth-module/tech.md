# Technical Spec: Módulo de Autenticação (GH2)

**Consulte `product.md` para detalhes sobre o comportamento esperado e casos de uso.**
**Issue:** GH2

---

## 1. Contexto
A autenticação será construída no backend Fastify (`apps/api`) utilizando a biblioteca oficial `@fastify/jwt` para emissão e validação de tokens JWT, e `bcrypt` para criptografia de senhas. A persistência usará o PostgreSQL via Prisma ORM.

---

## 2. Mudanças Propostas

### Fluxo de Dados e Segurança
- **Access Token:** Tempo de expiração de 15 minutos (`15m`). Contém `{ sub: userId, email: userEmail }` no payload.
- **Refresh Token:** String aleatória (gerada via `crypto.randomBytes(32).toString('hex')`) válida por 7 dias. Seu hash SHA256 será armazenado na coluna `User.refreshToken` do banco de dados.
- **Rotação de Refresh Tokens (RTR):** A cada uso do refresh token, um novo par (access + refresh) é gerado e o token antigo é revogado. Se o mesmo token antigo for submetido novamente (reuso), significa que ocorreu um vazamento de sessão; o sistema revoga imediatamente o refresh token atual do banco de dados, forçando o deslogamento completo.

### Bibliotecas a Adicionar
- `@fastify/jwt` (para gerenciamento de chaves e assinatura de JWTs).

### Módulos e Arquivos Criados/Modificados
| Arquivo | Tipo de Alteração | Descrição |
|------|-------------|-------------|
| `apps/api/package.json` | Modificado | Adicionar `@fastify/jwt` nas dependências. |
| `apps/api/src/app.ts` | Modificado | Registrar o plugin `@fastify/jwt` e o middleware global de autenticação. |
| `apps/api/src/middleware/auth_guard.ts` | Novo | Hook `preHandler` para proteger rotas privadas. |
| `apps/api/src/modules/auth/auth.schemas.ts` | Novo | Validações Zod para entrada e saída das rotas de autenticação. |
| `apps/api/src/modules/auth/auth.service.ts` | Novo | Regras de negócio (hashing, comparação de senhas, geração de tokens, rotação). |
| `apps/api/src/modules/auth/auth.routes.ts` | Novo | Definição das rotas `/auth/register`, `/auth/login`, `/auth/refresh`. |

### Definições de Tipagem e Schemas (Zod)

```typescript
import { z } from 'zod';

export const RegisterInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const RefreshInputSchema = z.object({
  refreshToken: z.string()
});

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string()
});
```

---

## 3. Lista de Implementação

- [ ] Instalar o pacote `@fastify/jwt` no workspace `api`.
- [ ] Registrar o plugin `@fastify/jwt` em `apps/api/src/app.ts` configurando a secret (lida da variável de ambiente `JWT_SECRET`).
- [ ] Criar as definições de rotas e schemas Zod em `apps/api/src/modules/auth/auth.schemas.ts`.
- [ ] Implementar a lógica de negócio em `apps/api/src/modules/auth/auth.service.ts`:
  - `registerUser`: Cria `User`, `Wallet` e inicializa `WalletBalance` (BRL, BTC, ETH) em uma transação do Prisma.
  - `loginUser`: Valida credenciais e gera tokens.
  - `refreshSession`: Valida o refresh token, executa a rotação e detecta reuso fraudulento.
- [ ] Registrar as rotas de autenticação em `apps/api/src/modules/auth/auth.routes.ts` conectando os schemas Zod de validação.
- [ ] Criar o guarda de rotas em `apps/api/src/middleware/auth_guard.ts`.
- [ ] Registrar as rotas de autenticação no arquivo central `apps/api/src/app.ts`.
- [ ] Criar arquivo de testes `apps/api/src/modules/auth/__tests__/auth.test.ts` cobrindo registro de usuário, login com sucesso/erro, refresh token rotation e detecção de reuso.
- [ ] Rodar testes unitários e de integração locais para validar o fluxo.
- [ ] Rodar lint e typecheck.

---

## 4. Testes e Validação

| Caso de Teste | Localização | Método de Verificação |
|---|---|---|
| Registro com sucesso | `auth.test.ts` | Envia e-mail inédito, verifica retorno 201 e existência da Wallet/Saldos no banco. |
| Registro e-mail duplicado | `auth.test.ts` | Envia e-mail existente, assevera retorno 409 Conflict. |
| Login credenciais corretas | `auth.test.ts` | Envia e-mail/senha corretos, valida retorno de `accessToken` e `refreshToken`. |
| Login credenciais incorretas | `auth.test.ts` | Envia credenciais inválidas, assevera retorno 401. |
| Rotação de Refresh Token | `auth.test.ts` | Executa refresh com token válido, assevera novos tokens gerados e invalidação do antigo. |
| Fraude de reuso detectada | `auth.test.ts` | Envia refresh token antigo usado, verifica revogação de todos os tokens e retorno 401. |
