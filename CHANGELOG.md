
## B29 — Índice inferior a 1,00
- Corrigido o tratamento de coeficientes acumulados inferiores a 1,00.
- O índice continua compondo o acumulado, mas não reduz o valor monetário da própria parcela abaixo do original.
- Aplicado na Guia 5 e no cálculo mensal reutilizado pela Guia 6.

## B25 — MC GERAL 2026 – SELIC
- Criado preset alternativo `MC-ACOES-GERAL-2026-SELIC`.
- 01/2003–06/2009: SELIC como juros e sem correção monetária.
- Preset `MC-ACOES-GERAL-2026` original permanece inalterado.


## B19 — Correção dos encadeamentos de juros da Guia 5

- Encadeamentos oficiais passaram a ser carregados integralmente, sem corte pela primeira competência do caso.
- Corrigidos os juros dos modelos MC-PREVID-2026 e MC-PREVID-2022 conforme os respectivos Manuais.
- Corrigida a aplicação da Taxa Legal Previdenciária no mês seguinte à competência.
- Sincronização de Início dos Juros da Guia 1 com a Guia 5 reforçada.
- Incluída a competência 05/2012 na série histórica de poupança.
- Auditoria dos modelos de Ações em Geral permanece como próxima etapa, devido às regras distintas para Fazenda Pública e devedor não enquadrado como Fazenda Pública.

## B16 — UX Guia 6 — Parcelas vincendas recolhíveis
- Bloco `Parcelas vincendas` transformado em painel recolhível.
- Removido o ícone `📊`.
- Fechado por padrão, com quantidade de parcelas visível no cabeçalho.
- Sem alteração no motor de cálculo.
# B12 — 1.9A
- Corrigida vincenda proporcional no mesmo mês da DIB/ajuizamento.
- Ajustada tipografia e ações globais.
- Compactada a Guia 1.

# Changelog

Todas as alterações relevantes do **ContadJus** e do módulo **LiquidaCalc** são registradas neste arquivo.

O projeto utiliza fases funcionais para documentar a evolução incremental. Cada fase somente é marcada como **homologada** após os testes de aceitação e regressão correspondentes.

## Convenções

- **Adicionado:** nova funcionalidade, estrutura ou arquivo.
- **Alterado:** mudança intencional de comportamento ou apresentação.
- **Corrigido:** resolução de erro ou regressão.
- **Preservado:** componentes que não sofreram alteração na fase.
- **Homologação:** testes executados e resultados aprovados.
- **Pendente:** funcionalidade preparada estruturalmente, mas ainda não implementada matematicamente.

---

## [3.5-alpha] Fase 1.8F-F1B.1: correção do fluxo dos modelos da Guia 5

**Data:** 11/08/2026  
**Status:** Homologada

### Corrigido

- restabelecida a aplicação automática dos modelos oficiais da Guia 5;
- correção da vinculação do botão Aplicar;
- atualização automática dos encadeamentos visuais após aplicação do modelo;
- sincronização entre seleção do modelo e renderização da legenda dos encadeamentos.

### Diagnóstico homologado

A investigação isolou o problema no fluxo de aplicação do modelo.

Foi confirmado que:

- os parâmetros eram carregados normalmente;
- os modelos oficiais eram carregados corretamente;
- `carregarEncadeamentoOficial()` funcionava corretamente;
- os encadeamentos oficiais estavam corretos;
- o container dos encadeamentos estava correto;
- `atualizarEncadeamentosVisuais()` funcionava corretamente;
- a renderização dos encadeamentos e de suas legendas funcionava corretamente;
- o problema estava exclusivamente no fluxo de disparo do botão `Aplicar`.

Assim, não houve necessidade de alteração do motor de carregamento,
dos parâmetros, da estrutura dos encadeamentos ou da rotina de
renderização. A correção concentrou-se na vinculação e no disparo
do fluxo do botão `Aplicar`.

### Preservado

- motor de correção monetária;
- motor previdenciário;
- filtros dos encadeamentos;
- Guia 2;
- Guia 4;
- cálculos homologados;
- modelos oficiais.

---

### Observação técnica — divergências residuais de arredondamento

Foram observadas, em cenários específicos, diferenças residuais de
centavos entre os resultados do ContadJus e sistemas de referência
externos.

A investigação indicou compatibilidade com diferenças de estratégia
de arredondamento, truncamento ou quantidade de casas decimais
utilizadas em etapas intermediárias.

Não foi identificada divergência material nos resultados homologados.

**Decisão técnica:** não alterar os motores matemáticos já homologados
exclusivamente para eliminar diferenças residuais de centavos cuja
origem esteja associada a estratégias distintas de precisão,
arredondamento ou truncamento.

