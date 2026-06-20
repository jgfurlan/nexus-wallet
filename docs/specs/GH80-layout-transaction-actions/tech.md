# Technical Spec: Ações Transacionais no Menu Lateral e Barra de Navegação Móvel

**Veja `product.md` para o comportamento esperado pelo usuário e invariantes.**
**Issue:** GH80

---

## 1. Contexto
Atualmente, o controle dos Drawers (`isOpen`, `onClose`, etc.) está acoplado à página [DashboardPage.tsx](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/web/src/pages/DashboardPage.tsx). Para tornar essas ações globais e acessíveis na barra lateral e barra móvel de [Layout.tsx](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/web/src/components/Layout.tsx), implementaremos um contexto global de controle.

**Arquivos Relevantes:**
- `apps/web/src/components/Layout.tsx` — Contém a Sidebar e Bottom Nav.
- `apps/web/src/pages/DashboardPage.tsx` — Contém os botões antigos e renderiza as gavetas.
- `apps/web/src/contexts/DrawerContext.tsx` — [NOVO] Contexto para gerenciar qual gaveta está aberta.

---

## 2. Mudanças Propostas

### Arquitetura / Fluxo de Dados
```
[User Action on Sidebar / Mobile Nav] 
        │
        ▼ (triggers openDrawer('type'))
[DrawerContext / DrawerProvider] ──► renders active [Drawer]
        │
        ▼ (on transaction success)
[window.dispatchEvent(CustomEvent 'transaction-success')]
        │
        ▼ (listens to event)
[DashboardPage (calls loadData())]
```

### Mudanças nos Módulos

| Arquivo | Tipo de Alteração | Descrição |
|------|-------------|-------------|
| [`apps/web/src/contexts/DrawerContext.tsx`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/web/src/contexts/DrawerContext.tsx) | [NOVO] | Cria o contexto e provider global para controlar o estado dos Drawers. |
| [`apps/web/src/components/Layout.tsx`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/web/src/components/Layout.tsx) | Modificado | Envelopar o conteúdo com o `DrawerProvider` e renderizar as ações na Sidebar e Bottom Nav. |
| [`apps/web/src/pages/DashboardPage.tsx`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/web/src/pages/DashboardPage.tsx) | Modificado | Remover os botões locais e a renderização das gavetas. Ouvir o evento `transaction-success` para recarregar dados. |

### Detalhes de Código: DrawerContext.tsx
```typescript
import React, { createContext, useContext, useState } from 'react';
import { SwapDrawer } from '../components/drawers/SwapDrawer';
import { HistoryDrawer } from '../components/drawers/HistoryDrawer';
import { DepositDrawer } from '../components/drawers/DepositDrawer';
import { WithdrawDrawer } from '../components/drawers/WithdrawDrawer';

type DrawerType = 'deposit' | 'withdraw' | 'swap' | 'history';

interface DrawerContextProps {
  openDrawer: (type: DrawerType) => void;
  closeDrawer: () => void;
  activeDrawer: DrawerType | null;
}

const DrawerContext = createContext<DrawerContextProps | undefined>(undefined);

export const DrawerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeDrawer, setActiveDrawer] = useState<DrawerType | null>(null);

  const openDrawer = (type: DrawerType) => setActiveDrawer(type);
  const closeDrawer = () => setActiveDrawer(null);

  const handleSuccess = () => {
    window.dispatchEvent(new CustomEvent('transaction-success'));
  };

  return (
    <DrawerContext.Provider value={{ openDrawer, closeDrawer, activeDrawer }}>
      {children}
      <SwapDrawer isOpen={activeDrawer === 'swap'} onClose={closeDrawer} onSuccess={handleSuccess} />
      <HistoryDrawer isOpen={activeDrawer === 'history'} onClose={closeDrawer} />
      <DepositDrawer isOpen={activeDrawer === 'deposit'} onClose={closeDrawer} onSuccess={handleSuccess} />
      <WithdrawDrawer isOpen={activeDrawer === 'withdraw'} onClose={closeDrawer} onSuccess={handleSuccess} />
    </DrawerContext.Provider>
  );
};

export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) throw new Error('useDrawer must be used within a DrawerProvider');
  return context;
};
```

---

## 3. Cronograma de Implementação
*(Executar passo a passo)*

- [ ] Criar o arquivo [`DrawerContext.tsx`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/web/src/contexts/DrawerContext.tsx) com a lógica e tipos propostos.
- [ ] Modificar [`Layout.tsx`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/web/src/components/Layout.tsx):
  - Envelopar o retorno da função `Layout` com o `DrawerProvider`.
  - Injetar os botões de ação na Sidebar (Desktop) e na Bottom Nav (Mobile).
  - Estilizar os botões com ícones correspondentes do `lucide-react` para ficarem consistentes com o design system do Rose Pine.
- [ ] Modificar [`DashboardPage.tsx`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/web/src/pages/DashboardPage.tsx):
  - Remover os estados locais das gavetas e os componentes correspondentes (`SwapDrawer`, `HistoryDrawer`, etc.).
  - Remover botões de ação no cabeçalho do Dashboard.
  - Registrar escuta ao evento customizado `'transaction-success'` no hook `useEffect`.
- [ ] Validar compilação e rodar linters.

---

## 4. Testes e Validação

### Testes Manuais de Fumaça:
1. Abrir a aplicação e verificar que no Dashboard não aparecem os botões originais no cabeçalho.
2. Na Sidebar (Desktop), clicar em "Depositar", "Sacar", "Converter" e "Histórico", garantindo que cada gaveta correspondente seja aberta.
3. Repetir o teste na visualização Mobile (Bottom Nav) reduzindo a largura da janela do navegador.
4. Executar um depósito fiduciário simulado no Faucet de Testes: ao finalizar, a gaveta deve fechar e a Dashboard deve atualizar os saldos e o histórico de atividades recentes automaticamente.
