// =====================================================================
// RELATÓRIOS – ALTERAÇÕES MANUAIS (Fase 1.7C2)
// =====================================================================

// =====================================================================
// FUNÇÕES AUXILIARES (consomem dados de diferencas.js)
// =====================================================================

function obterCompetenciasModificadasRelatorio() {
    // Esta função já existe em diferencas.js, mas se não estiver disponível globalmente, a implementamos aqui.
    if (typeof window.obterCompetenciasModificadas === 'function') {
        return window.obterCompetenciasModificadas();
    }
    // Fallback local (caso não esteja disponível)
    const competencias = new Set();
    for (const chave of Object.keys(dadosDiferencas.celulasEditadas)) {
        let comp;
        if (chave.startsWith('devido|')) {
            comp = chave.split('|')[1];
        } else {
            comp = chave.split('|')[0];
        }
        if (comp) competencias.add(comp);
    }
    return Array.from(competencias).sort((a, b) => {
        const [mesA, anoA] = a.split('/').map(Number);
        const [mesB, anoB] = b.split('/').map(Number);
        return (anoA * 12 + mesA) - (anoB * 12 + mesB);
    });
}

function obterValorOriginalDevido(comp) {
    // Recalcula o valor original do Benefício Devido para a competência
    const mes = parseInt(comp.split('/')[0], 10);
    const ano = parseInt(comp.split('/')[1], 10);
    const fracao = window.obterFracaoDevida ? window.obterFracaoDevida(mes, ano) : 1;
    const memoriaDevida = window.memoriaEvolucaoDevida || [];
    const rmiDevida = parseFloat(document.getElementById('rmi').value.replace(/\./g, '').replace(',', '.')) || 0;
    const valorIntegral = window.obterValorIntegral ? window.obterValorIntegral(memoriaDevida, comp, rmiDevida) : 0;
    return Math.round(valorIntegral * fracao * 100) / 100;
}

function obterValorOriginalRecebido(comp, benId) {
    // Recalcula o valor original do Benefício Recebido para a competência
    const mes = parseInt(comp.split('/')[0], 10);
    const ano = parseInt(comp.split('/')[1], 10);
    const beneficios = window.coletarBeneficiosRecebidosSimplificado ? window.coletarBeneficiosRecebidosSimplificado() : [];
    const ben = beneficios.find(b => b.id === benId);
    if (!ben) return 0;
    const fracao = window.obterFracaoRecebida ? window.obterFracaoRecebida(mes, ano, ben) : 1;
    const valorIntegral = window.obterValorIntegral ? window.obterValorIntegral(ben.memoria, comp, ben.rmi, ben.rmaFinal) : 0;
    return Math.round(valorIntegral * fracao * 100) / 100;
}

