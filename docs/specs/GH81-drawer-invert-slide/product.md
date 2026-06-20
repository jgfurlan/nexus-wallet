# Product Spec: Inversão do Sentido do Drawer (Esquerda para Direita)

**Issue:** GH81 — [UX/UI] Invert Drawer Slide Direction (Left to Right)
**Figma/Design:** N/A

---

## Resumo
Esta especificação descreve a mudança visual no comportamento de transição e posicionamento de todas as gavetas (Drawers) da aplicação. Atualmente, os Drawers surgem da borda direita e deslizam para a esquerda. A nova especificação inverte este comportamento: os Drawers devem aparecer na borda esquerda da tela e deslizar para a direita.

---

## Problema
O design atual da carteira posiciona a Sidebar na esquerda e os Drawers na direita. Para unificar a origem visual dos painéis principais e fornecer uma experiência de navegação mais consistente e alinhada à leitura ocidental (da esquerda para a direita), os Drawers devem deslizar a partir do lado esquerdo, sobrepondo-se à Sidebar de maneira elegante.

---

## Objetivos & Não-Objetivos

**Objetivos:**
- [ ] Posicionar o container do Drawer no lado esquerdo da tela (`left-0` em vez de `right-0`).
- [ ] Ajustar as bordas arredondadas do Drawer para a direita (`md:rounded-r-2xl` em vez de `md:rounded-l-2xl`).
- [ ] Ajustar a animação de transição para deslizar de fora da tela na esquerda para dentro (`-translate-x-full` para `translate-x-0`).

**Não-Objetivos:**
- Alterar o cabeçalho, rodapé ou conteúdo interno de cada gaveta.
- Modificar o comportamento do backdrop escuro.

---

## Experiência do Usuário & Invariantes

### Caminho Feliz
1. O usuário clica em qualquer ação (ex: "Depositar" na Sidebar).
2. O backdrop escuro aparece sobre a tela.
3. A gaveta surge do lado esquerdo e desliza suavemente para a direita até se posicionar.
4. Os cantos arredondados aparecem do lado direito do painel da gaveta em telas maiores (desktop).
5. Ao fechar a gaveta, ela desliza de volta para fora da tela pela esquerda.

---

## Critérios de Sucesso
- [ ] Todos os Drawers da aplicação (Depósito, Saque, Swap, Histórico) abrem a partir do lado esquerdo da tela.
- [ ] O visual no desktop exibe cantos arredondados na lateral direita do painel da gaveta.
- [ ] A animação de entrada e saída pela lateral esquerda ocorre de forma fluida e sem bugs de layout.
