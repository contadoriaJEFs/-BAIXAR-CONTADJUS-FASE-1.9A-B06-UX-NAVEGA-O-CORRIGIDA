# B26 — MC GERAL 2026 – SELIC — Implementação do índice SELIC no bloco de juros

## Problema identificado no teste B25

O preset `MC-ACOES-GERAL-2026-SELIC` carregava corretamente o encadeamento, porém o motor rejeitava `SELIC` quando o índice aparecia dentro do encadeamento de juros, exibindo:

> Índice de juros ainda não implementado nesta fase: SELIC

## Correção

O motor de juros passou a reconhecer `SELIC` como índice válido dentro do encadeamento de juros de mora, utilizando a mesma série mensal já existente em `BASE_INDEXADORES_JUROS.SELIC`.

A implementação é separada do cálculo da SELIC do bloco próprio:

- `SELIC` dentro de `juros` = juros de mora segundo o preset selecionado;
- `SELIC` dentro de `selic` = SELIC do bloco próprio, atualmente usada no período EC 113.

## Preset alternativo

`MC GERAL 2026 – SELIC`

- Correção: 01/2003 a 06/2009 = `SEM_CORRECAO`;
- Juros: 01/2003 a 06/2009 = `SELIC`;
- Demais períodos permanecem iguais ao `MC GERAL 2026`;
- SELIC do bloco próprio permanece 12/2021 a 08/2025.

## Regra de homologação

O preset original `MC-ACOES-GERAL-2026` não foi alterado.
