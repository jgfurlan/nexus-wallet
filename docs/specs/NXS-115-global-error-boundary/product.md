# NXS-115: Tratamento de Erro Global (Error Boundary)

## Declaração do Problema
O frontend React atual não possui captura de erros globais durante a fase de renderização ou ciclo de vida. Qualquer exceção não capturada derruba toda a árvore de componentes, resultando na temida "tela branca" sem explicação para o usuário ou rota de recuperação, criando uma UX terrível.

## Invariantes Comportamentais Testáveis
1. Toda a árvore de rotas da aplicação deve ser envolvida por um componente ErrorBoundary.
2. Quando um erro fatal ocorre no React, a aplicação não deve exibir uma tela branca, mas sim um UI de fallback de erro contendo uma mensagem amigável e um botão para "Tentar novamente" (recarregar/reiniciar estado).
