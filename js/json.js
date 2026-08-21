// =====================================================================
// JSON – EXPORTAR E IMPORTAR DADOS DO CASO (FASE 1.7D2 – incluir13FinalAberto)
// =====================================================================

function coletarDadosCaso() {
    const dados = {
        versao: "3.4",
        tipoArquivo: "calculo_judicial_previdenciario",
        dataExportacao: new Date().toLocaleDateString('pt-BR'),
        entradas: {
            processo: {
                vara: document.getElementById('vara').value,
                numero: document.getElementById('processo').value,
                autor: document.getElementById('autor').value,
                reu: document.getElementById('reu').value,
                cpf: document.getElementById('cpf').value,
                dataCalculo: document.getElementById('dataCalculo').value,
                observacoes: document.getElementById('observacoes').value
            },
            tipoAcao: document.getElementById('tipoAcao').value,
            datas: {
                ajuizamento: document.getElementById('dataAjuizamento').value,
                atualizacao: document.getElementById('dataAtualizacao').value,
                inicioJuros: document.getElementById('inicioJuros').value,
                criterioCompetenciaFinal: document.getElementById('criterioCompetenciaFinal')
                    ? document.getElementById('criterioCompetenciaFinal').value
                    : 'ultimo_indice_disponivel' 
            },
            prescricao: {
                aplicar: document.getElementById('aplicarPrescricao').value === 'sim',
                prazoAnos: parseInt(document.getElementById('prazoPrescricional').value) || 5,
                termoInicial: estadoTermoInicial.valor,
                termoInicialManual: estadoTermoInicial.manual
            },
            beneficioDevido: {
                nb: document.getElementById('nb').value,
                especie: document.getElementById('especie').value,
                tipo: document.getElementById('tipoBeneficio').value,
                dib: document.getElementById('dib').value,
                rmi: document.getElementById('rmi').value,
                transformado: document.querySelector('input[name="transformado"]:checked').value === 'sim',
                dibAntecedente: document.getElementById('dibAnterior').value,
                percentualDesdobramento: document.getElementById('percentualDesdobramento').value,
                adicionalTipo: document.getElementById('adicionalRenda').value,
                adicionalPercentual: document.getElementById('adicionalPercentual').value,
                dataFinalEvolucao: document.getElementById('dataFinal').value,
                dipDevido: document.getElementById('dipDevido').value,
                possuiAbono: document.getElementById('possuiAbonoDevido').checked,
                baseadoSalarioMinimo: document.getElementById('baseadoSalarioMinimoDevido').checked,
                incluir13FinalAberto: document.getElementById('incluir13FinalAberto').checked
            }
        },
        evolucaoDevida: {},
        beneficiosRecebidos: coletarBeneficiosRecebidos(),
        diferencas: {
            modoCompensacao: dadosDiferencas.modoCompensacao,
            celulasEditadas: dadosDiferencas.celulasEditadas,
            justificativas: dadosDiferencas.justificativas
        },
        atualizacao: {
            dataAtualizacao: document.getElementById('dataAtualizacao2').value,
            inicioJuros: document.getElementById('inicioJuros2').value,
            criterioCorrecao: document.getElementById('criterioCorrecao').value,
            criterioJuros: document.getElementById('criterioJuros').value,
            observacoes: document.getElementById('obsAtualizacao').value
        },
        formacaoDemanda: {
            parametros: {
                dataAjuizamento: document.getElementById('dataAjuizamento').value,
                competenciaAjuizamento: (window.parametrosFormacaoDemanda && window.parametrosFormacaoDemanda.competenciaAjuizamento) || '',
                metodoVincendas: document.getElementById('metodoVincendas').value,
                tratamentoMesAjuizamento: document.getElementById('tratamentoMesAjuizamento').value,
                incluir13: document.getElementById('incluir13Vincendas').value === 'sim',
                limitarAoTeto: document.getElementById('limitarAoTeto').value === 'sim',
                quantidadeSalariosMinimos: Number(document.getElementById('quantidadeSalariosMinimos').value) || 60,
                acordoAtivo: document.getElementById('acordoAtivo').value === 'sim',
                percentualAcordo: window.parametrosFormacaoDemanda
                    ? Number(window.parametrosFormacaoDemanda.percentualAcordo)
                    : 100
            },
            resultado: window.resultadoAjuizamento || null
        },
        // Estrutura legada preservada para compatibilidade com arquivos antigos.
        acordoRenuncia: {
            acordo: {
                ativo: document.getElementById('acordoAtivo').value === 'sim',
                percentual: (window.parametrosFormacaoDemanda
                    ? Number(window.parametrosFormacaoDemanda.percentualAcordo)
                    : 100) + '%',
                observacoes: document.getElementById('obsAcordo').value
            },
            renuncia: {
                ativo: document.getElementById('limitarAoTeto').value === 'sim',
                tipoLimite: 'salarios',
                qtdSalarios: document.getElementById('quantidadeSalariosMinimos').value,
                valorLimite: window.resultadoAjuizamento && window.resultadoAjuizamento.limiteJuizado !== null
                    ? formatarMoedaAtualizacao(window.resultadoAjuizamento.limiteJuizado)
                    : '',
                dataReferencia: document.getElementById('dataAjuizamento').value,
                observacoes: ''
            }
        },
        parametros: {
            correcao: window.parametrosCorrecaoAtual || null,
            juros: window.parametrosJurosAtual || null,
            selic: window.parametrosSelicAtual || null
        }
    };
    return dados;
}

