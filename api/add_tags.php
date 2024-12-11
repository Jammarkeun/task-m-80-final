<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../config/Database.php';
require_once '../api/Tag.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $tag = new Tag($db);

    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->task_id) && !empty($data->tags)) {
        if ($tag->addTags($data->task_id, $data->tags)) {
            http_response_code(201);
            echo json_encode(["message" => "Tags added successfully"]);
        } else {
            throw new Exception("Failed to add tags");
        }
    } else {
        throw new Exception("Missing required fields");
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["message" => $e->getMessage()]);
}
