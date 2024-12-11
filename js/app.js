class App {
    constructor() {
        this.state = {
            currentPage: 'dashboard',
            user: JSON.parse(localStorage.getItem('user')) || null,
            theme: localStorage.getItem('theme') || 'light'
        };

        this.initializeApp();
    }

    async initializeApp() {
        this.initializeSidebar();
        this.initializeTheme();
        await this.loadContent(this.state.currentPage);
        this.setupEventListeners();
    }

    initializeSidebar() {
        document.querySelectorAll('.sidebar .nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('href').replace('#/', '');

                if (page === 'logout') {
                    this.handleLogout();
                    return;
                }

                this.updateActiveLink(link);
                this.loadContent(page);
                this.state.currentPage = page;
            });
        });
    }

    initializeTheme() {
        document.body.setAttribute('data-theme', this.state.theme);
    }

    // Modified App class loadContent method
    async loadContent(page) {
        try {
            const response = await fetch(`views/${page}.html`);
            if (!response.ok) throw new Error('Page not found');

            const content = await response.text();
            const mainContent = document.querySelector('.main-content');

            // Add fade-out effect before changing content
            mainContent.classList.add('fade-out');
            setTimeout(() => {
                mainContent.innerHTML = content;
                this.initializePageModules(page);
                mainContent.classList.remove('fade-out'); // Remove fade-out class
                mainContent.classList.add('fade-in'); // Add fade-in class

                // Update URL without page reload
                history.pushState(null, '', `#/${page}`);
            }, 300); // Duration of fade-out effect
        } catch (error) {
            console.error('Error loading page:', error);
            this.showErrorMessage('Failed to load page content');
        }
    }



    initializePageModules(page) {
        switch(page) {
            case 'dashboard':
                new DashboardController();
                break;
            case 'tasks':
                new TaskManager();
                break;
            case 'statistics':
                new StatisticsController();
                break;
            case 'profile':
                new ProfileController();
                break;
        }
    }

    updateActiveLink(clickedLink) {
        document.querySelectorAll('.sidebar .nav-link').forEach(link => {
            link.classList.remove('active');
        });
        clickedLink.classList.add('active');
    }

    handleLogout() {
        Auth.logout();
        window.location.href = 'login.html';
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.querySelector('.main-content').appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }

    setupEventListeners() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => {
            const page = location.hash.replace('#/', '') || 'dashboard';
            this.loadContent(page);
        });

        // Handle theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', this.state.theme);
            this.initializeTheme();
        });
    }
}

// Animation on document load
document.addEventListener("DOMContentLoaded", function () {
    document.body.classList.add("fade-in");
});
// Initialize the app when document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
