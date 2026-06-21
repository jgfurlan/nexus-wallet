# 🐛 Nexus Wallet — Bug Report & Issues

> Análise realizada em: 2026-06-21  
> Ambiente: https://nexus-wallet-ashy.vercel.app/  
> Repositório: https://github.com/jgfurlan/nexus-wallet  
> Método: Análise de código-fonte + Testes de usuário via browser automatizado com DevTools

---

## 📸 Evidências Visuais (Browser Testing)

````carousel
![Dashboard — valores em BRL duplicados nos cards e 8 casas decimais em Atividades Recentes](C:\Users\joaog\.gemini\antigravity\brain\a56738bc-899f-4a3e-9823-fcc6f8d18f56\01_dashboard.png)
<!-- slide -->
![Modal de Saque — sem saldo disponível exibido acima do campo de valor](C:\Users\joaog\.gemini\antigravity\brain\a56738bc-899f-4a3e-9823-fcc6f8d18f56\03_saque_modal_inicial.png)
<!-- slide -->
![Digitando "123" — formulário funciona normalmente com 3 dígitos](C:\Users\joaog\.gemini\antigravity\brain\a56738bc-899f-4a3e-9823-fcc6f8d18f56\04_typing_123.png)
<!-- slide -->
![Digitando "456789" rapidamente — formulário se manteve (o crash pode ser intermitente, possivelmente relacionado ao apagar o valor)](C:\Users\joaog\.gemini\antigravity\brain\a56738bc-899f-4a3e-9823-fcc6f8d18f56\05_rapid_typing.png)
<!-- slide -->
![Modal de Saque com BTC selecionado — sem indicação de saldo BTC disponível](C:\Users\joaog\.gemini\antigravity\brain\a56738bc-899f-4a3e-9823-fcc6f8d18f56\06_saque_btc.png)
````

> [!NOTE]
> O browser test não conseguiu reproduzir a tela em branco com digitação direta. O crash reportado pelo usuário provavelmente ocorre ao **apagar** os dígitos (resultando em string vazia `""` sendo passada ao `new Decimal("")`), não ao digitar. O `formatToken` é chamado na `description` do `ConfirmModal` a cada re-render.

---

## Issue #1 — `[BUG]` Saldo disponível não exibido no modal de Saque

**Prioridade:** 🔴 Alta  
**Módulo:** `WithdrawDrawer.tsx`

### Descrição
No modal de "Sacar Fundos", o campo acima do input de valor (área circulada na imagem do usuário) não mostra o saldo disponível do token selecionado. O campo `token` é monitorado via `watch('token')`, mas nenhum dado de saldo é carregado no drawer.

### Causa Raiz
O componente `WithdrawDrawer` **não recebe os saldos como prop** e **não faz fetch de saldos** ao abrir. Comparando com o `SwapDrawer` (que faz o fetch corretamente):

```tsx
// SwapDrawer.tsx — faz o fetch ✅
useEffect(() => {
  if (isOpen) {
    WalletService.getBalances()
      .then(data => setBalances(data.balances))
      ...
  }
}, [isOpen]);

// WithdrawDrawer.tsx — NÃO tem estado de saldo ❌
// Nunca busca saldos, nunca exibe o valor disponível
```

O label `"Moeda e Valor"` não tem nenhuma indicação de saldo. No `SwapDrawer`, há o display:
```tsx
<span>Disponível: {formatCurrency(...)} {fromToken}</span>
```
Mas no `WithdrawDrawer` esse trecho simplesmente não existe.

### Reprodução
1. Abrir o modal "Sacar Fundos"
2. Observar que a área acima/próximo ao seletor de moeda está vazia — sem indicação de saldo disponível
3. Mudar o token de BRL para BTC e verificar que continua sem mostrar saldo

### Correção Proposta
Adicionar `useState<Balance[]>` + `useEffect` que chama `WalletService.getBalances()` ao abrir, e exibir o saldo disponível do token selecionado acima do input, igual ao padrão já implementado no `SwapDrawer`.

```tsx
// Adicionar ao WithdrawDrawer:
const [balances, setBalances] = useState<Balance[]>([]);

useEffect(() => {
  if (isOpen) {
    WalletService.getBalances()
      .then(data => setBalances(data.balances))
      .catch(err => console.error('Failed to fetch balances for withdraw drawer:', err));
  } else {
    setBalances([]);
  }
}, [isOpen]);

// No JSX, acima do input de valor:
<div className="flex justify-between items-center">
  <Label>Moeda e Valor</Label>
  <span className="text-xs text-subtle font-medium">
    Disponível: {token === 'BRL'
      ? formatCurrency(Number(balances.find(b => b.token === token)?.amount || 0))
      : formatToken(Number(balances.find(b => b.token === token)?.amount || 0))
    } {token !== 'BRL' ? token : ''}
  </span>
</div>
```

