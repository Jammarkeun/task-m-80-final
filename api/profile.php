<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, PUT");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/Database.php';
include_once '../models/User.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

// Handle PUT request for profile updates
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (isset($data->user_id) && isset($data->fullname) && isset($data->email)) {
        $user->id = $data->user_id;
        $user->fullname = $data->fullname;
        $user->email = $data->email;
        $user->timezone = $data->timezone;

        if ($user->update()) {
            http_response_code(200);
            echo json_encode(array("message" => "Profile was updated."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to update profile."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Missing required data."));
    }
}

// Handle POST request for image uploads
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['profile_image']) && isset($_POST['user_id'])) {
        $user->id = $_POST['user_id'];
        $upload_dir = "../uploads/profile_images/";

        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }

        $file_name = time() . '_' . basename($_FILES["profile_image"]["name"]);
        $target_file = $upload_dir . $file_name;
        $image_url = "/uploads/profile_images/" . $file_name;

        if (move_uploaded_file($_FILES["profile_image"]["tmp_name"], $target_file)) {
            if ($user->updateProfileImage($image_url)) {
                http_response_code(200);
                echo json_encode(array("message" => "Profile image was updated.", "image_url" => $image_url));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to update profile image in database."));
            }
        } else {
            http_response_code(500);
            echo json_encode(array("message" => "Sorry, there was an error uploading your file."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Missing required data."));
    }
}
