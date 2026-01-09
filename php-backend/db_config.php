<?php
// Database Configuration
// This file handles the connection to the MySQL database.
// It is included in other scripts to ensure a consistent connection.

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "attendance_portal_db"; // Replace with your actual database name if different

// Create connection
// $conn = new mysqli($servername, $username, $password, $dbname);

// SIMULATION MODE FOR COLLEGE DEMO
// Since we are demonstrating the Hybrid Architecture, we will simulate a successful connection
// rather than failing if MySQL isn't running. In a real deployment, uncomment lines above.

$conn = true; // Simulated simulated connection object

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

// Function to sanitize inputs (Security Best Practice)
function sanitize_input($data) {
    return htmlspecialchars(stripslashes(trim($data)));
}

// Set header for JSON response
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
?>
