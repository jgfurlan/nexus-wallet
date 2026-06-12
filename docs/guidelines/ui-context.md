# UI Context: NexusWallet Aesthetics & UX Paradigms

## Design System: Rose Pine Dark

| Token | Hex | Tailwind Custom Class | Usage |
|-------|-----|-----------------------|-------|
| `pine` | `#3b82f6` | `text-pine` / `bg-pine` | Primary actions, success states, `:focus` rings |
| `love` | `#eb6f92` | `text-love` / `bg-love` | Errors, destructive actions (withdrawals), negative balance |
| `gold` | `#f6c177` | `text-gold` / `bg-gold` | Warnings, pending states, fee indicators |
| `foam` | `#9ccfd8` | `text-foam` / `bg-foam` | Secondary actions, swap destination amounts |
| `text` | `#e0def4` | `text-primary` | Body text, labels, input values |
| `subtle` | `#908caa` | `text-subtle` | Placeholder text, secondary labels |
| `surface` | `#1f1d2e` | `bg-surface` | Card backgrounds |
| `base` | `#191724` | `bg-base` | Page background |
| `overlay` | `#26233a` | `bg-overlay` | Modal overlays, dropdown backgrounds |

Add to `tailwind.config.ts`:
```ts
colors: {
  pine: '#3b82f6', love: '#eb6f92', gold: '#f6c177',
  foam: '#9ccfd8', surface: '#1f1d2e', base: '#191724',
  overlay: '#26233a', primary: '#e0def4', subtle: '#908caa',
}
```

---

## Layout Behaviors

- **Page background:** `bg-base min-h-screen`
- **Main content:** `max-w-4xl mx-auto px-4 py-8`
- **Cards:** `bg-surface rounded-lg p-6`
- **Spacing:** Tailwind default scale — `gap-4`, `p-8`, `mb-6`
- **Radius:** `rounded-lg` (cards), `rounded-md` (buttons/inputs)
- **Typography:** Inter or system-ui; heading `text-xl font-semibold text-primary`

---

## Component Patterns

### Balance Card
```
┌─────────────────────────────┐
│  BTC                        │
│  0.00420000        [foam]   │
│  ≈ R$ 1,247.30     [subtle] │
└─────────────────────────────┘
```
- Token symbol: `text-sm font-mono text-subtle uppercase`
- Amount: `text-2xl font-bold text-primary`
- Fiat equivalent: `text-sm text-subtle`

### Swap Form
- Source token + amount → arrow icon (foam) → destination token + estimated amount
- Fee line: `text-xs text-gold` — "Taxa: 1.5% = 0.00006 BTC"
- Execute button: `bg-pine text-white rounded-md` — disabled + spinner while loading

### Transaction Row
- Icon by type: deposit=↓(foam), withdrawal=↑(love), swap=⇄(gold)
- Amount delta: green for positive, `text-love` for negative
- Timestamp: `text-xs text-subtle`

---

## UX Paradigms

### 1. Anticipatory Finance
The UI surfaces context before the user asks:
- Show fiat equivalent next to every crypto balance (uses cached CoinGecko rate)
- Show fee cost inline in the swap form before confirmation
- Highlight if a withdrawal would leave balance below a meaningful threshold

### 2. Trust Architecture
- Every action with monetary consequence shows a **confirmation step** before execution
- Use both color AND icon for status — never color alone (accessibility)
- Every async action shows a loading state; every completion shows a success/error toast
- Interactive elements minimum touch target: `min-h-[44px] min-w-[44px]`

### 3. Accessibility (WCAG 2.2 AA)
- Keyboard-first navigation for all interactive elements
- `aria-label` required on all icon-only buttons
- Focus rings: `focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2 focus:ring-offset-base`
- Contrast ratio ≥ 4.5:1 for all body text against backgrounds

---

## Page Map

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `DashboardPage` | Balance cards + recent transactions |
| `/swap` | `SwapPage` | Quote + execute swap |
| `/history` | `HistoryPage` | Paginated ledger / transaction list |
| `/login` | `LoginPage` | Email + password login |
| `/register` | `RegisterPage` | Email + password registration |
