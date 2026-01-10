<?php
// Logout Handler API
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Destroy session
    session_unset();
    session_destroy();
    
    echo json_encode([
        "status" => "success",
        "message" => "Logged out successfully"
    ]);

} else {
    echo json_encode(["status" => "error", "message" => "Invalid Request Method"]);
}
?>
