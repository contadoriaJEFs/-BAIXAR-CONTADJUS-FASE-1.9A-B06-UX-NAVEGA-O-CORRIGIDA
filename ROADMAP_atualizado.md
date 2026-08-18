# Roadmap do ContadJus

## LiquidaCalc e evolução da plataforma

**Marco atual:** Fase 1.8F-F1B  
**Status geral:** Em desenvolvimento  
**Última atualização:** 11/08/2026

## Objetivo

Este roadmap registra o estado atual, os marcos homologados, as pendências conhecidas e a sequência recomendada de desenvolvimento do **ContadJus** e do módulo **LiquidaCalc**.

O planejamento segue três princípios:

1. implementar motores matemáticos separadamente;
2. homologar cada etapa com casos de referência;
3. preservar a arquitetura parametrizada e a compatibilidade com arquivos antigos.

---

## Princípio arquitetural

```text
Motor genérico
+
Encadeamento administrativo
=
Critério aplicável
```

Os encadeamentos definem índices, períodos e transições. Os motores permanecem independentes dos nomes dos pacotes ou das edições dos manuais.

Não devem ser criadas regras como:

```javascript
if (parametros.nome === 'MC 2026') {
    // regra específica
}
```

---

# Situação atual

## Fases homologadas

```text
Fase 1.7D2   Abono anual, Guia 4 e ano final aberto       HOMOLOGADA
Fase 1.8A    Infraestrutura de parâmetros da Guia 5       HOMOLOGADA
Fase 1.8B    Base de indexadores de atualização           HOMOLOGADA
Fase 1.8C    Integração administrativa dos indexadores    HOMOLOGADA
Fase 1.8D    Diferenças da Guia 4 na Guia 5               HOMOLOGADA
Fase 1.8E    Motor genérico de correção monetária         HOMOLOGADA
Fase 1.8F-A  Infraestrutura de Juros e SELIC              HOMOLOGADA
Fase 1.8F-A2 Pacote unificado de Juros e SELIC            HOMOLOGADA
Fase 1.8F-B1 Motor de juros determinísticos               HOMOLOGADA
Fase 1.8F-B2 Exibição auditável dos juros                 HOMOLOGADA
Fase 1.8F-B3 Corte temporal pela data da conta            HOMOLOGADA
Fase 1.8F-B4 Arquivos e status detalhados                 HOMOLOGADA
Fase 1.8F-F1  Reorganização visual da Guia 5              HOMOLOGADA
Fase 1.8F-F1B Encadeamentos visuais e fluxo de modelos    HOMOLOGADA
```

---

## Consolidação recente

### Correção previdenciária da Guia 4

Foi corrigida a obtenção do valor devido para competências anteriores
ao primeiro reajuste existente na memória da evolução.

**Resultado:**

- aplicação correta de piso previdenciário;
- aplicação correta de teto previdenciário;
- alinhamento entre Guia 2, Guia 4 e Guia 5;
- diferenças compatíveis com a evolução homologada.

**Status:** HOMOLOGADA

### Consolidação visual da Guia 5

A Guia 5 recebeu uma reorganização visual e funcional consolidada,
com incorporação de:

- combobox de modelos oficiais;
- botão `Aplicar`;
- parâmetros avançados recolhíveis;
- encadeamentos visuais;
- limite de vigência dos modelos;
- reorganização da memória de atualização;
- redução do espaço vertical utilizado.

**Status:** HOMOLOGADA

### Correção do fluxo dos modelos

Foi identificado que os modelos oficiais eram carregados, mas os
encadeamentos não eram atualizados automaticamente pelo fluxo de
aplicação.

**Diagnóstico homologado:**

- `carregarEncadeamentoOficial()` funcional;
- `atualizarEncadeamentosVisuais()` funcional;
- parâmetros corretos;
- encadeamentos e renderização funcionais;
- falha localizada exclusivamente no fluxo de acionamento do botão
  `Aplicar`.

**Correção:**

- vinculação explícita do botão `Aplicar` ao carregamento dos modelos;
- aplicação automática dos modelos oficiais;
- atualização automática dos encadeamentos após a seleção do modelo;
- sincronização entre o modelo selecionado e a renderização das
  legendas dos encadeamentos visuais.

**Status:** HOMOLOGADA

---

# Capacidades atuais

## Evolução previdenciária

- evolução do benefício devido;
- múltiplos benefícios recebidos;
- piso, teto e salário mínimo;
- DIB, DIP e DCB;
- compensação mensal;
- diferenças positivas ou negativas;
- abono anual;
- ano final aberto;
- edição manual e auditoria;
- relatórios internos e externos.

