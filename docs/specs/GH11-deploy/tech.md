# GH11: Deploy Railway (API) + Vercel (Web) - Tech Specification

## Módulos Tocados
- Raiz do projeto (criação do `railway.toml`)
- `apps/web/` (criação do `vercel.json`)
- Repositório GitHub (configuração manual pós-código)

## Plano de Implementação

1. **Configuração Railway (API)**
   - Criar arquivo `railway.toml` na raiz do projeto.
   - Utilizar o `builder = "nixpacks"` (suporte nativo a pnpm workspaces).
   - Configurar o `buildCommand` executando: `pnpm install && pnpm --filter api db:generate && pnpm --filter api build`.
   - Configurar o `startCommand` executando: `pnpm --filter api exec prisma migrate deploy && pnpm --filter api start`.
   - Mapear a rota de healthcheck `/health`.

2. **Configuração Vercel (Frontend)**
   - Criar arquivo `vercel.json` dentro de `apps/web/`.
   - Definir uma regra de "rewrites" com "source": "/(.*)" apontando para "destination": "/index.html" para suportar roteamento SPA no cliente.

## Método de Verificação

### Testes Manuais de Deploy
1. **Verificação no Railway:**
   - Linkar o repositório.
   - Provisionar as instâncias do PostgreSQL e Redis.
   - Preencher `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, e rodar o pipeline.
   - Consultar `/health` para ver HTTP 200.
2. **Verificação na Vercel:**
   - Linkar repositório e selecionar *Framework Preset* (Vite), *Root Directory* (`apps/web`).
   - Adicionar a variável `VITE_API_URL` apontando para o app da API.
   - Fazer o build e testar uma rota qualquer (ex: carregar a URL em `/dashboard` deve renderizar o app corretamente sem dar 404).

## Passo a Passo para o Agente (Fase 2)
- [ ] Criar `/railway.toml` na raiz
- [ ] Criar `/apps/web/vercel.json`
