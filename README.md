# ContadJus

## LiquidaCalc, módulo de cálculos previdenciários RGPS/INSS

**Versão do arquivo de caso:** 3.3  
**Marco funcional:** Fase 1.8F-F1B  
**Status:** Em desenvolvimento, com as fases 1.7D2, 1.8E, 1.8F-A, 1.8F-A2, 1.8F-B1 a B4, 1.8F-F1 e 1.8F-F1B homologadas  
**Última atualização:** 11/08/2026

## Visão geral

O **ContadJus** é uma plataforma de cálculos judiciais executada no navegador. O **LiquidaCalc** é o primeiro módulo da plataforma e está voltado à evolução de benefícios do RGPS/INSS, apuração de diferenças, correção monetária e juros de mora.

O projeto prioriza:

- rastreabilidade da memória de cálculo;
- auditabilidade dos critérios aplicados;
- separação entre motores matemáticos e parâmetros jurídicos;
- compatibilidade com casos e encadeamentos antigos;
- execução local da lógica de cálculo;
- interface responsiva e organizada por guias;
- evolução incremental com testes de aceitação por fase.

A autenticação utiliza **Supabase Auth**. O Supabase controla o acesso, mas não participa dos cálculos.

> **Aviso:** o sistema permanece em desenvolvimento. Os resultados devem ser conferidos por profissional habilitado antes de qualquer utilização processual, administrativa ou financeira.

---

## Princípio arquitetural

O ContadJus adota a seguinte arquitetura:

```text
Motor genérico
+
Encadeamento administrativo
=
Critério aplicável
```

O código não deve incorporar regras rígidas com base no nome de um manual, pacote ou caso. Diferentes critérios são representados por encadeamentos com índices e períodos próprios, interpretados pelos mesmos motores genéricos.

Exemplos de práticas evitadas:

```javascript
calcularMC2022();
calcularMC2026();
```

```javascript
if (parametros.nome === 'MC 2026') {
    // regra específica
}
```

Os nomes dos encadeamentos servem para identificação e auditoria. A matemática depende dos índices, períodos e datas informados.

---

## Funcionalidades por guia

### Guia 1: Entradas

- dados processuais, autor, réu, CPF, vara e processo;
- tipo de ação;
- datas processuais e de atualização;
- início dos juros;
- parâmetros de prescrição;
- termo inicial das diferenças, automático ou manual;
- dados do benefício devido;
- DIB e DIP;
- RMI, transformação, cotas e adicionais;
- benefício baseado em salário mínimo;
- abono anual;
- opção de 13º proporcional no ano final aberto;
- exportação e importação do caso completo.

### Guia 2: Evolução devida

- evolução da renda mensal do benefício devido;
- reajustes integrais e proporcionais;
- aplicação de piso e teto;
- evolução por salário mínimo, quando aplicável;
- memória de cálculo e resumo executivo;
- Renda Mensal Atualizada;
- impressão pelo navegador.

A memória da Guia 2 permanece focada na evolução mensal, sem intercalar linhas do 13º.

### Guia 3: Benefícios recebidos

- cadastro de múltiplos benefícios recebidos;
- evolução independente por benefício;
- DIB, DIP e DCB individuais;
- RMI, abono anual e salário mínimo;
- modos de tratamento da DIP;
- cálculo individual ou em lote;
- re-renderização da memória após recálculo.

### Guia 4: Diferenças

- grade contínua de competências mensais;
- linhas próprias para `13º/AAAA`;
- benefício devido e benefícios recebidos;
- total recebido e diferença devida;
- limitação ao valor devido ou permissão de diferença negativa;
- cálculo do abono anual pela regra dos 15 dias;
- edição manual de valores;
- justificativas internas e externas;
- restauração individual ou geral;
- central de competências modificadas;
- cabeçalho fixo durante a rolagem;
- preparação das diferenças para a Guia 5.

#### Correções homologadas

- aplicação correta de piso e teto previdenciários, inclusive para competências anteriores ao primeiro reajuste existente na memória da evolução;
- alinhamento entre Guia 2, Guia 4 e Guia 5 no valor previdenciário efetivamente devido.

#### Bug previdenciário homologado

Foi corrigida a obtenção do valor do benefício devido para competências anteriores ao primeiro reajuste existente na memória da evolução.

