# Relatório — B21 — MC-ACOES-GERAL-2022 / Juros

## Objetivo
Atualizar exclusivamente o encadeamento de juros do modelo `MC-ACOES-GERAL-2022`, considerando o modelo de Ações em Geral — Fazenda Pública definido durante a validação da Guia 5.

## Encadeamento de juros aplicado

| Período | Juros | Observação |
|---|---|---|
| 07/1994 a 12/2002 | 0,5% a.m. simples | `JUROS_05_AM` |
| 01/2003 a 06/2009 | Sem juros | SELIC tratada no bloco próprio |
| 07/2009 a 04/2012 | 0,5% a.m. simples | `JUROS_05_AM` |
| 05/2012 a 11/2021 | Juros da poupança | `JUROS_POUPANCA` |

## Encadeamento SELIC

- 01/2003 a 06/2009 → `SELIC`
- 12/2021 em diante → `SELIC`

Quando a SELIC está no bloco próprio, o bloco de juros de mora permanece como `SEM_JUROS`, evitando dupla aplicação.

## Correção monetária
Não foi alterada.

## Indexadores
Não foram alterados.

## Não Fazenda Pública
Não foi criada nem alterada uma regra específica de Não Fazenda Pública nesta etapa. O foco desta versão é o modelo adotado para Fazenda Pública.

## Validação
- `admin-encadeamentos.js` validado com `node --check`.
- Encadeamento histórico inicia em 07/1994, conforme o limite histórico atualmente adotado pela Guia 5.
