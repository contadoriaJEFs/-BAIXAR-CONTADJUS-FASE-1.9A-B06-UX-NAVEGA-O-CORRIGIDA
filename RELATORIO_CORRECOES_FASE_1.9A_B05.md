# ContadJus — Relatório de Correções Fase 1.9A-B05

## Base

Correções aplicadas diretamente sobre o ZIP recebido do projeto ContadJus.

## 1. Evolução — piso/teto sem reajuste

Corrigido o cenário em que a evolução não atravessa nenhum reajuste até a Data Final.

Antes, uma RMI de R$ 1.000,00 em 2024 podia permanecer em R$ 1.000,00 porque a memória ficava vazia ou o último marco de reajuste ainda não havia ocorrido.

Agora, a competência final é limitada pelo salário mínimo e pelo teto vigentes, mesmo quando não existe reajuste aplicável dentro do período.

Foi criada uma âncora de memória com tipo `PISO_INICIAL`, `TETO_INICIAL` ou `SEM_REAJUSTE`, sem contar como reajuste.

## 2. `obterValorIntegral()`

A função deixou de retornar imediatamente `rmaFinal/rmi` quando a memória está vazia.

Agora aplica os limitadores da própria competência também nesse cenário.

Isso corrige a origem utilizada por diferenças e 13º sem criar um tratamento específico apenas para a Guia 6.

## 3. 13º da Guia 6

A Guia 6 deixou de exigir memória não vazia para calcular o 13º.

Quando não houve reajuste, a base pode ser obtida pela RMI e pelos limitadores da competência, preservando a regra dos avos já validada.

## 4. Data do ajuizamento na Guia 6

Incluído campo próprio de **Data do Ajuizamento** na Guia 6.

O campo permanece editável e é sincronizado bidirecionalmente com a Data do Ajuizamento da Guia 1 — Entradas.

Não existem duas datas independentes: a alteração em qualquer uma atualiza a outra.

## 5. Recalculo automático

Foi iniciado um encadeamento automático das guias para evitar a necessidade de abrir uma guia apenas para disparar seu cálculo.

Alterações relevantes em Entradas, Benefícios Recebidos, Diferenças e Guia 5 agendam o recálculo das dependências.

O recálculo automático é silencioso e não muda a guia ativa nem provoca rolagem da tela.

## 6. UX da Guia 6

### Valores até o Ajuizamento

Renomeado para:

**Valores até o Ajuizamento (Vencidas)**

Mantido como bloco recolhível.

### Parcelas Vincendas

Criado bloco próprio para demonstrar a composição das vincendas.

#### Método Até 12

Mostra as competências efetivamente existentes, sem criar parcelas artificiais, com coeficiente 1,000000 e SELIC 0,00%.

#### Método 1 Parcela Anual

Mostra:

- 1ª parcela — mês do ajuizamento;
- 11 demais parcelas integrais;
- total da projeção de 12 parcelas.

O 13º não é inserido nesse método.

O bloco possui totalizador destacado visualmente.

## 7. Regra preservada — 13º

No método **Até 12**, quando dezembro estiver entre as competências existentes e o parâmetro estiver ativo, o 13º é agregado à competência de dezembro e não cria uma parcela adicional.

No método **1 Parcela Anual**, o 13º não é acrescentado.

## 8. Regras já validadas e preservadas

- competência inicial pela convenção comercial de 30 dias;
- DIB incluída na contagem da competência inicial;
- 13º por avos, com critério de 15 dias;
- Até 12 = no máximo 12 competências efetivamente existentes;
- vincendas sem SELIC;
- proporcionalidade do mês do ajuizamento distinta da proporcionalidade da DIB;
- DIP vazia não delimita as vincendas;
- não criar DCB fictícia para o benefício devido;
- método 1 Parcela Anual sem inclusão de 13º.

## Pendências que permanecem

1. **DCB do benefício devido:** ainda não existe campo próprio; a questão permanece pendente.
2. **Integração completa entre todas as fases:** o recálculo automático foi iniciado, mas deve ser submetido a testes de regressão abrangentes.
3. **Piso/teto:** testar cenários de RMI abaixo do piso, acima do teto e com reajustes posteriores.
4. **13º sem memória:** testar diretamente na interface os cenários com final em 12/2024 e RMI abaixo do piso.
5. **Guia 5:** confirmar em testes de interface que seus parâmetros e resultados são atualizados sem necessidade de abrir a guia.
6. **JSON:** testar carga e salvamento com o novo campo da Guia 6, garantindo sincronização da data do ajuizamento.
7. **Fábrica de Cálculos:** divergências sem fundamento identificado continuam fora do motor do ContadJus e poderão ser investigadas posteriormente com os desenvolvedores da Fábrica.

## Próxima etapa recomendada

Executar uma bateria de regressão dos cenários já validados, especialmente:

- DIB 15/05, 16/05, 17/05 e 18/05;
- final 10/2024, 12/2024 e 02/2025;
- Até 12 com e sem 13º;
- 1 Parcela Anual proporcional e integral;
- RMI abaixo do piso;
- RMI acima do teto;
- data do ajuizamento editada pela Guia 1 e pela Guia 6.
