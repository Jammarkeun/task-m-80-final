document.addEventListener('DOMContentLoaded', async () => {
    const userId = localStorage.getItem('userId');

    if (!userId) {
        console.error('User ID not found in localStorage.');
        return;
    }

    try {
        const response = await fetch(`/api/tasks.php?user_id=${userId}`);
        const data = await response.json();

        if (response.ok) {
            const tasks = data.records;

            // Calculate statistics
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(task => task.status === 'completed').length;
            const activeTasks = tasks.filter(task => task.status === 'pending').length;
            const overdueTasks = tasks.filter(task => new Date(task.due_date) < new Date() && task.status !== 'completed').length;

            // Update the statistics on the dashboard
            document.getElementById('totalTasks').textContent = totalTasks;
            document.getElementById('completionRate').textContent = totalTasks > 0 ? `${((completedTasks / totalTasks) * 100).toFixed(2)}%` : '0%';
            document.getElementById('activeTasks').textContent = activeTasks;
            document.getElementById('overdueTasks').textContent = overdueTasks;
        } else {
            console.error('Failed to fetch tasks:', data.message);
            document.getElementById('totalTasks').textContent = '0';
            document.getElementById('completionRate').textContent = '0%';
            document.getElementById('activeTasks').textContent = '0';
            document.getElementById('overdueTasks').textContent = '0';
        }
    } catch (error) {
        console.error('Error fetching task statistics:', error);
        document.getElementById('totalTasks').textContent = '0';
        document.getElementById('completionRate').textContent = '0%';
        document.getElementById('activeTasks').textContent = '0';
        document.getElementById('overdueTasks').textContent = '0';
    }
});
