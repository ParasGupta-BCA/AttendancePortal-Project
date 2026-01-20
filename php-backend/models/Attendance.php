<?php
class Attendance {
    private $conn;
    private $table_name = "attendance";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function markAttendance($student_id, $date, $status) {
        // Simulate marking attendance
        return true;
    }

    public function getAttendanceHistory($student_id) {
        // Dummy data
        return [
            ["date" => "2023-10-01", "status" => "Present", "subject" => "Java"],
            ["date" => "2023-10-02", "status" => "Absent", "subject" => "Dbms"],
            ["date" => "2023-10-03", "status" => "Present", "subject" => "Maths"]
        ];
    }
}
?>
