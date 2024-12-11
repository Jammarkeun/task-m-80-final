<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../config/Database.php';
require_once '../api/Task.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $task = new Task($db);

    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->user_id) && !empty($data->title)) {
        $result = $task->create(
            $data->user_id,
            $data->title,
            $data->description ?? '',
            $data->due_date ?? null,
            $data->priority ?? 'medium',
            $data->category ?? 'general'
        );

        if ($result) {
            http_response_code(201);
            echo json_encode(["message" => "Task created successfully"]);
        } else {
            throw new Exception("Task creation failed");
        }
    } else {
        throw new Exception("Missing required fields");
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["message" => $e->getMessage()]);
}
