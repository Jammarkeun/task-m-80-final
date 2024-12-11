<?php
$request = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

$routes = [
    'POST' => [
        '/api/login' => 'login.php',
        '/api/register' => 'register.php',
        '/api/tasks' => 'create_task.php',
        '/api/tags' => 'add_tags.php',
        '/api/attachments' => 'upload_attachment.php'
    ],
    'GET' => [
        '/api/tasks' => 'get_tasks.php',
        '/api/task' => 'get_task_details.php',
        '/api/statistics' => 'get_statistics.php',
        '/api/notifications' => 'get_notifications.php',
        '/api/profile' => 'profile.php'
    ],
    'PUT' => [
        '/api/tasks' => 'update_task.php',
        '/api/preferences' => 'update_preferences.php',
        '/api/profile' => 'profile.php'
    ],
    'DELETE' => [
        '/api/tasks' => 'delete_task.php'
    ]
];

if (isset($routes[$method][$request])) {
    require_once $routes[$method][$request];
} else {
    http_response_code(404);
    echo json_encode(['message' => 'Route not found']);
}
