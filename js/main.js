// main.js

document.addEventListener('DOMContentLoaded', function() {
    // Check if TaskStatusHandler is defined
    if (typeof TaskStatusHandler === 'undefined') {
        console.error('TaskStatusHandler is not defined');
        return;
    }

    const taskStatusHandler = new TaskStatusHandler();
    const notificationHandler = new NotificationHandler(); // Initialize NotificationHandler
    taskStatusHandler.init();

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('userId');
            localStorage.removeItem('fullname');
            localStorage.removeItem('profileImage'); // Clear profile image on logout
            window.location.href = 'login.html';
        });
    }

    // Check if user is logged in
    const userId = localStorage.getItem('userId');
    if (!userId) {
        window.location.href = 'login.html';
    }

    // Display user's name
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        const fullname = localStorage.getItem('fullname');
        userNameElement.textContent = fullname;
    }

    // Display user's profile picture in the dashboard
    const dashboardProfileImage = document.getElementById('dashboardProfileImage');
    const storedProfileImage = localStorage.getItem('profileImage');
    if (dashboardProfileImage && storedProfileImage) {
        const img = dashboardProfileImage.querySelector('img');
        img.src = storedProfileImage; // Set the profile image source
    }

    // Task form handling
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
        taskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(taskForm);
            formData.append('user_id', userId);

            try {
                const response = await fetch('/api/tasks.php', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();

                if (data.success) {
                    alert('Task created successfully');
                    notificationHandler.sendNotification(`HEY ${localStorage.getItem('fullname')}! YOU HAVE A NEW TASK: ${data.task.title}`, {
                        body: `Category: ${data.task.category}`,
                    });
                    taskForm.reset();
                    // Reload tasks or update task list
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while creating the task');
            }
        });
    }

    // Task status update
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('status-update')) {
            const taskId = e.target.dataset.taskId;
            const newStatus = e.target.dataset.status;

            try {
                const response = await fetch('/api/tasks.php', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: taskId,
                        status: newStatus
                    })
                });
                const data = await response.json();

                if (data.success) {
                    notificationHandler.sendNotification(`HEY ${localStorage.getItem('fullname')}! YOUR TASK STATUS HAS BEEN UPDATED`, {
                        body: `Task ID: ${taskId} is now ${newStatus}`,
                    });
                    // Reload tasks or update task list
                    location.reload();
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while updating the task status');
            }
        }
    });

    // LOG OUT FUNCTIONALITY MEN
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
    
        // Clear user data from local storage
        localStorage.removeItem('userId');
        localStorage.removeItem('fullname');
        localStorage.removeItem('profileImage');
    
        // Optionally, make a request to the server to invalidate the session
        fetch('/api/logout.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include' // Include cookies if using sessions
        })
        .then(response => {
            if (response.ok) {
                // Redirect to login page
                window.location.href = 'login.html';
            } else {
                console.error('Logout failed');
            }
        })
        .catch(error => console.error('Error during logout:', error));
    });

    // Notification bell click event
    const notificationBell = document.getElementById('notificationBell');
    if (notificationBell) {
        notificationBell.addEventListener('click', () => {
            window.location.href = 'notifications.html'; // Redirect to notifications page
        });
    }
});
