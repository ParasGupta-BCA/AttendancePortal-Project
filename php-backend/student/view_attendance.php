<?php
include_once '../models/Attendance.php';
$database = new Database();
$db = $database->getConnection();
$attendance = new Attendance($db);

// $history = $attendance->getAttendanceHistory(1);
?>
<h1>My Attendance History</h1>
<ul>
    <li>2023-10-01: Present (Java)</li>
    <li>2023-10-02: Absent (DBMS)</li>
</ul>
