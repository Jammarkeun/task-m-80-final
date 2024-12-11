document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    const taskList = document.getElementById('taskList');
    const notificationHandler = new NotificationHandler(); // Initialize NotificationHandler

    // Load existing tasks
    loadTasks();

    function loadTasks(status = '') {
        const url = status ? `/api/tasks.php?user_id=${userId}&status=${status}` : `/api/tasks.php?user_id=${userId}`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.records && data.records.length > 0) {
                    taskList.innerHTML = ''; // Clear existing tasks
                    data.records.forEach(task => {
                        const taskElement = createTaskElement(task);
                        taskList.appendChild(taskElement);
                    });
                } else {
                    taskList.innerHTML = '<p>No tasks found.</p>';
                }
            })
            .catch(error => console.error('Error loading tasks:', error));
    }

    function createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-card';
        const isCompleted = task.status === 'completed';
        const titleClass = isCompleted ? 'task-title done' : 'task-title';
        taskElement.innerHTML = `
            <div class="task-info">
                <h3 class="${titleClass}">${task.title}</h3>
                <p class="task-description">${task.description}</p>
                <div class="task-meta">
                    <span class="task-priority priority-${task.priority.toLowerCase()}">${task.priority}</span>
                    <span class="task-category">${task.category || 'Uncategorized'}</span>
                    <span class="task-date"><i class="far fa-calendar"></i> ${task.due_date.split('T')[0]}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="task-action-btn edit-btn" data-id="${task.id}"><i class="fas fa-edit"></i></button>
                <button class="task-action-btn delete-btn" data-id="${task.id}"><i class="fas fa-trash"></i></button>
                <button class="task-action-btn done-btn" data-id="${task.id}" data-title="${task.title}">Done</button>
            </div>
            <div class="edit-form" style="display: none;">
                <input type="text" class="edit-title" value="${task.title}" />
                <textarea class="edit-description">${task.description}</textarea>
                <select class="edit-category">
                    <option value="work" ${task.category === 'work' ? 'selected' : ''}>Work</option>
                    <option value="personal" ${task.category === 'personal' ? 'selected' : ''}>Personal</option>
                    <option value="study" ${task.category === 'study' ? 'selected' : ''}>Study</option>
                    <option value="other" ${task.category === 'other' ? 'selected' : ''}>Other</option>
                </select>
                <button class="save-btn" data-id="${task.id}">Save</button>
                <button class="cancel-btn">Cancel</button>
            </div>
        `;

        // Add event listeners for edit, delete, and done buttons
        taskElement.querySelector('.edit-btn').addEventListener('click', () => {
            const editForm = taskElement.querySelector('.edit-form');
            editForm.style.display = editForm.style.display === 'none' ? 'block' : 'none';
        });

        taskElement.querySelector('.save-btn').addEventListener('click', () => {
            const editTitle = taskElement.querySelector('.edit-title').value;
            const editDescription = taskElement.querySelector('.edit-description').value;
            const editCategory = taskElement.querySelector('.edit-category').value;
            const taskId = taskElement.querySelector('.save-btn').getAttribute('data-id');
            updateTask(taskId, editTitle, editDescription, editCategory);
        });

        taskElement.querySelector('.done-btn').addEventListener('click', () => {
            const taskId = taskElement.querySelector('.done-btn').getAttribute('data-id');
            const taskTitle = taskElement.querySelector('.done-btn').getAttribute('data-title');
            if (confirm(`Are you sure you want to complete this task: "${taskTitle}"?`)) {
                markTaskAsDone(taskId, taskElement);
            }
        });

        taskElement.querySelector('.delete-btn').addEventListener('click', () => {
            deleteTask(task.id);
        });

        return taskElement;
    }

    function updateTask(taskId, title, description, category) {
        const dueDate = document.querySelector('.edit-due-date').value; // Assuming you have an input for due date

        fetch('/api/tasks.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: taskId, title: title, description: description, due_date: dueDate, category: category })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Task updated:', data);
            loadTasks(); // Reload tasks after updating
        })
        .catch(error => console.error('Error updating task:', error));
    }

    function markTaskAsDone(taskId, taskElement) {
        const completionDate = new Date().toISOString();
    
        fetch('/api/tasks.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: taskId, status: 'completed', completed_at: completionDate }),
        })
        .then(response => {
            if (!response.ok) {
                // If the response is not OK, throw an error with the status
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }
            return response.json(); // Parse JSON response
        })
        .then(data => {
            if (data.message && data.message === "Task updated successfully.") {
                console.log('Task marked as done:', data.message);
                
                // Add 'done' class to the task title and disable the done button
                const taskTitle = taskElement.querySelector('.task-title');
                taskTitle.classList.add('done');
                
                const doneButton = taskElement.querySelector('.done-btn');
                doneButton.disabled = true;
                doneButton.innerText = 'Completed';
            } else {
                console.error('Error in response:', data);
            }
        })
        .catch(error => {
            // Log the error for debugging
            console.error('Error marking task as done:', error);
            alert('An error occurred while marking the task as done. Please try again.');
        });
    }
    

    function deleteTask(taskId) {
        fetch('/api/tasks.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: taskId })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Task deleted:', data);
            loadTasks();
        })
        .catch(error => console.error('Error deleting task:', error));
    }

    function updateCompletionRate() {
        fetch(`/api/tasks.php?user_id=${userId}`)
            .then(response => response.json())
            .then(data => {
                const totalTasks = data.records.length;
                const completedTasks = data.records.filter(task => task.status === 'completed').length;
                const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
                document.getElementById('completionRate').innerText = `${completionRate.toFixed(2)}%`;
            })
            .catch(error => console.error('Error updating completion rate:', error));
    }
});
