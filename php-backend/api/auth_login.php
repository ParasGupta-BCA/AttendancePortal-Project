<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once '../config/database.php';
include_once '../models/User.php';
include_once '../includes/functions.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->email) && !empty($data->password)){
    if($user->login($data->email, $data->password)){
        json_response(200, "Login successful", [
            "id" => $user->id,
            "name" => $user->name,
            "role" => $user->role,
            "token" => "dummy_token_" . time()
        ]);
    } else {
        json_response(401, "Invalid credentials");
    }
} else {
    json_response(400, "Incomplete data");
}
?>
