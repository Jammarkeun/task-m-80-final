<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/Database.php';
include_once '../models/User.php';

$database = new Database();
$db = $database->getConnection();

$user = new User($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->fullName) && !empty($data->email) && !empty($data->password)) {
    $user->fullname = $data->fullName;
    $user->email = $data->email;
    $user->password = $data->password;

    if ($user->create()) {
        http_response_code(201);
        echo json_encode(["message" => "User registered successfully"]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Unable to register user"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Unable to register user. Data is incomplete."]);
}