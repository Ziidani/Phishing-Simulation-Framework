document.addEventListener('DOMContentLoaded', function() {
    // Inicializar gráficos
    let activityChart, timelineChart;
    
    // Carregar dados
    loadDashboardData();
    
    // Configurar filtros
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterActivities(this.dataset.filter);
        });
    });
    
    function loadDashboardData() {
        const actions = JSON.parse(localStorage.getItem('phishing_actions') || '[]');
        
        // Atualizar estatísticas
        updateStats(actions);
        
        // Exibir atividades
        displayActivities(actions);
        
        // Criar gráficos
        createCharts(actions);
    }
    
    function updateStats(actions) {
        const totalClicks = actions.filter(a => a.type === 'link_click').length;
        const loginAttempts = actions.filter(a => a.type === 'login_attempt').length;
        const searchQueries = actions.filter(a => a.type === 'search_query').length;
        
        // Contar usuários únicos (simulado por user agent)
        const uniqueUserAgents = new Set(actions.map(a => a.userAgent));
        
        document.getElementById('total-clicks').textContent = totalClicks;
        document.getElementById('login-attempts').textContent = loginAttempts;
        document.getElementById('search-queries').textContent = searchQueries;
        document.getElementById('unique-users').textContent = uniqueUserAgents.size;
    }
    
    function displayActivities(actions, filter = 'all') {
        const container = document.getElementById('activities-container');
        
        if (actions.length === 0) {
            container.innerHTML = '<p>Nenhuma atividade registrada ainda.</p>';
            return;
        }
        
        // Ordenar por timestamp (mais recente primeiro)
        const sortedActions = [...actions].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
        
        // Filtrar se necessário
        const filteredActions = filter === 'all' 
            ? sortedActions 
            : sortedActions.filter(a => a.type === filter);
        
        if (filteredActions.length === 0) {
            container.innerHTML = '<p>Nenhuma atividade encontrada para este filtro.</p>';
            return;
        }
        
        let html = '';
        filteredActions.forEach(action => {
            const date = new Date(action.timestamp);
            const formattedDate = date.toLocaleString('pt-BR');
            
            let iconClass = '';
            let title = '';
            let description = '';
            
            switch (action.type) {
                case 'login_attempt':
                    iconClass = 'login';
                    title = 'Tentativa de Login';
                    description = `Email: ${action.data.email} | Senha: ${'*'.repeat(action.data.password.length)}`;
                    break;
                case 'link_click':
                    iconClass = 'click';
                    title = 'Clique em Link';
                    description = `Elemento: ${action.data.element} | URL: ${action.data.href}`;
                    break;
                case 'search_query':
                    iconClass = 'search';
                    title = 'Pesquisa Realizada';
                    description = `Consulta: "${action.data.query}"`;
                    break;
            }
            
            html += `
                <div class="activity-item">
                    <div class="activity-icon ${iconClass}">
                        <i class="fas fa-${action.type === 'login_attempt' ? 'key' : action.type === 'link_click' ? 'mouse-pointer' : 'search'}"></i>
                    </div>
                    <div class="activity-info">
                        <h4>${title}</h4>
                        <p>${description}</p>
                        <p><small>${formattedDate}</small></p>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    function filterActivities(filterType) {
        const actions = JSON.parse(localStorage.getItem('phishing_actions') || '[]');
        displayActivities(actions, filterType);
    }
    
    function createCharts(actions) {
        // Dados para o gráfico de distribuição
        const loginCount = actions.filter(a => a.type === 'login_attempt').length;
        const clickCount = actions.filter(a => a.type === 'link_click').length;
        const searchCount = actions.filter(a => a.type === 'search_query').length;
        
        // Configurar gráfico de pizza
        const activityCtx = document.getElementById('activityChart').getContext('2d');
        activityChart = new Chart(activityCtx, {
            type: 'pie',
            data: {
                labels: ['Tentativas de Login', 'Cliques em Links', 'Pesquisas'],
                datasets: [{
                    data: [loginCount, clickCount, searchCount],
                    backgroundColor: [
                        '#ea4335',
                        '#fbbc04',
                        '#34a853'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        
        // Dados para o gráfico de linha (atividades por hora)
        const now = new Date();
        const last24Hours = [];
        for (let i = 23; i >= 0; i--) {
            const time = new Date(now);
            time.setHours(now.getHours() - i);
            last24Hours.push(time);
        }
        
        const hourlyData = last24Hours.map(hour => {
            const hourStart = new Date(hour);
            hourStart.setMinutes(0, 0, 0);
            const hourEnd = new Date(hour);
            hourEnd.setMinutes(59, 59, 999);
            
            return actions.filter(a => {
                const actionTime = new Date(a.timestamp);
                return actionTime >= hourStart && actionTime <= hourEnd;
            }).length;
        });
        
        const timelineCtx = document.getElementById('timelineChart').getContext('2d');
        timelineChart = new Chart(timelineCtx, {
            type: 'line',
            data: {
                labels: last24Hours.map(h => h.getHours() + 'h'),
                datasets: [{
                    label: 'Atividades por Hora',
                    data: hourlyData,
                    borderColor: '#1a73e8',
                    backgroundColor: 'rgba(26, 115, 232, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
    
    // Atualizar a cada 30 segundos
    setInterval(loadDashboardData, 30000);
});