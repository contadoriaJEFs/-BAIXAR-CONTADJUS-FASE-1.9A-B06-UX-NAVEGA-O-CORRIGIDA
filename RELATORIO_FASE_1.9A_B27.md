# ContadJus — Fase 1.9A — B27

## Ajustes desta versão

- Mantida a implementação da Guia 6 / Renúncia da B26.
- Adicionado botão explícito **Calcular Formação da Demanda**.
- O cálculo da memória até o ajuizamento passa a reutilizar efetivamente `guia5CalcularJurosDeterministicos()` com `SEM_JUROS`.
- Mantida a reutilização de `guia5CalcularCoeficienteMensal()` e `guia5CalcularSelic()`.
- `window.resultadosAtualizacao` não é alterado pela Guia 6.

## Estados da Guia 6

- `window.parametrosFormacaoDemanda`
- `window.resultadosAjuizamentoAtualizacao`
- `window.resultadoAjuizamento`

## Arquivos alterados nesta B27

- `index.html`
- `js/admin-encadeamentos.js`

A estrutura `formacaoDemanda` e a compatibilidade com `acordoRenuncia` permanecem conforme a B26 em `js/json.js`.

## Validação

- `node --check` executado em `js/admin-encadeamentos.js`.
- `node --check` executado em `js/json.js`.
- Testes automatizados do núcleo da Guia 6 executados com sucesso:
  - competência do ajuizamento;
  - 1 parcela anual integral;
  - 1 parcela anual proporcional;
  - até 12 vincendas;
  - limitação do número de vincendas;
  - 13º agregado em dezembro;
  - renúncia;
  - acordo;
  - memória até o ajuizamento com juros zero;
  - SELIC preservada;
  - preservação de `window.resultadosAtualizacao`.

## Escopo não implementado

- Guia 7 / Expedição;
- RPV;
- precatório;
- honorários;
- relatórios novos.
