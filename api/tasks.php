<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

error_reporting(E_ALL);
ini_set('display_errors', 1);

include_once '../config/Database.php';
include_once '../api/Task.php'; // Ensure the path is correct

$database = new Database();
$db = $database->getConnection();
$task = new Task($db);

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : die();
        $task->user_id = $user_id;
        $stmt = $task->read();
        $num = $stmt->rowCount();

        $tasks_arr = ["records" => []]; // Initialize the array

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);

            $task_item = [
                "id" => $id,
                "title" => $title,
                "description" => $description,
                "status" => $STATUS, // Use the correct case for the status
                "due_date" => isset($due_date) ? $due_date : null, // Check if due_date exists
                "priority" => isset($priority) ? $priority : 'medium', // Default to 'medium' if not set
                "category" => isset($category) ? $category : 'uncategorized' // Default to 'uncategorized' if not set
            ];

            array_push($tasks_arr["records"], $task_item);
        }

        http_response_code(200); // Set response code to 200 OK
        echo json_encode($tasks_arr);
        break;

        case 'PUT':
            $data = json_decode(file_get_contents("php://input"));
            if (isset($data->id)) {
                $task->id = $data->id;
                $task->status = 'completed'; // Update the task status to completed
                $task->completed_at = isset($data->completed_at) ? $data->completed_at : null;
        
                // Ensure that the task is updated in the database
                if ($task->update()) {
                    echo json_encode(["message" => "Task updated successfully."]);
                } else {
                    echo json_encode(["message" => "Unable to update task."]);
                }
            } else {
                echo json_encode(["message" => "Unable to update task. No ID provided."]);
            }
            break;
    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        if (!empty($data->title) && !empty($data->description) && !empty($data->user_id)) {
            $task->title = $data->title;
            $task->description = $data->description;
            $task->user_id = $data->user_id;
            $task->status = isset($data->status) ? $data->status : 'pending';
            $task->due_date = isset($data->due_date) ? $data->due_date : null; // Handle due_date

            if ($task->create()) {
                http_response_code(201);
                echo json_encode(["message" => "Task was created."]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Unable to create task."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Unable to create task. Data is incomplete."]);
        }
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"));
        if (!empty($data->id)) {
            $task->id = $data->id;
            if ($task->delete()) {
                http_response_code(200);
                echo json_encode(["message" => "Task was deleted."]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Unable to delete task."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Unable to delete task. No ID provided."]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed"]);
        break;
}
