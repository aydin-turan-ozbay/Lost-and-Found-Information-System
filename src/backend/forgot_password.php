<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json; charset=utf-8');
require_once 'db_config.php';

function respond($arr) {
    echo json_encode($arr);
    exit;
}

if (!isset($conn) || $conn->connect_error) {
    respond(["ok" => false, "error" => "Database connection failed."]);
}

$action = isset($_POST['action']) ? trim($_POST['action']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';

if ($action === '' || $email === '') {
    respond(["ok" => false, "error" => "Missing parameters."]);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(["ok" => false, "error" => "Invalid email address."]);
}

try {
    if ($action === 'lookup') {
        $sql = "SELECT full_name, security_question FROM users WHERE email = ? LIMIT 1";
        $stmt = $conn->prepare($sql);
        if (!$stmt) respond(["ok" => false, "error" => "Query error."]);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $res = $stmt->get_result();
        $row = $res ? $res->fetch_assoc() : null;
        $stmt->close();

        if (!$row) {
            respond(["ok" => false, "error" => "No user found with this email."]);
        }

        respond([
            "ok" => true,
            "full_name" => $row["full_name"],
            "security_question" => $row["security_question"]
        ]);
    }

    if ($action === 'verify' || $action === 'update') {
        $answer = isset($_POST['answer']) ? trim($_POST['answer']) : '';
        if ($answer === '') {
            respond(["ok" => false, "error" => "Security answer is required."]);
        }

        $sql = "SELECT security_answer FROM users WHERE email = ? LIMIT 1";
        $stmt = $conn->prepare($sql);
        if (!$stmt) respond(["ok" => false, "error" => "Query error."]);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $res = $stmt->get_result();
        $row = $res ? $res->fetch_assoc() : null;
        $stmt->close();

        if (!$row) {
            respond(["ok" => false, "error" => "No user found with this email."]);
        }

        $storedAnswerHash = $row["security_answer"];
        $isOk = password_verify(strtolower($answer), $storedAnswerHash);
        if (!$isOk) {
            respond(["ok" => false, "error" => "Security answer is incorrect."]);
        }

        if ($action === 'verify') {
            respond(["ok" => true]);
        }

        $newPassword = isset($_POST['new_password']) ? $_POST['new_password'] : '';
        if (strlen($newPassword) < 8) {
            respond(["ok" => false, "error" => "Password must be at least 8 characters long."]);
        }

        $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
        $upd = $conn->prepare("UPDATE users SET password = ? WHERE email = ? LIMIT 1");
        if (!$upd) respond(["ok" => false, "error" => "Update query error."]);
        $upd->bind_param("ss", $newHash, $email);
        $ok = $upd->execute();
        $upd->close();

        if (!$ok) {
            respond(["ok" => false, "error" => "Could not update password."]);
        }

        respond(["ok" => true]);
    }

    respond(["ok" => false, "error" => "Unknown action."]);
} catch (Exception $e) {
    respond(["ok" => false, "error" => "System error: " . $e->getMessage()]);
} finally {
    if (isset($conn)) $conn->close();
}

?>
