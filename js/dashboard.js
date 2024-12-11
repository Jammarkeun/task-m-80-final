document.addEventListener('DOMContentLoaded', function() {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('fullname');

    // Display user name
    const userNameElement = document.getElementById('userName');
    if (userNameElement && userName) {
        userNameElement.textContent = `Welcome, ${userName}!`;
    }

    // Load dashboard summary
    loadDashboardSummary();

    async function loadDashboardSummary() {
        try {
            const response = await fetch(`/api/get_task_status.php?user_id=${userId}&status_type=weekly_summary`);
            const data = await response.json();

            if (response.ok) {
                displayDashboardSummary(data);
            } else {
                console.error('Failed to load dashboard summary:', data.message);
            }
        } catch (error) {
            console.error('Error loading dashboard summary:', error);
        }
    }

    function displayDashboardSummary(summary) {
        const summaryContainer = document.getElementById('dashboardSummary');
        if (summaryContainer) {
            summaryContainer.innerHTML = `
                <h2>Weekly Summary</h2>
                <div class="summary-stats">
                    <div class="stat-item">
                        <span class="stat-value">${summary.total_tasks}</span>
                        <span class="stat-label">Total Tasks</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${summary.completed_tasks}</span>
                        <span class="stat-label">Completed</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${summary.overdue_tasks}</span>
                        <span class="stat-label">Overdue</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${summary.upcoming_tasks}</span>
                        <span class="stat-label">Upcoming</span>
                    </div>
                </div>
            `;
        }
    }

    // Load recent tasks
    loadRecentTasks();

    async function loadRecentTasks() {
        try {
            const response = await fetch(`/api/tasks.php?user_id=${userId}&limit=5`);
            const data = await response.json();

            if (response.ok) {
                displayRecentTasks(data.records);
            } else {
                console.error('Failed to load recent tasks:', data.message);
            }
        } catch (error) {
            console.error('Error loading recent tasks:', error);
        }
    }

    function displayRecentTasks(tasks) {
        const recentTasksContainer = document.getElementById('recentTasks');
        if (recentTasksContainer) {
            const tasksList = tasks.map(task => `
                <li class="task-item">
                    <h3>${task.title}</h3>
                    <p>${task.description}</p>
                    <p>Due: ${new Date(task.due_date).toLocaleDateString()}</p>
                    <p>Status: ${task.status}</p>
                </li>
            `).join('');

            recentTasksContainer.innerHTML = `
                <h2>Recent Tasks</h2>
                <ul class="tasks-list">
                    ${tasksList}
                </ul>
            `;
        }
    }
});