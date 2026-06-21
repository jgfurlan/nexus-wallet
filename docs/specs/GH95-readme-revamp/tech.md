# Technical Spec: Redesenho Premium do README.md e Roadmap OpenTelemetry

**Veja `product.md` para o comportamento esperado pelo usuário e invariantes.**
**Issue:** GH95

---

## 1. Contexto
Modificaremos o arquivo principal [`README.md`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/README.md) na raiz do repositório.

---

## 2. Mudanças Propostas

### Mudanças nos Módulos

| Arquivo | Tipo de Alteração | Descrição |
|------|-------------|-------------|
| [`README.md`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/README.md) | Modificado | Substituir o README atual por uma versão reestruturada, centralizada e enriquecida com pilares de arquitetura e roadmap. |

### Detalhes Técnicos da Estruturação do README.md
O novo arquivo `README.md` seguirá a seguinte estrutura:

1.  **Header Centralizado:**
    - Alinhamento em HTML (`<div align="center">`)
    - Imagem do Logo Nexus Wallet (tamanho controlado)
    - Título `<h1> Nexus Wallet </h1>`
    - Descrição curta e badges de tecnologia (TypeScript, React, Node.js, Fastify, Prisma, Redis, Docker, Vitest)
2.  **Visão Geral (Quick Tour):** Explicação concisa da carteira Web sandbox.
3.  **Tabela Visual de Funcionalidades:** Com ícones de emojis e colunas claras (Módulo, Descrição, Status).
4.  **🛡️ Pilares de Resiliência e Consistência (Tabela de Conexão com Evolution Blueprint):**
    - Tabela mapeando cada pilar transacional/estabilidade ao documento de arquitetura.
5.  **🚀 Roadmap & Integração com OpenTelemetry:**
    - Seção detalhando a visão técnica para implementar OpenTelemetry:
      - **Tracing:** Uso de `opentelemetry/sdk-node` e `@opentelemetry/instrumentation-fastify` para rastrear rotas como swap e saque.
      - **Metrics:** Instrumentação de conexões com Prisma e taxas de acerto do Redis para telemetria.
      - **Correlacionamento de Logs:** Injeção do `traceId` nos logs estruturados do `Pino` para depuração simplificada.
6.  **Guia de Inicialização Rápida:** Comandos diretos de instalação com pnpm e subida do docker.

---

## 3. Cronograma de Implementação
*(Executar passo a passo)*

- [ ] Redigir a nova versão premium do [`README.md`](file:///wsl.localhost/Fedora-44/home/jgfurlan/dev/projects/nexus-wallet/README.md).
- [ ] Garantir que os caminhos relativos às logos e blueprints estejam corretos.
- [ ] Validar visualização estática do markdown.
- [ ] Rodar teste local para garantir conformidade geral.

---

## 4. Testes e Validação
- **Validação de Links e Imagens:** Verificar no interpretador de markdown do editor ou no próprio GitHub após upload que as imagens e links internos carregam corretamente.
