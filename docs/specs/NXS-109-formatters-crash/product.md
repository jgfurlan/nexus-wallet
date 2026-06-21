# NXS-109 / NXS-112: Proteção de Formatadores (Crashes no Decimal.js)

## Declaração do Problema
Duas issues críticas foram identificadas causadas pela mesma raiz:
1. **NXS-109**: Página fica em branco ao digitar valores inválidos (como `""`, `"1."`) no modal de saque, pois o construtor do `Decimal.js` não suporta e lança exceção.
2. **NXS-112**: No Dashboard, se um token não existir ou vier sem valor, o `formatToken` renderiza `NaN` ou crasha a aplicação.
Como esses métodos são usados globalmente na renderização, qualquer `throw` não tratado remove a árvore de componentes inteira do React (até ser contido por um Error Boundary, que é escopo do NXS-115).

## Invariantes Comportamentais Testáveis
1. **Tolerância a falha no `formatToken`**: Entradas como `""`, `null`, `undefined` devem retornar `"0"`.
2. **Tolerância a falha no `formatCurrency`**: Entradas inválidas devem retornar `"R$ 0,00"`.
3. **Tolerância a falha no `formatDate`**: Entradas inválidas devem retornar `"Data inválida"`.
4. Os formatadores devem conter blocos `try/catch` para capturar os erros do `Decimal.js` graciosamente, impedindo crashes na interface.
