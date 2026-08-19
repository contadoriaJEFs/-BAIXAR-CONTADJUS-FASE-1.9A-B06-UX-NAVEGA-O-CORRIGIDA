// =====================================================================
// APLICAÇÃO – INICIALIZAÇÃO, NAVEGAÇÃO, EVENTOS (Fase 1.7D1A)
// =====================================================================

function ativarGuia(nomeGuia) {
    const botoes = document.querySelectorAll('.nav-guia button');
    const conteudos = document.querySelectorAll('.conteudo-guia');
    botoes.forEach(btn => {
        btn.classList.toggle('ativo', btn.dataset.guia === nomeGuia);
    });
    conteudos.forEach(div => {
        div.classList.toggle('ativo', div.id === 'guia-' + nomeGuia);
    });

    if (nomeGuia === 'diferencas') {
        if (typeof montarTabelaDiferencas === 'function') {
            montarTabelaDiferencas();
        }
    }
}

// =====================================================================
// RECÁLCULO AUTOMÁTICO DAS GUIAS
// =====================================================================
var recalculoGlobalTimer = null;
var recalculoGlobalEmExecucao = false;

function dibEstaCompletaParaValidacao(valor) {
    valor = String(valor || '').trim();
    // Durante a edição, só validamos quando a data já tem uma forma completa.
    // DD/MM/AAAA ou MM/AAAA.
    return /^(?:\d{2}\/\d{2}\/\d{4}|\d{2}\/\d{4})$/.test(valor);
}

function entradaDataEmEdicao(id) {
    const el = document.getElementById(id);
    return !!(el && document.activeElement === el);
}

function agendarRecalculoGlobal() {
    clearTimeout(recalculoGlobalTimer);
    recalculoGlobalTimer = setTimeout(recalcularTudoAutomaticamente, 350);
}

function recalcularTudoAutomaticamente() {
    if (recalculoGlobalEmExecucao) return;

    var dib = document.getElementById('dib')?.value?.trim() || '';
    var rmi = document.getElementById('rmi')?.value?.trim() || '';
    var dataFinal = document.getElementById('dataFinal')?.value?.trim() || '';
    var tipoAcao = document.getElementById('tipoAcao')?.value || '';
    if (tipoAcao !== 'previdenciaria' || !dib || !rmi || !dataFinal) return;

    // Não tente calcular enquanto a DIB ainda estiver sendo digitada.
    // Isso evita que '15', '15/0', etc. sejam tratados como erro e que a
    // interface role até o painel de validação.
    if (!dibEstaCompletaParaValidacao(dib)) return;

    recalculoGlobalEmExecucao = true;
    try {
        if (typeof executarCalculo === 'function') executarCalculo({ silencioso: true });
        if (typeof montarTabelaDiferencas === 'function') montarTabelaDiferencas();

        if (window.parametrosCorrecaoAtual && typeof importarDiferencasGuia4ParaAtualizacao === 'function') {
            importarDiferencasGuia4ParaAtualizacao();
            if (typeof calcularAtualizacaoGuia5 === 'function') calcularAtualizacaoGuia5();

            var dataAjuizamento = (document.getElementById('dataAjuizamentoGuia6')?.value || document.getElementById('dataAjuizamento')?.value || '').trim();
            if (dataAjuizamento && typeof calcularFormacaoDemanda === 'function') {
                calcularFormacaoDemanda();
            }
        }
    } catch (erro) {
        console.warn('[RECÁLCULO AUTOMÁTICO]', erro.message || erro);
    } finally {
        recalculoGlobalEmExecucao = false;
    }
}

window.agendarRecalculoGlobal = agendarRecalculoGlobal;
window.recalcularTudoAutomaticamente = recalcularTudoAutomaticamente;

// =====================================================================
// DOMContentLoaded
// =====================================================================