## Correção monetária

- motor genérico por encadeamentos;
- fatores mensais;
- suporte a diferentes linhas de correção;
- UFIR operacional;
- UFIR nominal de auditoria;
- transição opcional `IPCAE_CJF_2000`;
- aderência prática aos sistemas de referência nos cenários homologados a partir de 07/1994;
- reprodução parametrizada de linhas configuradas segundo diferentes edições dos manuais.

## Juros de mora

Critérios implementados:

```text
SEM_JUROS
JUROS_05_AM
JUROS_1_AM
JUROS_2_AA_EC136
```

Regras homologadas:

- juros simples;
- base no valor corrigido;
- exclusão do mês inicial;
- inclusão do mês da conta;
- marco comum de mora para parcelas vencidas anteriormente;
- contagem individual para parcelas posteriores;
- rateio linear de 2% ao ano por 12;
- erro para lacuna no encadeamento;
- distinção entre lacuna e `SEM_JUROS`.

## Auditoria da Guia 5

A memória apresenta:

- diferença original;
- índice e critério de correção;
- coeficiente de correção;
- valor corrigido;
- percentual de juros anterior à SELIC;
- Taxa Legal reservada;
- percentual total de juros;
- juros de mora em reais;
- totais do principal e dos juros.

## Arquivos

Formatos atuais:

```text
CORRE-NOME.corr
JUROS-NOME.jur
DADOS-AUTOR-IDENTIFICADOR.contadjus
```

Compatibilidade preservada com `.json`.

## Plataforma

- domínio próprio;
- GitHub Pages;
- autenticação por Supabase Auth;
- login, logout, sessão e recuperação de senha;
- cálculos executados no navegador;
- autenticação independente dos motores matemáticos.

---

# Próxima frente: Fase 1.8F-C

## Juros da Poupança

**Prioridade:** Alta  
**Status:** Próxima fase recomendada

### Objetivo

Implementar o índice:

```text
JUROS_POUPANCA
```

sem alterar os critérios determinísticos já homologados.

### Decisões necessárias antes da implementação

- confirmar a fonte oficial da série mensal;
- confirmar a unidade dos valores armazenados;
- definir a primeira competência disponível;
- confirmar a regra de competência inicial e final;
- confirmar juros simples e ausência de capitalização;
- definir comportamento para mês sem taxa;
- selecionar memórias externas de referência;
- definir precisão interna e arredondamento visual.

### Testes previstos

- uma parcela anterior ao início dos juros;
- uma parcela na competência do início dos juros;
- uma parcela posterior;
- transição de taxa determinística para Poupança;
- transição de Poupança para `SEM_JUROS`;
- lacuna de competência;
- comparação competência por competência com memória externa.

### Critérios de aceite

- percentuais mensais coincidentes com a fonte adotada;
- soma simples das taxas;
- valores monetários sobre o principal corrigido;
- total dos juros coincidente com a soma das parcelas;
- regressão dos critérios determinísticos aprovada.

---

# Fase 1.8F-D

## Motor da SELIC

**Prioridade:** Alta  
**Status:** Planejada

### Objetivo

Implementar:

```text
SELIC
```

como índice misto, preservando sua separação estrutural em relação aos juros de mora.

### Escopo esperado

- leitura de `window.parametrosSelicAtual`;
- utilização da série mensal da SELIC;
- percentual e valor por parcela;
- colunas próprias na memória;
- total da SELIC;
- tratamento da competência de início;
- corte pela Data de Atualização;
- detalhamento mensal para auditoria.

### Decisões pendentes

- regra exata da competência de transição em dezembro de 2021;
- incidência exclusiva ou concorrente por competência;
- tratamento da parcela vencida no mês inicial da SELIC;
- regime mensal adotado pelo sistema de referência;
- arredondamento e precisão;
- relação com o principal corrigido;
- comportamento do 13º.

### Testes previstos

- pacote somente com SELIC;
- SELIC iniciada antes e depois da parcela;
- parcela na competência de início;
- conta na mesma competência;
- comparação com Fábrica de Cálculos e outras memórias confiáveis;
- ausência de acúmulo indevido com juros simples.

---

# Fase 1.8F-E

## Taxa Legal e Taxa Legal Previdenciária

**Prioridade:** Alta  
**Status:** Planejada

### Índices

```text
TAXA_LEGAL
TAXA_LEGAL_PREVIDENCIARIA
```

### Objetivo

Implementar as séries históricas e preencher a coluna auditável já existente:

