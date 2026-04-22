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

// Get POST parameters
$item_id = isset($_POST['item_id']) ? (int)$_POST['item_id'] : 0;
$recipient_id = isset($_POST['recipient_id']) ? (int)$_POST['recipient_id'] : 0;

if (!$item_id || !$recipient_id) {
    echo json_encode(["ok" => false, "error" => "Gerekli parametreler eksik"]);
    exit;
}

// Connect to database
$conn = new mysqli($host, $username, $password, $db_name);
if ($conn->connect_error) {
    echo json_encode(["ok" => false, "error" => "Veritabanı bağlantısı başarısız"]);
    exit;
}

// Verify the item exists and is a found item with active status
$checkSql = "SELECT id, type, status FROM items WHERE id = ? AND type = 'found' AND status = 'active'";
$checkStmt = $conn->prepare($checkSql);
if (!$checkStmt) {
    echo json_encode(["ok" => false, "error" => "Sorgu hazırlanması başarısız"]);
    exit;
}

$checkStmt->bind_param("i", $item_id);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows === 0) {
    echo json_encode(["ok" => false, "error" => "Eşya bulunamadı veya teslim edilemez durumda"]);
    exit;
}

// Verify the recipient exists and has active lost items
$recipientSql = "SELECT COUNT(*) as count FROM items WHERE user_id = ? AND type = 'lost' AND status = 'active'";
$recipientStmt = $conn->prepare($recipientSql);
if (!$recipientStmt) {
    echo json_encode(["ok" => false, "error" => "Sorgu hazırlanması başarısız"]);
    exit;
}

$recipientStmt->bind_param("i", $recipient_id);
$recipientStmt->execute();
$recipientResult = $recipientStmt->get_result();
$recipientRow = $recipientResult->fetch_assoc();

if ($recipientRow['count'] === 0) {
    echo json_encode(["ok" => false, "error" => "Alıcının aktif kayıp ilanı yok"]);
    exit;
}

// Update the item: set status to 'delivered' and set delivered_to_user_id
$updateSql = "UPDATE items SET status = 'delivered', delivered_to_user_id = ?, updated_at = NOW() WHERE id = ?";
$updateStmt = $conn->prepare($updateSql);
if (!$updateStmt) {
    echo json_encode(["ok" => false, "error" => "Güncellemeleme başarısız"]);
    exit;
}

$updateStmt->bind_param("ii", $recipient_id, $item_id);

if ($updateStmt->execute()) {
    echo json_encode(["ok" => true, "message" => "Eşya başarıyla teslim edildi"]);
} else {
    echo json_encode(["ok" => false, "error" => "Güncelleme sırasında hata oluştu"]);
}

$conn->close();

// Fetch users with active lost items
if (isset($_GET['action']) && $_GET['action'] === 'get_users') {
    $users = [];
    $userSql = "SELECT DISTINCT u.id, u.full_name FROM users u 
                JOIN items i ON u.id = i.user_id 
                WHERE i.type = 'lost' AND i.status = 'active'";
    $userResult = $conn->query($userSql);

    if ($userResult) {
        while ($userRow = $userResult->fetch_assoc()) {
            $users[] = $userRow;
        }
        echo json_encode(["ok" => true, "users" => $users]);
    } else {
        echo json_encode(["ok" => false, "error" => "Kullanıcılar alınamadı"]);
    }
    exit;
}

// Fetch lost items for a specific user
if (isset($_GET['action']) && $_GET['action'] === 'get_user_items') {
    $userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
    $items = [];

    if ($userId) {
        $itemSql = "SELECT id, title FROM items WHERE user_id = ? AND type = 'lost' AND status = 'active'";
        $itemStmt = $conn->prepare($itemSql);
        if ($itemStmt) {
            $itemStmt->bind_param("i", $userId);
            $itemStmt->execute();
            $itemResult = $itemStmt->get_result();

            while ($itemRow = $itemResult->fetch_assoc()) {
                $items[] = $itemRow;
            }
            echo json_encode(["ok" => true, "items" => $items]);
        } else {
            echo json_encode(["ok" => false, "error" => "Kayıp eşyalar alınamadı"]);
        }
    } else {
        echo json_encode(["ok" => false, "error" => "Geçersiz kullanıcı"]);
    }
    exit;
}
