# Technical Spec: Implementação de Testes Unitários no Frontend React

**Veja `product.md` para o comportamento esperado pelo usuário e invariantes.**
**Issue:** GH94

---

## 1. Contexto
Atualmente, o frontend [`apps/web`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/web) carece de arquivos de configuração e dependências de testes unitários de interface.

---

## 2. Mudanças Propostas

### Dependências Adicionadas a `apps/web/package.json`
Instalaremos as seguintes dependências de desenvolvimento no frontend:
- `vitest` (engine de execução de testes rápidos compatível com Vite)
- `jsdom` (simulação de DOM no ambiente Node.js)
- `@testing-library/react` (métodos de renderização e consulta a elementos React)
- `@testing-library/jest-dom` (matchers do jest para asserções HTML)
- `@testing-library/user-event` (simulação realista de cliques e digitação do usuário)

### Mudanças nos Módulos

| Arquivo | Tipo de Alteração | Descrição |
|------|-------------|-------------|
| [`apps/web/package.json`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/web/package.json) | Modificado | Adicionar script de teste (`"test": "vitest run"`) e as novas `devDependencies`. |
| [`apps/web/vitest.config.ts`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/web/vitest.config.ts) | [NEW] | Configuração do Vitest com ambiente `jsdom` e registro do arquivo de setup. |
| [`apps/web/src/setupTests.ts`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/web/src/setupTests.ts) | [NEW] | Configuração global do ambiente de testes frontend (importação do jest-dom e eventuais mocks de APIs do browser como `window.matchMedia` ou `crypto`). |
| `apps/web/src/contexts/__tests__/ThemeContext.test.tsx` | [NEW] | Testes para o `ThemeContext` (alternância e gravação em localStorage). |
| `apps/web/src/contexts/__tests__/DrawerContext.test.tsx` | [NEW] | Testes para o `DrawerContext` (controle global de gavetas abertas/fechadas). |
| `apps/web/src/components/drawers/__tests__/DepositDrawer.test.tsx` | [NEW] | Testes para o `DepositDrawer` (validação de formulário de cotações sandbox). |
| `apps/web/src/components/drawers/__tests__/WithdrawDrawer.test.tsx` | [NEW] | Testes para o `WithdrawDrawer` (garantir comportamento do botão sandbox "Autofill"). |

### Configuração: vitest.config.ts
```typescript
import { defineConfig, mergeConfig } from 'vite';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
    },
  })
);
```

---

## 3. Cronograma de Implementação
*(Executar passo a passo)*

- [ ] Instalar dependências de testes no diretório `apps/web/`:
  `pnpm -F web add -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event`
- [ ] Criar o arquivo [`vitest.config.ts`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/web/vitest.config.ts) no frontend.
- [ ] Criar [`setupTests.ts`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/apps/web/src/setupTests.ts).
- [ ] Adicionar script `"test": "vitest run"` no package.json do frontend.
- [ ] Escrever e validar o arquivo de teste `ThemeContext.test.tsx`.
- [ ] Escrever e validar o arquivo de teste `DrawerContext.test.tsx`.
- [ ] Escrever e validar os testes do `DepositDrawer.test.tsx` e `WithdrawDrawer.test.tsx` mockando o cliente HTTP `api.ts`.
- [ ] Rodar testes na raiz e garantir que todas as suítes (backend e frontend) passam: `pnpm test`.

---

## 4. Testes e Validação
- **Execução Automatizada:** Rodar `pnpm test` no repositório. O Vitest deve rodar os testes nos pacotes `apps/api` e `apps/web` recursivamente, totalizando todas as suítes verdes.
- **CI/CD Integration:** Confirmar no pipeline de Pull Requests do GitHub que a etapa de testes executa com sucesso incluindo a suíte do frontend.
