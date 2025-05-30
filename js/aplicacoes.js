// Inicialização dos arrays no localStorage
let aplicacoes = JSON.parse(localStorage.getItem('aplicacoes')) || [];
let medicamentos = JSON.parse(localStorage.getItem('medicamentos')) || [];
let pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];

// Debug: Log the initial state
console.log('Aplicações:', aplicacoes);
console.log('Medicamentos:', medicamentos);
console.log('Pacientes:', pacientes);

// Função para salvar aplicações no localStorage
function salvarAplicacoes() {
    localStorage.setItem('aplicacoes', JSON.stringify(aplicacoes));
}

// Função para adicionar nova aplicação
function adicionarAplicacao(event) {
    event.preventDefault();
    
    const form = event.target;
    const novaAplicacao = {
        id: Date.now(),
        pacienteId: parseInt(form.paciente.value),
        medicamento: parseInt(form.medicamento.value),
        dosagem: form.dosagem.value,
        unidade: form.unidade.value,
        data: form.data.value,
        hora: form.hora.value,
        responsavel: form.responsavel.value,
        observacoes: form.observacoes.value,
        status: 'Pendente'
    };

    // Atualiza o estoque do medicamento
    const medicamento = medicamentos.find(med => med.id === parseInt(form.medicamento.value));
    if (medicamento) {
        medicamento.quantidade -= parseFloat(form.dosagem.value);
        medicamento.status = medicamento.quantidade <= 50 ? 'Estoque Baixo' : 'Normal';
        localStorage.setItem('medicamentos', JSON.stringify(medicamentos));
    }

    aplicacoes.push(novaAplicacao);
    salvarAplicacoes();
    window.location.href = 'aplicacoes.html';
}

// Função para excluir aplicação
function excluirAplicacao(id) {
    if (confirm('Tem certeza que deseja excluir esta aplicação?')) {
        aplicacoes = aplicacoes.filter(apl => apl.id !== id);
        salvarAplicacoes();
        renderizarTabela();
    }
}

// Função para marcar aplicação como concluída
function concluirAplicacao(id) {
    const aplicacao = aplicacoes.find(apl => apl.id === id);
    if (aplicacao) {
        aplicacao.status = 'Concluído';
        salvarAplicacoes();
        renderizarTabela();
    }
}

// Função para renderizar a tabela de aplicações
function renderizarTabela() {
    const tbody = document.querySelector('#tabela-aplicacoes tbody');
    if (!tbody) return;

    tbody.innerHTML = aplicacoes.map(apl => {
        const medicamento = medicamentos.find(med => med.id === apl.medicamento);
        const medicamentoNome = medicamento ? medicamento.nome : 'Medicamento não encontrado';
        
        const paciente = pacientes.find(pac => pac.id === apl.pacienteId);
        const pacienteNome = paciente ? paciente.nome : 'Paciente não encontrado';
        
        return `
        <tr>
            <td>${pacienteNome}</td>
            <td>${medicamentoNome}</td>
            <td>${apl.dosagem}${apl.unidade}</td>
            <td>${new Date(apl.data + 'T' + apl.hora).toLocaleString('pt-BR')}</td>
            <td>${apl.responsavel}</td>
            <td><span class="status ${apl.status === 'Concluído' ? 'success' : 'warning'}">${apl.status}</span></td>
            <td class="actions">
                ${apl.status !== 'Concluído' ? `
                <button onclick="concluirAplicacao(${apl.id})" class="action-btn edit" aria-label="Concluir">
                    <svg viewBox="0 0 24 24">
                        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                    </svg>
                </button>
                ` : ''}
                <button onclick="excluirAplicacao(${apl.id})" class="action-btn delete" aria-label="Remover">
                    <svg viewBox="0 0 24 24">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                </button>
            </td>
        </tr>
    `}).join('');
}

// Função para carregar pacientes no select
function carregarPacientes() {
    const select = document.getElementById('paciente');
    if (!select) return;

    select.innerHTML = `
        <option value="">Selecione um paciente</option>
        ${pacientes.map(pac => `
            <option value="${pac.id}">${pac.nome} (${pac.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')})</option>
        `).join('')}
    `;
}

// Função para carregar medicamentos no select
function carregarMedicamentos() {
    const select = document.getElementById('medicamento');
    if (!select) return;

    select.innerHTML = `
        <option value="">Selecione um medicamento</option>
        ${medicamentos.map(med => `
            <option value="${med.id}">${med.nome} - ${med.dosagem}${med.unidade} (Estoque: ${med.quantidade})</option>
        `).join('')}
    `;
}

// Função para carregar dados do medicamento selecionado
function carregarDadosMedicamento() {
    const medicamentoSelect = document.getElementById('medicamento');
    const dosagemInput = document.getElementById('dosagem');
    const unidadeSelect = document.getElementById('unidade');
    
    if (medicamentoSelect && dosagemInput && unidadeSelect) {
        medicamentoSelect.addEventListener('change', function() {
            const medicamento = medicamentos.find(med => med.id === parseInt(this.value));
            if (medicamento) {
                dosagemInput.value = medicamento.dosagem;
                unidadeSelect.value = medicamento.unidade;
            }
        });
    }
}

// Inicialização das páginas
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    const form = document.querySelector('form');
    console.log('Form found:', form);
    
    if (form) {
        console.log('Loading medications...');
        carregarPacientes();
        carregarMedicamentos();
        carregarDadosMedicamento();
        form.onsubmit = adicionarAplicacao;
    }
    
    renderizarTabela();
}); 