// =====================================================================
// AUXILIARES PARA NOME DO ARQUIVO JSON
// =====================================================================

function sanitizarNomeArquivo(nome) {
    if (!nome || nome.trim() === '') return 'SEM-AUTOR';
    var semAcentos = nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    // Substitui apóstrofos e similares por hífen
    var comHifens = semAcentos.replace(/['’`´]/g, '-');
    var sanitizado = comHifens
        .toUpperCase()
        .replace(/\s+/g, '-')
        .replace(/[^A-Z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    return sanitizado || 'SEM-AUTOR';
}

function extrairIdentificadorProcesso(processo) {
    if (!processo) return 'SEM-PROCESSO';
    // Primeiro bloco antes do primeiro hífen
    var primeiroBloco = processo.split('-')[0] || '';
    var numeros = primeiroBloco.replace(/\D/g, '');
    if (numeros.length === 0) return 'SEM-PROCESSO';
    // Últimos 6 dígitos
    var ultimosSeis = numeros.slice(-6);
    // Completar com zeros à esquerda se necessário
    while (ultimosSeis.length < 6) {
        ultimosSeis = '0' + ultimosSeis;
    }
    return ultimosSeis;
}

function formatarDataHoraArquivo() {
    const agora = new Date();
    const dia = String(agora.getDate()).padStart(2, '0');
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const ano = agora.getFullYear();
    const horas = String(agora.getHours()).padStart(2, '0');
    const minutos = String(agora.getMinutes()).padStart(2, '0');
    const segundos = String(agora.getSeconds()).padStart(2, '0');
    return `${dia}${mes}${ano}-${horas}-${minutos}-${segundos}`;
}

// =====================================================================
// EXPORTAR
// =====================================================================

function exportarCaso() {
    // Sincroniza os parâmetros visíveis da Guia 6 antes de montar o JSON.
    // Assim, alterações feitas na tela não ficam atrás do estado global.
    if (typeof guia6ColetarParametrosFormacaoDemanda === 'function') {
        guia6ColetarParametrosFormacaoDemanda();
    }

    const dados = coletarDadosCaso();
    const json = JSON.stringify(dados, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const autor = document.getElementById('autor')?.value?.trim() || '';
    const processo = document.getElementById('processo')?.value?.trim() || '';

    const autorSanitizado = sanitizarNomeArquivo(autor);
    const identificador = extrairIdentificadorProcesso(processo);

    const nomeArquivo = `DADOS-${autorSanitizado}-${identificador}.contadjus`;

    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// =====================================================================
// IMPORTAR
// =====================================================================

function importarCaso(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            if (dados.tipoArquivo !== 'calculo_judicial_previdenciario') {
                alert('O arquivo selecionado não corresponde a um caso previdenciário.');
                return;
            }
            if (!['3.1', '3.2', '3.3', '3.4'].includes(dados.versao)) {
                alert('Versão do arquivo não suportada. Versões aceitas: 3.1, 3.2, 3.3 ou 3.4');
                return;
            }

            const ent = dados.entradas || {};
            const proc = ent.processo || {};
            const datas = ent.datas || {};
            const presc = ent.prescricao || { aplicar: true, prazoAnos: 5, termoInicial: '', termoInicialManual: false };
            const bene = ent.beneficioDevido || {};

            document.getElementById('vara').value = proc.vara || '';
            document.getElementById('processo').value = proc.numero || '';
            document.getElementById('autor').value = proc.autor || '';
            document.getElementById('reu').value = proc.reu || 'INSS';
            document.getElementById('cpf').value = proc.cpf || '';
            document.getElementById('dataCalculo').value = proc.dataCalculo || '';
            document.getElementById('observacoes').value = proc.observacoes || '';

            document.getElementById('tipoAcao').value = ent.tipoAcao || 'previdenciaria';
            onTipoAcaoChange();

            document.getElementById('dataAjuizamento').value = datas.ajuizamento || '';
            if (typeof guia6SincronizarDataAjuizamento === 'function') {
                guia6SincronizarDataAjuizamento(document.getElementById('dataAjuizamento'));
            }
            document.getElementById('dataAtualizacao').value = datas.atualizacao || '';
            document.getElementById('inicioJuros').value = datas.inicioJuros || '';
            const criterioCompetenciaFinalEl = document.getElementById('criterioCompetenciaFinal');
            if (criterioCompetenciaFinalEl) {
                criterioCompetenciaFinalEl.value = datas.criterioCompetenciaFinal || 'ultimo_indice_disponivel';
            }

            document.getElementById('aplicarPrescricao').value = presc.aplicar ? 'sim' : 'nao';
            document.getElementById('prazoPrescricional').value = presc.prazoAnos || 5;

            const termoValor = presc.termoInicial || '';
            const termoManual = presc.termoInicialManual || false;
            if (termoManual) {
                termoInicialManual = true;
                document.querySelectorAll('.cadeado').forEach(el => {
                    el.classList.remove('fechado');
                    el.classList.add('aberto');
                    el.textContent = '🔓';
                });
                document.querySelectorAll('#termoInicialDiferencas, #termoInicialDiferencas2').forEach(el => {
                    if (el) {
                        el.readOnly = false;
                        el.classList.remove('bg-slate-50');
                        el.classList.add('bg-white');
                    }
                });
                definirTermoInicial(termoValor, 'manual');
            } else {
                termoInicialManual = false;
                document.querySelectorAll('.cadeado').forEach(el => {
                    el.classList.remove('aberto');
                    el.classList.add('fechado');
                    el.textContent = '🔒';
                });
                document.querySelectorAll('#termoInicialDiferencas, #termoInicialDiferencas2').forEach(el => {
                    if (el) {
                        el.readOnly = true;
                        el.classList.remove('bg-white');
                        el.classList.add('bg-slate-50');
                    }
                });
                definirTermoInicial(termoValor, 'automatico');
            }

            document.getElementById('nb').value = bene.nb || '';
            document.getElementById('especie').value = bene.especie || '';
            document.getElementById('tipoBeneficio').value = bene.tipo || 'previdenciario';
            document.getElementById('dib').value = bene.dib || '';
            document.getElementById('rmi').value = bene.rmi || '';
            
            const transformado = bene.transformado ? 'sim' : 'nao';
            document.querySelector(`input[name="transformado"][value="${transformado}"]`).checked = true;
            toggleTransformacao(transformado === 'sim');
            
            document.getElementById('dibAnterior').value = bene.dibAntecedente || '';
            document.getElementById('percentualDesdobramento').value = bene.percentualDesdobramento || '100,00';
            document.getElementById('adicionalRenda').value = bene.adicionalTipo || '0';
            toggleAdicionalPercentual(document.getElementById('adicionalRenda'));
            document.getElementById('adicionalPercentual').value = bene.adicionalPercentual || '';
            document.getElementById('dataFinal').value = bene.dataFinalEvolucao || '';

            const dipDevido = document.getElementById('dipDevido');
            if (dipDevido) {
                dipDevido.value = bene.dipDevido || '';
                dipDevido.dataset.ultimoValor = bene.dipDevido || '';
            }

            const checkboxAbono = document.getElementById('possuiAbonoDevido');
            if (checkboxAbono) {
                const tipoAtual = document.getElementById('tipoBeneficio').value;
                if (bene.possuiAbono !== undefined) {
                    checkboxAbono.checked = bene.possuiAbono;
                } else {
                    checkboxAbono.checked = (tipoAtual === 'previdenciario');
                }
            }

            const checkboxSM = document.getElementById('baseadoSalarioMinimoDevido');
            if (checkboxSM) {
                const tipoAtual = document.getElementById('tipoBeneficio').value;
                if (bene.baseadoSalarioMinimo !== undefined) {
                    checkboxSM.checked = bene.baseadoSalarioMinimo;
                } else {
                    checkboxSM.checked = (tipoAtual === 'assistencial');
                }
            }

            const incluir13FinalAberto = document.getElementById('incluir13FinalAberto');
            if (incluir13FinalAberto) {
                incluir13FinalAberto.checked = (bene.incluir13FinalAberto !== undefined) ? bene.incluir13FinalAberto : false;
            }

            if (typeof atualizarEstadoBaseadoSalarioMinimo === 'function') {
                atualizarEstadoBaseadoSalarioMinimo();
            }

            const atu = dados.atualizacao || {};
            document.getElementById('dataAtualizacao2').value = atu.dataAtualizacao || '';
            document.getElementById('inicioJuros2').value = atu.inicioJuros || '';
            document.getElementById('criterioCorrecao').value = atu.criterioCorrecao || '';
            document.getElementById('criterioJuros').value = atu.criterioJuros || '';
            document.getElementById('obsAtualizacao').value = atu.observacoes || '';

            // Fase 1.9A: restaura a nova estrutura; se ausente, migra
            // os dados da estrutura legada acordoRenuncia.
            const fd = dados.formacaoDemanda || {};
            const fp = fd.parametros || {};
            const ar = dados.acordoRenuncia || {};
            const ac = ar.acordo || {};
            const ren = ar.renuncia || {};

            document.getElementById('metodoVincendas').value = fp.metodoVincendas || '1_parcela_anual';
            document.getElementById('tratamentoMesAjuizamento').value = fp.tratamentoMesAjuizamento || 'integral';
            document.getElementById('incluir13Vincendas').value = fp.incluir13 ? 'sim' : 'nao';
            document.getElementById('limitarAoTeto').value =
                fp.limitarAoTeto !== undefined
                    ? (fp.limitarAoTeto ? 'sim' : 'nao')
                    : (ren.ativo ? 'sim' : 'nao');
            document.getElementById('quantidadeSalariosMinimos').value =
                fp.quantidadeSalariosMinimos !== undefined
                    ? fp.quantidadeSalariosMinimos
                    : (parseFloat(String(ren.qtdSalarios || '').replace(',', '.')) || 60);

            document.getElementById('acordoAtivo').value =
                fp.acordoAtivo !== undefined
                    ? (fp.acordoAtivo ? 'sim' : 'nao')
                    : (ac.ativo ? 'sim' : 'nao');

            var percentualImportado = fp.percentualAcordo;
            if (percentualImportado === undefined || percentualImportado === null || isNaN(Number(percentualImportado))) {
                percentualImportado = parseFloat(String(ac.percentual || '100').replace('%', '').replace(',', '.')) || 100;
            }
            percentualImportado = Number(percentualImportado);

            var presets = [100, 95, 90, 80];
            if (presets.indexOf(percentualImportado) >= 0) {
                document.getElementById('percentualAcordoPreset').value = String(percentualImportado);
            } else {
                document.getElementById('percentualAcordoPreset').value = 'personalizado';
            }
            document.getElementById('percentualAcordo').value = percentualImportado;
            document.getElementById('obsAcordo').value = ac.observacoes || '';

            if (typeof guia6AtualizarEstadoAcordo === 'function') {
                guia6AtualizarEstadoAcordo();
            }

            if (typeof guia6ColetarParametrosFormacaoDemanda === 'function') {
                guia6ColetarParametrosFormacaoDemanda();
            }

            if (fd.resultado) {
                window.resultadoAjuizamento = fd.resultado;
            } else {
                window.resultadoAjuizamento = null;
            }

            if (typeof renderizarFormacaoDemanda === 'function' && window.resultadoAjuizamento) {
                renderizarFormacaoDemanda();
            }

            if (dados.beneficiosRecebidos) {
                restaurarBeneficiosRecebidos(dados.beneficiosRecebidos);
            } else {
                restaurarBeneficiosRecebidos([]);
            }

            if (dados.diferencas) {
                dadosDiferencas.modoCompensacao = dados.diferencas.modoCompensacao || 'limite';
                dadosDiferencas.celulasEditadas = dados.diferencas.celulasEditadas || {};
                if (dados.diferencas.justificativas) {
                    const just = dados.diferencas.justificativas;
                    for (const comp in just) {
                        if (typeof just[comp] === 'string') {
                            just[comp] = { texto: just[comp], incluirNoRelatorio: false };
                        }
                    }
                    dadosDiferencas.justificativas = just;
                } else {
                    dadosDiferencas.justificativas = {};
                }
                const radio = document.querySelector(`input[name="modoCompensacao"][value="${dadosDiferencas.modoCompensacao}"]`);
                if (radio) radio.checked = true;
                montarTabelaDiferencas();
            }

            // =============================================================
            // Restauração dos parâmetros (Fase 1.8F-A2)
            // =============================================================
            const params = dados.parametros || {};

            // Atribuição direta (sempre sobrescreve com o que está no arquivo)
            window.parametrosCorrecaoAtual = params.correcao || null;
            window.parametrosJurosAtual = params.juros || null;
            window.parametrosSelicAtual = params.selic || null;

            // Atualizar status visuais
            // Correção
            const statusCorrecao = document.getElementById('statusCorrecao');
            if (statusCorrecao) {
                if (window.parametrosCorrecaoAtual) {
                    const obj = window.parametrosCorrecaoAtual;
                    if (typeof adminAtualizarStatusDetalhado === 'function') {
                        adminAtualizarStatusDetalhado('correcao_monetaria', obj, '✅ Correção restaurada.');
                    } else {
                        // Fallback: usa classes flexíveis
                        statusCorrecao.innerHTML = '';
                        statusCorrecao.className = 'flex-1 min-w-0 text-sm p-3 rounded-md bg-green-100 text-green-700';
                        let msg = '✅ Correção restaurada: ' + obj.nome;
                        msg += ' (' + (obj.periodos ? obj.periodos.length : 0) + ' períodos)';
                        const p = document.createElement('p');
                        p.textContent = msg;
                        statusCorrecao.appendChild(p);
                    }
                } else {
                    statusCorrecao.innerHTML = '';
                    statusCorrecao.className = 'flex-1 min-w-0 text-sm p-3 rounded-md bg-slate-100 text-slate-600';
                    const p = document.createElement('p');
                    p.textContent = 'Nenhum arquivo carregado.';
                    statusCorrecao.appendChild(p);
                }
            }

            // Juros e SELIC (status unificado)
            const statusJurosSelic = document.getElementById('statusJurosSelic');
            if (statusJurosSelic) {
                if (window.parametrosJurosAtual || window.parametrosSelicAtual) {
                    var pacote = {
                        nome: '',
                        descricao: '',
                        juros: window.parametrosJurosAtual,
                        selic: window.parametrosSelicAtual
                    };
                    if (window.parametrosJurosAtual) {
                        pacote.nome = window.parametrosJurosAtual.nomePacote || window.parametrosJurosAtual.nome || 'Juros';
                        pacote.descricao = window.parametrosJurosAtual.descricaoPacote || window.parametrosJurosAtual.descricao || '';
                    } else if (window.parametrosSelicAtual) {
                        pacote.nome = window.parametrosSelicAtual.nomePacote || window.parametrosSelicAtual.nome || 'SELIC';
                        pacote.descricao = window.parametrosSelicAtual.descricaoPacote || window.parametrosSelicAtual.descricao || '';
                    }
                    if (typeof adminAtualizarStatusDetalhado === 'function') {
                        adminAtualizarStatusDetalhado('juros_selic', pacote, '✅ Parâmetros restaurados.');
                    } else {
                        statusJurosSelic.innerHTML = '';
                        statusJurosSelic.className = 'flex-1 min-w-0 text-sm p-3 rounded-md bg-green-100 text-green-700';
                        let msg = '✅ Parâmetros restaurados:\n';
                        if (window.parametrosJurosAtual) {
                            const j = window.parametrosJurosAtual;
                            msg += 'Juros: ' + (j.nomePacote || j.nome || 'sem nome') +
                                   ' (' + (j.periodos ? j.periodos.length : 0) + ' períodos)\n';
                        } else {
                            msg += 'Juros: não definido\n';
                        }
                        if (window.parametrosSelicAtual) {
                            const s = window.parametrosSelicAtual;
                            msg += 'SELIC: ' + (s.nomePacote || s.nome || 'sem nome') +
                                   ' (' + (s.periodos ? s.periodos.length : 0) + ' períodos)';
                        } else {
                            msg += 'SELIC: não definido';
                        }
                        const p = document.createElement('p');
                        p.textContent = msg;
                        statusJurosSelic.appendChild(p);
                    }
                } else {
                    statusJurosSelic.innerHTML = '';
                    statusJurosSelic.className = 'flex-1 min-w-0 text-sm p-3 rounded-md bg-slate-100 text-slate-600';
                    const p = document.createElement('p');
                    p.textContent = 'Nenhum arquivo carregado.';
                    statusJurosSelic.appendChild(p);
                }
            }

            // Atualizar botão de cálculo (se necessário)
            if (typeof atualizarBotoesAtualizacao === 'function') {
                atualizarBotoesAtualizacao();
            }

            if (!termoManual) calcularTermoInicial();

            alert('Dados do caso importados com sucesso!');
        } catch (error) {
            alert('Erro ao importar o arquivo: ' + error.message);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// =====================================================================
// NOVO CASO
// =====================================================================

function novoCaso() {
    if (confirm('Limpar todos os dados do caso atual?')) {
        limparFormulario();
        restaurarBeneficiosRecebidos([]);
        dadosDiferencas.modoCompensacao = 'limite';
        dadosDiferencas.celulasEditadas = {};
        dadosDiferencas.justificativas = {};
        document.querySelector('input[name="modoCompensacao"][value="limite"]').checked = true;
        const cbAbono = document.getElementById('possuiAbonoDevido');
        if (cbAbono) cbAbono.checked = true;
        const cbSM = document.getElementById('baseadoSalarioMinimoDevido');
        if (cbSM) cbSM.checked = false;
        const cbIncluir13 = document.getElementById('incluir13FinalAberto');
        if (cbIncluir13) cbIncluir13.checked = false;

        // Limpeza dos parâmetros globais
        window.parametrosCorrecaoAtual = null;
        window.parametrosJurosAtual = null;
        window.parametrosSelicAtual = null;

        // Limpeza dos status com classes flexíveis
        const statusCorrecao = document.getElementById('statusCorrecao');
        if (statusCorrecao) {
            statusCorrecao.innerHTML = '';
            statusCorrecao.className = 'flex-1 min-w-0 text-sm p-3 rounded-md bg-slate-100 text-slate-600';
            const p = document.createElement('p');
            p.textContent = 'Nenhum arquivo carregado.';
            statusCorrecao.appendChild(p);
        }

        const statusJurosSelic = document.getElementById('statusJurosSelic');
        if (statusJurosSelic) {
            statusJurosSelic.innerHTML = '';
            statusJurosSelic.className = 'flex-1 min-w-0 text-sm p-3 rounded-md bg-slate-100 text-slate-600';
            const p = document.createElement('p');
            p.textContent = 'Nenhum arquivo carregado.';
            statusJurosSelic.appendChild(p);
        }
    }
}