<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../config/Database.php';
require_once '../api/Notification.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $notification = new NotificationSystem($db);

    $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : die();
    $notifications = $notification->getNotifications($user_id);
    
    http_response_code(200);
    echo json_encode($notifications);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Error fetching notifications"]);
}
