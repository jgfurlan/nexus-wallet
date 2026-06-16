# Product Spec: Módulo de Autenticação (GH2)

**Issue:** GH2 — Auth module (register, login, JWT, refresh token)
**Figma/Design:** N/A

---

## Resumo
Este módulo implementa o sistema de autenticação e gerenciamento de sessões do **NexusWallet**. Ele fornece mecanismos seguros para registro de novos usuários, login, renovação de tokens (Refresh Token Rotation) e proteção de rotas privadas através de um middleware de guarda (Auth Guard).

---

## Problema
Atualmente, qualquer pessoa pode acessar os endpoints da API (quando criados) sem se identificar. Para um sistema financeiro/carteira de criptoativos, é fundamental garantir que as informações de saldo e histórico sejam privadas e acessíveis apenas pelos respectivos donos de forma segura e stateless.

---

## Objetivos & Não-Objetivos

**Objetivos:**
- [ ] Permitir o registro de usuários via e-mail e senha com validações rígidas.
- [ ] Implementar login seguro gerando um token de acesso JWT (Access Token) de curta duração e um token de renovação (Refresh Token) de longa duração.
- [ ] Aplicar a rotação de Refresh Tokens (Refresh Token Rotation) para mitigar roubo de sessão.
- [ ] Criar um middleware global/específico para barrar requisições não autenticadas em rotas privadas.

**Não-Objetivos:**
- Recuperação de senha via e-mail ou fluxos de "esqueci minha senha" (fora de escopo).
- Autenticação multifator (MFA/2FA) (fora de escopo).

---

## Experiência do Usuário & Invariantes

### Fluxo Principal 1: Registro (`POST /auth/register`)
1. O usuário envia `email` e `password`.
2. O sistema valida os campos (e-mail válido, senha com mínimo de 8 caracteres).
3. O sistema cria o hash da senha usando `bcrypt`.
4. Em uma transação atômica, o sistema cria o usuário e sua carteira padrão (com saldos em BRL, BTC, ETH zerados).
5. O sistema retorna HTTP `201 Created` com os dados básicos do usuário (sem a senha).

### Fluxo Principal 2: Login (`POST /auth/login`)
1. O usuário envia `email` e `password`.
2. O sistema valida se o usuário existe e compara o hash da senha.
3. Se válido, gera um **Access Token JWT** (válido por 15 minutos) e um **Refresh Token** (válido por 7 dias).
4. O hash do Refresh Token é salvo no banco de dados do usuário.
5. Retorna HTTP `200 OK` com `{ accessToken: "...", refreshToken: "..." }`.

### Fluxo Principal 3: Renovação de Token (`POST /auth/refresh`)
1. O usuário envia o `refreshToken` no corpo da requisição.
2. O sistema decodifica e valida o token.
3. Verifica se o hash do Refresh Token confere com o salvo no banco de dados do usuário.
4. Se válido, gera um novo **Access Token** e um novo **Refresh Token** (rotacionado).
5. Salva o novo hash no banco e invalida o anterior.
6. Retorna HTTP `200 OK` com os novos tokens.

---

## Casos de Erro e Edge Cases

| Cenário | Comportamento Esperado |
|---------|------------------------|
| Registro com e-mail já existente | Retorna HTTP 409 Conflict com `{ error: "EMAIL_ALREADY_EXISTS" }` |
| Credenciais inválidas no Login | Retorna HTTP 401 Unauthorized com `{ error: "INVALID_CREDENTIALS" }` |
| Refresh Token expirado ou adulterado | Retorna HTTP 401 Unauthorized com `{ error: "INVALID_REFRESH_TOKEN" }` |
| Reuso de Refresh Token antigo (Tentativa de Ataque) | Detecta discrepância de hash, deleta o `refreshToken` do usuário no banco (deslogando todas as sessões) e retorna HTTP 401 |
| Requisição em rota privada sem Token ou expirada | Retorna HTTP 401 Unauthorized com `{ error: "UNAUTHORIZED", message: "Missing or invalid token" }` |

---

## Critérios de Aceitação
- [ ] Todas as rotas de autenticação (`/auth/register`, `/auth/login`, `/auth/refresh`) devidamente validadas via Zod.
- [ ] Passagem no portão de verificação: `pnpm test` (com testes integrados para sucesso, erro e reuso de refresh token), `pnpm lint` e `pnpm typecheck` retornando código de saída 0.
- [ ] Nenhuma rota privada permite acesso sem cabeçalho `Authorization: Bearer <token>`.