---

## [3.5-alpha] Fase 1.8F-B4: arquivos personalizados e status detalhados

**Data:** 06/08/2026  
**Status:** Homologada

### Adicionado

- Extensão `.corr` para encadeamentos de correção monetária.
- Extensão `.jur` para pacotes unificados de Juros e SELIC.
- Extensão `.contadjus` para casos completos.
- Novos padrões de nomes:

```text
CORRE-NOME.corr
JUROS-NOME.jur
DADOS-AUTOR-IDENTIFICADOR.contadjus
```

- Identificador do caso obtido dos últimos seis algarismos do primeiro bloco do processo CNJ.
- Sanitização de nomes com remoção de acentos, uso de maiúsculas e separação por hífens.
- Tratamento de apóstrofos na sanitização.
- Valores substitutos:

```text
SEM-NOME
SEM-AUTOR
SEM-PROCESSO
```

- Exibição dos intervalos de cada indexador nos cartões da Guia 5.
- Nomes amigáveis dos índices nos status.
- Símbolo `►` para identificar visualmente cada novo período.
- Quebra automática dos blocos de períodos conforme a largura disponível.
- Exibição de período sem data final como `MM/AAAA em diante`.

### Alterado

- Botão `Carregar JSON de Correção` renomeado para `Carregar Parâmetros de Correção`.
- Botão `Carregar JSON de Juros e SELIC` renomeado para `Carregar Parâmetros de Juros e SELIC`.
- Cartões de status ampliados para ocupar o espaço disponível ao lado dos botões.
- Layout responsivo com empilhamento do botão e do status em telas menores.
- Informações principais mantidas em fonte normal e intervalos exibidos em fonte menor.
- Juros e SELIC mantidos em blocos visuais separados.
- Status restaurados com a mesma apresentação após importação do caso ou criação de novo caso.

### Compatibilidade

Continuam aceitos:

```text
.json
.corr
.jur
.contadjus
```

O reconhecimento permanece baseado no conteúdo interno, e não apenas na extensão.

### Segurança

- Dados provenientes dos arquivos são renderizados com `document.createElement()` e `textContent`.
- Nenhum nome, descrição, índice ou período importado é executado como HTML.

### Homologação

- Exportação de `CORRE-PREVID-2026.corr` aprovada.
- Exportação de `JUROS-PACOTE-JUROS-05-AM.jur` aprovada.
- Exportação de `DADOS-JOAO-DA-SILVA-001234.contadjus` aprovada.
- Sanitização de `Maria d'Ávila Neto` para `MARIA-D-AVILA-NETO` aprovada.
- Importação de `.corr`, `.jur` e `.contadjus` aprovada.
- Compatibilidade com arquivos antigos `.json` aprovada.
- Cartões ampliados e responsivos aprovados.
- Intervalos dos encadeamentos aprovados.
- Restauração dos parâmetros pelo caso completo aprovada.
- Todos os testes de aceitação passaram.

---

## [3.5-alpha] Fase 1.8F-B3: corte temporal pela data da conta

**Data:** 06/08/2026  
**Status:** Homologada

### Adicionado

- Corte temporal da memória da Guia 5 pela Data de Atualização.
- Contagem informativa das parcelas posteriores desconsideradas.
- Tratamento controlado para competência inválida durante a filtragem.
- Tratamento do caso em que nenhuma parcela é igual ou anterior à data da conta.

### Alterado

Somente parcelas com:

```text
competência <= Data de Atualização
```

passam a integrar:

- `window.resultadosAtualizacao.itens`;
- Total original;
- Total corrigido;
- Total dos Juros de Mora;
- memória renderizada na Guia 5.

As diferenças importadas permanecem integralmente preservadas em:

```javascript
window.diferencasAtualizacaoAtual
```

### Homologação

Cenário testado:

```text
Diferenças importadas: 418
Itens calculados:      358
Parcelas excluídas:     60
```

Foi confirmado que nenhum item calculado possuía competência posterior à Data de Atualização.

O tratamento atual do 13º foi preservado:

```text
13º/AAAA = competência 12/AAAA
```

Todos os testes de aceitação passaram.

---

## [3.5-alpha] Fase 1.8F-B2: exibição auditável dos juros

**Data:** 06/08/2026  
**Status:** Homologada

### Adicionado

Quatro colunas na memória da Guia 5:

1. `% Juros antes da SELIC`;
2. `Taxa Legal`;
3. `% Juros até a atualização`;
4. `Juros de Mora (R$)`.