A Guia 4 passou a respeitar piso e teto previdenciários durante todo o período de cálculo.

### Guia 5: Atualização

A Guia 5 está estruturada para correção monetária, juros e SELIC, com parâmetros predefinidos, parâmetros avançados e encadeamentos visuais voltados à auditabilidade da conta.

#### Datas de referência

- Data de Atualização;
- Início dos Juros;
- Observações.

O campo **Início dos Juros** é genérico. Pode representar citação, vencimento, evento danoso ou outro marco definido no processo.

#### Correção e Juros Predefinidos

A Guia 5 permite aplicação rápida de modelos oficiais por meio de combobox.

Exemplos de modelos:

- `MC-PREVID-2026`;
- `MC-ACOES-GERAL-2026`;
- `MC-PREVID-2022`;
- `MC-ACOES-GERAL-2022`.

A aplicação do modelo atualiza automaticamente os parâmetros de correção, juros e SELIC correspondentes ao modelo selecionado.

#### Parâmetros Avançados de Correção

Permite visualizar e ajustar os parâmetros de correção monetária de forma independente, preservando os encadeamentos e períodos utilizados na conta.

#### Parâmetros Avançados de Juros e SELIC

Permite trabalhar separadamente os parâmetros de juros de mora e SELIC, mantendo a estrutura administrativa unificada e a representação interna independente de cada encadeamento.

A infraestrutura de Juros e SELIC está integrada à Guia 5 e aos modelos predefinidos. Os critérios matemáticos efetivamente homologados permanecem descritos nas seções específicas deste README.

#### Diferenças da Guia 4

A Guia 5 recebe as diferenças preparadas pela Guia 4 e aplica os parâmetros de atualização sobre as parcelas elegíveis, preservando a rastreabilidade entre a origem da diferença e a atualização realizada.

#### Encadeamentos Visuais

A Guia 5 exibe os encadeamentos utilizados na conta logo acima da tabela de atualização.

São apresentados:

- Encadeamento de Correção;
- Encadeamento de Juros;
- Encadeamento SELIC;
- Limite de vigência do modelo.

Os encadeamentos possuem finalidade auditável e explicativa, não interferindo diretamente na memória de cálculo.

#### Memória de atualização

A tabela apresenta:

1. Competência;
2. Diferença Original;
3. Índice ou Critério;
4. Coeficiente;
5. Valor Corrigido;
6. % Juros antes da SELIC;
7. Taxa Legal;
8. % Juros até a atualização;
9. Juros de Mora em reais.

O resumo apresenta:

- Total original;
- Total corrigido;
- Total dos Juros de Mora.

#### Corte temporal

Somente parcelas com competência igual ou anterior à Data de Atualização participam da memória e dos totais. As diferenças importadas permanecem preservadas, mas parcelas posteriores à data da conta são desconsideradas na atualização.

### Guia 6: Acordo e renúncia

Estrutura visual preparada. A implementação matemática e jurídica permanece planejada para fase posterior.

### Guia 7: Relatórios

- relatório interno de alterações;
- relatório externo com justificativas autorizadas;
- pré-visualização em HTML;
- impressão e geração de PDF pelo navegador.

---


## Atualizações Pós Fase 1.8F-B4

### Correção Previdenciária da Guia 4

Foi corrigido um defeito na obtenção do valor do benefício devido para competências anteriores ao primeiro reajuste registrado na memória da evolução.

#### Sintoma identificado

Benefícios enquadrados em piso previdenciário apresentavam, na Guia 4, a RMI original em vez do valor previdenciário efetivamente devido.

Exemplo:

```text
RMI = R$ 300,00

Antes da correção:
04/2020 = R$ 300,00
05/2020 = R$ 300,00

Após a correção:
04/2020 = R$ 1.045,00
05/2020 = R$ 1.045,00
```

#### Causa

A função responsável pela obtenção do benefício devido utilizava a RMI original quando a competência era anterior ao primeiro reajuste presente na memória da evolução.

#### Resultado

- aplicação correta de piso previdenciário;
- aplicação correta de teto previdenciário;
- alinhamento entre Guia 2, Guia 4 e Guia 5;
- diferenças e atualização monetária consistentes.

