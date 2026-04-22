<?php
session_start();
include 'db_config.php';

// Admin Access Control
if (!isset($_SESSION['user_id'])) {
    header('Content-Type: application/json');
    echo json_encode(["ok" => false, "error" => "Lütfen önce giriş yapın"]);
    exit;
}

if ($_SESSION['role'] !== 'admin') {
    header('Content-Type: application/json');
    echo json_encode(["ok" => false, "error" => "Bu işlem için yetkiniz yok"]);
    exit;
}

header('Content-Type: application/json');

$type = isset($_GET['type']) ? $_GET['type'] : 'all';
$location = isset($_GET['location']) ? $conn->real_escape_string($_GET['location']) : '';
$category = isset($_GET['category']) ? $conn->real_escape_string($_GET['category']) : '';

// Connect to database
$conn = new mysqli($host, $username, $password, $db_name);
if ($conn->connect_error) {
    echo json_encode(["ok" => false, "error" => "Veritabanı bağlantısı başarısız"]);
    exit;
}

$conn->set_charset("utf8mb4");

$items = array();

if ($type === 'all') {
    // Get all items with user information
    $sql = "SELECT i.id, i.user_id, i.title, i.category, i.color, i.location, i.item_date, 
                   i.description, i.type, i.status, i.image_path, i.delivered_to_user_id,
                   u.full_name, u.student_id, u.email
            FROM items i
            LEFT JOIN users u ON i.user_id = u.id
            WHERE (i.location LIKE '%$location%' OR '$location' = '')
              AND (i.category LIKE '%$category%' OR '$category' = '')
            ORDER BY i.created_at DESC";
    
    $result = $conn->query($sql);
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $items[] = $row;
        }
    }
} elseif ($type === 'lost') {
    // Get lost items
    $sql = "SELECT i.id, i.user_id, i.title, i.category, i.color, i.location, i.item_date, 
                   i.description, i.type, i.status, i.image_path,
                   u.full_name, u.student_id, u.email
            FROM items i
            LEFT JOIN users u ON i.user_id = u.id
            WHERE i.type = 'lost'
            ORDER BY i.created_at DESC";
    
    $result = $conn->query($sql);
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $items[] = $row;
        }
    }
} elseif ($type === 'found') {
    // Get found items
    $sql = "SELECT i.id, i.user_id, i.title, i.category, i.color, i.location, i.item_date, 
                   i.description, i.type, i.status, i.image_path,
                   u.full_name, u.student_id, u.email
            FROM items i
            LEFT JOIN users u ON i.user_id = u.id
            WHERE i.type = 'found'
            ORDER BY i.created_at DESC";
    
    $result = $conn->query($sql);
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $items[] = $row;
        }
    }
} elseif ($type === 'delivered') {
    // Get delivered items (status = 'delivered')
    $sql = "SELECT i.id, i.user_id, i.title, i.category, i.color, i.location, i.item_date, 
                   i.description, i.type, i.status, i.image_path, i.delivered_to_user_id,
                   u.full_name, u.student_id, u.email,
                   du.full_name as delivered_to_name, du.student_id as delivered_to_student_id
            FROM items i
            LEFT JOIN users u ON i.user_id = u.id
            LEFT JOIN users du ON i.delivered_to_user_id = du.id
            WHERE i.status = 'delivered'
            ORDER BY i.updated_at DESC";
    
    $result = $conn->query($sql);
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            // Add delivered_to_user info if available
            if ($row['delivered_to_user_id']) {
                $row['delivered_to_user'] = [
                    'id' => $row['delivered_to_user_id'],
                    'full_name' => $row['delivered_to_name'],
                    'student_id' => $row['delivered_to_student_id']
                ];
            }
            $items[] = $row;
        }
    }
}

echo json_encode(["ok" => true, "items" => $items]);

$conn->close();
?>
