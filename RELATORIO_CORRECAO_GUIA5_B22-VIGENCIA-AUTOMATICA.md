# B22 — Guia 5: vigência aberta e carregamento automático dos modelos

## Alterações

### 1. Vigência dos encadeamentos
Os períodos finais que representam regras ainda vigentes deixaram de ter como termo final artificial a competência 06/2026.

A regra jurídica agora pode permanecer com `fim: ''`, sendo exibida como **“em diante”**.

Foram ajustados os quatro modelos oficiais:
- MC-PREVID-2026;
- MC-ACOES-GERAL-2026;
- MC-PREVID-2022;
- MC-ACOES-GERAL-2022.

Períodos históricos que foram efetivamente substituídos por outra regra permanecem com termo final definido.

### 2. Vigência da regra x disponibilidade da base
A tela não informa mais que o encadeamento “vence” em 06/2026.

Quando aplicável, é exibido:

> Base de índices disponível até MM/AAAA. A vigência das regras permanece aberta conforme o modelo; competências posteriores dependem da atualização da base.

O limite é calculado a partir das séries mensais efetivamente disponíveis na base para os períodos finais abertos. Regras matemáticas/neutras (`SEM_CORRECAO`, `SEM_JUROS`, `JUROS_1_AM`, `JUROS_05_AM`) não limitam a base.

### 3. Cálculo
Foi removida da Guia 5 a lógica que estacionava o encadeamento com base no último `fim` cadastrado. A vigência aberta permanece aplicável até a data solicitada; se faltar uma série mensal na base, o cálculo apresenta o erro correspondente e a tela informa a necessidade de atualizar a base.

### 4. Modelo predefinido
A seleção da caixa **Correção e Juros Predefinidos** agora carrega automaticamente:
- correção monetária;
- juros de mora;
- SELIC;
- encadeamentos visuais.

O botão **Aplicar** foi removido.

O botão **Calcular Atualização** permanece, pois sua função é executar a conta das diferenças e não apenas carregar o modelo.

### 5. Validação
Validação sintática realizada com `node --check` em:
- `js/admin-encadeamentos.js`
- `js/app.js`
