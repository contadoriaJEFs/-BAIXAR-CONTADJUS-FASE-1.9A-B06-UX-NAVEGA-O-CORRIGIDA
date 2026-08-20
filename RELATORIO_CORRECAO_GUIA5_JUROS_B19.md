# Guia 5 — Correção do motor de encadeamentos de juros (B19)

## Objetivo

Corrigir a utilização dos encadeamentos oficiais de juros na Guia 5, especialmente para testes com início dos juros em 07/1994, e garantir que os modelos oficiais não sejam mutilados pela competência inicial do caso.

## Correções implementadas

### 1. Encadeamentos oficiais carregados integralmente

Ao aplicar um modelo predefinido, o sistema não corta mais os períodos anteriores à primeira competência das diferenças. O encadeamento oficial permanece completo; a competência inicial do caso continua sendo utilizada pelo motor no cálculo efetivo.

Isso permite que o usuário visualize o histórico integral do modelo, inclusive desde 07/1994 quando essa for a origem do encadeamento.

### 2. MC-PREVID-2026 — juros

Conforme item 4.3.2 do Manual de Cálculos da Justiça Federal — edição julho/2026:

- 07/1994 a 06/2009 — 1,0% a.m., simples;
- 07/2009 a 04/2012 — 0,5% a.m., simples;
- 05/2012 a 11/2021 — remuneração da poupança, simples;
- 12/2021 a 08/2025 — SELIC, tratada no bloco SELIC;
- a partir de 09/2025 — Taxa Legal Previdenciária, tratada no bloco de juros.

A taxa legal da competência é aplicada no mês seguinte à competência, conforme a regra do Manual.

### 3. MC-PREVID-2022 — juros

O encadeamento foi alinhado ao item 4.3.2 do Manual 2022:

- 07/1994 a 06/2009 — 1,0% a.m., simples;
- 07/2009 a 04/2012 — 0,5% a.m., simples;
- 05/2012 a 11/2021 — remuneração da poupança, simples;
- a partir de 12/2021 — SELIC.

### 4. Base histórica da poupança

Foi incluída a competência 05/2012 na série utilizada pelo motor, com 0,5000%, correspondente à regra aplicável no início da sistemática da MP 567/2012.

### 5. Sincronização Guia 1 → Guia 5

A alteração de `Início dos Juros` na Guia 1 passa a atualizar imediatamente o campo correspondente da Guia 5.

A sincronização ocorre:

- ao abrir/entrar na Guia 5;
- durante a alteração do campo na Guia 1;
- sem impedir que o usuário altere manualmente o campo da Guia 5 para um teste específico.

## Testes técnicos realizados

- JavaScript validado com `node --check`;
- MC-PREVID-2026 carregando juros desde 07/1994;
- MC-PREVID-2022 carregando juros desde 07/1994;
- intervalo 07/1994–11/2021 percorre os três regimes de juros;
- taxa legal de 09/2025 é computada em 10/2025, conforme regra de aplicação no mês seguinte.

## Próxima etapa

Ainda deve ser feita a auditoria específica dos modelos **MC-ACOES-GERAL-2026** e **MC-ACOES-GERAL-2022**, porque o Manual de ações condenatórias em geral possui regras diferentes conforme o devedor seja Fazenda Pública ou não. Essa distinção exige validação própria do motor e não deve ser resolvida copiando as regras previdenciárias.