document.addEventListener('DOMContentLoaded', function() {
    // Navegação
    document.querySelectorAll('.nav-guia button').forEach(btn => {
        btn.addEventListener('click', function(e) {
            ativarGuia(this.dataset.guia);
        });
    });

    // Cadeados
    document.addEventListener('click', function(e) {
        const cadeado = e.target.closest('.cadeado');
        if (cadeado) {
            e.preventDefault();
            alternarModoTermoInicial(cadeado);
        }
    });

    // Termo Inicial manual
    document.querySelectorAll('#termoInicialDiferencas, #termoInicialDiferencas2').forEach(el => {
        if (el) {
            el.addEventListener('input', function() {
                if (termoInicialManual) {
                    estadoTermoInicial.valor = this.value.trim();
                }
            });
            el.addEventListener('blur', function() {
                if (termoInicialManual) {
                    sincronizarTermoInicial(this);
                }
            });
        }
    });

    // Gatilhos para recalcular termo automático
    ['dib', 'dataAjuizamento', 'aplicarPrescricao', 'prazoPrescricional'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', function() {
                if (!termoInicialManual) calcularTermoInicial();
            });
            if (el.tagName === 'INPUT') {
                el.addEventListener('input', function() {
                    if (!termoInicialManual) {
                        const dibVal = document.getElementById('dib').value;
                        const ajuizVal = document.getElementById('dataAjuizamento').value;
                        if (dibVal.length >= 6 && (document.getElementById('aplicarPrescricao').value === 'nao' || ajuizVal.length >= 8)) {
                            calcularTermoInicial();
                        }
                    }
                });
            }
        }
    });

    // DIB: edição livre, seguindo o mesmo critério da Data do Ajuizamento.
    // Nenhum blur dispara o cálculo ou muda de guia. A validação/cálculo
    // ocorre somente por ação explícita do usuário (botão Calcular Evolução)
    // ou pelo recálculo automático silencioso das dependências.

    // Sincronização Data de Atualização → Data Final
    const dataFinal = document.getElementById('dataFinal');
    if (dataFinal) {
        dataFinal.addEventListener('input', function() {
            if (this.value.length === 7) {
                dataFinalAlteradaManualmente = true;
            }
        });
    }
    const dataAtualizacao = document.getElementById('dataAtualizacao');
    if (dataAtualizacao) {
        dataAtualizacao.addEventListener('input', sincronizarDataFinal);
    }

    // Alterações relevantes recalculam as guias dependentes sem exigir que
    // o usuário abra a Guia 4 ou a Guia 5 para disparar os encadeamentos.
    [
        'dib', 'rmi', 'dataFinal', 'dataAjuizamento', 'dataAtualizacao',
        'inicioJuros', 'possuiAbonoDevido', 'incluir13FinalAberto',
        'tipoBeneficio', 'baseadoSalarioMinimoDevido', 'percentualDesdobramento',
        'adicionalRenda', 'adicionalPercentual', 'dibAnterior'
    ].forEach(function(id) {
        var el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', agendarRecalculoGlobal);
        el.addEventListener('change', agendarRecalculoGlobal);
    });

    // Data do ajuizamento é um único dado lógico exibido em dois pontos da UI.
    // Alterar um campo atualiza imediatamente o outro, sem navegar de guia.
    var dataAjuizamentoEntrada = document.getElementById('dataAjuizamento');
    var dataAjuizamentoGuia6 = document.getElementById('dataAjuizamentoGuia6');
    if (dataAjuizamentoEntrada && typeof guia6SincronizarDataAjuizamento === 'function') {
        guia6SincronizarDataAjuizamento(dataAjuizamentoEntrada);
    }
    if (dataAjuizamentoEntrada && dataAjuizamentoGuia6) {
        dataAjuizamentoEntrada.addEventListener('input', function() {
            guia6SincronizarDataAjuizamento(dataAjuizamentoEntrada);
        });
        dataAjuizamentoEntrada.addEventListener('change', function() {
            guia6SincronizarDataAjuizamento(dataAjuizamentoEntrada);
        });
        dataAjuizamentoGuia6.addEventListener('input', function() {
            guia6SincronizarDataAjuizamento(dataAjuizamentoGuia6);
        });
        dataAjuizamentoGuia6.addEventListener('change', function() {
            guia6SincronizarDataAjuizamento(dataAjuizamentoGuia6);
        });
    }

    // Inicializar Guia 4
    if (typeof initGuiaDiferencas === 'function') {
        initGuiaDiferencas();
    }

    // Inicializações gerais
    toggleFonteIndices();
    preencherDataAtual();
    ativarGuia('entradas');
    adicionarBeneficioRecebido();
    onTipoAcaoChange();

    // Prescrição padrão
    document.getElementById('aplicarPrescricao').value = 'sim';
    document.getElementById('prazoPrescricional').value = 5;

    // Fecha cadeados
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
    termoInicialManual = false;
    calcularTermoInicial();

    // === NOVO: Inicializar estado de Baseado em Salário Mínimo ===
    atualizarEstadoBaseadoSalarioMinimo();

    // Se a guia atual for "diferencas", montar tabela
    const guiaAtiva = document.querySelector('.nav-guia button.ativo');
    if (guiaAtiva && guiaAtiva.dataset.guia === 'diferencas') {
        if (typeof montarTabelaDiferencas === 'function') {
            montarTabelaDiferencas();
        }
    }

    // === Event listeners para SM (adicional) ===
    const smCheck = document.getElementById('baseadoSalarioMinimoDevido');
    if (smCheck) {
        smCheck.addEventListener('change', toggleBaseadoSalarioMinimo);
    }
    const tipoSelect = document.getElementById('tipoBeneficio');
    if (tipoSelect) {
        tipoSelect.addEventListener('change', function() {
            atualizarEstadoBaseadoSalarioMinimo();
        });
    }
    const dibInput = document.getElementById('dib');
    if (dibInput) {
        dibInput.addEventListener('change', function() {
            const smCheck = document.getElementById('baseadoSalarioMinimoDevido');
            if (smCheck && smCheck.checked) {
                const salario = obterSalarioMinimoPorCompetencia(this.value);
                if (salario !== null) {
                    const rmi = document.getElementById('rmi');
                    if (rmi) {
                        if (!rmi.dataset.originalManual) {
                            rmi.dataset.originalManual = rmi.value;
                        }
                        rmi.value = formatarMoeda(salario);
                    }
                }
            }
        });
    }

    // ============================================================
    // CORREÇÃO DO BOTÃO "APLICAR" – GUIA 5
    // ============================================================
    var btnAplicar = document.getElementById('btnAplicarModelo');
    if (btnAplicar) {
        btnAplicar.addEventListener('click', function() {
            var select = document.getElementById('modeloSelect');
            if (select && select.value) {
                if (typeof window.carregarEncadeamentoOficial === 'function') {
                    window.carregarEncadeamentoOficial(select.value);
                } else {
                    console.warn('[app.js] carregarEncadeamentoOficial não está definida.');
                }
            }
        });
    }
});