Adicionado ao resumo:

```text
Total dos Juros de Mora
```

### Alterado

- Percentuais exibidos com quatro casas decimais.
- Valores monetários exibidos com duas casas decimais.
- Precisão interna preservada.
- Taxa Legal exibida como `-` enquanto o motor correspondente não estiver implementado.
- Tabela mantida em contêiner com rolagem horizontal.

### Homologação

- Percentuais visuais coincidiram com os resultados internos.
- Valores dos juros por parcela coincidiram com a incidência sobre o valor corrigido.
- Total registrado coincidiu com a soma de `item.valorJuros`.
- Total visual coincidiu com o total interno arredondado para centavos.
- Correção monetária isolada permaneceu funcional.
- Todos os testes de aceitação passaram.

---

## [3.5-alpha] Fase 1.8F-B1: motor de juros determinísticos

**Data:** 06/08/2026  
**Status:** Homologada

### Adicionado

Motor interno dos critérios:

```text
SEM_JUROS
JUROS_05_AM
JUROS_1_AM
JUROS_2_AA_EC136
```

Novos campos por parcela:

```javascript
inicioJurosEfetivoISO
inicioJurosEfetivo
fimJurosISO
criteriosJuros
quantidadeMesesJuros
percentualJurosAntesSelic
percentualTaxaLegal
percentualJurosTotal
valorJuros
detalhamentoJuros
```

Novo total global:

```javascript
window.resultadosAtualizacao.totalJuros
```

### Regras homologadas

- Juros simples.
- Incidência sobre o valor corrigido.
- Exclusão do mês inicial.
- Inclusão do mês da conta.
- Início efetivo pelo maior valor entre a competência da parcela e o campo Início dos Juros.
- Repetição do percentual para parcelas anteriores ou iguais ao início da mora.
- Redução mensal para parcelas posteriores.
- Lacuna no encadeamento tratada como erro.
- `SEM_JUROS` tratado como período expresso com taxa zero.

### Taxas

```text
SEM_JUROS        = 0% ao mês
JUROS_05_AM      = 0,5% ao mês
JUROS_1_AM       = 1% ao mês
JUROS_2_AA_EC136 = 2% ao ano ÷ 12, linearmente
```

### Testes homologados

#### Juros de 0,5% ao mês

```text
12/2019 → 23 meses → 11,5%
01/2020 → 23 meses → 11,5%
02/2020 → 22 meses → 11,0%
03/2020 → 21 meses → 10,5%
10/2021 →  2 meses →  1,0%
11/2021 →  1 mês   →  0,5%
12/2021 →  0 meses →  0,0%
```

#### Juros de 1% ao mês

```text
12/2019 → 23 meses → 23%
01/2020 → 23 meses → 23%
02/2020 → 22 meses → 22%
03/2020 → 21 meses → 21%
10/2021 →  2 meses →  2%
11/2021 →  1 mês   →  1%
12/2021 →  0 meses →  0%
```

#### Juros de 2% ao ano

```text
12/2019 → 12 meses → 2,0000%
01/2020 → 12 meses → 2,0000%
02/2020 → 11 meses → 1,8333333333%
12/2020 →  1 mês   → 0,1666666667%
01/2021 →  0 meses → 0%
```

#### Sem juros

- Quantidade de meses preservada para auditoria.
- Percentual igual a zero.
- Valor dos juros igual a zero.
- `criteriosJuros` contendo `SEM_JUROS` quando houve percurso mensal.

Todos os testes de aceitação passaram.

---

## [3.5-alpha] Fase 1.8F-A2: pacote unificado de Juros e SELIC

**Data:** 05/08/2026  
**Status:** Homologada

### Adicionado

- Tipo administrativo principal `Juros e SELIC`.
- Tabela interna de Juros de Mora.
- Tabela interna de SELIC.
- Pacote único com blocos independentes `juros` e `selic`.
- Carregamento unificado na Guia 5.
- Status unificado `statusJurosSelic`.
- Metadados `nomePacote`, `descricaoPacote` e `dataCriacaoPacote` nos blocos internos.
- Validação estrutural dos períodos com `Array.isArray()`.
- Bloqueio do pacote totalmente vazio.

### Combinações permitidas

- somente Juros;
- somente SELIC;
- Juros e SELIC.

### Alterado

- Taxa Legal e Taxa Legal Previdenciária mantidas como índices de Juros de Mora.
- SELIC mantida como índice exclusivo da tabela SELIC.
- Parâmetros preservados separadamente em:

```javascript
window.parametrosCorrecaoAtual
window.parametrosJurosAtual
window.parametrosSelicAtual
```