function formatarMoedaRelatorio(valor) {
    return 'R$ ' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// =====================================================================
// GERAR RELATÓRIO
// =====================================================================

function gerarRelatorio(tipo) {
    const competencias = obterCompetenciasModificadasRelatorio();
    if (competencias.length === 0) {
        return '<p class="text-slate-400 text-center py-4">Nenhuma alteração manual encontrada.</p>';
    }

    const linhas = [];
    let countExternas = 0;
    let countInternas = 0;

    competencias.forEach(comp => {
        const just = dadosDiferencas.justificativas[comp];
        const justTexto = just && typeof just === 'object' ? just.texto : (typeof just === 'string' ? just : null);
        const incluirRel = just && typeof just === 'object' ? just.incluirNoRelatorio : false;

        // Filtro para relatório externo: só inclui se houver justificativa externa
        if (tipo === 'externo' && !incluirRel) return;

        const temJustificativaExterna = incluirRel && justTexto && justTexto.trim() !== '';

        if (temJustificativaExterna) countExternas++;
        else if (justTexto && justTexto.trim() !== '') countInternas++;

        // --- Benefício Devido ---
        const chaveDevido = 'devido|' + comp;
        const valorEditado = dadosDiferencas.celulasEditadas[chaveDevido];
        if (valorEditado !== undefined) {
            const valorOriginal = obterValorOriginalDevido(comp);
            const status = (tipo === 'interno') ? (temJustificativaExterna ? 'EXTERNO' : 'INTERNO') : '';
            linhas.push({
                comp,
                campo: 'Benefício Devido',
                valorOriginal,
                valorEditado,
                justificativa: justTexto || 'Justificativa não informada.',
                status,
                incluirRel
            });
        }

        // --- Benefícios Recebidos ---
        for (const chave of Object.keys(dadosDiferencas.celulasEditadas)) {
            if (chave.startsWith(comp + '|')) {
                const benId = chave.split('|')[1];
                const valorEditado = dadosDiferencas.celulasEditadas[chave];
                const valorOriginal = obterValorOriginalRecebido(comp, benId);
                // Buscar identificador do benefício (NB)
                const beneficios = window.coletarBeneficiosRecebidosSimplificado ? window.coletarBeneficiosRecebidosSimplificado() : [];
                const ben = beneficios.find(b => b.id === benId);
                const nomeBen = ben ? ('NB ' + ben.nb) : ('Benefício ' + benId);
                const status = (tipo === 'interno') ? (temJustificativaExterna ? 'EXTERNO' : 'INTERNO') : '';
                linhas.push({
                    comp,
                    campo: nomeBen,
                    valorOriginal,
                    valorEditado,
                    justificativa: justTexto || 'Justificativa não informada.',
                    status,
                    incluirRel
                });
            }
        }
    });

    // Se não houver linhas para exibir (externo sem justificativas)
    if (linhas.length === 0) {
        return '<p class="text-slate-400 text-center py-4">Nenhuma alteração com justificativa para relatório externo foi encontrada.</p>';
    }

    // Ordenar por competência
    linhas.sort((a, b) => {
        const [mesA, anoA] = a.comp.split('/').map(Number);
        const [mesB, anoB] = b.comp.split('/').map(Number);
        return (anoA * 12 + mesA) - (anoB * 12 + mesB);
    });

    // Construir HTML
    let html = '';
    let currentComp = '';
    linhas.forEach(item => {
        if (item.comp !== currentComp) {
            if (currentComp !== '') html += '<div class="relatorio-separador"></div>';
            currentComp = item.comp;
            html += `<div class="relatorio-item"><div class="font-bold text-slate-800">COMPETÊNCIA: ${item.comp}</div>`;
        }
        html += `
            <div class="ml-4 mt-2">
                <div><span class="campo">Campo Alterado:</span> ${item.campo}</div>
                <div><span class="campo">Valor Original Calculado:</span> ${formatarMoedaRelatorio(item.valorOriginal)}</div>
                <div><span class="campo">Valor Utilizado:</span> ${formatarMoedaRelatorio(item.valorEditado)}</div>
                <div><span class="campo">Justificativa:</span> ${item.justificativa}</div>
        `;
        if (tipo === 'interno') {
            const statusClass = item.status === 'EXTERNO' ? 'status-externo' : 'status-interno';
            html += `<div><span class="campo">Status:</span> <span class="${statusClass}">${item.status}</span></div>`;
        }
        html += `</div>`;
    });
    html += `</div>`; // fecha último item

    // Atualizar resumo
    atualizarResumoRelatorio(competencias, countExternas, countInternas);

    return html;
}

// =====================================================================
// RESUMO DAS ALTERAÇÕES
// =====================================================================

function atualizarResumoRelatorio(competencias, externas, internas) {
    const resumoDiv = document.getElementById('resumoRelatorio');
    if (!resumoDiv) return;
    if (competencias.length === 0) {
        resumoDiv.classList.add('hidden');
        return;
    }
    resumoDiv.classList.remove('hidden');
    document.getElementById('resumoCompetencias').textContent = competencias.length;
    document.getElementById('resumoExternas').textContent = externas;
    document.getElementById('resumoInternas').textContent = internas;
}

// =====================================================================
// EXIBIR RELATÓRIO NO PREVIEW
// =====================================================================

function exibirRelatorio() {
    const tipoRadio = document.querySelector('input[name="tipoRelatorio"]:checked');
    const tipo = tipoRadio ? tipoRadio.value : 'interno';
    const preview = document.getElementById('previewRelatorio');
    if (!preview) return;

    const html = gerarRelatorio(tipo);
    preview.innerHTML = html;
}

function imprimirRelatorio() {
    window.print();
}

// =====================================================================
// INICIALIZAÇÃO (substitui a função placeholder anterior)
// =====================================================================

// Esta função será chamada pelo DOMContentLoaded em app.js, se existir.
// Caso contrário, manteremos a função vazia ou apenas configuramos eventos.

function initRelatorios() {
    // Configurar eventos da Guia 7 (já estão nos botões inline)
    // Nada mais necessário.
}

// Para compatibilidade, manter a função antiga como alias
function visualizarRelatorio() {
    exibirRelatorio();
}

function gerarRelatorioCompleto() {
    exibirRelatorio();
}