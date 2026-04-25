<?php
session_start();
include 'db_config.php';

// Authentication Check
if (!isset($_SESSION['user_id'])) {
    die(json_encode(["ok" => false, "error" => "Please log in first"]));
}

// Database Connection
$conn = new mysqli($host, $username, $password, $db_name);

if ($conn->connect_error) {
    die(json_encode(["ok" => false, "error" => "Database connection failed"]));
}

// Data from POST request
$user_id = $_SESSION['user_id'];
$title = $_POST['title'];
$description = $_POST['description'];
$location = $_POST['location'];
$category = $_POST['category'];
$type = $_POST['type']; // 'lost' or 'found'

// SQL Preparation and Execution
$sql = "INSERT INTO items (user_id, title, description, location, category, type) VALUES (?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("isssss", $user_id, $title, $description, $location, $category, $type);

if ($stmt->execute()) {
    echo json_encode(["ok" => true, "message" => "Item added successfully!"]);
} else {
    echo json_encode(["ok" => false, "error" => "An error occurred while adding the item"]);
}

$stmt->close();
$conn->close();
?>