- Persistência do caso preservada em:

```json
{
  "parametros": {
    "correcao": {},
    "juros": {},
    "selic": {}
  }
}
```

### Compatibilidade

Mantida importação dos formatos:

```text
parametros_atualizacao + correcao_monetaria
parametros_atualizacao + juros_mora
parametros_atualizacao + selic
parametros_juros_selic + juros_selic
```

### Homologação

- Pacote somente com Juros aprovado.
- Pacote somente com SELIC aprovado.
- Pacote com Juros e SELIC aprovado.
- Pacote vazio bloqueado.
- Carregamento unificado aprovado.
- Importação de formatos antigos aprovada.
- Correção monetária preservada.
- Todos os testes de aceitação passaram.

---

## [3.5-alpha] Fase 1.8F-A: infraestrutura de Juros e SELIC

**Data:** 05/08/2026  
**Status:** Homologada

### Adicionado

- Arquivo `data/indexadores-juros.js`.
- Catálogo `window.CATALOGO_INDEXADORES_JUROS`.
- Base `window.BASE_INDEXADORES_JUROS`.
- Critérios determinísticos, históricos e mistos.
- Estrutura inicial de carregamento e persistência dos parâmetros.

### Critérios cadastrados

```text
SEM_JUROS
JUROS_05_AM
JUROS_1_AM
JUROS_2_AA_EC136
JUROS_POUPANCA
TAXA_LEGAL
TAXA_LEGAL_PREVIDENCIARIA
SELIC
```

### Observação

Nesta fase foi criada a infraestrutura. Os cálculos foram implementados gradualmente nas fases posteriores.

---

## [3.5-alpha] Fase 1.8E: motor de correção monetária e plataforma ContadJus

**Período:** 02/08/2026 a 04/08/2026  
**Status:** Homologada para os cenários operacionais testados

### Plataforma ContadJus

#### Adicionado

- domínio oficial `contadjus.com.br`;
- hospedagem no GitHub Pages;
- autenticação por Supabase Auth;
- login, logout, persistência de sessão e recuperação de senha;
- arquivos `js/auth.js`, `js/supabase.js` e `css/auth.css`;
- namespace global `CONTADJUS`.

#### Preservado

- processamento dos cálculos no navegador;
- independência entre autenticação e motores matemáticos;
- motor previdenciário e regras existentes.

### Motor de correção monetária

#### Adicionado

- primeira versão funcional do motor genérico da Guia 5;
- leitura de encadeamentos de correção;
- acumulação de fatores mensais;
- índice operacional UFIR;
- índice histórico `UFIR_NOMINAL` para auditoria;
- índice especial opcional `IPCAE_CJF_2000` para transição;
- suporte a diferentes encadeamentos sem alteração do motor.

#### Homologação

- coeficientes a partir de 07/1994 compatíveis com os sistemas de referência utilizados;
- resultados finais compatíveis com ProjefWeb e Fábrica de Cálculos nos cenários testados;
- encadeamentos configurados conforme diferentes manuais reproduzidos pelo mesmo motor genérico;
- diferenças residuais limitadas a precisão, arredondamento ou truncamento, sem divergência material nos resultados finais testados.

### Pendência histórica

O intervalo entre `01/1992` e `06/1994` permanece registrado para validação histórica complementar da UFIR.

> Encadeamentos configurados segundo diferentes edições de manuais não são motores separados. Todos são interpretados pelo mesmo motor genérico de correção monetária.

---

## [3.4-alpha] Fase 1.8D: espelho das diferenças na Guia 5

**Data:** 30/07/2026  
**Status:** Homologada

### Adicionado

- seção Diferenças da Guia 4 na Guia 5;
- botão Importar Diferenças da Guia 4;
- `window.diferencasAtualizacaoAtual`;
- tabela inicial de Competência e Diferença Original;
- reset automático após alterações nas Guias 1, 3 ou 4.

### Preservado

- parâmetros carregados na Guia 5;
- lógica da Guia 4;
- motor previdenciário;
- estrutura do caso.

---

## [3.4-alpha] Fase 1.8C: integração administrativa com a base de indexadores

**Data:** 30/07/2026  
**Status:** Homologada

### Adicionado

- consulta dinâmica ao catálogo de indexadores;
- filtro por tipo de parâmetro;
- preservação auditável de índices inexistentes ou incompatíveis em arquivos antigos;
- nomes amigáveis e códigos técnicos nos seletores.

### Corrigido

- substituição silenciosa de índice importado;
- incompatibilidades entre correção e juros;
- erro de sintaxe após ajuste da importação;
- abertura do modal administrativo.