**Status: HOMOLOGADA**

### Fase 1.8F-F1 – Consolidação Visual da Guia 5

A Guia 5 passou por reorganização completa da interface com foco em usabilidade e auditabilidade.

#### Estrutura atual

1. Datas de Referência;
2. Correção e Juros Predefinidos;
3. Parâmetros Avançados de Correção;
4. Parâmetros Avançados de Juros e SELIC;
5. Diferenças da Guia 4;
6. Encadeamentos;
7. Tabela de Resultados.

#### Objetivos alcançados

- redução de altura ocupada;
- melhor aproveitamento visual;
- parâmetros avançados recolhíveis;
- encadeamentos posicionados acima da tabela;
- melhoria da leitura da atualização.

**Status: HOMOLOGADA**

### Modelos Pré-definidos da Guia 5

A Guia 5 passou a disponibilizar seleção rápida de critérios por meio de modelos oficiais.

Exemplos:

- `MC-PREVID-2026`;
- `MC-ACOES-GERAL-2026`;
- `MC-PREVID-2022`;
- `MC-ACOES-GERAL-2022`.

A seleção do modelo aplica automaticamente os encadeamentos compatíveis com o critério escolhido.

**Status: HOMOLOGADA**

### Encadeamentos Visuais

A Guia 5 exibe os encadeamentos utilizados na atualização logo acima da tabela de resultados.

São exibidos:

- Encadeamento de Correção Monetária;
- Encadeamento de Juros;
- Encadeamento SELIC;
- Limite de vigência do modelo.

Exemplo de representação:

```text
📈 Encadeamento Correção:
► IPCA-E: 01/2020 a 11/2021;
► Sem correção: 12/2021 a 08/2025;
► IPCA-E: 09/2025 a 06/2026;

📊 Encadeamento Juros:
► Remuneração da Poupança: 01/2020 a 12/2021;
► Sem juros: 01/2022 a 08/2025;
► Taxa Legal: 09/2025 a 06/2026;

📉 Encadeamento SELIC:
► SELIC: 12/2021 a 08/2025;
```

Os encadeamentos possuem finalidade auditável e explicativa.

**Status: HOMOLOGADA**

### Correção do Fluxo do Botão Aplicar

Durante a reorganização visual da Guia 5 foi identificada uma quebra no fluxo de aplicação dos modelos oficiais.

#### Sintoma

Os modelos eram carregados, porém os encadeamentos não eram atualizados visualmente após o clique em **Aplicar**.

#### Diagnóstico

Foi confirmado que:

- `carregarEncadeamentoOficial()` funcionava corretamente;
- `atualizarEncadeamentosVisuais()` funcionava corretamente;
- o problema estava exclusivamente na vinculação do botão.

#### Correção

Foi adicionada vinculação explícita do botão `btnAplicarModelo` para `carregarEncadeamentoOficial()`, restabelecendo a atualização automática dos encadeamentos após a aplicação do modelo.

Essa correção também registra uma decisão arquitetural importante: os encadeamentos não estavam perdidos ou incorretos; a falha estava exclusivamente no fluxo de aplicação do modelo na interface da Guia 5.

**Status: HOMOLOGADA**


## Correção monetária

O motor genérico de correção monetária está homologado.

### Funcionamento

- leitura de encadeamentos do tipo `correcao_monetaria`;
- localização do período aplicável por competência;
- utilização de fatores mensais;
- multiplicação sucessiva dos fatores;
- preservação do critério utilizado em cada parcela;
- suporte ao índice `SEM_CORRECAO`;
- erro explícito para competência sem período ou sem índice cadastrado.

A correção utiliza fatores mensais, por exemplo:

```javascript
1.0061
```

Esse valor representa um fator, não uma taxa percentual direta.

---

## Juros de mora determinísticos

Os seguintes critérios estão implementados e homologados:

```text
SEM_JUROS
JUROS_05_AM
JUROS_1_AM
JUROS_2_AA_EC136
```

### Regras matemáticas

- juros simples;
- incidência sobre o valor corrigido da parcela;
- exclusão do mês de início;
- inclusão do mês da conta;
- contagem mensal, sem proporcionalidade diária nesta fase;
- repetição do percentual para parcelas vencidas antes ou na competência do início da mora;
- redução mensal do percentual para parcelas posteriores;
- erro explícito para lacunas no encadeamento.

