<?php
include_once '../config/database.php';
?>
<h1>Take Attendance</h1>
<form action="../api/mark_attendance.php" method="POST">
    <label>Select Date:</label>
    <input type="date" name="date" required><br>
    
    <label>Student ID:</label>
    <input type="text" name="student_id" placeholder="Enter Student ID"><br>
    
    <label>Status:</label>
    <select name="status">
        <option value="Present">Present</option>
        <option value="Absent">Absent</option>
    </select><br>
    
    <button type="submit">Submit</button>
</form>
