<?php
class Database {
    private $host = "localhost";
    private $db_name = "attendance_portal_dummy";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->exec("set names utf8");
        } catch(PDOException $exception) {
            // For dummy purpose, we don't strictly fail, just log or return null
            // echo "Connection error: " . $exception->getMessage();
        }

        return $this->conn;
    }
}
?>
