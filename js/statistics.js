document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');

    // Function to fetch and display total tasks
    function loadTotalTasks() {
        fetch(`/api/tasks.php?user_id=${userId}`)
            .then(response => response.json())
            .then(data => {
                const totalTasksContainer = document.getElementById('totalTasksContainer');
                totalTasksContainer.innerHTML = '';
                if (data.records && data.records.length > 0) {
                    data.records.forEach(task => {
                        totalTasksContainer.innerHTML += createTaskElement(task);
                    });
                } else {
                    totalTasksContainer.innerHTML = '<p>No tasks found.</p>';
                }
            })
            .catch(error => console.error('Error loading total tasks:', error));
    }

    // Function to fetch and display active tasks
    function loadActiveTasks() {
        fetch(`/api/tasks.php?user_id=${userId}&status=active`)
            .then(response => response.json())
            .then(data => {
                const activeTasksContainer = document.getElementById('activeTasksContainer');
                activeTasksContainer.innerHTML = '';
                if (data.records && data.records.length > 0) {
                    data.records.forEach(task => {
                        activeTasksContainer.innerHTML += createTaskElement(task);
                    });
                } else {
                    activeTasksContainer.innerHTML = '<p>No active tasks found.</p>';
                }
            })
            .catch(error => console.error('Error loading active tasks:', error));
    }

    // Function to fetch and display overdue tasks
    function loadOverdueTasks() {
        fetch(`/api/tasks.php?user_id=${userId}&status=overdue`)
            .then(response => response.json())
            .then(data => {
                const overdueTasksContainer = document.getElementById('overdueTasksContainer');
                overdueTasksContainer.innerHTML = '';
                if (data.records && data.records.length > 0) {
                    data.records.forEach(task => {
                        overdueTasksContainer.innerHTML += createTaskElement(task);
                    });
                } else {
                    overdueTasksContainer.innerHTML = '<p>No overdue tasks found.</p>';
                }
            })
            .catch(error => console.error('Error loading overdue tasks:', error));
    }

    // Function to create task element
    function createTaskElement(task) {
        return `
            <div class="task-card">
                <h3 class="task-title">${task.title}</h3>
                <p class="task-description">${task.description}</p>
                <div class="task-meta">
                    <span class="task-priority priority-${task.priority}">${task.priority}</span>
                    <span class="task-category">${task.category}</span>
                    <span class="task-date"><i class="far fa-calendar"></i> ${task.due_date.split('T')[0]}</span>
                </div>
            </div>
        `;
    }

    // Load tasks based on the current page
    if (document.getElementById('totalTasksContainer')) {
        loadTotalTasks();
    }
    if (document.getElementById('activeTasksContainer')) {
        loadActiveTasks();
    }
    if (document.getElementById('overdueTasksContainer')) {
        loadOverdueTasks();
    }
});
