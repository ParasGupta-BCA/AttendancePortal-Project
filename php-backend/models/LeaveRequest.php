<?php
class LeaveRequest {
    private $conn;
    private $table_name = "leave_requests";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function createLeaveRequest($student_id, $reason, $start_date, $end_date) {
        // Simulate creation
        return [
            "id" => rand(100, 999),
            "status" => "Pending",
            "message" => "Leave request submitted successfully"
        ];
    }

    public function getStudentLeaves($student_id) {
        return [
            ["id" => 1, "reason" => "Sick", "status" => "Approved", "dates" => "2023-11-01 to 2023-11-02"],
            ["id" => 2, "reason" => "Family Event", "status" => "Pending", "dates" => "2023-11-15"]
        ];
    }
}
?>
