<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once '../config/database.php';
include_once '../models/LeaveRequest.php';
include_once '../includes/functions.php';

$database = new Database();
$db = $database->getConnection();
$leave = new LeaveRequest($db);

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->student_id) && !empty($data->reason)){
    $result = $leave->createLeaveRequest($data->student_id, $data->reason, $data->start_date, $data->end_date);
    json_response(200, "Leave request submitted", $result);
} else {
    json_response(400, "Incomplete data");
}
?>
