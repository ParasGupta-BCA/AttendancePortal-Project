<?php
// Get Courses API
require_once 'db_config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    
    // SIMULATED DATABASE FETCH
    $courses = [
        ["code" => "CS101", "name" => "Introduction to Programming", "credits" => 4],
        ["code" => "CS102", "name" => "Data Structures & Algorithms", "credits" => 4],
        ["code" => "CS201", "name" => "Database Management Systems", "credits" => 3],
        ["code" => "CS205", "name" => "Web Technologies (PHP & Next.js)", "credits" => 5]
    ];

    echo json_encode([
        "status" => "success",
        "total_courses" => count($courses),
        "data" => $courses
    ]);

} else {
    echo json_encode(["status" => "error", "message" => "Invalid Request Method"]);
}
?>