---

## Issue #2 — `[FEATURE REMOVAL]` Remover valores de conversão em BRL dos cards do Dashboard

**Prioridade:** 🟡 Média  
**Módulo:** `BalanceCard.tsx`, `DashboardPage.tsx`

### Descrição
Os cards de saldo no Dashboard exibem uma linha secundária com `≈ R$ X,XX` (valor estimado em BRL) para todos os tokens incluindo o próprio BRL (que mostra o mesmo valor duplicado). O usuário solicitou a remoção desses valores convertidos.

### Causa Raiz
No `BalanceCard.tsx`, o componente sempre renderiza a prop `fiatValue`:
```tsx
<div className="flex items-center gap-2 text-sm">
  <span className="text-subtle">≈</span>
  <span className="text-subtle font-medium">{fiatValue}</span>
</div>
```

No `DashboardPage.tsx`, o card BRL exibe o mesmo valor duplicado:
```tsx
<BalanceCard
  token="Real Brasileiro"
  amount={formatCurrency(getBalance('BRL'))}
  fiatValue={formatCurrency(getBalance('BRL'))}  // ← mesmo valor duplicado
  ...
/>
```

### Correção Proposta
**Opção A (Recomendada):** Tornar a exibição de `fiatValue` opcional via prop, e remover o bloco `fiatValue` do `BalanceCard` quando não for passado ou quando o token for BRL.

```tsx
// BalanceCard.tsx — tornar o bloco opcional
{fiatValue && (
  <div className="flex items-center gap-2 text-sm">
    <span className="text-subtle">≈</span>
    <span className="text-subtle font-medium">{fiatValue}</span>
  </div>
)}
```

```tsx
// DashboardPage.tsx — não passar fiatValue para nenhum card
<BalanceCard token="Real Brasileiro" amount={...} icon={...} isLoading={...} />
<BalanceCard token="Bitcoin" amount={...} icon={...} isLoading={...} />
<BalanceCard token="Ethereum" amount={...} icon={...} isLoading={...} />
```

---

## Issue #3 — `[BUG CRÍTICO]` Página fica em branco ao digitar no campo de valor do Saque

**Prioridade:** 🔴 Crítica  
**Módulo:** `WithdrawDrawer.tsx`, `formatters.ts`, `Drawer.tsx`

### Descrição
Ao digitar 3 ou mais caracteres no campo de valor do modal de Saque, a página inteira fica em branco (white screen / tela preta). Isso é um crash total do React — um Error Boundary não implementado faz com que o componente remova todo o DOM.

### Causa Raiz Provável

**Hipótese primária — `formatToken` no ConfirmModal:**
Na linha 195 do `WithdrawDrawer.tsx`:
```tsx
description={`Você está prestes a sacar ${formatToken(amount || 0)} ${token} para: ${address}`}
```

O `ConfirmModal` renderiza isso **enquanto o form ainda está aberto** (não só ao abrir o modal). O `formatToken` usa `Decimal.js`:
```ts
export const formatToken = (value: string | number, digits = 8) => {
  const amount = new Decimal(value);  // ← pode lançar erro!
  return amount.toFixed(digits);
};
```

Se `amount` for uma string parcial inválida como `"1."`, `"0,"`, ou string vazia `""`, o construtor `new Decimal()` **lança uma exceção não tratada**. Como não há `try/catch` nem Error Boundary, o crash derruba o componente/árvore inteira.

**O problema mais provável:** `new Decimal("")` ou `new Decimal(undefined)` gera `Error: [DecimalError] Invalid argument: undefined`.

### Reprodução
1. Abrir "Sacar Fundos"
2. Digitar `1`, depois `2`, depois `3` no campo de valor
3. Observar a página ficar em branco

### Correção Proposta

**1. Proteger o `formatToken` contra inputs inválidos:**
```ts
export const formatToken = (value: string | number, digits = 8) => {
  try {
    if (value === '' || value === null || value === undefined) return '0.00000000';
    const amount = new Decimal(value);
    return amount.toFixed(digits);
  } catch {
    return '0.00000000';
  }
};
```

