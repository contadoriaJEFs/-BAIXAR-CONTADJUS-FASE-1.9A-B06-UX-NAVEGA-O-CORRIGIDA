# RELATÓRIO — B28 — Competência da Taxa Legal

## Problema identificado

Na Guia 5, a `TAXA_LEGAL` e a `TAXA_LEGAL_PREVIDENCIARIA` estavam sendo deslocadas uma competência para frente durante o cálculo de juros. A lógica anterior buscava a competência anterior à competência da parcela.

Exemplo observado no teste previdenciário:

- 07/2026 deveria receber a Taxa Legal Previdenciária de 07/2026: **0,978134%**;
- 08/2026 deveria receber a taxa de 08/2026: **0,000000%**.

A versão anterior aplicava a taxa de 07/2026 em 08/2026.

## Correção B28

A função `guia5CalcularJurosIntervalo()` passou a consultar a taxa diretamente com a competência corrente:

```text
guia5ObterTaxaJurosMensal(periodo.indice, cursor)
```

Não há mais deslocamento para o mês seguinte.

## Regra dinâmica

A data final da base de indexadores não é codificada no motor. O cálculo percorre até a data de atualização e consulta a taxa disponível para cada competência.

Assim:

```text
07/2026 → taxa de 07/2026
08/2026 → taxa de 08/2026
09/2026 → taxa de 09/2026, se disponível na base
```

## Preservação

- Encadeamentos homologados não foram alterados.
- `MC GERAL 2026` permanece intacto.
- `MC GERAL 2026 – SELIC` permanece intacto.
- SELIC EC 113 continua no bloco próprio.
- A correção afeta apenas a aplicação da Taxa Legal no bloco de juros.

## Validação estrutural

- `node --check js/admin-encadeamentos.js` → aprovado.
- Confirmada a remoção da lógica de deslocamento de competência.
- Confirmada a consulta direta da taxa pela competência corrente.
