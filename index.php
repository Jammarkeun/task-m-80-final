<?php

// Set document root and handle directory change
chdir(__DIR__);
define('BASE_PATH', '/htdocs');
define('ROOT_PATH', dirname(__DIR__));
define('API_PATH', ROOT_PATH . '/api');

// Handle root URL request
if ($_SERVER['REQUEST_URI'] == '/' || $_SERVER['REQUEST_URI'] == BASE_PATH || $_SERVER['REQUEST_URI'] == BASE_PATH . '/') {
    header('Content-Type: text/html');
    readfile(__DIR__ . '/index.html');
    exit;
}

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set global headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle OPTIONS requests for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get request info
$request_method = $_SERVER['REQUEST_METHOD'];
$request_path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path_parts = explode('/', trim($request_path, '/'));
$endpoint = end($path_parts);

// API Routes Handler
if (strpos($request_path, './api/login.php') !== false) {
    require_once ROOT_PATH . '/config/Database.php';

    // API Route mapping
    $routes = [
        'GET' => [
            'tasks' => 'get_tasks.php',
            'task_details' => 'get_task_details.php',
            'statistics' => 'get_statistics.php',
            'notifications' => 'get_notifications.php'
        ],
        'POST' => [
            'login' => 'login.php',
            'register' => 'register.php',
            'create_task' => 'create_task.php',
            'add_tags' => 'add_tags.php',
            'upload_attachment' => 'upload_attachment.php'
        ],
        'PUT' => [
            'update_task' => 'update_task.php',
            'update_preferences' => 'update_preferences.php'
        ],
        'DELETE' => [
            'delete_task' => 'delete_task.php'
        ]
    ];

    try {
        $database = new Database();
        $db = $database->getConnection();

        if (isset($routes[$request_method][$endpoint])) {
            require_once API_PATH . '/' . $routes[$request_method][$endpoint];
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Endpoint not found"]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["message" => "Server error", "error" => $e->getMessage()]);
    }
} else {
    // Frontend Routes
    header('Content-Type: text/html');

    $frontend_routes = [
        BASE_PATH . '/' => 'index.html',
        BASE_PATH . '/dashboard' => 'views/dashboard.html',
        BASE_PATH . '/login' => 'views/login.html',
        BASE_PATH . '/signup' => 'views/signup.html',
        BASE_PATH . '/tasks' => 'views/tasks.html',
        BASE_PATH . '/create-task' => 'views/create-task.html',
        BASE_PATH . '/statistics' => 'views/statistics.html',
        BASE_PATH . '/notifications' => 'views/notifications.html',
        BASE_PATH . '/profile' => 'views/profile.html',
        BASE_PATH . '/preferences' => 'views/preferences.html'
    ];

    if (isset($frontend_routes[$request_path])) {
        require $frontend_routes[$request_path];
    } else {
        http_response_code(404);
        require 'views/404.html';
    }
}
