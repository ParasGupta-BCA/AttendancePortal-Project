<?php
class User {
    private $conn;
    private $table_name = "users";

    public $id;
    public $name;
    public $email;
    public $role;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function login($email, $password) {
        // Dummy login logic
        if ($email === "admin@test.com" && $password === "password") {
            $this->id = 1;
            $this->name = "Admin User";
            $this->role = "admin";
            return true;
        }
        return false;
    }

    public function getUserDetails($id) {
        // Dummy data return
        return [
            "id" => $id,
            "name" => "John Doe",
            "email" => "john@example.com",
            "role" => "student",
            "department" => "BCA"
        ];
    }
}
?>
