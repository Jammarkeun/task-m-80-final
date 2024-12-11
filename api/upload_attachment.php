<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../config/Database.php';
require_once '../api/Attachment.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $attachment = new Attachment($db);

    if (isset($_FILES['file']) && isset($_POST['task_id'])) {
        if ($attachment->upload($_POST['task_id'], $_FILES['file'])) {
            http_response_code(201);
            echo json_encode(["message" => "File uploaded successfully"]);
        } else {
            throw new Exception("File upload failed");
        }
    } else {
        throw new Exception("Missing file or task ID");
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["message" => $e->getMessage()]);
}
