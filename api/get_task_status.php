<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/Database.php';
include_once '../api/Task.php';

$database = new Database();
$db = $database->getConnection();
$task = new Task($db);

$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : die();
$status_type = isset($_GET['status_type']) ? $_GET['status_type'] : die();

$task->user_id = $user_id;

switch ($status_type) {
    case 'completed':
        $result = $task->getCompletedTasks();
        break;
    case 'overdue':
        $result = $task->getOverdueTasks();
        break;
    case 'weekly_summary':
        $result = $task->getWeeklySummary();
        break;
    default:
        http_response_code(400);
        echo json_encode(array("message" => "Invalid status type."));
        exit();
}

if ($result) {
    http_response_code(200);
    echo json_encode($result);
} else {
    http_response_code(404);
    echo json_encode(array("message" => "No tasks found."));
}