// =====================================================================
// FUNÇÃO sincronizarTermoInicial (já existente, mantida)
// =====================================================================
function sincronizarTermoInicial(campoOrigem) {
    if (!termoInicialManual) return;
    const valor = campoOrigem.value.trim();
    const regexMMAAAA = /^\d{2}\/\d{4}$/;
    const regexDDMMAAAA = /^\d{2}\/\d{2}\/\d{4}$/;
    if (valor === '') {
        const outro = campoOrigem.id === 'termoInicialDiferencas' ?
            document.getElementById('termoInicialDiferencas2') :
            document.getElementById('termoInicialDiferencas');
        if (outro && outro.value !== valor) {
            outro.value = valor;
        }
        estadoTermoInicial.valor = valor;
        return;
    }
    if (regexMMAAAA.test(valor) || regexDDMMAAAA.test(valor)) {
        const outro = campoOrigem.id === 'termoInicialDiferencas' ?
            document.getElementById('termoInicialDiferencas2') :
            document.getElementById('termoInicialDiferencas');
        if (outro && outro.value !== valor) {
            outro.value = valor;
        }
        estadoTermoInicial.valor = valor;
        estadoTermoInicial.manual = true;
        estadoTermoInicial.origem = 'manual';
        return;
    }
    let valorNormalizado = null;
    if (/^\d+$/.test(valor)) {
        if (valor.length === 6) {
            const mes = parseInt(valor.substring(0, 2), 10);
            const ano = parseInt(valor.substring(2), 10);
            if (mes >= 1 && mes <= 12 && ano >= 1900 && ano <= 2100) {
                valorNormalizado = valor.substring(0, 2) + '/' + valor.substring(2);
            }
        } else if (valor.length === 8) {
            const dia = parseInt(valor.substring(0, 2), 10);
            const mes = parseInt(valor.substring(2, 4), 10);
            const ano = parseInt(valor.substring(4), 10);
            if (dia >= 1 && dia <= 31 && mes >= 1 && mes <= 12 && ano >= 1900 && ano <= 2100) {
                valorNormalizado = valor.substring(0, 2) + '/' + valor.substring(2, 4) + '/' + valor.substring(4);
            }
        }
    }
    if (!valorNormalizado) {
        return;
    }
    if (campoOrigem.value !== valorNormalizado) {
        campoOrigem.value = valorNormalizado;
    }
    const outro = campoOrigem.id === 'termoInicialDiferencas' ?
        document.getElementById('termoInicialDiferencas2') :
        document.getElementById('termoInicialDiferencas');
    if (outro && outro.value !== valorNormalizado) {
        outro.value = valorNormalizado;
    }
    estadoTermoInicial.valor = valorNormalizado;
    estadoTermoInicial.manual = true;
    estadoTermoInicial.origem = 'manual';
}

// =====================================================================
// FUNÇÃO PARA OBTER SALÁRIO MÍNIMO POR COMPETÊNCIA (centralizada)
// =====================================================================
function obterSalarioMinimoPorCompetencia(competencia) {
    if (!competencia) return null;
    const partes = competencia.split('/');
    let mes, ano;
    if (partes.length === 3) {
        mes = parseInt(partes[1], 10);
        ano = parseInt(partes[2], 10);
    } else if (partes.length === 2) {
        mes = parseInt(partes[0], 10);
        ano = parseInt(partes[1], 10);
    } else {
        return null;
    }
    if (isNaN(mes) || isNaN(ano) || mes < 1 || mes > 12 || ano < 1900) return null;
    const chave = ano * 100 + mes;

    for (let vig of VIGENCIAS) {
        const [mesInicio, anoInicio] = vig.inicio.split('/').map(Number);
        const [mesFim, anoFim] = vig.fim.split('/').map(Number);
        const chaveInicio = anoInicio * 100 + mesInicio;
        const chaveFim = anoFim * 100 + mesFim;
        if (chave >= chaveInicio && chave <= chaveFim) {
            return vig.salarioMinimo;
        }
    }
    return null;
}

