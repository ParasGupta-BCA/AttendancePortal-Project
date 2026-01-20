<?php
class Timetable {
    private $conn;
    private $table_name = "timetable";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getScheduleForDay($day, $batch_id) {
        // Dummy schedule
        return [
            ["time" => "09:00 - 10:00", "subject" => "Java", "room" => "101", "faculty" => "Mr. Sharma"],
            ["time" => "10:00 - 11:00", "subject" => "DBMS", "room" => "102", "faculty" => "Ms. Gupta"],
            ["time" => "11:00 - 12:00", "subject" => "Maths", "room" => "103", "faculty" => "Dr. Singh"]
        ];
    }
}
?>
