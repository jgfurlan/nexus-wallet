# Technical Specification: UX Revamp & Drawers Architecture (GH41)

## Implementation Plan

### 1. Database & Backend (Feedback & Faucet)
- **`apps/api/prisma/schema.prisma`**:
  - `[MODIFY]` Adicionar model `Feedback` (`id`, `userId`, `message`, `rating`, `createdAt`).
  - Executar `pnpm prisma format` e `pnpm prisma migrate dev --name add_feedback_model`.
- **`apps/api/src/modules/feedback/`**:
  - `[NEW]` Criar `feedback.schemas.ts`, `feedback.service.ts`, `feedback.routes.ts`.
  - Registrar rotas em `app.ts`.
- **`apps/api/src/modules/test/faucet.routes.ts`**:
  - `[NEW]` Criar rota POST em `/api/v1/test/faucet` utilizando o `DepositService` existente. Requer autenticação de usuário (JWT) e injeta valor fixo (1.000 BRL) na carteira.
  - Registrar em `app.ts`.

### 2. Frontend: UI/UX Polish
- **`apps/web/src/index.css`**:
  - `[MODIFY]` Atualizar tokens de CSS: usar `bg-zinc-900` para body.
- **`apps/web/src/components/ui/`**:
  - `[MODIFY]` `Card.tsx`, `Button.tsx`, `Input.tsx`: Alterar `rounded-md` para `rounded-2xl`. Ajustar backgrounds dos inputs para translúcido `bg-white/5` com bordas sutis.

### 3. Frontend: Layout & Drawers
- **`apps/web/src/components/ui/Drawer.tsx`**:
  - `[NEW]` Componente de gaveta deslizante usando animação CSS.
- **`apps/web/src/components/Layout.tsx`**:
  - `[MODIFY]` Alterar o layout top-nav (Header) para left-nav (Sidebar) no desktop. Manter bottom-nav no mobile.
- **Gavetas (Drawers)**:
  - `[NEW]` `SwapDrawer.tsx` (Migrado do `SwapPage.tsx`).
  - `[NEW]` `HistoryDrawer.tsx` (Migrado do `HistoryPage.tsx`).
  - `[NEW]` `WithdrawDrawer.tsx`.
  - `[NEW]` `DepositDrawer.tsx` (Interface para acionar o Faucet).
- **`apps/web/src/pages/DashboardPage.tsx`**:
  - `[MODIFY]` O Dashboard agora controla os estados locais de quais Drawers estão abertos. Renderiza todos os Drawers e expõe botões para abri-los.
  - `[DELETE]` `SwapPage.tsx` e `HistoryPage.tsx` são apagados do `App.tsx` (rotas).

### 4. Frontend: "Fale Conosco" (Feedback)
- **`apps/web/src/components/ui/ContactWidget.tsx`**:
  - `[NEW]` Floating Action Button no canto direito com modal de formulário.
  - Conecta com a API `POST /api/v1/feedbacks`.

## Verification Plan

### Automated Tests
- Executar `pnpm test` e `pnpm typecheck` no backend e frontend para validar as novas rotas e a estrutura do React.
- Validação do schema via `pnpm prisma validate`.

### Manual Verification
1. Fazer o login.
2. Inspecionar o Layout: confirmar a presença da Sidebar na esquerda (Desktop) ou Bottom Bar (Mobile).
3. Testar Drawers: Abrir "Depositar", "Converter", "Sacar", "Histórico". Verificar a fluidez da animação e a sobreposição (backdrop blur) em relação ao dashboard.
4. Testar Faucet: clicar em "Simular Depósito" no Drawer e garantir que o saldo atualizou na Home.
5. Fale Conosco: abrir o Widget, digitar uma mensagem, submeter e consultar no banco de dados.
