<?php
session_start();
include 'db_config.php';

header('Content-Type: application/json');

// Auth
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["ok" => false, "error" => "Lütfen giriş yapın"]);
    exit;
}

if ($_SESSION['role'] !== 'admin') {
    echo json_encode(["ok" => false, "error" => "Yetkiniz yok"]);
    exit;
}

// DB
$conn = new mysqli($host, $username, $password, $db_name);
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    echo json_encode(["ok" => false, "error" => "DB bağlantı hatası"]);
    exit;
}

// ================= ACTIONS =================
if (isset($_GET['action'])) {

    if ($_GET['action'] === 'get_users') {
        $users = [];
        $sql = "SELECT DISTINCT u.id, u.full_name 
                FROM users u
                JOIN items i ON u.id = i.user_id
                WHERE i.type='lost' AND i.status='active'";
        $res = $conn->query($sql);

        while ($row = $res->fetch_assoc()) {
            $users[] = $row;
        }

        echo json_encode(["ok"=>true,"users"=>$users]);
        exit;
    }

    if ($_GET['action'] === 'get_user_items') {
        $userId = (int)$_GET['user_id'];

        $stmt = $conn->prepare("SELECT id,title FROM items WHERE user_id=? AND type='lost' AND status='active'");
        $stmt->bind_param("i",$userId);
        $stmt->execute();

        $res = $stmt->get_result();
        $items=[];

        while($row=$res->fetch_assoc()){
            $items[]=$row;
        }

        echo json_encode(["ok"=>true,"items"=>$items]);
        exit;
    }
}

// ================= DELIVER =================

/**
 * JS tarafında FormData kullandığımız için verileri doğrudan $_POST içinden alıyoruz.
 * JSON_DECODE satırlarını siliyoruz.
 */
$item_id = isset($_POST['item_id']) ? (int)$_POST['item_id'] : 0;
$recipient_id = isset($_POST['recipient_id']) ? (int)$_POST['recipient_id'] : 0;
$recipient_lost_item_id = isset($_POST['recipient_lost_item_id']) ? (int)$_POST['recipient_lost_item_id'] : 0;

if (!$item_id || !$recipient_id || !$recipient_lost_item_id) {
    echo json_encode(["ok"=>false,"error"=>"Parametre eksik (Found Item: $item_id, Recipient: $recipient_id, Lost Item: $recipient_lost_item_id)"]);
    exit;
}

// Önce seçilen kayıp ilanı doğrula
$checkLostStmt = $conn->prepare("SELECT user_id FROM items WHERE id=? AND type='lost' AND status='active'");
$checkLostStmt->bind_param("i", $recipient_lost_item_id);
$checkLostStmt->execute();
$lostResult = $checkLostStmt->get_result();
$lostItem = $lostResult->fetch_assoc();
$checkLostStmt->close();

if (!$lostItem) {
    echo json_encode(["ok"=>false,"error"=>"Seçilen kayıp ilan geçersiz veya aktif değil"]);
    exit;
}

if ((int)$lostItem['user_id'] !== $recipient_id) {
    echo json_encode(["ok"=>false,"error"=>"Kayıp ilan sahibi ile seçilen alıcı eşleşmiyor"]);
    exit;
}

// Seçilen buluntu ilanı doğrula
$checkFoundStmt = $conn->prepare("SELECT id FROM items WHERE id=? AND type='found' AND status='active'");
$checkFoundStmt->bind_param("i", $item_id);
$checkFoundStmt->execute();
$foundResult = $checkFoundStmt->get_result();
$foundItem = $foundResult->fetch_assoc();
$checkFoundStmt->close();

if (!$foundItem) {
    echo json_encode(["ok"=>false,"error"=>"Seçilen buluntu ilan geçersiz veya aktif değil"]);
    exit;
}

// İki ilanı da tek işlemde sil
$conn->begin_transaction();

try {
    $deleteFoundStmt = $conn->prepare("DELETE FROM items WHERE id=? AND type='found'");
    $deleteFoundStmt->bind_param("i", $item_id);
    $deleteFoundStmt->execute();

    if ($deleteFoundStmt->affected_rows !== 1) {
        throw new Exception("Buluntu ilan silinemedi");
    }
    $deleteFoundStmt->close();

    $deleteLostStmt = $conn->prepare("DELETE FROM items WHERE id=? AND type='lost'");
    $deleteLostStmt->bind_param("i", $recipient_lost_item_id);
    $deleteLostStmt->execute();

    if ($deleteLostStmt->affected_rows !== 1) {
        throw new Exception("Kayıp ilan silinemedi");
    }
    $deleteLostStmt->close();

    $conn->commit();
    echo json_encode(["ok" => true, "message" => "Teslim tamamlandı. Buluntu ve seçilen kayıp ilan kaldırıldı."]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["ok" => false, "error" => "Teslim işlemi tamamlanamadı: " . $e->getMessage()]);
}

$conn->close();