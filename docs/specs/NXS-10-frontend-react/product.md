# Product Spec: Frontend React Dashboard (NXS-10)

**Issue:** NXS-10 — [Frontend Implementation](https://github.com/users/jgfurlan/projects/nexus-wallet/issues/10)
**Figma/Design:** Rose Pine Dark (Conceito A)

---

## Sumário
A interface do usuário do NexusWallet é um Single Page Application (SPA) moderno construído em React. Ele permite que os usuários gerenciem suas carteiras cripto, realizem conversões em tempo real e auditem seu histórico de transações de forma intuitiva e segura, seguindo o tema Rose Pine Dark.

---

## Problema
Atualmente, o sistema é apenas uma API. Os usuários precisam de uma interface visual para interagir com suas carteiras, ver saldos convertidos em tempo real e realizar operações financeiras sem utilizar ferramentas como Postman ou Curl.

---

## Objetivos & Não-Objetivos

**Objetivos:**
- [ ] Implementar Dashboard com saldos em BRL, BTC e ETH com equivalência em fiat.
- [ ] Criar formulário de Swap com cotação dinâmica e timer de 30 segundos.
- [ ] Desenvolver página de Histórico com paginação por cursor e filtros.
- [ ] Garantir fluxo de Auth completo (Registro, Login, Persistência de Sessão).
- [ ] Aplicar design system Rose Pine com foco em acessibilidade e confiança.

**Não-Objetivos:**
- Gráficos de trading complexos (Candlesticks, etc).
- Gerenciamento de perfil de usuário (troca de avatar, etc).
- Modo claro (Light mode) — o foco é o tema dark moderno.

---

## Experiência do Usuário & Invariantes

### Fluxo do Dashboard
1. Usuário loga e vê seus cards de saldo.
2. O sistema busca as cotações em background para mostrar o valor em R$ de cada cripto.
3. Botões de ação rápida levam para Swap ou Saque.

### Invariantes de UI
- **Confirmação:** Toda operação financeira (Swap/Saque) exige um passo de confirmação.
- **Feedback:** Sucesso ou erro sempre exibidos via Toasts ou mensagens claras.
- **Acessibilidade:** Navegação por teclado funcional em todos os formulários.

---

## Critérios de Sucesso
- [ ] Usuário consegue completar um fluxo de registro -> depósito (via webhook/simulado) -> swap -> saque -> histórico.
- [ ] Interface responsiva (Mobile-first).
- [ ] Zero erros de lint e TypeScript.
- [ ] Performance: FCP (First Contentful Paint) < 1.5s.
