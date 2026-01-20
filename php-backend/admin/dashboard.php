<?php
include_once '../includes/functions.php';
// session_start();
// if(!isset($_SESSION['admin_logged_in'])) { header("Location: ../login.php"); exit(); }
?>
<!DOCTYPE html>
<html>
<head>
    <title>Admin Dashboard</title>
</head>
<body>
    <h1>Welcome Admin</h1>
    <p>Manage users, timetables, and system settings here.</p>
    <ul>
        <li><a href="manage_users.php">Manage Users</a></li>
        <li><a href="reports.php">View Reports</a></li>
    </ul>
</body>
</html>
