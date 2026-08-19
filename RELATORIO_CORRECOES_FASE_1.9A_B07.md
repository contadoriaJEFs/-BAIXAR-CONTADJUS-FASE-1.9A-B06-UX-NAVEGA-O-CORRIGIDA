# ContadJus — Fase 1.9A-B07

## Correção: competência do ajuizamento nas vencidas e parcela-base das vincendas

### Problemas identificados no teste B06

1. A competência do ajuizamento ainda recebia SELIC na memória de vencidas.
2. Quando o tratamento do mês do ajuizamento era proporcional, a linha da competência do ajuizamento não era apresentada proporcionalizada na memória das vencidas.
3. A primeira parcela vincenda estava sendo calculada sobre o **total atualizado da diferença no ajuizamento**, que carregava SELIC, e depois sofria nova proporcionalização. Isso produzia, por exemplo, R$ 712,14 em vez de R$ 706,00 para 15/08/2024 sobre base de R$ 1.412,00.
4. Havia risco de aplicar a proporcionalização duas vezes: uma na memória das vencidas e outra no total das vencidas.

## Correções B07

### 1. Vencidas

A competência do ajuizamento:

- não recebe SELIC;
- não recebe juros;
- quando o tratamento é proporcional, é reduzida à fração vencida;
- passa a aparecer na tabela já com o valor efetivamente integrante das vencidas.

Para 15/08/2024, pela convenção comercial de 30 dias:

- fração vencida: 50%;
- fração vincenda: 50%;
- R$ 1.412,00 × 50% = R$ 706,00.

### 2. Parcela-base das vincendas

`calcularParcelaAjuizamento()` deixa de utilizar o total atualizado da diferença do mês do ajuizamento.

Agora obtém o **valor integral do benefício na competência do ajuizamento**, sem SELIC e sem proporcionalização.

A proporcionalização é aplicada somente na construção da primeira parcela vincenda.

Assim:

- parcela-base integral: R$ 1.412,00;
- 15/08/2024, proporcional: 50%;
- primeira vincenda: R$ 706,00.

### 3. Evita dupla proporcionalização

A memória das vencidas já entrega a competência do ajuizamento proporcionalizada. A formação da demanda não aplica uma segunda fração sobre o total.

### 4. SELIC

Para a competência do ajuizamento, a SELIC é explicitamente zerada na memória das vencidas.

As demais competências anteriores continuam sendo atualizadas normalmente.

## Resultado esperado no cenário de teste

DIB 16/05/2024, RMI R$ 1.000,00, ajuizamento 15/08/2024, final 12/2024, método Até 12, proporcional, 13º Sim:

### Vencidas

- 05/2024: R$ 706,00
- 06/2024: R$ 1.412,00
- 07/2024: R$ 1.412,00
- 08/2024: R$ 706,00, SELIC R$ 0,00

Total original esperado: **R$ 4.236,00**.

SELIC esperada: **R$ 85,43**.

Total atualizado esperado: **R$ 4.321,43**.

### Vincendas

- 08/2024: R$ 706,00
- 09/2024: R$ 1.412,00
- 10/2024: R$ 1.412,00
- 11/2024: R$ 1.412,00
- 12/2024: R$ 2.353,33 (R$ 1.412,00 + R$ 941,33 de 13º)

Total esperado: **R$ 7.295,33**.
