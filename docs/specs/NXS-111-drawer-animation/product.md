# NXS-111: Animação do Drawer

## Declaração do Problema
O componente `Drawer.tsx` sofre de montagem/desmontagem instantânea no React porque o código retorna `null` quando `isOpen` é falso (`if (!isOpen) return null;`). Isso impossibilita a reprodução de animações CSS de fechamento e abertura, reduzindo a qualidade UX.

## Invariantes Comportamentais Testáveis
1. O Drawer deve permanecer montado no DOM para que a classe CSS de transição funcione, recebendo classes como `translate-x-full` e `pointer-events-none` quando fechado.
2. O "backdrop" (fundo escurecido) deve ficar com `opacity-0` e `pointer-events-none` quando fechado.
3. Não deve mais ocorrer `if (!isOpen) return null`.