```text
Taxa Legal
```

### Escopo esperado

- carregamento da série mensal;
- cálculo do percentual por parcela;
- valor monetário dos juros;
- totalização;
- nomes amigáveis e detalhamento mensal;
- distinção entre Taxa Legal geral e previdenciária;
- preservação do percentual anterior à SELIC.

### Testes previstos

- período exclusivamente com Taxa Legal;
- transição após `SEM_JUROS`;
- transição após SELIC;
- verificação da coluna separada;
- composição do percentual total dos juros;
- comparação com memória de referência.

---

# Fase 1.8F-F

## Consolidação, transições e não cumulação

**Prioridade:** Alta  
**Status:** Planejada

### Objetivo

Integrar os motores de Juros, SELIC e Taxa Legal em uma linha temporal juridicamente coerente e auditável.

### Escopo esperado

- regra de não cumulação;
- transições entre Juros, SELIC e Taxa Legal;
- definição da competência de fronteira;
- prevenção de dupla incidência;
- validação conjunta dos encadeamentos;
- detalhamento dos critérios aplicados por parcela;
- preservação dos blocos internos separados.

### Questões a fechar

- Poupança até 11/2021 ou 12/2021 nos cenários aplicáveis;
- SELIC iniciada em 12/2021;
- término da SELIC e início da Taxa Legal;
- tratamento de sobreposição entre tabelas;
- necessidade futura de cálculo diário em situações específicas;
- regras diferenciadas por natureza da ação, sempre parametrizadas.

---

# Fase 1.8F-G

## Totais gerais e integração da memória

**Prioridade:** Média  
**Status:** Planejada

### Escopo esperado

- total do principal corrigido;
- total dos juros de mora;
- total da SELIC;
- total geral;
- resumo executivo da atualização;
- revisão da nomenclatura das colunas;
- impressão da memória completa;
- integração com os relatórios.

### Estrutura visual esperada

```text
Principal corrigido
Juros de mora
SELIC
Total geral
```

A composição deverá permanecer auditável, sem ocultar os componentes.

---

# Fase 1.8F-H

## Relatórios e exportações da Guia 5

**Prioridade:** Média  
**Status:** Planejada

### Escopo esperado

- relatório completo da atualização;
- identificação do encadeamento de correção;
- identificação do pacote de Juros e SELIC;
- intervalos e índices utilizados;
- memória por competência;
- observações da Guia 5;
- impressão em layout institucional;
- exportação para PDF;
- avaliação futura de exportação para Word e Excel.

---

# Fase 1.8F-I

## Preferências de exibição e experiência de uso

**Prioridade:** Média  
**Status:** Planejada

### Melhorias previstas

- separadores anuais discretos;
- contraste configurável;
- tamanho de fonte;
- densidade das linhas;
- linhas de grade;
- largura das colunas;
- ocultação seletiva de colunas;
- congelamento de colunas relevantes;
- impressão otimizada;
- melhor navegação em memórias extensas.

### Observação

As preferências visuais não devem alterar valores, totais ou estruturas internas.

---

# Pendência histórica complementar

## UFIR entre 01/1992 e 06/1994

**Prioridade:** Baixa  
**Status:** Pendente

### Objetivos

- revisar fatores históricos;
- conferir coeficientes normativos;
- analisar diferenças metodológicas anteriores ao Plano Real;
- comparar com manuais e sistemas de referência;
- documentar a conclusão definitiva.

### Estado atual

A correção monetária está homologada operacionalmente para os cenários testados a partir de 07/1994. A pendência histórica não bloqueia a rotina prática atual, mas deve ser resolvida antes de declarar cobertura normativa integral da série.

---

# Guia 6: Acordo e renúncia

## Fase 1.9

**Prioridade:** Média  
**Status:** Planejada

### Escopo esperado

- aplicação de percentual de acordo;
- limites de renúncia;
- limite por quantidade de salários mínimos;
- limite monetário;
- data de referência;
- memória do valor anterior e posterior ao ajuste;
- integração com resumo e relatórios;
- persistência integral no caso.

### Questões pendentes

- ordem de incidência em relação à atualização;
- base do acordo;
- tratamento de honorários e acessórios;
- regras de arredondamento;
- cenários com renúncia parcial.

---

# Plataforma ContadJus

## Fase 2.0

**Prioridade:** Estratégica  
**Status:** Parcialmente iniciada

A autenticação e o domínio já estão operacionais. Permanecem planejadas as demais capacidades da plataforma.

### Usuários

