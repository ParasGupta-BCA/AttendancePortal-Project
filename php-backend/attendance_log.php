<?php
// Attendance Log API
// Fetches attendance history for a specific student

require_once 'db_config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    
    $student_id = $_GET['student_id'] ?? null;
    $month = $_GET['month'] ?? date('m');

    if (!$student_id) {
        echo json_encode(["status" => "error", "message" => "Student ID is required"]);
        exit;
    }

    // SIMULATED DATABASE FETCH
    $attendance_log = [
        ["date" => "2023-$month-01", "status" => "Present", "lecture" => "Data Structures"],
        ["date" => "2023-$month-02", "status" => "Present", "lecture" => "Web Dev"],
        ["date" => "2023-$month-03", "status" => "Absent", "lecture" => "Maths"],
        ["date" => "2023-$month-04", "status" => "Present", "lecture" => "DBMS"],
        ["date" => "2023-$month-05", "status" => "Present", "lecture" => "OS"]
    ];

    echo json_encode([
        "status" => "success",
        "student_id" => $student_id,
        "month" => $month,
        "logs" => $attendance_log
    ]);

} else {
    echo json_encode(["status" => "error", "message" => "Invalid Request Method"]);
}
?>
