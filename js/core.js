// =====================================================================
// FUNÇÕES AUXILIARES E MÁSCARAS
// =====================================================================

function competenciaParaNumero(competencia) {
    let partes = competencia.split('/');
    let mes = parseInt(partes[0], 10);
    let ano = parseInt(partes[1], 10);
    return ano * 100 + mes;
}

function obterLimitadores(competencia) {
    const numCompetencia = competenciaParaNumero(competencia);
    for (let vig of VIGENCIAS) {
        let numInicio = competenciaParaNumero(vig.inicio);
        let numFim = competenciaParaNumero(vig.fim);
        if (numCompetencia >= numInicio && numCompetencia <= numFim) {
            return { salarioMinimo: vig.salarioMinimo, teto: vig.teto };
        }
    }
    return null;
}

function aplicarMascaraData(input, apenasMesAno) {
    let v = input.value.replace(/\D/g, '');
    if (apenasMesAno) {
        if (v.length > 6) v = v.substring(0, 6);
        if (v.length >= 3) {
            input.value = v.substring(0, 2) + '/' + v.substring(2);
        } else {
            input.value = v;
        }
    } else {
        if (v.length > 8) v = v.substring(0, 8);
        if (v.length === 8) {
            input.value = v.substring(0, 2) + '/' + v.substring(2, 4) + '/' + v.substring(4, 8);
        } else if (v.length >= 3 && v.length < 8) {
            input.value = v.substring(0, 2) + '/' + v.substring(2);
        } else {
            input.value = v;
        }
    }
}

function aplicarMascaraDataSimples(input) {
    let v = input.value.replace(/\D/g, '');
    if (v.length > 8) v = v.substring(0, 8);
    if (v.length >= 3 && v.length <= 5) {
        input.value = v.substring(0, 2) + '/' + v.substring(2);
    } else if (v.length >= 6) {
        input.value = v.substring(0, 2) + '/' + v.substring(2, 4) + '/' + v.substring(4, 8);
    } else {
        input.value = v;
    }
}

function aplicarMascaraCPF(input) {
    let v = input.value.replace(/\D/g, '');
    if (v.length > 11) v = v.substring(0, 11);
    if (v.length >= 4 && v.length < 7) {
        input.value = v.substring(0, 3) + '.' + v.substring(3);
    } else if (v.length >= 7 && v.length < 10) {
        input.value = v.substring(0, 3) + '.' + v.substring(3, 6) + '.' + v.substring(6);
    } else if (v.length >= 10) {
        input.value = v.substring(0, 3) + '.' + v.substring(3, 6) + '.' + v.substring(6, 9) + '-' + v.substring(9);
    } else {
        input.value = v;
    }
}

function aplicarMascaraMoeda(input) {
    let v = input.value.replace(/\D/g, '');
    if (!v) { input.value = ''; return; }
    let valor = (parseInt(v, 10) / 100).toFixed(2);
    let partes = valor.split('.');
    partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    input.value = partes.join(',');
}

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

function parseDataFlexivel(str, permitirDia) {
    if (!str) return null;
    let limpo = str.trim().replace(/\D/g, '');
    if (!permitirDia && limpo.length === 6) {
        let mes = parseInt(limpo.substring(0, 2), 10);
        let ano = parseInt(limpo.substring(2, 6), 10);
        if (mes < 1 || mes > 12 || ano < 1900) return null;
        return { dia: null, mes, ano, strCompetencia: `${String(mes).padStart(2,'0')}/${ano}` };
    }
    if (permitirDia && (limpo.length === 6 || limpo.length === 8)) {
        if (limpo.length === 6) {
            let mes = parseInt(limpo.substring(0, 2), 10);
            let ano = parseInt(limpo.substring(2, 6), 10);
            if (mes < 1 || mes > 12 || ano < 1900) return null;
            return { dia: null, mes, ano, strCompetencia: `${String(mes).padStart(2,'0')}/${ano}` };
        } else {
            let dia = parseInt(limpo.substring(0, 2), 10);
            let mes = parseInt(limpo.substring(2, 4), 10);
            let ano = parseInt(limpo.substring(4, 8), 10);
            if (mes < 1 || mes > 12 || dia < 1 || dia > 31 || ano < 1900) return null;
            const dataTest = new Date(ano, mes - 1, dia);
            if (dataTest.getFullYear() !== ano || dataTest.getMonth() !== mes - 1 || dataTest.getDate() !== dia) return null;
            return { dia, mes, ano, strCompetencia: `${String(mes).padStart(2,'0')}/${ano}` };
        }
    }
    return null;
}

function formatarDataExibicao(dataObj) {
    if (!dataObj) return '-';
    if (dataObj.dia !== null)
        return `${String(dataObj.dia).padStart(2,'0')}/${String(dataObj.mes).padStart(2,'0')}/${dataObj.ano}`;
    return `${String(dataObj.mes).padStart(2,'0')}/${dataObj.ano}`;
}

// =====================================================================
// FUNÇÕES DE FORMATAÇÃO E PARSING
// =====================================================================

function parseMoeda(str) {
    if (!str) return NaN;
    let limpo = str.replace(/[^0-9,.]/g, '').replace(/\./g, '').replace(',', '.');
    return parseFloat(limpo);
}

