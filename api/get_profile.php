<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/Database.php';
include_once '../models/User.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : die(json_encode(array("message" => "User ID is required.")));

$user->id = $user_id;

if ($user->getProfile()) {
    $user_arr = array(
        "id" => $user->id,
        "fullname" => $user->fullname,
        "email" => $user->email,
        "timezone" => $user->timezone,
        "profile_image" => $user->profile_image
    );

    http_response_code(200);
    echo json_encode($user_arr);
} else {
    http_response_code(404);
    echo json_encode(array("message" => "User not found."));
}