Para cada parcela:

```text
Início efetivo = maior entre:
- competência da parcela;
- Início dos Juros.
```

O cálculo monetário utiliza:

```text
Juros de Mora = Valor Corrigido × Percentual Acumulado ÷ 100
```

### Taxas homologadas

```text
SEM_JUROS        = 0% ao mês
JUROS_05_AM      = 0,5% ao mês
JUROS_1_AM       = 1% ao mês
JUROS_2_AA_EC136 = 2% ao ano ÷ 12, de forma linear
```

A taxa de 2% ao ano não utiliza equivalência composta.

### Exemplo de contagem

Com início dos juros em `01/2020` e conta em `12/2021`:

```text
12/2019 → 23 meses → 11,5% a 0,5% ao mês
01/2020 → 23 meses → 11,5%
02/2020 → 22 meses → 11,0%
11/2021 →  1 mês   →  0,5%
12/2021 →  0 meses →  0,0%
```

---

## Juros, SELIC e Taxa Legal

A infraestrutura de Juros e SELIC evoluiu e está integrada à Guia 5, aos encadeamentos administrativos e aos modelos predefinidos.

Os critérios determinísticos já homologados permanecem:

```text
SEM_JUROS
JUROS_05_AM
JUROS_1_AM
JUROS_2_AA_EC136
```

A Guia 5 também dispõe de estrutura para parâmetros avançados de Juros e SELIC, incluindo encadeamentos independentes e aplicação por modelos.

Os critérios específicos ainda não homologados devem permanecer tratados como roadmap, sem serem considerados implementados apenas por estarem disponíveis na infraestrutura ou na interface.

Entre os pontos ainda sujeitos a homologação específica, conforme evolução do projeto, estão:

- JUROS_POUPANCA;
- TAXA_LEGAL;
- TAXA_LEGAL_PREVIDENCIARIA;
- SELIC, em seus critérios matemáticos específicos;
- regras de transição e não cumulação;
- cálculo e totalização da SELIC;
- integração completa com o total geral da condenação;
- integração completa com relatórios.

A coluna **Taxa Legal** permanece disponível na memória para os critérios que a utilizarem, sem implicar que o respectivo motor esteja homologado em todos os cenários.

---

## Encadeamentos administrativos

O modal administrativo é aberto por:

```text
Ctrl + Shift + E
```

Tipos principais:

```text
Correção Monetária
Juros e SELIC
```

O pacote de Juros e SELIC possui tabelas internas independentes:

```text
Encadeamento de Juros de Mora
Encadeamento SELIC
```

### Combinações permitidas

- somente Juros;
- somente SELIC;
- Juros e SELIC.

Um pacote totalmente vazio é bloqueado.

### Modelos predefinidos

A Guia 5 disponibiliza modelos oficiais por meio de combobox, permitindo aplicação rápida dos encadeamentos correspondentes.

Exemplos:

```text
MC-PREVID-2026
MC-ACOES-GERAL-2026
MC-PREVID-2022
MC-ACOES-GERAL-2022
```

A seleção de um modelo atualiza os parâmetros de correção, juros e SELIC correspondentes, respeitando os períodos e limites de vigência definidos pelo modelo.

### Estrutura do pacote

```json
{
  "tipoArquivo": "parametros_juros_selic",
  "tipoParametro": "juros_selic",
  "versao": "1.0",
  "nome": "NOME DO PACOTE",
  "descricao": "",
  "dataCriacao": "DD/MM/AAAA",
  "juros": {
    "tipoParametro": "juros_mora",
    "indicesUtilizados": [],
    "periodos": []
  },
  "selic": {
    "tipoParametro": "selic",
    "indicesUtilizados": [],
    "periodos": []
  }
}
```

### Variáveis globais

```javascript
window.parametrosCorrecaoAtual
window.parametrosJurosAtual
window.parametrosSelicAtual
```

A interface e o arquivo administrativo são unificados, mas Juros e SELIC permanecem separados internamente.

---

## Formatos de arquivo

O conteúdo dos arquivos continua sendo JSON, mesmo quando a extensão é personalizada.

### Correção monetária

