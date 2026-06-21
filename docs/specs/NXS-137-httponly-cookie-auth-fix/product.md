# NXS-137: Correção de autenticação HttpOnly cookie

## Contexto
O merge da PR #127 (NXS-114, migração de JWT para HttpOnly cookie) quebrou produção. O login retorna 200 e seta o cookie, mas chamadas subsequentes à API retornam 401.

## Problema
O frontend ainda depende de resíduos da autenticação via localStorage (nexus_token, nexus_user) em vez de confiar exclusivamente no cookie HttpOnly. Não existe endpoint de validação de sessão no backend.

## Invariantes

### INV-1: Cookie como única fonte de autenticação
- O token JWT NUNCA é armazenado em localStorage.
- O estado de "autenticado" no frontend vem de uma chamada ao backend `GET /auth/me`.

### INV-2: Toda chamada à API envia credenciais
- Axios usa `withCredentials: true` em todas as requests.
- Nenhum código monta header `Authorization: Bearer` manualmente.

### INV-3: Backend lê token do cookie
- O `auth_guard` usa `request.jwtVerify()` que extrai o token do cookie `nexus_token` via config do `@fastify/jwt`.

### INV-4: CORS permite origens de desenvolvimento
- A whitelist de CORS inclui a porta real do Vite dev server (3001).

## Critérios de Aceite
1. Login → `/wallet/balances` retorna 200 (não 401) tanto em dev local quanto em produção.
2. Nenhuma referência a `nexus_token` em localStorage no frontend.
3. Reload da página valida sessão com o backend (GET /auth/me).
4. Logout limpa o cookie e redireciona para login.
