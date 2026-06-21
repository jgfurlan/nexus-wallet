# NXS-111: Tech Spec

## Contexto
O `Drawer.tsx` gerencia overlay de interfaces laterais. Atualmente, usa curto-circuito lógico para desmontar da árvore React.

## Alterações Cirúrgicas Propostas
No `apps/web/src/components/ui/Drawer.tsx`:
1. Remover o `if (!isOpen) return null;`.
2. No elemento container exterior, adicionar `pointer-events-none` condicional para que ele não bloqueie cliques da página quando invisível. O backdrop deve receber `opacity-0` quando fechado, e o overlay principal `translate-x-full` ou `translate-x-[-100%]` dependendo do `position`.
3. Ajuste sugerido para o portal: O `createPortal` pode envolver tudo, e a visibilidade ditar as animações via Tailwind `transition-all duration-300`.

## Rastreabilidade das Modificações
O escopo está isolado ao componente Drawer de interface, não afetando os contextos de dados.

## Passos para Validação
1. Rodar linter e testes.
2. Abrir visualmente a aplicação para verificar a suavidade da entrada/saída de telas laterais.
