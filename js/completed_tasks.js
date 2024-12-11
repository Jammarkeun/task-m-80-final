document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    const completedTaskList = document.getElementById('completedTaskList');

    // Load completed tasks
    loadCompletedTasks();

    function loadCompletedTasks() {
        fetch(`/api/tasks.php?user_id=${userId}&status=completed`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.records && data.records.length > 0) {
                    completedTaskList.innerHTML = ''; // Clear existing tasks
                    data.records.forEach(task => {
                        const taskElement = createTaskElement(task);
                        completedTaskList.appendChild(taskElement);
                    });
                } else {
                    completedTaskList.innerHTML = '<p>No completed tasks found.</p>';
                }
            })
            .catch(error => console.error('Error loading completed tasks:', error));
    }

    function createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-card';
        taskElement.innerHTML = `
            <div class="task-info">
                <h3 class="task-title">${task.title}</h3>
                <p class="task-description">${task.description}</p>
                <p>Completed on: ${task.completed_at}</p>
            </div>
        `;
        return taskElement;
    }
});