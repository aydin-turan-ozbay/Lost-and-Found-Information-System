<?php
session_start();
include 'db_config.php';

// Admin Access Control
if (!isset($_SESSION['user_id'])) {
    header('Content-Type: application/json');
    echo json_encode(["ok" => false, "error" => "Please log in first"]);
    exit;
}

if ($_SESSION['role'] !== 'admin') {
    header('Content-Type: application/json');
    echo json_encode(["ok" => false, "error" => "You do not have permission for this action"]);
    exit;
}

header('Content-Type: application/json');

// Connect to database
$conn = new mysqli($host, $username, $password, $db_name);
if ($conn->connect_error) {
    echo json_encode(["ok" => false, "error" => "Database connection failed"]);
    exit;
}

$conn->set_charset("utf8mb4");

// Get users who have active lost items (JOIN query)
$sql = "SELECT DISTINCT u.id, u.full_name, u.student_id, u.email
        FROM users u
        INNER JOIN items i ON u.id = i.user_id
        WHERE i.type = 'lost' AND i.status = 'active'
        ORDER BY u.full_name ASC";

$result = $conn->query($sql);
$users = array();

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
}

echo json_encode(["ok" => true, "users" => $users]);

$conn->close();
?>