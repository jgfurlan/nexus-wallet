# NXS-137: Tech Spec — Correção HttpOnly Cookie Auth

## Módulos Tocados
- `apps/api/src/modules/auth/auth.routes.ts`
- `apps/api/src/modules/auth/auth.schemas.ts`
- `apps/api/src/middleware/auth_guard.ts` (docstring only)
- `apps/api/src/app.ts` (CORS origins)
- `apps/web/src/services/api.ts`
- `apps/web/src/services/auth.service.ts`
- `apps/web/src/contexts/AuthContext.tsx`
- `apps/web/src/pages/LoginPage.tsx`

## Checklist de Implementação

### Backend

- [ ] **auth.routes.ts**: Adicionar endpoint `GET /auth/me` protegido com `authGuard`. Retorna `{ id, email }` do `request.user`.
- [ ] **auth.routes.ts**: Modificar resposta do login para incluir `user: { id, email }` no body (além de definir o cookie).
- [ ] **auth.schemas.ts**: Atualizar `AuthResponseSchema` para incluir `user` object.
- [ ] **auth_guard.ts**: Atualizar docstring para refletir que o token é lido do cookie (não mais do Authorization header).
- [ ] **app.ts**: Adicionar `http://localhost:3001` ao array de origins do CORS.

### Frontend

- [ ] **api.ts**: Remover `localStorage.removeItem('nexus_token')` residual no interceptor 401. Remover `localStorage.removeItem('nexus_user')`. Não redirecionar em 401 de rotas `/auth/`.
- [ ] **auth.service.ts**: Atualizar interface `AuthResponse` para incluir `user`.
- [ ] **AuthContext.tsx**: Remover `token` do state/interface. Remover todo uso de localStorage. No `useEffect` de mount, chamar `GET /auth/me` para validar sessão.
- [ ] **LoginPage.tsx**: Atualizar chamada `login()` para não passar token.

## Verificação
```bash
pnpm lint && pnpm typecheck && pnpm test
```

Teste manual: login → GET /wallet/balances deve retornar 200.