// =====================================================================
// FUNÇÕES PARA BASEADO EM SALÁRIO MÍNIMO (Fase 1.7D1A)
// =====================================================================

function atualizarEstadoBaseadoSalarioMinimo() {
    const tipo = document.getElementById('tipoBeneficio').value;
    const checkboxSM = document.getElementById('baseadoSalarioMinimoDevido');
    const statusSM = document.getElementById('statusBaseadoSMDevido');
    const checkboxAbono = document.getElementById('possuiAbonoDevido');
    const statusAbono = document.getElementById('statusAbonoDevido');
    const radiosTransformado = document.querySelectorAll('input[name="transformado"]');
    const dibAnt = document.getElementById('dibAnterior');
    const rmi = document.getElementById('rmi');

    if (tipo === 'assistencial') {
        checkboxSM.checked = true;
        checkboxSM.disabled = true;
        statusSM.textContent = 'Benefícios assistenciais evoluem pelo salário mínimo.';

        checkboxAbono.checked = false;
        checkboxAbono.disabled = true;
        statusAbono.textContent = 'Assistenciais não possuem 13º.';

        radiosTransformado.forEach(radio => {
            radio.disabled = true;
        });
        document.querySelector('input[name="transformado"][value="nao"]').checked = true;

        if (dibAnt) {
            dibAnt.value = '';
            dibAnt.readOnly = true;
            dibAnt.classList.add('bg-slate-50');
            dibAnt.classList.remove('bg-white');
        }

        const dib = document.getElementById('dib').value;
        if (dib) {
            const salario = obterSalarioMinimoPorCompetencia(dib);
            if (salario !== null) {
                rmi.value = formatarMoeda(salario);
                rmi.readOnly = true;
                rmi.classList.add('bg-slate-50');
                rmi.classList.remove('bg-white');
                rmi.dataset.originalManual = '';
                rmi.dataset.automatico = 'true';
            }
        }
    } else {
        checkboxSM.disabled = false;
        statusSM.textContent = '';

        checkboxAbono.disabled = false;
        statusAbono.textContent = '';

        radiosTransformado.forEach(radio => {
            radio.disabled = false;
        });

        if (dibAnt) {
            dibAnt.readOnly = false;
            dibAnt.classList.remove('bg-slate-50');
            dibAnt.classList.add('bg-white');
        }

        if (checkboxSM.checked) {
            const dib = document.getElementById('dib').value;
            if (dib) {
                const salario = obterSalarioMinimoPorCompetencia(dib);
                if (salario !== null) {
                    if (!rmi.dataset.originalManual) {
                        rmi.dataset.originalManual = rmi.value;
                    }
                    rmi.value = formatarMoeda(salario);
                    rmi.readOnly = true;
                    rmi.classList.add('bg-slate-50');
                    rmi.classList.remove('bg-white');
                    rmi.dataset.automatico = 'true';
                }
            }
        } else {
            if (rmi.dataset.originalManual) {
                rmi.value = rmi.dataset.originalManual;
                rmi.dataset.originalManual = '';
            }
            rmi.readOnly = false;
            rmi.classList.remove('bg-slate-50');
            rmi.classList.add('bg-white');
            rmi.dataset.automatico = 'false';
        }
    }
}

function toggleBaseadoSalarioMinimo() {
    const checkbox = document.getElementById('baseadoSalarioMinimoDevido');
    const rmi = document.getElementById('rmi');
    const dib = document.getElementById('dib').value;

    if (checkbox.checked) {
        if (dib) {
            const salario = obterSalarioMinimoPorCompetencia(dib);
            if (salario !== null) {
                if (!rmi.dataset.originalManual) {
                    rmi.dataset.originalManual = rmi.value;
                }
                rmi.value = formatarMoeda(salario);
                rmi.readOnly = true;
                rmi.classList.add('bg-slate-50');
                rmi.classList.remove('bg-white');
                rmi.dataset.automatico = 'true';
            }
        }
    } else {
        if (rmi.dataset.originalManual) {
            rmi.value = rmi.dataset.originalManual;
            rmi.dataset.originalManual = '';
        }
        rmi.readOnly = false;
        rmi.classList.remove('bg-slate-50');
        rmi.classList.add('bg-white');
        rmi.dataset.automatico = 'false';
    }
}

// =====================================================================
// DEMAIS FUNÇÕES (toggleTransformacao, toggleAdicionalPercentual, etc.)
// =====================================================================
function toggleTransformacao(ativo) {
    const grupo = document.getElementById('grupoTransformacao');
    if (grupo) grupo.classList.toggle('hidden', !ativo);
    if (!ativo) {
        const dibAnt = document.getElementById('dibAnterior');
        if (dibAnt) dibAnt.value = '';
    }
}

