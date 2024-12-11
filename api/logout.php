<?php
session_start(); // Start the session

// Destroy the session to log out the user
if (isset($_SESSION['user_id'])) {
    unset($_SESSION['user_id']); // Remove user ID from session
    session_destroy(); // Destroy the session
}

// Optionally, you can return a response
http_response_code(200);
echo json_encode(["message" => "Logged out successfully."]);
