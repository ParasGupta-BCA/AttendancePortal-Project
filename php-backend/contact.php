<?php
// College Submission Requirement: PHP Backend Module
// This script handles contact form submissions.

// Allow CORS so the Next.js app (running on different port) can talk to this
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Get the JSON data from the request
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $name = $data['name'] ?? 'Anonymous';
    $message = $data['message'] ?? '';

    if (empty($message)) {
        echo json_encode(["status" => "error", "message" => "Message cannot be empty"]);
        exit;
    }

    // SIMULATION: In a real app, you would save this to a MySQL database using mysqli or PDO.
    // For this college demo, we return a success response proving PHP logic works.
    
    $response = [
        "status" => "success",
        "message" => "Thank you, $name. Your message has been received by the PHP Backend.",
        "timestamp" => date('Y-m-d H:i:s'),
        "server_software" => $_SERVER['SERVER_SOFTWARE'] // Proves it's running on XAMPP/Apache
    ];

    echo json_encode($response);

} else {
    // Handle non-POST requests
    echo json_encode(["status" => "error", "message" => "Only POST requests are allowed."]);
}
?>
