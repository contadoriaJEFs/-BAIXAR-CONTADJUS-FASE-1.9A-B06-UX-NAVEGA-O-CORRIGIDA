# B30 — Limite dinâmico da última competência calculável

## Problema

Quando a Data de Atualização era 08/2026 e a base de correção INPC estava disponível somente até 07/2026, a Guia 5 ainda incluía a competência 08/2026. Como 08/2026 coincidia com a data da conta, o coeficiente podia aparecer como 1,0000000000 e a parcela integral era mantida, embora não houvesse índice oficial necessário para calculá-la.

## Correção

A data de atualização continua aberta e não há nenhuma data fixa no código.

O motor passa a determinar a última competência calculável pela disponibilidade efetiva das séries mensais necessárias nos períodos abertos dos encadeamentos de correção, juros e SELIC. O limite efetivo é o menor entre:

1. a Data de Atualização informada; e
2. a última competência disponível na base para os indexadores ativos que exigem série mensal.

Competências posteriores ao limite efetivo são desconsideradas.

## Exemplo validado

Com Data de Atualização 08/2026 e INPC disponível até 07/2026:

- 07/2026 permanece calculável;
- 08/2026 não é incluída;
- não há data 07/2026 ou 08/2026 fixada no código;
- quando uma nova competência for adicionada à base, o limite avançará automaticamente.

## Preservações

- Regra do índice acumulado inferior a 1 permanece intacta.
- Taxa Legal continua sendo aplicada na própria competência.
- Encadeamentos homologados não foram alterados.
