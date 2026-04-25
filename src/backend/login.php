<?php
session_start();
require_once 'db_config.php';

// Enable error reporting for debugging purposes
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    exit('Invalid request method.');
}

$identifier = isset($_POST['identifier']) ? trim($_POST['identifier']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';
$next = isset($_POST['next']) ? trim($_POST['next']) : '';
$nextParam = $next !== '' ? '&next=' . urlencode($next) : '';

// 1. Check for empty fields
if (empty($identifier) || empty($password)) {
    // Redirect back to login page with status on empty fields
    header("Location: ../frontend/login.html?status=empty" . $nextParam);
    exit;
}

try {
    // 2. Query user by Student ID or Email
    $stmt = $conn->prepare("SELECT * FROM users WHERE student_id = ? OR email = ?");
    $stmt->bind_param("ss", $identifier, $identifier);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    // 3. Password Verification and Redirection
    if ($user && password_verify($password, $user['password'])) {
        // Store user information in session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['full_name'] = $user['full_name'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['student_id'] = $user['student_id'];

        // SUCCESS: Redirect based on role or 'next' parameter
        if ($user['role'] === 'admin') {
            header("Location: index.php");
            exit();
        } elseif ($next === 'dashboard') {
            header("Location: ../frontend/dashboard.html");
        } elseif ($next === 'my_items') {
            header("Location: ../frontend/my_items.html");
        } else {
            header("Location: index.php");
        }
        exit();
    } else {
        // ERROR: Redirect back to login page if credentials are incorrect
        header("Location: ../frontend/login.html?status=error" . $nextParam);
        exit();
    }
} catch (Exception $e) {
    die("System Error: " . $e->getMessage());
}

$conn->close();
?>