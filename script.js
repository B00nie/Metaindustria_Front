const MockAPI = {
    login: async (username, password) => {
        return new Promise((resolve) => {
            setTimeout(() => resolve({ success: true, token: "mock_jwt_token" }), 500);
        });
    },

    getDashboardStats: async () => {
        return {
            workersActive: 142,
            complianceRate: 94,
            alertsToday: 12
        };
    },

    getRealtimeLogs: async () => {
        return [
            { time: '10:45:02', area: 'Linha 1', status: 'OK', detail: 'EPIs completos' },
            { time: '10:42:15', area: 'Soldagem', status: 'ALERTA', detail: 'Falta Máscara de Solda' },
            { time: '10:40:00', area: 'Estoque', status: 'OK', detail: 'EPIs completos' }
        ];
    },

    getInventoryLogs: async () => {
        return [
            { datetime: '2023-10-24 09:30', workerId: 'MAT-105', sector: 'Soldagem', ppe: 'Luva de Raspa', action: 'Notificado' },
            { datetime: '2023-10-24 08:15', workerId: 'MAT-088', sector: 'Estoque', ppe: 'Capacete', action: 'Aviso Verbal' },
            { datetime: '2023-10-23 16:40', workerId: 'MAT-210', sector: 'Linha 1', ppe: 'Óculos', action: 'Resolvido' }
        ];
    }
};

function getCurrentPage() {
    return document.body ? document.body.dataset.page : '';
}

function setActiveNav() {
    const currentPage = getCurrentPage();
    document.querySelectorAll('.nav-item').forEach(item => {
        const targetPage = item.dataset.page;
        item.classList.toggle('active', targetPage === currentPage);
    });
}

function redirectTo(pageUrl) {
    window.location.href = pageUrl;
}

async function handleLogin(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.textContent = "Autenticando...";

    const response = await MockAPI.login("admin", "admin");

    if (response.success) {
        redirectTo('dashboard.html');
    }

    btn.textContent = "Entrar no Sistema";
}

function logout() {
    redirectTo('sistema_de_epis.html');
}

async function loadDashboardData() {
    const workersElement = document.getElementById('dash-workers');
    const complianceElement = document.getElementById('dash-compliance');
    const alertsElement = document.getElementById('dash-alerts');
    const tbody = document.getElementById('realtime-logs-table');

    if (!workersElement || !complianceElement || !alertsElement || !tbody) {
        return;
    }

    const stats = await MockAPI.getDashboardStats();
    workersElement.textContent = stats.workersActive;
    complianceElement.textContent = stats.complianceRate + '%';
    alertsElement.textContent = stats.alertsToday;

    const logs = await MockAPI.getRealtimeLogs();
    tbody.innerHTML = '';

    logs.forEach(log => {
        const tr = document.createElement('tr');
        const badgeClass = log.status === 'OK' ? 'status-ok' : 'status-alert';
        tr.innerHTML = `
            <td>${log.time}</td>
            <td>${log.area}</td>
            <td><span class="status-badge ${badgeClass}">${log.status}</span></td>
            <td>${log.detail}</td>
        `;
        tbody.appendChild(tr);
    });
}

async function loadInventoryData() {
    const tbody = document.getElementById('inventory-table');
    if (!tbody) {
        return;
    }

    const logs = await MockAPI.getInventoryLogs();
    tbody.innerHTML = '';

    logs.forEach(log => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${log.datetime}</td>
            <td>${log.workerId}</td>
            <td>${log.sector}</td>
            <td style="color: #dc3545;">${log.ppe}</td>
            <td>${log.action}</td>
        `;
        tbody.appendChild(tr);
    });
}

function openModal() {
    const modal = document.getElementById('inventory-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal() {
    const modal = document.getElementById('inventory-modal');
    modal.classList.remove('active');
    const form = document.getElementById('form-manual-entry');
    if (form) {
        form.reset();
    }
}

function submitManualEntry(e) {
    e.preventDefault();
    alert("Mock: Registro inserido com sucesso!");
    closeModal();
    loadInventoryData();
}

window.onclick = function(event) {
    const modal = document.getElementById('inventory-modal');
    if (event.target == modal) {
        closeModal();
    }
}

function toggleTheme() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) {
        return;
    }

    const isDark = toggle.checked;
    if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
    }
}

function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.checked = true;
        }
    }
}

function initializePage() {
    applySavedTheme();
    setActiveNav();

    const currentPage = getCurrentPage();
    if (currentPage === 'dashboard') {
        loadDashboardData();
    }

    if (currentPage === 'inventory') {
        loadInventoryData();
    }
}

document.addEventListener('DOMContentLoaded', initializePage);