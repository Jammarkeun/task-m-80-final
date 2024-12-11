class TaskStatusHandler {
    constructor() {
        this.setupEventListeners();
    }

    init() {
        this.addStatusButtons();
        this.loadTaskStatus();
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.addStatusButtons();
            this.loadTaskStatus();
        });
    }

    addStatusButtons() {
        const navLinks = document.querySelectorAll('.nav-link');
        const statusPages = ['task_completed', 'task_overdue', 'weekly_summary'];

        statusPages.forEach(page => {
            const button = document.createElement('a');
            button.href = `#${page}`;
            button.className = 'nav-link';
            button.innerHTML = `<i class="fas fa-file-alt"></i> ${this.formatPageName(page)}`;
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadTaskStatus(page);
            });
            
            const li = document.createElement('li');
            li.appendChild(button);
            
            navLinks[navLinks.length - 1].parentNode.insertBefore(li, navLinks[navLinks.length - 1]);
        });
    }

    formatPageName(pageName) {
        return pageName.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    async loadTaskStatus(statusType = 'weekly_summary') {
        const userId = localStorage.getItem('userId');
        try {
            const response = await fetch(`/api/get_task_status.php?user_id=${userId}&status_type=${statusType}`);
            const data = await response.json();

            if (response.ok) {
                this.displayTaskStatus(statusType, data);
            } else {
                console.error('Failed to load task status:', data.message);
            }
        } catch (error) {
            console.error('Error loading task status:', error);
        }
    }

    displayTaskStatus(statusType, data) {
        const contentArea = document.querySelector('.main-content');
        let html = '';

        switch (statusType) {
            case 'task_completed':
                html = this.renderCompletedTasks(data);
                break;
            case 'task_overdue':
                html = this.renderOverdueTasks(data);
                break;
            case 'weekly_summary':
                html = this.renderWeeklySummary(data);
                break;
        }

        contentArea.innerHTML = html;
    }

    renderCompletedTasks(tasks) {
        return `
            <h2>Completed Tasks</h2>
            <ul class="task-list">
                ${tasks.map(task => `
                    <li class="task-item">
                        <h3>${task.title}</h3>
                        <p>${task.description}</p>
                        <p>Completed on: ${new Date(task.completed_at).toLocaleDateString()}</p>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    renderOverdueTasks(tasks) {
        return `
            <h2>Overdue Tasks</h2>
            <ul class="task-list">
                ${tasks.map(task => `
                    <li class="task-item">
                        <h3>${task.title}</h3>
                        <p>${task.description}</p>
                        <p>Due date: ${new Date(task.due_date).toLocaleDateString()}</p>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    renderWeeklySummary(summary) {
        return `
            <h2>Weekly Summary</h2>
            <div class="summary-stats">
                <p>Total tasks: ${summary.total_tasks}</p>
                <p>Completed tasks: ${summary.completed_tasks}</p>
                <p>Overdue tasks: ${summary.overdue_tasks}</p>
                <p>Upcoming tasks: ${summary.upcoming_tasks}</p>
            </div>
        `;
    }
}