function formatarMoeda(valor) {
    if (valor === null || valor === undefined || isNaN(valor)) return 'R$ 0,00';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarNumero(valor) {
    if (valor === null || valor === undefined || isNaN(valor)) return '-';
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getChaveCronologica(mes, ano) {
    return ano * 100 + mes;
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
}

function mostrarErro(mensagem) {
    const painelErro = document.getElementById('painelErro');
    const msgErro = document.getElementById('mensagemErro');
    if (painelErro && msgErro) {
        msgErro.innerHTML = mensagem;
        painelErro.classList.remove('hidden');
        painelErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        alert(mensagem);
    }
    const painelResultado = document.getElementById('painelResultado');
    if (painelResultado) painelResultado.classList.add('hidden');
    const msgSemCalculo = document.getElementById('msgSemCalculo');
    if (msgSemCalculo) msgSemCalculo.style.display = 'block';
}

// =====================================================================
// FUNÇÕES PARA CÁLCULO DO ABONO ANUAL (13º) – Fase 1.7D2
// =====================================================================

/**
 * Conta os avos (meses com pelo menos 15 dias de vigência) em um ano
 * @param {string} dib - Data de Início do Benefício (DD/MM/AAAA ou MM/AAAA)
 * @param {string|null} dcb - Data de Cessação (DD/MM/AAAA ou null)
 * @param {number} ano - Ano alvo (ex: 2024)
 * @returns {number} Número de avos (0 a 12)
 */
function contarAvosAno(dib, dcb, ano) {
    const dibParsed = parseDataFlexivel(dib, true);
    if (!dibParsed) return 0;
    const dibData = new Date(dibParsed.ano, dibParsed.mes - 1, dibParsed.dia || 1);

    let dcbData = null;
    if (dcb) {
        const dcbParsed = parseDataFlexivel(dcb, true);
        if (dcbParsed) {
            dcbData = new Date(dcbParsed.ano, dcbParsed.mes - 1, dcbParsed.dia || 1);
        }
    }

    const inicioAno = new Date(ano, 0, 1);
    const fimAno = new Date(ano, 11, 31);

    let inicioEfetivo = new Date(Math.max(dibData.getTime(), inicioAno.getTime()));
    let fimEfetivo = dcbData ? new Date(Math.min(dcbData.getTime(), fimAno.getTime())) : new Date(fimAno.getTime());

    if (inicioEfetivo > fimEfetivo) return 0;

    let avos = 0;

    for (let mes = 1; mes <= 12; mes++) {
        const mesAtual = new Date(ano, mes - 1, 1);
        if (mesAtual < new Date(inicioEfetivo.getFullYear(), inicioEfetivo.getMonth(), 1) ||
            mesAtual > new Date(fimEfetivo.getFullYear(), fimEfetivo.getMonth(), 1)) {
            continue;
        }

        const ultimoDia = new Date(ano, mes, 0).getDate();
        const primeiroDia = 1;

        let diaInicio = primeiroDia;
        let diaFim = ultimoDia;

        if (ano === inicioEfetivo.getFullYear() && mes === inicioEfetivo.getMonth() + 1) {
            diaInicio = inicioEfetivo.getDate();
        }
        if (ano === fimEfetivo.getFullYear() && mes === fimEfetivo.getMonth() + 1) {
            diaFim = fimEfetivo.getDate();
        }

        const diasAtivos = diaFim - diaInicio + 1;
        if (diasAtivos >= 15) {
            avos++;
        }
    }
    return avos;
}

/**
 * Calcula o valor do 13º para um ano específico
 * @param {object} beneficio - Objeto com propriedades: dib, dcb, possuiAbono (booleano), rmi, rmaFinal, memoria (array mensal)
 * @param {number} ano - Ano alvo
 * @param {array} memoriaMensal - Array com as competências mensais (cada item com competencia e valorFinal)
 * @returns {object|null} { avos, base, valor, competenciaBase } ou null se não houver abono
 */
function calcular13ParaAno(beneficio, ano, memoriaMensal) {
    if (!beneficio.possuiAbono) return null;

    const avos = contarAvosAno(beneficio.dib, beneficio.dcb || null, ano);
    if (avos === 0) return null;

    // Determina a última competência ativa do ano
    const dibParsed = parseDataFlexivel(beneficio.dib, true);
    if (!dibParsed) return null;
    const dcbParsed = beneficio.dcb ? parseDataFlexivel(beneficio.dcb, true) : null;

    let ultimoMes = 12;
    let ultimoAno = ano;
    if (dcbParsed && dcbParsed.ano === ano) {
        ultimoMes = dcbParsed.mes;
        ultimoAno = dcbParsed.ano;
    } else if (dcbParsed && dcbParsed.ano < ano) {
        return null; // benefício já cessou antes do ano
    }

    // Se a DIB é posterior ao último mês, não há competência
    if (dibParsed.ano > ultimoAno || (dibParsed.ano === ultimoAno && dibParsed.mes > ultimoMes)) {
        return null;
    }

    const competenciaAlvo = String(ultimoMes).padStart(2, '0') + '/' + ultimoAno;

    // ============================================================
    // USA A MESMA FUNÇÃO DA GUIA 4 PARA OBTER O VALOR DA COMPETÊNCIA
    // ============================================================
    // Isso garante que a base do 13º seja IDÊNTICA ao valor exibido
    // na coluna "Benefício Devido" ou "Benefício Recebido" da Guia 4
    // para aquela competência (ex: 12/2022).
    // obterValorIntegral está definida em diferencas.js (global).
    const base = window.obterValorIntegral ? window.obterValorIntegral(memoriaMensal, competenciaAlvo, beneficio.rmi, beneficio.rmaFinal) : (beneficio.rmi || 0);

    const valor13 = base * avos / 12;
    return {
        avos,
        base,
        valor: Math.round(valor13 * 100) / 100,
        competenciaBase: competenciaAlvo
    };
}
