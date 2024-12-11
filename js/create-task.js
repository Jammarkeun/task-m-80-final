document.addEventListener('DOMContentLoaded', function() {
    const createTaskForm = document.getElementById('createTaskForm');
    const userId = localStorage.getItem('userId');

    createTaskForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;
        const dueDate = document.getElementById('dueDate').value;
        const priority = document.getElementById('priority').value;
        const category = document.getElementById('category').value;

        const taskData = {
            user_id: userId,
            title: title,
            description: description,
            due_date: dueDate,
            priority: priority,
            category: category,
            status: 'pending'
        };

        try {
            const response = await fetch('/api/tasks.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Task created successfully!');
                createTaskForm.reset();
                window.location.href = 'tasks.html'; // Redirect to tasks page
            } else {
                alert(data.message || 'Failed to create task. Please try again.');
            }
        } catch (error) {
            console.error('Task creation error:', error);
            alert('Failed to create task. Please check your connection and try again.');
        }
    });
});
