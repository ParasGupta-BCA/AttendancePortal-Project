<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once '../config/database.php';
include_once '../models/Attendance.php';
include_once '../includes/functions.php';

$database = new Database();
$db = $database->getConnection();
$attendance = new Attendance($db);

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->student_id) && !empty($data->date) && !empty($data->status)){
    if($attendance->markAttendance($data->student_id, $data->date, $data->status)){
        json_response(200, "Attendance marked successfully");
    } else {
        json_response(503, "Unable to mark attendance");
    }
} else {
    json_response(400, "Incomplete data");
}
?>
