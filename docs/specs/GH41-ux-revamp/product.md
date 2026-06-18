# Product Specification: UX Revamp & Drawers Architecture (GH41)

## Contexto e Motivação
Com base no feedback real de usuários e benchmarks das fintechs mais modernas (Nubank Web, Vercel, Stripe), a interface do Nexus Wallet precisa ser unificada e as transições entre páginas precisam ser extintas para evitar a perda de contexto. O dashboard deve se tornar o palco central, e todas as ações transacionais devem deslizar em modais/drawers, proporcionando micro-interações elegantes.
Adicionalmente, precisamos de uma forma fácil de injetar fundos no ambiente de teste (Faucet) e de coletar feedback nativamente.

## Invariantes e Requisitos (O "O Que")

### 1. Navegação (Layout Desktop e Mobile)
- **Desktop:** A navegação superior (Header) será substituída por uma **Sidebar Esquerda (Barra Lateral)** fixa. O Dashboard fica à direita da barra, cobrindo 100% da altura da tela.
- **Mobile:** A navegação "Bottom Bar" (abaixo) será mantida, pois é o padrão de ouro para uso com apenas uma mão.
- **Responsividade:** Todas as gavetas (Drawers) e o Layout devem escalar elegantemente entre tamanhos de tela. Em mobile, os Drawers podem deslizar de baixo para cima (Bottom Sheet) ou manter o comportamento de painel direito se houver espaço.

### 2. Ações baseadas em Drawers (Gavetas)
Em vez de páginas isoladas, teremos **4 Drawers** principais:
- **Depositar (Faucet):** Uma gaveta que permite injetar um valor fixo ou manual via API.
- **Sacar (Withdrawal):** Uma gaveta para sacar saldos.
- **Converter (Swap):** O formulário de Swap atual, convertido em gaveta.
- **Histórico:** A lista paginada de transações.

*Regra de Contexto:* O clique para abrir a gaveta NÃO deve alterar a URL de maneira que recarregue a aplicação inteira. O fundo (Dashboard) deve continuar visível e levemente desfocado (backdrop blur).

### 3. Fale Conosco (Feedback)
- Um botão flutuante persistente no canto inferior direito.
- Ao clicar, um modal rápido permite que o usuário envie uma mensagem. O modal se fecha com uma confirmação de sucesso.

### 4. Estética "Senior Fintech"
- **Sem pontas quadradas:** `Card`, `Button` e `Input` devem adotar curvaturas modernas (`rounded-2xl`).
- **Paleta de Cores:** Substituição do preto chapado por um cinza sofisticado (`slate` ou `zinc`).
- **Inputs Modernos:** Áreas de texto devem ter um leve preenchimento translúcido para contraste, não um bloco escuro.

## Edge Cases Tratados
- **Z-Index Collision:** Garantir que o botão do Fale Conosco não fique na frente de informações críticas ou esconda o botão de confirmar no Drawer.
- **Viewport Height Mobile:** Tratamento do `100vh` no Safari/iOS para que os Drawers e a Bottom bar não sejam cortados.
