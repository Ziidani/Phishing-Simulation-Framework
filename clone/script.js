document.addEventListener('DOMContentLoaded', function() {
    // Formulário de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Registrar tentativa de login (fake)
            registerAction('login_attempt', { email, password });
            
            // Mostrar mensagem educativa
            alert('Esta é uma simulação educacional de phishing!\n\nNunca digite suas credenciais em sites suspeitos.\nVerifique sempre a URL e o certificado de segurança do site.');
        });
    }
    
    // Formulário de pesquisa
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            registerAction('search_query', { 
                query: this.querySelector('input').value 
            });
            alert('Simulação: pesquisa registrada (fins educacionais)');
        });
    }
    
    // Registrar cliques em links importantes
    const importantLinks = document.querySelectorAll('a, button');
    importantLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const linkText = this.textContent.trim() || this.querySelector('i')?.className || 'Link';
            registerAction('link_click', { 
                element: linkText,
                href: this.getAttribute('href') || 'javascript:void(0)'
            });
        });
    });
    
    // Função para registrar ações (simulação)
    function registerAction(type, data) {
        // Em um cenário real, isso enviaria os dados para um servidor
        console.log('Ação registrada:', type, data);
        
        // Armazenar localmente para o dashboard acessar
        let actions = JSON.parse(localStorage.getItem('phishing_actions') || '[]');
        actions.push({
            type,
            data,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        });
        localStorage.setItem('phishing_actions', JSON.stringify(actions));
    }
});