```text
CORRE-NOME.corr
```

### Juros e SELIC

```text
JUROS-NOME.jur
```

### Caso completo

```text
DADOS-AUTOR-IDENTIFICADOR.contadjus
```

Exemplo:

```text
DADOS-JOAO-DA-SILVA-001234.contadjus
```

### Identificador do processo

Para o processo:

```text
0001234-56.2022.4.05.8300
```

é utilizado o primeiro bloco antes do hífen, considerando seus últimos seis algarismos:

```text
0001234 → 001234
```

### Compatibilidade

Continuam aceitos:

```text
.json
.corr
.jur
.contadjus
```

O reconhecimento ocorre pelo conteúdo interno, por meio de campos como:

```text
tipoArquivo
tipoParametro
versao
periodos
```

---

## Persistência do caso

O caso completo utiliza a versão `3.3` e preserva:

- entradas;
- benefícios recebidos;
- diferenças e alterações manuais;
- parâmetros de atualização;
- acordo e renúncia;
- parâmetros de correção, Juros e SELIC.

Estrutura dos parâmetros:

```json
{
  "parametros": {
    "correcao": {},
    "juros": {},
    "selic": {}
  }
}
```

A importação suporta as versões:

```text
3.1
3.2
3.3
```

Casos antigos continuam recebendo valores padrão para campos introduzidos posteriormente.

---

## Estrutura principal do projeto

```text
/
├── index.html
├── README.md
├── css/
│   ├── styles.css
│   └── auth.css
├── data/
│   ├── indices.js
│   ├── indexadores.js
│   └── indexadores-juros.js
└── js/
    ├── app.js
    ├── auth.js
    ├── beneficios-recebidos.js
    ├── core.js
    ├── diferencas.js
    ├── json.js
    ├── motor-evolucao.js
    ├── relatorios.js
    ├── admin-encadeamentos.js
    └── supabase.js
```

### Responsabilidades principais

- `index.html`: estrutura das guias, tabelas, formulários e modais;
- `css/styles.css`: estilos gerais, tabelas, impressão e elementos visuais;
- `css/auth.css`: interface de autenticação;
- `data/indices.js`: bases previdenciárias e vigências;
- `data/indexadores.js`: catálogo e bases de correção monetária;
- `data/indexadores-juros.js`: catálogo e bases de Juros e SELIC;
- `js/core.js`: máscaras, datas, valores e funções compartilhadas;
- `js/motor-evolucao.js`: evolução do benefício devido;
- `js/beneficios-recebidos.js`: Guia 3;
- `js/diferencas.js`: Guia 4, 13º, compensações e auditoria;
- `js/admin-encadeamentos.js`: encadeamentos, Guia 5, correção e juros;
- `js/json.js`: persistência e compatibilidade dos casos;
- `js/relatorios.js`: relatórios internos e externos;
- `js/app.js`: navegação, eventos e integração da interface;
- `js/supabase.js` e `js/auth.js`: configuração e autenticação.

---

## Como utilizar

1. Acesse o ContadJus em navegador moderno.
2. Efetue a autenticação.
3. Preencha a Guia 1.
4. Calcule a evolução do benefício devido.
5. Cadastre e calcule os benefícios recebidos na Guia 3.
6. Confira as diferenças na Guia 4.
7. Se necessário, edite, justifique ou restaure competências.
8. Na Guia 5, informe a Data de Atualização e o Início dos Juros.
9. Carregue os parâmetros de correção.
10. Carregue os parâmetros de Juros e SELIC, quando aplicável.
11. Importe as diferenças da Guia 4.
12. Clique em **Calcular Atualização**.
13. Confira coeficientes, percentuais, valores e totais.
14. Exporte o caso completo para preservação e futura importação.

---

## Regras de negócio relevantes

### Proporcionalidade mensal

- mês comercial de 30 dias nas competências mensais;
- dia 31 tratado internamente como dia 30, preservando a exibição;
- DIP do benefício devido como marco financeiro, quando aplicável;
- DIP não tratada como DCB.

### Abono anual

- camada derivada da evolução mensal;
- linha própria na Guia 4;
- regra dos 15 dias para contagem de avos;
- calendário real, inclusive anos bissextos;
- DIB e DCB consideradas na contagem;
- DIP não interfere nos avos;
- base obtida da última competência ativa do exercício;
- suporte ao ano final aberto e a DCB real de benefício recebido.

