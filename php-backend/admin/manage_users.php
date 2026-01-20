<?php
include_once '../config/database.php';
include_once '../models/User.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

// $all_users = $user->getAllUsers(); // Dummy method call
?>
<h1>User Management</h1>
<table border="1">
    <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Role</th>
        <th>Action</th>
    </tr>
    <tr>
        <td>1</td>
        <td>John Doe</td>
        <td>Student</td>
        <td>Edit | Delete</td>
    </tr>
</table>
