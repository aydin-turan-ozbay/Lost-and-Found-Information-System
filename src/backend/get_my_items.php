<?php
session_start();
require_once 'db_config.php';

header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        "ok" => false,
        "error" => "Lütfen önce giriş yapın."
    ]);
    exit();
}

$user_id = (int) $_SESSION['user_id'];

$sql = "
    SELECT
        id,
        title,
        category,
        color,
        location,
        item_date,
        description,
        type AS item_type,
        image_path
    FROM items
    WHERE user_id = ?
    ORDER BY id DESC
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        "ok" => false,
        "error" => $conn->error
    ]);
    exit();
}

$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$items = [];

while ($row = $result->fetch_assoc()) {
    $items[] = $row;
}

echo json_encode([
    "ok" => true,
    "items" => $items
]);

$stmt->close();
$conn->close();
?>