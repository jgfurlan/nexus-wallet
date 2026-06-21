# Diretrizes de Documentação (TSDoc & JSDoc)

Este documento estabelece as regras e padrões de documentação de código e de alto nível para o repositório **Nexus Wallet**. O objetivo é manter uma base de código legível, autoexplicativa e perfeitamente indexada por ferramentas de IDE ou assistentes de IA (LLMs).

---

## 🌐 Padrão de Idioma

Para manter a consistência com o ecossistema de desenvolvimento global e os arquivos locais, adotamos as seguintes regras:
1. **Comentários Inline de Código (TSDoc/JSDoc):** Devem ser escritos obrigatoriamente em **Inglês**. Isso inclui a descrição de parâmetros, retornos, exceções e notas técnicas de runtime.
2. **Documentações de Alto Nível (ADRs, Specs, Walkthroughs, Blueprints):** Devem ser escritas em **Português (PT-BR)**, permitindo uma comunicação empresarial clara e alinhada com as especificações do negócio.

---

## 🏷️ Tags TSDoc/JSDoc Permitidas e Recomendadas

Utilize comentários estruturados multilinha (`/** ... */`) para descrever componentes, funções e serviços. As seguintes tags devem ser utilizadas sistematicamente:

*   `@param <nome> - <descrição>`: Descreve um parâmetro de entrada de um método ou função.
*   `@returns <descrição>`: Explica o formato e tipo do retorno.
*   `@throws {TipoDeErro} - <descrição>`: Documenta possíveis exceções ou erros de negócio que o método pode lançar.
*   `@transactional`: (Tag customizada) Indica se a execução do método ocorre sob um escopo de transação de banco de dados (especialmente útil para denotar níveis de isolamento como `SERIALIZABLE`).

---

## 💻 Exemplos Práticos

### 1. Componentes React (Props e Interface)
No frontend (`apps/web`), todos os componentes principais devem descrever suas propriedades na interface de Props utilizando comentários simples:

```typescript
/**
 * Properties for the BalanceCard component.
 */
interface BalanceCardProps {
  /** The ticker symbol of the token (e.g., "BTC", "BRL") */
  token: string;
  /** The formatted balance amount to display */
  amount: string;
  /** The calculated fiat estimation value in local currency (e.g., "R$ 1.500,00") */
  fiatValue?: string;
  /** Optional Lucide icon element to display in the header card */
  icon?: React.ReactNode;
  /** If true, renders a pulsing skeleton screen placeholder */
  isLoading?: boolean;
}

/**
 * BalanceCard renders an interactive dashboard card displaying the token balance
 * and its fiat valuation equivalent, supporting loading skeleton states.
 */
export const BalanceCard: React.FC<BalanceCardProps> = ({ ... }) => { ... }
```

### 2. Funções de Auxílio (Helpers) e Hooks Customizados
Devem descrever de forma direta a entrada, a saída, e quaisquer efeitos colaterais (como escrita no `localStorage`):

```typescript
/**
 * Hook to access the ThemeContext properties (current theme, toggle function).
 * Reads the initial state from localStorage and updates the DOM data-theme attribute.
 * 
 * @returns The ThemeContext properties containing active theme and toggle function.
 * @throws {Error} If used outside of a ThemeProvider wrapper.
 */
export const useTheme = () => { ... }
```

### 3. Serviços de API e Operações com Banco de Dados
Devem conter anotações sobre regras de negócio, tratamento de erros, idempotência e aspectos transacionais:

```typescript
/**
 * Processes the deposit webhook within an atomic Serializable transaction.
 * Ensures idempotency by checking if the idempotencyKey has already been processed.
 * 
 * @param input - The deposit webhook payload including userId, token, amount, and idempotencyKey.
 * @returns A promise resolving to the created transaction and a duplicate execution flag.
 * @throws {Error} WALLET_NOT_FOUND (404) if the wallet does not exist for the user.
 * @transactional Requires SERIALIZABLE isolation level to prevent balance update race conditions.
 */
static async deposit_process_webhook(input: DepositWebhookInput) { ... }
```

### 4. Rotas e Controladores (Fastify)
Devem descrever o objetivo do endpoint, mecanismos de guarda/autorização e status de resposta:

```typescript
/**
 * Test faucet routes to inject mock funds into the authenticated user's wallet balances.
 * Requires authGuard preHandler to extract user credentials.
 * 
 * @param app - The Fastify application instance.
 */
export const faucetRoutes = async (app: FastifyInstance) => { ... }
```
