<?php
// Update Profile API
require_once 'db_config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!isset($data['user_id'])) {
         echo json_encode(["status" => "error", "message" => "User ID required"]);
         exit;
    }

    $updates = [];
    if (isset($data['phone'])) $updates['phone'] = sanitize_input($data['phone']);
    if (isset($data['address'])) $updates['address'] = sanitize_input($data['address']);
    
    // SIMULATED UPDATE QUERY
    // $sql = "UPDATE users SET ... WHERE id = " . $data['user_id'];

    echo json_encode([
        "status" => "success",
        "message" => "Profile updated successfully",
        "updated_fields" => array_keys($updates)
    ]);

} else {
    echo json_encode(["status" => "error", "message" => "Invalid Request Method"]);
}
?>
