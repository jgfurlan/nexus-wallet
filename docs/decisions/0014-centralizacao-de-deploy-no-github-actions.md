# ADR 0014: Centralização de Deploys de Preview e Produção no GitHub Actions

## Status
Aprovada

## Contexto
O Vercel GitHub Bot executava compilações e deploys automáticos de preview para todas as branches e Pull Requests associados ao repositório de forma concorrente às pipelines de CI/CD. Essa automatização nativa gerava desperdício de minutos de build (construções duplicadas na main), risco de disponibilizar deploys de preview com códigos com erros ou testes quebrando, e quebrava o isolamento de qualidade do portão de releases.

## Decisão
Decidi centralizar toda a orquestração e o ciclo de vida dos deploys (Preview e Produção) no pipeline de CI/CD do GitHub Actions. Configurei o projeto da Vercel para ignorar builds automáticos disparados por commits do GitHub (`exit 0` no Ignored Build Step) e implementei no workflow do GitHub Actions (`ci.yml`) o disparo condicional de deploy de preview via CLI da Vercel (`vercel deploy`), executado unicamente após o sucesso de todos os passos de compilação, lint e testes.

## Consequências
- **Positivas:** Elimina por completo builds redundantes de deploys de produção e garante que nenhum deploy de preview seja exposto caso os testes integrados ou validações de tipo falhem. Centraliza a inteligência e o log de auditoria operacional em uma única plataforma (GitHub Actions).
- **Negativas:** Requer o fornecimento e rotação de tokens de deploy do Vercel (`VERCEL_TOKEN`) nos segredos criptografados do repositório do GitHub.
