<?php
// Dashboard Stats API
// Provides summary statistics for the admin dashboard

require_once 'db_config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    
    // SIMULATED AGGREGATION QUERY
    // SELECT COUNT(*) FROM students;
    // SELECT AVG(attendance) FROM attendance;

    $stats = [
        "total_students" => 1250,
        "total_faculty" => 45,
        "avg_attendance" => 78.5,
        "classes_today" => 24,
        "system_status" => "Operational"
    ];

    echo json_encode([
        "status" => "success",
        "timestamp" => time(),
        "stats" => $stats
    ]);

} else {
    echo json_encode(["status" => "error", "message" => "Invalid Request Method"]);
}
?>
