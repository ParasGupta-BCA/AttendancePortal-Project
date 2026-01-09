<?php
// Login Handler API
// Validates user credentials against the database (Simulated)

require_once 'db_config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Get raw POST data
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!isset($data['email']) || !isset($data['password'])) {
        echo json_encode(["status" => "error", "message" => "Missing credentials"]);
        exit;
    }

    $email = sanitize_input($data['email']);
    $password = sanitize_input($data['password']);

    // SIMULATED AUTHENTICATION LOGIC
    // In production: SELECT * FROM users WHERE email = '$email' AND password_hash = ...
    
    // For Demo Purposes: accept specific test credentials or any valid-looking email
    if (filter_var($email, FILTER_VALIDATE_EMAIL) && strlen($password) > 5) {
        echo json_encode([
            "status" => "success",
            "message" => "Login Successful",
            "token" => "php_jwt_token_" . time(), // Mock Token
            "user" => [
                "id" => 101,
                "email" => $email,
                "role" => "student"
            ]
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid credentials"]);
    }

} else {
    echo json_encode(["status" => "error", "message" => "Invalid Request Method"]);
}
?>
