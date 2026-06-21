# Spec Técnica: GH103 - Enforce Progress Tracker Update

## 1. Arquitetura da Solução
Vamos utilizar as Github Actions nativas adicionando um novo step no nosso workflow existente `.github/workflows/ci.yml` ou criando um novo `.github/workflows/enforce-tracker.yml`. Como queremos bloquear a mesclagem, é mais eficiente rodar na mesma pipeline de PR.

### Modificações Necessárias:
1. **Verificador de Diff**: Adicionar um job ou step no `.github/workflows/ci.yml` (ou num workflow isolado) que faça o diff entre a HEAD do PR e a branch base (main).
2. O script/step pode ser construído via comando bash ou usando actions da comunidade (ex: `tj-actions/changed-files`). Preferiremos o comando bash simples ou tj-actions para evitar excesso de dependências externas se possível, mas `tj-actions/changed-files` é robusto.

## 2. Abordagem de Implementação
Adicionaremos um Job `check-progress-tracker` em um novo workflow dedicado (ex: `pr-guidelines.yml`) que rode rápido, ou diretamente no topo de `ci.yml`.

### Exemplo de Lógica (Action dedicada `tracker-check.yml`):
```yaml
name: "Guideline Enforcement"
on:
  pull_request:
    branches: [ "main" ]

jobs:
  check-tracker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Necessário para o diff

      - name: Verify progress-tracker.md modification
        run: |
          if git diff --name-only origin/main...HEAD | grep -q "^docs/guidelines/progress-tracker\.md$"; then
            echo "✅ progress-tracker.md foi atualizado."
            exit 0
          else
            echo "❌ ERRO: Você DEVE atualizar docs/guidelines/progress-tracker.md neste PR."
            exit 1
          fi
```

### 3. Sinais de Conclusão (RLVR)
- Arquivo de workflow gerado.
- Commit e push realizados na branch `spec/GH103-enforce-progress-tracker`.
