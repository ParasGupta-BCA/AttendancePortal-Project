<?php
// Get Student Data API
// Fetches list of students for the dashboard

require_once 'db_config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    
    // Authorization Check (Mock)
    $headers = getallheaders();
    if (!isset($headers['Authorization']) && !isset($_GET['api_key'])) {
         // Allow for browser testing ease, normally would reject
    }

    // SIMULATED DATABASE QUERY
    // $sql = "SELECT id, name, attendance_percentage, status FROM students";
    
    // Mock Data mimicking a real DB result set
    $students = [
        [
            "id" => "STU001",
            "name" => "Aarav Patel",
            "course" => "BCA",
            "attendance" => 85,
            "status" => "Good"
        ],
        [
            "id" => "STU002",
            "name" => "Sneha Gupta",
            "course" => "B.Tech",
            "attendance" => 62,
            "status" => "Warning"
        ],
        [
            "id" => "STU003",
            "name" => "Rohan Kumar",
            "course" => "BBA",
            "attendance" => 91,
            "status" => "Excellent"
        ],
         [
            "id" => "STU004",
            "name" => "Priya Singh",
            "course" => "BCA",
            "attendance" => 78,
            "status" => "Average"
        ]
    ];

    echo json_encode([
        "status" => "success",
        "count" => count($students),
        "data" => $students,
        "query_time" => "0.002s"
    ]);

} else {
    echo json_encode(["status" => "error", "message" => "Invalid Request Method"]);
}
?>
