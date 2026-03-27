<?php
session_start();
include 'db_config.php';

if (!isset($_SESSION['user_id'])) {
    die(json_encode(["ok" => false, "error" => "Lütfen önce giriş yapın"]));
}

$conn = new mysqli($host, $username, $password, $db_name);

$user_id = $_SESSION['user_id'];
$title = $_POST['title'];
$description = $_POST['description'];
$location = $_POST['location'];
$category = $_POST['category'];
$type = $_POST['type']; // 'lost' veya 'found'

$sql = "INSERT INTO items (user_id, title, description, location, category, type) VALUES (?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("isssss", $user_id, $title, $description, $location, $category, $type);

if ($stmt->execute()) {
    echo json_encode(["ok" => true, "message" => "Eşya başarıyla eklendi!"]);
} else {
    echo json_encode(["ok" => false, "error" => "Ekleme hatası"]);
}
?>