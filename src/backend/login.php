<?php
session_start();
require_once 'db_config.php'; 

// Hata raporlamayı açalım ki bir sorun olursa görebilelim
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    exit('Invalid request method.');
}

$identifier = isset($_POST['identifier']) ? trim($_POST['identifier']) : '';
$password   = isset($_POST['password']) ? $_POST['password'] : '';
$next       = isset($_POST['next']) ? trim($_POST['next']) : '';
$nextParam  = $next !== '' ? '&next=' . urlencode($next) : '';

// 1. Boş alan kontrolü
if (empty($identifier) || empty($password)) {
    // Hata durumunda login sayfasına geri gönderir
    header("Location: ../frontend/login.html?status=empty" . $nextParam);
    exit;
}

try {
    // 2. Kullanıcıyı sorgula
    $stmt = $conn->prepare("SELECT * FROM users WHERE student_id = ? OR email = ?");
    $stmt->bind_param("ss", $identifier, $identifier);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    // 3. Şifre doğrulama ve Yönlendirme
    if ($user && password_verify($password, $user['password'])) {
        // Session bilgilerini kaydet
        $_SESSION['user_id']   = $user['id'];
        $_SESSION['role']      = $user['role'];
        $_SESSION['full_name'] = $user['full_name'];
        $_SESSION['email']     = $user['email'];
        $_SESSION['student_id']= $user['student_id'];

        // BASARILI: next parametresine gore yonlendir
        if ($next === 'dashboard') {
            header("Location: ../frontend/dashboard.html");
        } else {
            header("Location: index.php");
        }
        exit();
    } else {
        // HATALI: Şifre veya kullanıcı yanlışsa geri gönder
        header("Location: ../frontend/login.html?status=error" . $nextParam);
        exit();
    }
} catch (Exception $e) {
    die("System Error: " . $e->getMessage());
}

$conn->close();
?>