function toggleAdicionalPercentual(select) {
    const grupo = document.getElementById('grupoAdicionalPercentual');
    if (!grupo) return;
    if (select.value === 'outro') {
        grupo.classList.remove('hidden');
    } else {
        grupo.classList.add('hidden');
        const input = document.getElementById('adicionalPercentual');
        if (input) input.value = '';
    }
}

function onTipoAcaoChange() {
    const tipo = document.getElementById('tipoAcao').value;
    const blocoBeneficio = document.getElementById('blocoBeneficio');
    const msgOutros = document.getElementById('msgOutrosTipos');
    if (tipo === 'previdenciaria') {
        blocoBeneficio.style.display = 'block';
        msgOutros.classList.add('hidden');
    } else {
        blocoBeneficio.style.display = 'none';
        msgOutros.classList.remove('hidden');
    }
}

function sincronizarDataFinal() {
    if (dataFinalAlteradaManualmente) return;
    const dataAtualizacao = document.getElementById('dataAtualizacao').value;
    if (dataAtualizacao.length === 7) {
        document.getElementById('dataFinal').value = dataAtualizacao;
    }
}

function toggleFonteIndices() {
    const opcao = document.querySelector('input[name="fonteIndices"]:checked').value;
    const grupoUpload = document.getElementById('grupoUpload');
    const fonteAtiva = document.getElementById('fonteAtiva');
    if (opcao === 'interna') {
        grupoUpload.classList.add('hidden');
        fonteAtiva.innerText = 'Interna';
        indicesAtivos = BASE_INTERNA;
        fonteIndices = 'interna';
        document.getElementById('statusIndices').innerText = '(usando base interna)';
    } else {
        grupoUpload.classList.remove('hidden');
        fonteAtiva.innerText = 'Externa (arquivo)';
        fonteIndices = 'externa';
        if (indicesAtivos === BASE_INTERNA) {
            document.getElementById('statusIndices').innerText = '(nenhum arquivo carregado)';
        }
    }
}

function carregarIndicesExternos() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
        alert('Selecione um arquivo JSON primeiro.');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            const anos = Object.keys(dados);
            if (anos.length === 0 || !dados[anos[0]].competencia) {
                throw new Error('Estrutura JSON inválida. Verifique o formato.');
            }
            indicesAtivos = dados;
            fonteIndices = 'externa';
            document.getElementById('statusIndices').innerText = `✅ ${anos.length} anos carregados (${Object.keys(dados[anos[0]].pro_rata).length} pro-rata)`;
            document.getElementById('fonteAtiva').innerText = 'Externa (arquivo)';
            alert('Índices carregados com sucesso!');
        } catch (error) {
            alert('Erro ao carregar o arquivo: ' + error.message);
        }
    };
    reader.readAsText(file);
}

function restaurarBaseInterna() {
    indicesAtivos = BASE_INTERNA;
    fonteIndices = 'interna';
    document.querySelector('input[name="fonteIndices"][value="interna"]').checked = true;
    toggleFonteIndices();
    document.getElementById('statusIndices').innerText = '(base interna restaurada)';
    document.getElementById('fileInput').value = '';
    alert('Base interna restaurada com sucesso.');
}

function alternarModoTermoInicial(cadeadoClicado) {
    const cadeados = document.querySelectorAll('.cadeado');
    const campos = document.querySelectorAll('#termoInicialDiferencas, #termoInicialDiferencas2');
    const estaAberto = cadeadoClicado.classList.contains('aberto');

    if (estaAberto) {
        cadeados.forEach(el => {
            el.classList.remove('aberto');
            el.classList.add('fechado');
            el.textContent = '🔒';
        });
        campos.forEach(el => {
            if (el) {
                el.readOnly = true;
                el.classList.remove('bg-white');
                el.classList.add('bg-slate-50');
            }
        });
        termoInicialManual = false;
        calcularTermoInicial();
    } else {
        cadeados.forEach(el => {
            el.classList.remove('fechado');
            el.classList.add('aberto');
            el.textContent = '🔓';
        });
        campos.forEach(el => {
            if (el) {
                el.readOnly = false;
                el.classList.remove('bg-slate-50');
                el.classList.add('bg-white');
            }
        });
        termoInicialManual = true;
        const valorAtual = document.getElementById('termoInicialDiferencas').value;
        definirTermoInicial(valorAtual, 'manual');
    }
}

function definirTermoInicial(valor, origem) {
    estadoTermoInicial.valor = valor;
    estadoTermoInicial.origem = origem;
    estadoTermoInicial.manual = (origem === 'manual');

    const campo1 = document.getElementById('termoInicialDiferencas');
    const campo2 = document.getElementById('termoInicialDiferencas2');
    if (campo1) campo1.value = valor;
    if (campo2) campo2.value = valor;

    const status1 = document.getElementById('statusTermoPrincipal');
    const status2 = document.getElementById('statusTermoBeneficio');
    if (origem === 'manual') {
        if (status1) status1.textContent = 'Termo informado manualmente.';
        if (status2) status2.textContent = 'Termo informado manualmente.';
    } else {
        if (status1) status1.textContent = 'Termo calculado automaticamente.';
        if (status2) status2.textContent = 'Termo calculado automaticamente.';
    }
}

