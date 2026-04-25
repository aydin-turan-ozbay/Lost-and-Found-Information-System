<?php
session_start();
include 'db_config.php';

header('Content-Type: application/json');

// Auth Check
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["ok" => false, "error" => "Please log in"]);
    exit;
}

if ($_SESSION['role'] !== 'admin') {
    echo json_encode(["ok" => false, "error" => "Unauthorized access"]);
    exit;
}

// Database Connection
$conn = new mysqli($host, $username, $password, $db_name);
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    echo json_encode(["ok" => false, "error" => "Database connection error"]);
    exit;
}

// ================= ACTIONS =================
if (isset($_GET['action'])) {

    // Fetch users who have active lost item reports
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

        echo json_encode(["ok" => true, "users" => $users]);
        exit;
    }

    // Fetch specific lost items belonging to a user
    if ($_GET['action'] === 'get_user_items') {
        $userId = (int)$_GET['user_id'];

        $stmt = $conn->prepare("SELECT id, title FROM items WHERE user_id=? AND type='lost' AND status='active'");
        $stmt->bind_param("i", $userId);
        $stmt->execute();

        $res = $stmt->get_result();
        $items = [];

        while ($row = $res->fetch_assoc()) {
            $items[] = $row;
        }

        echo json_encode(["ok" => true, "items" => $items]);
        exit;
    }
}

// ================= DELIVERY PROCESS =================

/**
 * Since FormData is used on the JS side, we retrieve data directly from $_POST.
 * JSON_DECODE lines have been removed.
 */
$item_id = isset($_POST['item_id']) ? (int)$_POST['item_id'] : 0;
$recipient_id = isset($_POST['recipient_id']) ? (int)$_POST['recipient_id'] : 0;
$recipient_lost_item_id = isset($_POST['recipient_lost_item_id']) ? (int)$_POST['recipient_lost_item_id'] : 0;

if (!$item_id || !$recipient_id || !$recipient_lost_item_id) {
    echo json_encode(["ok" => false, "error" => "Missing parameters (Found Item: $item_id, Recipient: $recipient_id, Lost Item: $recipient_lost_item_id)"]);
    exit;
}

// 1. Validate the selected lost item report
$checkLostStmt = $conn->prepare("SELECT user_id FROM items WHERE id=? AND type='lost' AND status='active'");
$checkLostStmt->bind_param("i", $recipient_lost_item_id);
$checkLostStmt->execute();
$lostResult = $checkLostStmt->get_result();
$lostItem = $lostResult->fetch_assoc();
$checkLostStmt->close();

if (!$lostItem) {
    echo json_encode(["ok" => false, "error" => "Selected lost item report is invalid or inactive"]);
    exit;
}

if ((int)$lostItem['user_id'] !== $recipient_id) {
    echo json_encode(["ok" => false, "error" => "Lost item owner does not match the selected recipient"]);
    exit;
}

// 2. Validate the selected found item report
$checkFoundStmt = $conn->prepare("SELECT id FROM items WHERE id=? AND type='found' AND status='active'");
$checkFoundStmt->bind_param("i", $item_id);
$checkFoundStmt->execute();
$foundResult = $checkFoundStmt->get_result();
$foundItem = $foundResult->fetch_assoc();
$checkFoundStmt->close();

if (!$foundItem) {
    echo json_encode(["ok" => false, "error" => "Selected found item report is invalid or inactive"]);
    exit;
}

// 3. Delete both reports in a single transaction
$conn->begin_transaction();

try {
    // ✅ FOUND ITEM → delivered
    $updateFoundStmt = $conn->prepare("
        UPDATE items 
        SET status='delivered' 
        WHERE id=? AND type='found'
    ");
    $updateFoundStmt->bind_param("i", $item_id);
    $updateFoundStmt->execute();

    if ($updateFoundStmt->affected_rows !== 1) {
        throw new Exception("Could not update the found item");
    }
    $updateFoundStmt->close();

    // ✅ LOST ITEM → archived
    $updateLostStmt = $conn->prepare("
        UPDATE items 
        SET status='archived' 
        WHERE id=? AND type='lost'
    ");
    $updateLostStmt->bind_param("i", $recipient_lost_item_id);
    $updateLostStmt->execute();

    if ($updateLostStmt->affected_rows !== 1) {
        throw new Exception("Could not update the lost item");
    }
    $updateLostStmt->close();

    $conn->commit();

    echo json_encode([
        "ok" => true,
        "message" => "Delivery complete. Found item delivered, lost item archived."
    ]);

} catch (Exception $e) {
    $conn->rollback();

    echo json_encode([
        "ok" => false,
        "error" => "Delivery process failed: " . $e->getMessage()
    ]);
}

$conn->close();