- cadastro controlado;
- perfil de usuário;
- gerenciamento de acesso;
- redefinição e política de senha;
- preferências pessoais.

### Biblioteca de parâmetros

- armazenamento de encadeamentos;
- biblioteca institucional;
- modelos configurados conforme manuais e tribunais;
- versionamento;
- histórico de alterações;
- restauração de versões;
- assinatura ou hash dos arquivos.

### Compartilhamento

- compartilhamento de parâmetros;
- compartilhamento de casos;
- controle de permissões;
- identificação de autor e versão;
- importação segura entre usuários.

### Administração e auditoria

- controle de acesso;
- logs;
- trilha de auditoria;
- gerenciamento de usuários;
- gerenciamento de versões;
- acompanhamento de falhas;
- política de retenção.

### Armazenamento

O armazenamento remoto de parâmetros ou casos deve ser planejado separadamente dos motores. A matemática deve continuar independente da disponibilidade da nuvem.

---

# Expansão para outros tipos de ação

## Ações condenatórias em geral

**Status:** Estrutura inicial presente, motor específico pendente

### Objetivos

- reutilizar o motor genérico de correção;
- parametrizar juros conforme o título;
- permitir termo inicial próprio;
- suportar diferentes bases e marcos jurídicos;
- preservar a auditoria por competência.

## Ações tributárias

**Status:** Planejada

### Objetivos

- levantamento de índices e regras aplicáveis;
- desenho de encadeamentos próprios;
- definição de bases, compensações e restituições;
- integração futura à plataforma sem contaminar o módulo previdenciário.

---

# Critérios gerais de aceite

Toda nova fase deve observar:

1. **Escopo controlado:** alterar somente os arquivos necessários.
2. **Regressão:** preservar resultados já homologados.
3. **Sintaxe:** validar os arquivos JavaScript antes da publicação.
4. **Auditabilidade:** disponibilizar critérios, períodos, percentuais e valores.
5. **Compatibilidade:** manter arquivos antigos sempre que tecnicamente possível.
6. **Precisão:** preservar precisão interna e arredondar apenas no ponto definido.
7. **Segurança:** não executar conteúdo importado como HTML ou código.
8. **Fonte confiável:** comparar séries e resultados com documentação e memórias externas.
9. **Documentação:** atualizar README, CHANGELOG e ROADMAP após a homologação.
10. **Restauração:** manter um marco seguro antes de motores históricos ou mudanças estruturais.

---

# Sequência recomendada

As fases de consolidação visual e de integração dos modelos da Guia 5
(1.8F-F1 e 1.8F-F1B) estão homologadas. O próximo marco de
desenvolvimento recomendado é:

```text
1.8F-C  Juros da Poupança
1.8F-D  SELIC
1.8F-E  Taxa Legal e Taxa Legal Previdenciária
1.8F-F  Transições e não cumulação
1.8F-G  Totais gerais e integração da memória
1.8F-H  Relatórios e exportações da Guia 5
1.8F-I  Preferências de exibição
1.9     Acordo e renúncia
2.0     Evolução da plataforma ContadJus
```

A validação histórica da UFIR entre 01/1992 e 06/1994 pode ocorrer em paralelo, pois possui prioridade baixa e não bloqueia as próximas etapas operacionais.

---

# Objetivo estratégico

Ao final das fases previstas, o ContadJus deverá oferecer:

- cálculos previdenciários completos;
- evolução do devido e dos recebidos;
- diferenças mensais e abono anual;
- correção monetária parametrizada;
- Juros de Mora, SELIC e Taxa Legal;
- memória completa e auditável;
- arquivos próprios e retrocompatíveis;
- relatórios profissionais;
- acordo e renúncia;
- expansão para outros tipos de ação;
- autenticação e biblioteca institucional de parâmetros;
- independência entre os motores matemáticos e a infraestrutura online.

---

## Estado seguro de restauração

O marco atual seguro é:

```text
Fase 1.8F-F1B homologada
```

Esse marco contém:

- correção monetária homologada;
- Juros determinísticos homologados;
- correção previdenciária da Guia 4;
- tabela auditável;
- corte temporal;
- pacote unificado de Juros e SELIC;
- modelos oficiais;
- encadeamentos visuais;
- fluxo do botão `Aplicar` corrigido;
- extensões `.corr`, `.jur` e `.contadjus`;
- compatibilidade com `.json`;
- cartões detalhados dos encadeamentos;
- autenticação funcional.

Antes de iniciar Juros da Poupança, recomenda-se manter uma cópia ou tag desse estado.
