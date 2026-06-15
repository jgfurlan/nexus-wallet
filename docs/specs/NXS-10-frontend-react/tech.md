# Technical Spec: Frontend React Dashboard (NXS-10)

**Consulte `product.md` para ver o comportamento do usuário e os objetivos.**
**Issue:** NXS-10

---

## 1. Contexto
O frontend será implementado no diretório `apps/web` usando Vite + React + Tailwind CSS. Ele consumirá a API implementada nos módulos NXS-2 ao NXS-8.

---

## 2. Decisões Técnicas (Justificativas)

### 2.1. Rose Pine Dark + Tailwind
**Decisão:** Uso do tema Rose Pine com utilitários Tailwind.
**Por que:** Velocidade de desenvolvimento e consistência visual imediata. O tema Rose Pine é moderno e muito apreciado por desenvolvedores, alinhando com o público-alvo da vaga.

### 2.2. Context API para Autenticação
**Decisão:** Usar React Context para gerenciar o estado do usuário e token.
**Por que:** O estado de autenticação é global, mas não complexo o suficiente para exigir Redux ou Zustand. Context API é nativo e robusto para este caso.

### 2.3. Axios com Interceptors
**Decisão:** Centralizar chamadas API no Axios.
**Por que:** Permite injetar o cabeçalho `Authorization: Bearer <token>` automaticamente e tratar erros 401 (token expirado) de forma centralizada.

---

## 3. Arquitetura de Componentes

### Componentes Core
- `Layout`: Header com navegação e botão de logout + área de conteúdo.
- `BalanceCard`: Exibe símbolo, saldo e estimativa em fiat.
- `TransactionItem`: Linha de histórico com ícone dinâmico por tipo.
- `ConfirmModal`: Modal reutilizável para confirmação de operações.

### Rotas e Páginas
- `/login`: Form de login.
- `/register`: Form de registro.
- `/`: Dashboard (Private).
- `/swap`: Fluxo de conversão (Private).
- `/history`: Lista de transações (Private).

---

## 4. Checklist de Implementação

- [ ] Configurar `tailwind.config.ts` com as cores do Rose Pine.
- [ ] Implementar `AuthContext` e `AuthService`.
- [ ] Criar componentes base: `Button`, `Input`, `Card`.
- [ ] Implementar páginas de Login e Registro com `react-hook-form`.
- [ ] Desenvolver o Dashboard com busca de saldos.
- [ ] Implementar página de Swap com lógica de cotação (polling/timer).
- [ ] Implementar página de Histórico com busca paginada.
- [ ] Portão de Verificação: `pnpm lint && pnpm typecheck && pnpm build`.

---

## 5. Validação Técnica

| Funcionalidade | Critério |
|----------------|----------|
| Persistência | Refresh da página não desloga o usuário (token no localStorage). |
| Segurança | Rotas privadas redirecionam para `/login` se não houver token. |
| Precisão | Valores monetários formatados corretamente usando `Intl.NumberFormat`. |
| Responsividade | Layout funcional em telas de iPhone e Desktop. |
