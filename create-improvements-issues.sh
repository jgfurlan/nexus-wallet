#!/bin/bash
set -e

# Verificação do GitHub CLI
if ! command -v gh &> /dev/null; then
  echo "Erro: O GitHub CLI ('gh') não está instalado ou não foi encontrado no PATH."
  echo "Instale o gh e faça login com 'gh auth login' antes de rodar este script."
  exit 1
fi

issues=(
  "BUG: Fix Withdrawal contract mismatch between Web and API|A funcionalidade de saque no frontend falha sistematicamente com erros de validação e rota. É necessário alinhar a chamada do frontend com o Zod schema e rotas da API.

Ações Necessárias:
1. Em 'apps/web/src/services/withdrawal.service.ts', atualizar a rota de chamada do POST de '/withdrawals' para '/wallet/withdraw'.
2. No mesmo arquivo e no formulário 'apps/web/src/components/drawers/WithdrawDrawer.tsx', mudar o nome do parâmetro enviado de 'destinationAddress' para 'address'.
3. Na submissão do formulário, gerar dinamicamente um UUID para o parâmetro 'externalId' (usando 'crypto.randomUUID()' ou biblioteca externa) e enviá-lo na requisição para atender à exigência de idempotência do backend."

  "BUG: Fix missing Token in Ledger Entries returned by History API|O extrato expandido no frontend exibe o símbolo do token como 'undefined' para todas as linhas de auditoria interna (Ledger). Isso ocorre porque a tabela 'LedgerEntry' não possui campo 'token' nativo e a API não inclui o relacionamento de 'walletBalance' no retorno.

Ações Necessárias:
1. Em 'apps/api/src/modules/wallet/history.service.ts', atualizar o include do Prisma para carregar o token através do relacionamento com 'walletBalance':
\`\`\`ts
include: {
  ledgerEntries: {
    include: {
      walletBalance: true
    }
  }
}
\`\`\`
2. Mapear o retorno da query no Service para injetar a propriedade 'token' em cada objeto do array 'ledgerEntries' a partir de 'ledgerEntry.walletBalance.token'."

  "COMPLIANCE: Align Deposit Webhook payload with Test Specifications|O webhook de depósitos espera 'walletId' no payload, violando a especificação do teste prático que define explicitamente o payload como '{ userId, token, amount, idempotencyKey }'.

Ações Necessárias:
1. Atualizar o esquema de validação 'DepositWebhookInputSchema' em 'apps/api/src/modules/webhook/deposit.schemas.ts' para receber 'userId' (string) em vez de 'walletId'.
2. No service 'deposit.service.ts', buscar a carteira do usuário de forma segura através do relacionamento de unicidade com o 'userId':
\`\`\`ts
const wallet = await tx.wallet.findUnique({
  where: { userId: input.userId }
});
\`\`\`"

  "UX/UI: Improve Swap rate formula display in SwapDrawer|A cotação de moedas no formulário de conversão exibe uma representação matemática confusa (ex: 1 BRL = R$ 0,00 em conversões BTC -> BRL). O usuário final espera ver a cotação padrão da moeda base (ex: 1 BTC = R$ 350.000,00).

Ações Necessárias:
1. Em 'apps/web/src/components/drawers/SwapDrawer.tsx' (linha 235), alterar a exibição da taxa de conversão para o formato padrão do mercado:
\`\`\`tsx
1 {quote.fromToken} = {quote.toToken === 'BRL' ? formatCurrency(quote.rate) : \`\${formatToken(quote.rate)} \${quote.toToken}\`}
\`\`\`"

  "PERFORMANCE: Avoid Redis transaction quote writes during Dashboard balance loading|Para calcular e exibir o valor equivalente em BRL dos saldos no Dashboard, o frontend chama o endpoint '/swap/quote'. Isso faz o backend gerar registros transacionais UUID no Redis que poluem a memória temporária sem nunca serem executados.

Ações Necessárias:
1. Criar um endpoint simplificado na API (ex: GET /swap/rates ou GET /prices) que retorna apenas as taxas brutas atuais do cache do Redis (CoinGecko).
2. Atualizar o 'DashboardPage.tsx' para buscar essas taxas gerais e efetuar a conversão de saldo no próprio cliente frontend, eliminando chamadas redundantes a '/swap/quote' no carregamento de tela."

  "UX/UI: Optimize mobile inputs for numeric values|A experiência de usuário em dispositivos móveis pode ser aprimorada configurando o comportamento do teclado em campos numéricos de quantidade nos formulários de transações.

Ações Necessárias:
1. Adicionar o atributo inputMode=\"decimal\" nos campos de input de quantidade monetária em 'SwapDrawer.tsx', 'WithdrawDrawer.tsx' e 'DepositDrawer.tsx' para que dispositivos móveis apresentem o teclado numérico adequado por padrão."

  "UX/UI: Implement Light and Dark theme options using Nexus brand colors|Implementar a alternância de temas Claro (Light) e Escuro (Dark) adaptando a paleta para usar o Vermelho Carmim (#b91c1c) da logo da Nexus como cor de destaque (pine).

Ações Necessárias:
1. Alterar tailwind.config.js para usar variáveis CSS baseadas em RGB e opacidade: pine: 'rgb(var(--color-brand) / <alpha-value>)' etc.
2. Declarar as variáveis RGB no index.css para os escopos :root (tema escuro padrão) e :root[data-theme='light'] (tema claro).
3. Criar um contexto React ThemeContext para gerenciar a classe/atributo no html e persistir a escolha no localStorage.
4. Inserir um botão Sol/Lua no topo do cabeçalho móvel e na sidebar para desktop em Layout.tsx."

  "UX/UI: Replace generic wallet icons with brand logo|Fortalecer a identidade visual substituindo os ícones de carteira genéricos da biblioteca lucide-react pela imagem oficial da logo (logo-nexus.jpg).

Ações Necessárias:
1. Importar e renderizar logo-nexus.jpg no cabeçalho/sidebar (Layout.tsx), na tela de login (LoginPage.tsx) e de registro (RegisterPage.tsx)."

  "UX/UI: Enhance Feedback module with 5-star rating selector|O encaminhamento dos feedbacks está correto (Axios com interceptador e rota /feedbacks no backend criam o registro). Para aprimorar, devemos implementar um seletor visual de 5 estrelas no widget para coletar a nota (rating).

Ações Necessárias:
1. Em ContactWidget.tsx, adicionar um seletor de 5 estrelas interativo usando o ícone Star do lucide-react.
2. Ao submeter o formulário, incluir a nota (rating) selecionada no corpo do POST enviado para /feedbacks."
)

echo "Iniciando a criação de 9 Issues no repositório GitHub..."
for issue in "${issues[@]}"; do
  title="${issue%%|*}"
  body="${issue#*|}"
  echo "Criando issue: $title"
  gh issue create --title "$title" --body "$body"
  sleep 1
done
echo "Todas as 9 issues foram criadas com sucesso!"
