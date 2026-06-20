# Product Spec: Ações Transacionais no Menu Lateral e Barra de Navegação Móvel

**Issue:** GH80 — [UX/UI] Move Transactional Actions to Sidebar and Mobile Bottom Nav
**Figma/Design:** N/A

---

## Resumo
Esta especificação redefine a localização das principais ações da carteira (Depositar, Sacar, Converter e Histórico) na interface de usuário. Em vez de ficarem posicionadas no palco principal do Dashboard, essas ações serão movidas para elementos de navegação persistentes:
1. **Sidebar (Desktop):** Links/botões na barra lateral esquerda.
2. **Mobile Bottom Nav (Mobile):** Botões na barra de navegação inferior.

Dessa forma, o usuário terá acesso rápido e global a essas ações a partir de qualquer contexto da aplicação, e o palco principal do Dashboard ficará mais limpo e focado no resumo dos ativos.

---

## Problema
Atualmente, os botões para abrir os Drawers de transações ("Depositar", "Sacar" e "Converter") estão fixados no cabeçalho do Dashboard. Além disso, o botão para visualizar o histórico completo ("Ver tudo") fica dentro do card de atividades recentes na mesma página.
Essa abordagem tem duas desvantagens:
- Obriga o usuário a retornar ao Dashboard sempre que quiser realizar uma ação.
- Polui a tela inicial com múltiplos botões de ação proeminentes que competem visualmente com os saldos dos ativos.

---

## Objetivos & Não-Objetivos

**Objetivos:**
- [ ] Mover os gatilhos dos Drawers de Depositar, Sacar, Converter e Histórico para a Sidebar em resoluções de desktop.
- [ ] Adicionar os mesmos gatilhos na barra de navegação inferior (Bottom Nav) em resoluções mobile.
- [ ] Remover os botões de ação originais do palco principal do Dashboard.
- [ ] Centralizar o controle dos Drawers (abrir/fechar) de forma global para que possam ser ativados de qualquer lugar do layout.
- [ ] Atualizar o Dashboard automaticamente após ações bem-sucedidas realizadas a partir dos Drawers.

**Não-Objetivos:**
- Alterar o design ou os formulários internos dos Drawers.
- Criar novas rotas de página para swap, histórico, etc. (o comportamento deve continuar sendo a abertura de gavetas/drawers sobrepostos).

---

## Experiência do Usuário & Invariantes

### Caminho Feliz (Desktop)
1. O usuário visualiza o menu lateral (Sidebar) contendo os links normais e novas ações:
   - "Dashboard" (Redireciona para `/`)
   - "Depositar" (Abre o Drawer de Depósito)
   - "Sacar" (Abre o Drawer de Saque)
   - "Converter" (Abre o Drawer de Conversão)
   - "Histórico" (Abre o Drawer de Histórico)
2. Ao clicar em "Depositar", a gaveta de depósito desliza na tela.
3. O usuário realiza o depósito.
4. Após o depósito ser concluído, a gaveta se fecha e o saldo no Dashboard é atualizado automaticamente.

### Caminho Feliz (Mobile)
1. O usuário vê cinco ícones na barra inferior:
   - "Dash" (Redireciona para `/`)
   - "Depositar" (Abre o Drawer correspondente)
   - "Sacar" (Abre o Drawer correspondente)
   - "Converter" (Abre o Drawer correspondente)
   - "Histórico" (Abre o Drawer correspondente)
2. Os Drawers abrem ocupando a tela com facilidade de interação móvel.

---

## Critérios de Sucesso
- [ ] O Dashboard principal não contém mais os botões "Depositar", "Sacar" e "Converter" no cabeçalho.
- [ ] O botão "Ver tudo" nas atividades recentes do Dashboard é removido ou integrado ao link global de Histórico.
- [ ] As quatro ações (Depositar, Sacar, Converter, Histórico) estão acessíveis e funcionais na Sidebar e na Bottom Nav.
- [ ] As atualizações de saldo e histórico no Dashboard refletem imediatamente o sucesso das transações executadas nos Drawers globais.