### Edições manuais

- registro por competência e coluna;
- justificativa estruturada;
- indicação de inclusão no relatório externo;
- restauração individual ou global;
- compatibilidade com justificativas antigas em texto.

### Atualização

- correção por fatores mensais;
- juros determinísticos simples;
- base dos juros no valor corrigido;
- corte pela Data de Atualização;
- erro para lacunas de período;
- distinção entre ausência de período e `SEM_JUROS`.

---

## Tecnologias

- HTML5;
- Tailwind CSS via CDN;
- CSS3;
- JavaScript puro;
- Supabase Auth;
- impressão nativa do navegador.

---

## Compatibilidade

### Navegadores

- Microsoft Edge recente;
- Google Chrome recente;
- Mozilla Firefox recente;
- Safari recente.

### Arquivos

- casos 3.1, 3.2 e 3.3;
- parâmetros administrativos antigos em `.json`;
- correção em `.corr` ou `.json`;
- Juros e SELIC em `.jur` ou `.json`;
- casos em `.contadjus` ou `.json`.

---

## Marcos homologados

```text
Fase 1.7D2   Abono anual, Guia 4 e ano final aberto                HOMOLOGADA
Fase 1.8E    Motor genérico de correção monetária                  HOMOLOGADA
Fase 1.8F-A  Infraestrutura de Juros e SELIC                       HOMOLOGADA
Fase 1.8F-A2 Pacote unificado de Juros e SELIC                     HOMOLOGADA
Fase 1.8F-B1 Motor de juros determinísticos                        HOMOLOGADA
Fase 1.8F-B2 Exibição auditável dos juros                          HOMOLOGADA
Fase 1.8F-B3 Corte temporal pela data da conta                     HOMOLOGADA
Fase 1.8F-B4 Nomes, extensões e status detalhados                  HOMOLOGADA
Fase 1.8F-F1 Reorganização visual da Guia 5                        HOMOLOGADA
Fase 1.8F-F1B Encadeamentos visuais e fluxo de modelos             HOMOLOGADA
```

### Consolidação recente da Guia 5

A consolidação das fases 1.8F-F1 e 1.8F-F1B incorporou:

- reorganização visual da Guia 5;
- encadeamentos visíveis acima da tabela;
- combobox de modelos;
- botão **Aplicar**;
- parâmetros avançados recolhíveis;
- apresentação do limite de vigência do modelo;
- organização visual dos parâmetros de correção, juros e SELIC.

---

## Roadmap

### Próximas fases da Guia 5

- homologação dos critérios específicos de juros da Poupança;
- homologação dos critérios matemáticos específicos da SELIC;
- Taxa Legal;
- Taxa Legal Previdenciária;
- transições e não cumulação;
- totalização da SELIC;
- total geral;
- integração completa com relatórios.

### Outras áreas

- implementação da Guia 6;
- relatórios avançados;
- parâmetros de exibição das tabelas;
- aprimoramentos de impressão e exportação;
- expansão futura para ações condenatórias e tributárias.

---

## Manutenção e extensibilidade

- preservar a separação entre motor e encadeamento;
- evitar regras baseadas no nome do pacote;
- manter compatibilidade com arquivos antigos;
- alterar apenas os arquivos necessários em cada fase;
- validar JavaScript antes da publicação;
- executar testes de regressão da correção monetária;
- homologar cada novo motor com memória externa confiável;
- manter precisão interna e arredondar apenas na exibição ou no ponto definido pela regra;
- diferenças residuais de centavos entre sistemas podem decorrer de estratégias distintas de arredondamento e não devem ser tratadas como erro sem evidência de impacto material.

---

## Uso e responsabilidade

O ContadJus é uma ferramenta profissional de apoio. O uso dos resultados exige conferência dos parâmetros, das datas, dos índices, das regras jurídicas aplicáveis e da memória final.

O sistema não substitui a análise do processo, da decisão judicial, do título executivo ou da legislação aplicável.

---

## Licença

Uso profissional interno no âmbito de cálculos judiciais e administrativos. A redistribuição depende de autorização do responsável pelo projeto.
