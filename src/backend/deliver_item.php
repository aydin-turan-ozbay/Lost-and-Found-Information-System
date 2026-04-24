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

// JSON oku
$data = json_decode(file_get_contents("php://input"), true);

$item_id = (int)($data['item_id'] ?? 0);
$recipient_id = (int)($data['recipient_id'] ?? 0);

if (!$item_id || !$recipient_id) {
    echo json_encode(["ok"=>false,"error"=>"Parametre eksik"]);
    exit;
}

// update
$stmt = $conn->prepare("UPDATE items SET status='delivered', delivered_to_user_id=?, updated_at=NOW() WHERE id=?");
$stmt->bind_param("ii",$recipient_id,$item_id);

if($stmt->execute()){
    echo json_encode(["ok"=>true]);
}else{
    echo json_encode(["ok"=>false,"error"=>"DB hata"]);
}