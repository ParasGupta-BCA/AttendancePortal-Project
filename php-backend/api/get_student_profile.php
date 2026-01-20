<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/database.php';
include_once '../models/User.php';
include_once '../includes/functions.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

$student_id = isset($_GET['id']) ? $_GET['id'] : die();

$profile_data = $user->getUserDetails($student_id);

if($profile_data){
    json_response(200, "Data found", $profile_data);
} else {
    json_response(404, "User not found");
}
?>
