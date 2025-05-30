// API endpoints
const API_URL = 'http://localhost:3000/api';

// DOM Elements
const medicationsList = document.querySelector('.medications-table tbody');
const searchInput = document.querySelector('.search-box input');
const exportBtn = document.querySelector('.export-btn');

// Load initial data
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    loadMedications();
});

// Load dashboard statistics
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/medications/stats`);
        const stats = await response.json();
        
        document.querySelector('.total-stock .number').textContent = stats.total;
        document.querySelector('.low-stock .number').textContent = stats.lowStock;
        document.querySelector('.expiring .number').textContent = stats.expiring;
    } catch (error) {
        showNotification('Erro ao carregar estatísticas', 'error');
    }
}

// Load medications list
async function loadMedications() {
    try {
        const response = await fetch(`${API_URL}/medications`);
        const medications = await response.json();
        
        medicationsList.innerHTML = '';
        medications.forEach(medication => {
            const row = createMedicationRow(medication);
            medicationsList.appendChild(row);
        });
    } catch (error) {
        showNotification('Erro ao carregar medicamentos', 'error');
    }
}

// Create table row for medication
function createMedicationRow(medication) {
    const tr = document.createElement('tr');
    
    const expiryDate = new Date(medication.expiry_date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    let status = 'success';
    let statusText = 'Normal';
    
    if (medication.quantity < 5) {
        status = 'warning';
        statusText = 'Estoque Baixo';
    }
    if (daysUntilExpiry <= 30) {
        status = 'danger';
        statusText = 'Próximo da Validade';
    }

    tr.innerHTML = `
        <td>${medication.name}</td>
        <td>${medication.dosage}</td>
        <td>${medication.quantity}</td>
        <td>${formatDate(medication.expiry_date)}</td>
        <td><span class="status ${status}">${statusText}</span></td>
        <td>
            <button class="action-btn edit" aria-label="Editar" onclick="editMedication(${medication.id})">
                <svg viewBox="0 0 24 24">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
            </button>
            <button class="action-btn delete" aria-label="Remover" onclick="deleteMedication(${medication.id})">
                <svg viewBox="0 0 24 24">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
            </button>
        </td>
    `;
    
    return tr;
}

// Delete medication
async function deleteMedication(id) {
    if (!confirm('Tem certeza que deseja remover este medicamento?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/medications/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('Medicamento removido com sucesso');
            loadMedications();
            loadStats();
        } else {
            throw new Error('Erro ao remover medicamento');
        }
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Search functionality
searchInput.addEventListener('input', debounce(async (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const rows = medicationsList.querySelectorAll('tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}, 300));

// Export functionality
exportBtn.addEventListener('click', async () => {
    try {
        const response = await fetch(`${API_URL}/medications`);
        const medications = await response.json();
        
        const csv = [
            ['Nome', 'Dosagem', 'Quantidade', 'Validade', 'Fabricante', 'Observações'],
            ...medications.map(med => [
                med.name,
                med.dosage,
                med.quantity,
                formatDate(med.expiry_date),
                med.manufacturer || '',
                med.notes || ''
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `medicamentos_${formatDate(new Date())}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        showNotification('Erro ao exportar dados', 'error');
    }
});

// Utility functions
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showNotification(message, type = 'success') {
    // Implementar sistema de notificação aqui
    alert(message);
} 