---

## [3.4-alpha] Fase 1.8B: base de indexadores de atualização

**Data:** 29/07/2026  
**Status:** Homologada estruturalmente

### Adicionado

- `data/indexadores.js`;
- `window.BASE_INDEXADORES_ATUALIZACAO`;
- `window.CATALOGO_INDEXADORES_ATUALIZACAO`;
- `window.INDEXADORES_ATUALIZACAO`;
- dados iniciais de INPC, IPCA-E e IPCA;
- estrutura preparada para expansão dos demais índices.

---

## [3.4-alpha] Fase 1.8A: infraestrutura de parâmetros da Guia 5

**Data:** 29/07/2026  
**Status:** Homologada

### Adicionado

- infraestrutura inicial da Guia 5;
- modal administrativo aberto por `Ctrl + Shift + E`;
- criação, validação, importação e exportação de encadeamentos;
- variáveis globais de correção, Juros e SELIC;
- sincronização das datas entre as Guias 1 e 5;
- validação de sobreposição e período aberto.

---

## [3.3] Fase 1.7D2: abono anual e ano final aberto

**Data:** 28/07/2026  
**Status:** Homologada

### Adicionado

- linhas `13º/AAAA` na Guia 4;
- cálculo de avos pela regra dos 15 dias;
- suporte ao primeiro 13º;
- suporte a benefícios baseados em salário mínimo;
- opção de 13º proporcional no ano final aberto;
- persistência da nova opção no caso;
- cálculo individualizado do 13º devido e recebido.

### Corrigido

- base do primeiro 13º em memórias resumidas;
- tratamento do ano final aberto;
- DCB de benefícios recebidos;
- uso indevido da DIP como DCB;
- restauração das competências de 13º;
- recursão em relatórios;
- compatibilidade visual entre navegadores.

---

## Funcionalidades pendentes

Os seguintes motores ainda não estão implementados:

```text
JUROS_POUPANCA
TAXA_LEGAL
TAXA_LEGAL_PREVIDENCIARIA
SELIC
```

Também permanecem pendentes:

- não cumulação entre juros e SELIC;
- valor e total da SELIC;
- total geral da condenação;
- integração completa da atualização aos relatórios;
- implementação matemática da Guia 6;
- parâmetros avançados de exibição das tabelas.

---

## Política de compatibilidade

O projeto preserva, sempre que possível:

- casos nas versões 3.1, 3.2 e 3.3;
- encadeamentos administrativos antigos em `.json`;
- justificativas antigas armazenadas como texto;
- campos novos com valores padrão em casos antigos;
- separação entre parâmetros de Correção, Juros e SELIC;
- cálculos já homologados durante a evolução das fases.

## B24 — MC-ACOES-GERAL-2022 após teste
- IPCAE: 01/2001–11/2021; SEM_CORRECAO a partir de 12/2021.
- Juros: 01/2003–06/2009 = JUROS_05_AM.
- Removida SELIC de 01/2003–06/2009; mantida no bloco SELIC a partir de 12/2021.

## B28 — Correção da competência da Taxa Legal

- Corrigido o deslocamento indevido da `TAXA_LEGAL` e da `TAXA_LEGAL_PREVIDENCIARIA` para o mês seguinte.
- A taxa passa a ser consultada diretamente na competência da parcela.
- A vigência da base permanece dinâmica e aberta: a data de atualização limita o período do cálculo, mas não desloca a competência da taxa.
- Exemplo de validação: 07/2026 utiliza a taxa de 07/2026; 08/2026 utiliza a taxa de 08/2026.
- Não foram alterados os encadeamentos homologados.

## B33 — Simplificação da Guia 1
- Removido o bloco "Fonte dos Índices de Reajuste" da Guia de Entradas.
- Removido o seletor de comportamento para competência final; a data de atualização volta a ser sempre o termo final informado pelo usuário.
- Removido o botão "Limpar" inferior, mantendo o botão "Novo caso / Limpar" do bloco Ações do Caso.
- Mantido o botão azul "Calcular Evolução" para atualização explícita da Guia 2 após carregamento/alteração de dados.
- Quando a última competência não possuir índice de correção disponível, a competência permanece no cálculo com coeficiente neutro, quando aplicável, em vez de ser automaticamente excluída.


## B34 — Campos de entrada manual da Guia 1 com fundo branco
- Padronizados inputs, selects e textareas editáveis da Guia 1 com fundo branco.
- Campos `readonly`/automáticos permanecem com a aparência diferenciada.
- Checkboxes, radios, arquivos e campos ocultos não foram afetados.
