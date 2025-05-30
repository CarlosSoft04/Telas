// Inicialização do array de medicamentos no localStorage
let medicamentos = JSON.parse(localStorage.getItem('medicamentos')) || [];

// Função para salvar medicamentos no localStorage
function salvarMedicamentos() {
    localStorage.setItem('medicamentos', JSON.stringify(medicamentos));
}

// Função para adicionar novo medicamento
function adicionarMedicamento(event) {
    event.preventDefault();
    
    const form = event.target;
    const novoMedicamento = {
        id: Date.now(),
        nome: form.nome.value,
        dosagem: form.dosagem.value,
        unidade: form.unidade.value,
        fabricante: form.fabricante.value,
        lote: form.lote.value,
        quantidade: parseInt(form.quantidade.value),
        validade: form.validade.value,
        observacoes: form.observacoes.value,
        status: parseInt(form.quantidade.value) <= 50 ? 'Estoque Baixo' : 'Normal'
    };

    medicamentos.push(novoMedicamento);
    salvarMedicamentos();
    window.location.href = 'medicamentos.html';
}

// Função para excluir medicamento
function excluirMedicamento(id) {
    if (confirm('Tem certeza que deseja excluir este medicamento?')) {
        medicamentos = medicamentos.filter(med => med.id !== id);
        salvarMedicamentos();
        renderizarTabela();
    }
}

// Função para editar medicamento
function editarMedicamento(id) {
    const medicamento = medicamentos.find(med => med.id === id);
    if (medicamento) {
        localStorage.setItem('editando', JSON.stringify(medicamento));
        window.location.href = 'adicionar.html';
    }
}

// Função para atualizar medicamento
function atualizarMedicamento(event) {
    event.preventDefault();
    
    const form = event.target;
    const editandoId = JSON.parse(localStorage.getItem('editando')).id;
    
    const medicamentoAtualizado = {
        id: editandoId,
        nome: form.nome.value,
        dosagem: form.dosagem.value,
        unidade: form.unidade.value,
        fabricante: form.fabricante.value,
        lote: form.lote.value,
        quantidade: parseInt(form.quantidade.value),
        validade: form.validade.value,
        observacoes: form.observacoes.value,
        status: parseInt(form.quantidade.value) <= 50 ? 'Estoque Baixo' : 'Normal'
    };

    const index = medicamentos.findIndex(med => med.id === editandoId);
    medicamentos[index] = medicamentoAtualizado;
    
    salvarMedicamentos();
    localStorage.removeItem('editando');
    window.location.href = 'medicamentos.html';
}

// Função para renderizar a tabela de medicamentos
function renderizarTabela() {
    const tbody = document.querySelector('#tabela-medicamentos tbody');
    if (!tbody) return;

    tbody.innerHTML = medicamentos.map(med => `
        <tr>
            <td>${med.nome}</td>
            <td>${med.dosagem}${med.unidade}</td>
            <td>${med.fabricante}</td>
            <td>${med.lote}</td>
            <td>${med.quantidade}</td>
            <td>${new Date(med.validade).toLocaleDateString('pt-BR')}</td>
            <td><span class="status ${med.status === 'Normal' ? 'success' : 'warning'}">${med.status}</span></td>
            <td class="actions">
                <button onclick="editarMedicamento(${med.id})" class="action-btn edit" aria-label="Editar">
                    <svg viewBox="0 0 24 24">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                </button>
                <button onclick="excluirMedicamento(${med.id})" class="action-btn delete" aria-label="Remover">
                    <svg viewBox="0 0 24 24">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                </button>
            </td>
        </tr>
    `).join('');
}

// Função para carregar dados para edição
function carregarDadosEdicao() {
    const editando = localStorage.getItem('editando');
    if (editando) {
        const medicamento = JSON.parse(editando);
        const form = document.querySelector('form');
        if (form) {
            form.nome.value = medicamento.nome;
            form.dosagem.value = medicamento.dosagem;
            form.unidade.value = medicamento.unidade;
            form.fabricante.value = medicamento.fabricante;
            form.lote.value = medicamento.lote;
            form.quantidade.value = medicamento.quantidade;
            form.validade.value = medicamento.validade;
            if (medicamento.observacoes) {
                form.observacoes.value = medicamento.observacoes;
            }
            
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'Atualizar Medicamento';
            }
            
            form.onsubmit = atualizarMedicamento;
        }
    }
}

// Inicialização das páginas
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    if (form) {
        carregarDadosEdicao();
        if (!localStorage.getItem('editando')) {
            form.onsubmit = adicionarMedicamento;
        }
    }
    
    renderizarTabela();
}); 