**2. Proteger o `formatCurrency` da mesma forma:**
```ts
export const formatCurrency = (value: string | number, currency = 'BRL') => {
  try {
    if (value === '' || value === null || value === undefined) return 'R$ 0,00';
    const amount = new Decimal(value);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(amount.toNumber());
  } catch {
    return 'R$ 0,00';
  }
};
```

**3. Adicionar um Error Boundary global na aplicação (`App.tsx`):**
```tsx
// ErrorBoundary.tsx
class ErrorBoundary extends React.Component<{children: ReactNode}, {hasError: boolean}> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error) { console.error('Uncaught error:', error); }
  render() {
    if (this.state.hasError) {
      return <div>Algo deu errado. <button onClick={() => this.setState({hasError: false})}>Tentar novamente</button></div>;
    }
    return this.props.children;
  }
}
```

**4. Proteger o campo de descrição do ConfirmModal:**
```tsx
// WithdrawDrawer.tsx linha 195
description={`Você está prestes a sacar ${amount && !isNaN(Number(amount)) ? formatToken(amount) : '0'} ${token} para: ${address}`}
```

---

## Issue #4 — `[BUG]` BalanceCard do BRL exibe valor duplicado (mesmo valor em amount e fiatValue)

**Prioridade:** 🟡 Média  
**Módulo:** `DashboardPage.tsx`

### Descrição
O card "Real Brasileiro" exibe o mesmo valor em dois lugares:
- Valor principal: `R$ 2.741,00`
- Valor secundário: `≈ R$ 2.741,00`

Isso é confuso e redundante — o BRL já é a moeda de referência, não há necessidade de converter BRL em BRL.

### Causa Raiz
```tsx
// DashboardPage.tsx linha 84-90
<BalanceCard
  token="Real Brasileiro"
  amount={formatCurrency(getBalance('BRL'))}
  fiatValue={formatCurrency(getBalance('BRL'))}  // ← idêntico ao amount
  ...
/>
```

