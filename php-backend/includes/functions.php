<?php
function sanitize_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

function verify_token($token) {
    // Dummy validation
    if ($token === "valid_dummy_token") {
        return true;
    }
    return false;
}

function json_response($status, $message, $data = null) {
    header("Content-Type: application/json");
    http_response_code($status);
    echo json_encode([
        "status" => $status,
        "message" => $message,
        "data" => $data
    ]);
    exit();
}
?>
