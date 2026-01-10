<?php
// Registration Handler API
require_once 'db_config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $name = sanitize_input($data['name'] ?? '');
    $email = sanitize_input($data['email'] ?? '');
    $password = sanitize_input($data['password'] ?? '');
    $role = sanitize_input($data['role'] ?? 'student');

    if (empty($name) || empty($email) || empty($password)) {
        echo json_encode(["status" => "error", "message" => "All fields are required"]);
        exit;
    }

    // SIMULATED DATABASE INSERT
    // $stmt = $conn->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
    
    // For demo/submission:
    $new_user_id = rand(100, 999);
    
    echo json_encode([
        "status" => "success",
        "message" => "User registered successfully",
        "user_id" => $new_user_id
    ]);

} else {
    echo json_encode(["status" => "error", "message" => "Invalid Request Method"]);
}
?>
