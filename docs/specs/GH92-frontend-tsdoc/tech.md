# Technical Spec: Documentação de Código Frontend com JSDoc/TSDoc

**Veja `product.md` para o comportamento esperado pelo usuário e invariantes.**
**Issue:** GH92

---

## 1. Contexto
Os componentes visuais e lógicos do frontend residem sob `apps/web/src/`. Vamos enriquecer a base de código do frontend com comentários padrão JSDoc.

**Arquivos que receberão comentários:**
- `apps/web/src/components/Layout.tsx`
- `apps/web/src/components/ui/BalanceCard.tsx`
- `apps/web/src/components/drawers/SwapDrawer.tsx`
- `apps/web/src/components/drawers/HistoryDrawer.tsx`
- `apps/web/src/components/drawers/DepositDrawer.tsx`
- `apps/web/src/components/drawers/WithdrawDrawer.tsx`
- `apps/web/src/components/ui/ContactWidget.tsx`
- `apps/web/src/contexts/DrawerContext.tsx`
- `apps/web/src/contexts/ThemeContext.tsx`
- `apps/web/src/contexts/AuthContext.tsx`
- `apps/web/src/services/` (todos os arquivos de serviços como `api.ts`, `auth.service.ts`, `history.service.ts`, `swap.service.ts`, `wallet.service.ts`, `withdrawal.service.ts`)

---

## 2. Mudanças Propostas

### Padrão de Comentário a ser Adotado

#### Exemplo em Componentes React (Props e Componente):
```typescript
/**
 * Properties for the BalanceCard component.
 */
interface BalanceCardProps {
  /** The ticker symbol or full name of the token (e.g., "BTC", "Real Brasileiro") */
  token: string;
  /** The formatted balance amount (e.g., "1,500.00 BRL", "0.005 BTC") */
  amount: string;
  /** The calculated fiat estimation value in local currency (e.g., "R$ 1.500,00") */
  fiatValue?: string;
  /** Optional Lucide icon element to display in the header card */
  icon?: React.ReactNode;
  /** If true, renders a pulsing skeleton screen placeholder */
  isLoading?: boolean;
}

/**
 * BalanceCard renders an interactive dashboard card displaying the token balance
 * and its fiat valuation equivalent, supporting loading skeleton states.
 */
export const BalanceCard: React.FC<BalanceCardProps> = ({ ... }) => { ... }
```

#### Exemplo em Contextos Globais:
```typescript
/**
 * DrawerContext holds the global state of the transaction drawers.
 * Provides functions to open and close specific drawer overlays from any component.
 */
interface DrawerContextProps {
  /** Triggers the visibility of a drawer by its identifier */
  openDrawer: (type: DrawerType) => void;
  /** Closes any open drawer currently active */
  closeDrawer: () => void;
  /** The identifier of the currently open drawer, or null if none are active */
  activeDrawer: DrawerType | null;
}
```

#### Exemplo em Serviços de API Frontend:
```typescript
/**
 * Request a fiat or cryptocurrency withdrawal from the wallet.
 * 
 * @param payload - The withdrawal inputs containing token, amount, destination address, and externalId.
 * @returns A promise resolving to the created transaction details.
 */
static async requestWithdrawal(payload: WithdrawalPayload): Promise<Transaction> { ... }
```

---

## 3. Cronograma de Implementação
*(Executar passo a passo)*

- [ ] Documentar interfaces de propriedades e funções em `apps/web/src/components/ui/BalanceCard.tsx`.
- [ ] Documentar `Layout.tsx` e `ContactWidget.tsx`.
- [ ] Documentar os quatro drawers em `apps/web/src/components/drawers/`.
- [ ] Documentar os contextos globals em `apps/web/src/contexts/` (`DrawerContext`, `ThemeContext`, `AuthContext`).
- [ ] Documentar todos os serviços em `apps/web/src/services/`.
- [ ] Validar a build e linters rodando `pnpm lint` e `pnpm typecheck` na raiz.

---

## 4. Testes e Validação
- **TypeScript Typecheck:** Garantir compilador limpo na raiz do projeto.
- **Linter Check:** Garantir que o linter passe sem acusar erros ou avisos adicionais.