function calcularTermoInicial() {
    if (termoInicialManual) return;

    const aplicarPrescricao = document.getElementById('aplicarPrescricao').value === 'sim';
    const prazo = parseInt(document.getElementById('prazoPrescricional').value) || 5;
    const strDib = document.getElementById('dib').value;
    const dibObj = parseDataFlexivel(strDib, true);
    if (!dibObj) return;

    let termoMes = dibObj.mes;
    let termoAno = dibObj.ano;

    if (aplicarPrescricao) {
        const strAjuizamento = document.getElementById('dataAjuizamento').value;
        const ajuizamentoObj = parseDataFlexivel(strAjuizamento, true);
        if (ajuizamentoObj) {
            let anoMarco = ajuizamentoObj.ano - prazo;
            let mesMarco = ajuizamentoObj.mes;
            while (mesMarco < 1) { mesMarco += 12; anoMarco--; }
            const chaveDib = getChaveCronologica(dibObj.mes, dibObj.ano);
            const chaveMarco = getChaveCronologica(mesMarco, anoMarco);
            if (chaveMarco > chaveDib) {
                termoMes = mesMarco;
                termoAno = anoMarco;
            }
        }
    }

    const valor = `${String(termoMes).padStart(2,'0')}/${termoAno}`;
    definirTermoInicial(valor, 'automatico');
}

function preencherDataAtual() {
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = hoje.getFullYear();
    const el = document.getElementById('dataCalculo');
    if (el) el.value = dia + '/' + mes + '/' + ano;
}

function limparFormulario() {
    document.getElementById('calcForm').reset();
    const selPresc = document.getElementById('aplicarPrescricao');
    if (selPresc) selPresc.value = 'sim';
    const prazo = document.getElementById('prazoPrescricional');
    if (prazo) prazo.value = 5;

    const painelErro = document.getElementById('painelErro');
    if (painelErro) painelErro.classList.add('hidden');
    const painelResultado = document.getElementById('painelResultado');
    if (painelResultado) painelResultado.classList.add('hidden');
    const msgSemCalculo = document.getElementById('msgSemCalculo');
    if (msgSemCalculo) msgSemCalculo.style.display = 'block';
    const resumoExecutivo = document.getElementById('resumoExecutivo');
    if (resumoExecutivo) resumoExecutivo.classList.add('hidden');
    const identificacao = document.getElementById('identificacaoCalculo');
    if (identificacao) identificacao.classList.add('hidden');

    toggleTransformacao(false);
    preencherDataAtual();
    dataFinalAlteradaManualmente = false;
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
    const st1 = document.getElementById('statusTermoPrincipal');
    const st2 = document.getElementById('statusTermoBeneficio');
    if (st1) st1.textContent = 'Termo calculado automaticamente.';
    if (st2) st2.textContent = 'Termo calculado automaticamente.';
    calcularTermoInicial();

    const smCheck = document.getElementById('baseadoSalarioMinimoDevido');
    if (smCheck) {
        smCheck.checked = false;
        smCheck.disabled = false;
    }
    const rmi = document.getElementById('rmi');
    if (rmi) {
        rmi.readOnly = false;
        rmi.classList.remove('bg-slate-50');
        rmi.classList.add('bg-white');
        rmi.dataset.originalManual = '';
        rmi.dataset.automatico = 'false';
    }
    const dibAnt = document.getElementById('dibAnterior');
    if (dibAnt) {
        dibAnt.readOnly = false;
        dibAnt.classList.remove('bg-slate-50');
        dibAnt.classList.add('bg-white');
    }
    atualizarEstadoBaseadoSalarioMinimo();
}

