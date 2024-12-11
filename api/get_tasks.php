<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../config/Database.php';
require_once '../api/Task.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $task = new Task($db);

    $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : die();
    $result = $task->read($user_id);
    
    $tasks_arr = [];
    while ($row = $result->fetch_assoc()) {
        $tasks_arr[] = array(
            "id" => $row['id'],
            "title" => $row['title'],
            "description" => $row['description'],
            "due_date" => $row['due_date'],
            "priority" => $row['priority'],
            "category" => $row['category'],
            "status" => $row['status'],
            "created_at" => $row['created_at']
        );
    }

    http_response_code(200);
    echo json_encode($tasks_arr);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Error fetching tasks"]);
}