### Correção Proposta
Não passar `fiatValue` para o card BRL (coberto pela Issue #2).

---

## Issue #5 — `[BUG]` Drawer não possui animação de entrada/saída

**Prioridade:** 🟢 Baixa  
**Módulo:** `Drawer.tsx`

### Descrição
O `Drawer.tsx` tem lógica CSS para animação (`translate-x-0` vs `-translate-x-full`) mas retorna `null` quando `isOpen === false`:
```tsx
if (!isOpen) return null;  // ← montagem/desmontagem instantânea, sem animação de saída
```
Isso faz com que o drawer apareça e desapareça sem animação.

### Correção Proposta
Usar o padrão de manter o drawer montado e controlar apenas visibilidade + animação via CSS:
```tsx
// Não retornar null, mas usar classe CSS condicional
<div className={cn(
  "fixed inset-y-0 ...",
  isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none"
)} />
```
Ou usar uma biblioteca como `framer-motion` / `@radix-ui/react-dialog`.

---

## Issue #6 — `[BUG]` `formatToken` no Dashboard usa 8 casas decimais para BTC/ETH nos cards

**Prioridade:** 🟡 Média  
**Módulo:** `DashboardPage.tsx`, `formatters.ts`

### Descrição
`formatToken` sempre formata com 8 dígitos por padrão. O card BTC exibe `0.00014894 BTC` (OK), mas o card ETH exibe `0.00000000 ETH` — strings longas que podem desalinhar o layout e confundir o usuário.

### Correção Proposta
Usar formatação inteligente que trunca trailing zeros:
```ts
export const formatToken = (value: string | number, digits = 8) => {
  try {
    const amount = new Decimal(value || 0);
    return amount.toSignificantDigits(8).toString(); // Ou toFixed com trim
  } catch {
    return '0';
  }
};
```

---

## Issue #7 — `[BUG]` Histórico: campo `formatDate` recebe string sem garantia de formato

**Prioridade:** 🟡 Média  
**Módulo:** `HistoryDrawer.tsx`, `formatters.ts`

### Descrição
Na linha 129 do `HistoryDrawer.tsx`:
```tsx
<p className="text-[10px] text-subtle">{formatDate(tx.createdAt)}</p>
```

`tx.createdAt` é tipado como `string`. Se a API retornar um formato inesperado (ex: timestamp Unix, formato sem timezone), `new Date(date)` pode retornar `Invalid Date` sem nenhum tratamento de erro.

### Correção Proposta
Adicionar tratamento de erro no `formatDate`:
```ts
export const formatDate = (date: string | Date) => {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Data inválida';
    return new Intl.DateTimeFormat('pt-BR', { ... }).format(d);
  } catch {
    return 'Data inválida';
  }
};
```

---

## Issue #8 — `[SEGURANÇA]` Token JWT armazenado em localStorage

**Prioridade:** 🟠 Alta (Segurança)  
**Módulo:** `AuthContext.tsx`

### Descrição
O token de autenticação JWT é armazenado em `localStorage`:
```ts
localStorage.setItem('nexus_token', newToken);
```

O `localStorage` é acessível via JavaScript, tornando o token vulnerável a ataques **XSS (Cross-Site Scripting)**. Qualquer script injetado na página pode ler e roubar o token.

### Correção Proposta
Mover o token para um **`HttpOnly cookie`** (gerenciado pelo servidor), que não é acessível via JavaScript. Isso requer mudanças no backend (API deve definir o cookie) e no frontend (remover o armazenamento manual no localStorage).

---

## Issue #9 — `[BUG]` Sem tratamento de erro global (ausência de Error Boundary)

**Prioridade:** 🔴 Crítica  
**Módulo:** `App.tsx`

### Descrição
A aplicação não possui nenhum `Error Boundary` React. Qualquer exceção não tratada em qualquer componente derruba **toda a árvore de componentes**, resultando em tela branca/preta. Este é o mecanismo que causa o bug reportado na Issue #3.

### Correção Proposta
Adicionar um `ErrorBoundary` envolvendo toda a aplicação em `App.tsx`:
```tsx
// apps/web/src/components/ErrorBoundary.tsx — [NEW FILE]
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Algo deu errado.</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

```tsx
// App.tsx
<ErrorBoundary>
  <ThemeProvider>
    <BrowserRouter>
      ...
    </BrowserRouter>
  </ThemeProvider>
</ErrorBoundary>
```

---

## Issue #10 — `[UX]` SwapDrawer: tokens de destino inicialmente incluem BRL como primeira opção no `toToken` select, mas o default é BTC

**Prioridade:** 🟢 Baixa  
**Módulo:** `SwapDrawer.tsx`

### Descrição
No `SwapDrawer`, o select de `toToken` lista opções na ordem `[BTC, ETH, BRL]` mas o `defaultValues` define `toToken: 'BTC'`. O problema é que quando o usuário muda `fromToken` para `BTC`, o `toToken` permanece `BTC`, criando um estado inválido (mesmo token de origem e destino). O schema Zod valida isso, mas o usuário só é alertado após tentar submeter.

### Causa Raiz
Não há lógica reativa que atualize automaticamente o `toToken` quando o usuário muda o `fromToken` para um valor igual ao `toToken`.

### Correção Proposta
```tsx
// SwapDrawer.tsx — Adicionar useEffect para auto-corrigir conflito de tokens
useEffect(() => {
  if (fromToken === toToken) {
    // Mudar toToken para o próximo token disponível
    const tokens = ['BRL', 'BTC', 'ETH'] as TokenSymbol[];
    const next = tokens.find(t => t !== fromToken);
    if (next) setValue('toToken', next);
  }
}, [fromToken]);
```

---

## Issue #11 — `[BUG CRÍTICO]` Acesso ao Histórico causa redirecionamento para o Login

**Prioridade:** 🔴 Crítica  
**Módulo:** `HistoryDrawer.tsx`, `history.service.ts`, Backend `history.routes.ts`

### Descrição
Ao clicar em "Histórico" ou tentar abrir o `HistoryDrawer`, a sessão do usuário é imediatamente encerrada e ele é redirecionado para a tela de Login. Isso ocorre porque a requisição `/wallet/history` está retornando um erro `401 Unauthorized`. O interceptor do `api.ts` captura esse 401, remove os tokens do `localStorage` e força o redirecionamento para `/login`.

### Causa Raiz
O endpoint `/wallet/history` na API não está reconhecendo o token de autenticação (possível falha de validação JWT, rota não registrada corretamente com o middleware de autenticação, ou erro interno não tratado na rota que devolve 401). 

### Correção Proposta
1. Verificar o backend (`apps/api/src/modules/wallet/history.routes.ts`) para garantir que o middleware `authenticate` está sendo aplicado corretamente.
2. Garantir que eventuais erros no endpoint não retornem 401 a menos que o token seja efetivamente inválido.