function mostrarErro(mensagem, opcoes) {
    opcoes = opcoes || {};
    const painelErro = document.getElementById('painelErro');
    const msgErro = document.getElementById('mensagemErro');
    if (painelErro && msgErro) {
        msgErro.innerHTML = mensagem;
        painelErro.classList.remove('hidden');
        // Validações disparadas pelo blur/input não devem retirar o campo
        // que o usuário acabou de editar da área visível. O scroll só ocorre
        // quando solicitado explicitamente.
        const campoEmEdicao = document.activeElement && document.activeElement.matches &&
            document.activeElement.matches('input, select, textarea');
        const devePreservarTela = opcoes.semScroll || opcoes.validacaoCampo || campoEmEdicao;
        if (!devePreservarTela) {
            painelErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    } else if (!opcoes.silencioso) {
        alert(mensagem);
    }
    const painelResultado = document.getElementById('painelResultado');
    if (painelResultado) painelResultado.classList.add('hidden');
    const msgSemCalculo = document.getElementById('msgSemCalculo');
    if (msgSemCalculo) msgSemCalculo.style.display = 'block';
}

// =====================================================================
// FUNÇÕES DE CÁLCULO (executarCalculo, exibirResultado, etc.)
// =====================================================================
function executarCalculo(opcoes) {
    opcoes = opcoes || {};
    if (document.getElementById('tipoAcao').value !== 'previdenciaria') {
        if (!opcoes.silencioso) mostrarErro('O cálculo de evolução está disponível apenas para "Ações Previdenciárias".', { semScroll: !!opcoes.semScrollErro });
        return;
    }

    const painelErro = document.getElementById('painelErro');
    if (painelErro) painelErro.classList.add('hidden');

    if (fonteIndices === 'externa' && indicesAtivos === BASE_INTERNA) {
        if (!opcoes.silencioso) mostrarErro("Você selecionou 'Arquivo Externo', mas nenhum arquivo foi carregado.", { semScroll: !!opcoes.semScrollErro });
        return;
    }

    try {
        const parametros = {
            dib: document.getElementById('dib').value,
            rmi: parseMoeda(document.getElementById('rmi').value),
            dataFinal: document.getElementById('dataFinal').value,
            transformado: document.querySelector('input[name="transformado"]:checked').value === 'sim',
            dibAntecedente: document.getElementById('dibAnterior').value,
            tipoBeneficio: document.getElementById('tipoBeneficio').value,
            percentualDesdobramento: parseFloat(document.getElementById('percentualDesdobramento').value.replace(',', '.')) || 100,
            adicionalTipo: document.getElementById('adicionalRenda').value,
            adicionalPercentual: parseFloat(document.getElementById('adicionalPercentual').value.replace(',', '.')) || 0,
            baseadoSalarioMinimo: document.getElementById('baseadoSalarioMinimoDevido').checked
        };

        const resultado = calcularEvolucao(parametros);
        exibirResultado(resultado, parametros, opcoes);

    } catch (erro) {
        if (!opcoes.silencioso) {
            mostrarErro('Erro: ' + erro.message, { semScroll: !!opcoes.semScrollErro, validacaoCampo: opcoes.validacaoCampo });
            if (!opcoes.preservarGuia) ativarGuia('entradas');
        } else {
            // Recalculo automático: erros transitórios (ex.: DIB parcialmente
            // digitada) não devem aparecer nem provocar scroll/navegação.
            console.debug('[RECALCULO SILENCIOSO]', erro.message || erro);
        }
    }
}

function exibirResultado(resultado, parametros, opcoes) {
    opcoes = opcoes || {};
    const { memoria, rmaFinal, statusFinal, qtdReajustes, ultimoReajuste, ultimoIndice } = resultado;

    window.memoriaEvolucaoDevida = memoria;

    const divIdent = document.getElementById('identificacaoCalculo');
    if (divIdent) {
        divIdent.innerHTML = '';
        let temCampo = false;
        const camposIdent = [
            { id: 'processo', label: 'Processo' },
            { id: 'autor', label: 'Autor' },
            { id: 'reu', label: 'Réu' },
            { id: 'nb', label: 'NB' },
            { id: 'especie', label: 'Espécie' },
            { id: 'cpf', label: 'CPF' },
            { id: 'dataCalculo', label: 'Data do Cálculo' },
            { id: 'observacoes', label: 'Observações' }
        ];
        for (let campo of camposIdent) {
            const el = document.getElementById(campo.id);
            if (el && el.value.trim() !== '') {
                temCampo = true;
                const item = document.createElement('div');
                item.className = 'item';
                const rotulo = document.createElement('span');
                rotulo.className = 'rotulo';
                rotulo.innerText = campo.label;
                const valor = document.createElement('span');
                valor.className = 'valor';
                valor.innerText = el.value.trim();
                item.appendChild(rotulo);
                item.appendChild(valor);
                divIdent.appendChild(item);
            }
        }
        divIdent.classList.toggle('hidden', !temCampo);
    }

    const dibObj = parseDataFlexivel(parametros.dib, true);
    const finalObj = parseDataFlexivel(parametros.dataFinal, false);
    document.getElementById('resDIB').innerText = formatarDataExibicao(dibObj);
    document.getElementById('resRMI').innerText = formatarMoeda(parametros.rmi);
    document.getElementById('resDataFinal').innerText = formatarDataExibicao(finalObj);
    document.getElementById('resQtdReajustes').innerText = qtdReajustes;
    document.getElementById('resRMA').innerText = formatarMoeda(rmaFinal);

    const resumoExecutivo = document.getElementById('resumoExecutivo');
    if (memoria.length > 0) {
        const ultimoRegistro = memoria[memoria.length - 1];
        const statusExibicao = ultimoRegistro.status === 'LIMITADO_TETO' ? 'TETO' : ultimoRegistro.status === 'SALARIO_MINIMO' ? 'SM' : ultimoRegistro.status;
        document.getElementById('resumoStatus').innerText = statusExibicao;
        document.getElementById('resumoSalarioMinimo').innerText = formatarNumero(ultimoRegistro.salarioMinimo);
        document.getElementById('resumoTeto').innerText = formatarNumero(ultimoRegistro.teto);
        document.getElementById('resumoValorEvoluido').innerText = formatarNumero(ultimoRegistro.valorEvoluido);
        document.getElementById('resumoUltimoIndice').innerText = ultimoIndice !== null ? ultimoIndice.toFixed(4) : '-';
        document.getElementById('resumoCompetencia').innerText = ultimoReajuste;
        resumoExecutivo.classList.remove('hidden');
    } else {
        resumoExecutivo.classList.add('hidden');
    }

    const avisoRma = document.getElementById('avisoRmaMantida');
    const ultimoReajusteEl = document.getElementById('ultimoReajusteData');
    if (ultimoReajuste && memoria.length > 0 && ultimoReajuste !== formatarDataExibicao(finalObj)) {
        avisoRma.classList.remove('hidden');
        ultimoReajusteEl.innerText = ultimoReajuste;
    } else {
        avisoRma.classList.add('hidden');
    }

    const tbody = document.getElementById('tabelaMemoria');
    if (tbody) {
        tbody.innerHTML = '';
        if (memoria.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" class="p-4 text-center text-slate-500">Nenhum reajuste aplicável.</td></tr>`;
        } else {
            memoria.forEach(item => {
                const tr = document.createElement('tr');
                tr.className = "hover:bg-slate-50 transition";
                let statusExibicao = item.status === 'LIMITADO_TETO' ? 'TETO' : item.status === 'SALARIO_MINIMO' ? 'SM' : item.status;
                let rowClass = '';
                if (item.status === 'PISO') rowClass = 'row-piso';
                else if (item.status === 'LIMITADO_TETO') rowClass = 'row-teto';
                if (rowClass) tr.classList.add(rowClass);
                let statusBadgeClass = 'status-normal';
                if (item.status === 'PISO') statusBadgeClass = 'status-piso';
                else if (item.status === 'LIMITADO_TETO') statusBadgeClass = 'status-teto';
                else if (item.status === 'SALARIO_MINIMO') statusBadgeClass = 'status-sm';
                tr.innerHTML = `
                    <td class="p-3 font-semibold text-slate-800">${item.competencia}</td>
                    <td class="p-3">${item.tipo ? `<span class="px-2 py-0.5 rounded text-xs font-bold ${item.tipo === 'PRO RATA' ? 'bg-amber-100 text-amber-800 border border-amber-200' : item.tipo === 'INTEGRAL' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : item.tipo === 'PRO RATA/FALLBACK' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}">${item.tipo}</span>` : '-'}</td>
                    <td class="p-3 text-slate-600">${item.indice !== null ? item.indice.toFixed(4) : '-'}</td>
                    <td class="p-3 text-slate-600">${formatarNumero(item.salarioMinimo)}</td>
                    <td class="p-3 text-slate-600">${formatarNumero(item.teto)}</td>
                    <td class="p-3 text-slate-600">${item.indiceTeto !== null ? item.indiceTeto.toFixed(5) : '-'}</td>
                    <td class="p-3"><span class="status-badge ${statusBadgeClass}">${statusExibicao}</span></td>
                    <td class="p-3 text-slate-600">${formatarNumero(item.valorTeorico)}</td>
                    <td class="p-3 text-slate-600">${formatarNumero(item.valorEvoluido)}</td>
                    <td class="p-3 valor-final">${formatarNumero(item.valorFinal)}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    const painelResultado = document.getElementById('painelResultado');
    const msgSemCalculo = document.getElementById('msgSemCalculo');
    if (painelResultado) painelResultado.classList.remove('hidden');
    if (msgSemCalculo) {
        msgSemCalculo.classList.add('hidden');
        msgSemCalculo.style.display = 'none';
    }
    // Recalculos automáticos atualizam os dados sem tirar o usuário da guia
    // que ele está visualizando. A navegação só ocorre no cálculo manual.
    if (!opcoes.silencioso) {
        ativarGuia('evolucao-devida');
        if (painelResultado) {
            painelResultado.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

function iniciarCalculoComSeguranca() {
    try {
        console.log('[CALCULO] Botão acionado');
        executarCalculo();
        console.log('[CALCULO] Cálculo concluído com sucesso.');
    } catch (erro) {
        console.error('[CALCULO] Erro inesperado:', erro);
        mostrarErro('Erro interno ao executar o cálculo: ' + erro.message);
        ativarGuia('entradas');
    }
}

// =====================================================================
// VARIÁVEIS GLOBAIS
// =====================================================================
var indicesAtivos = BASE_INTERNA;
var fonteIndices = 'interna';
var dataFinalAlteradaManualmente = false;
var termoInicialManual = false;
var estadoTermoInicial = {
    valor: '',
    manual: false,
    origem: 'automatico'
};
