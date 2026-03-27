<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json; charset=utf-8');
require_once 'db_config.php'; 

// 1. Get data from form (English fields)
$full_name  = isset($_POST['full_name']) ? trim($_POST['full_name']) : '';
$email      = isset($_POST['email']) ? trim($_POST['email']) : '';
$student_id = isset($_POST['student_id']) ? trim($_POST['student_id']) : '';
$password   = isset($_POST['password']) ? $_POST['password'] : '';
$role       = isset($_POST['role']) ? $_POST['role'] : 'student';

// 2. Empty field and Password length check (8 chars)
if (empty($full_name) || empty($email) || empty($student_id) || empty($password)) {
    echo json_encode(["ok" => false, "error" => "Please fill in all required fields!"]);
    exit;
}

if (strlen($password) < 8) {
    echo json_encode(["ok" => false, "error" => "Password must be at least 8 characters long!"]);
    exit;
}

// 3. Database connection check
if (!isset($conn) || $conn->connect_error) {
    echo json_encode(["ok" => false, "error" => "Database connection failed!"]);
    exit;
}

try {
    // 4. Duplicate check (Email or Student ID)
    $check_sql = "SELECT id FROM users WHERE email = ? OR student_id = ?";
    $stmt = $conn->prepare($check_sql);
    
    if (!$stmt) {
        die(json_encode(["ok" => false, "error" => "Check query error: " . $conn->error]));
    }

    $stmt->bind_param("ss", $email, $student_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode(["ok" => false, "error" => "This Email or Student ID is already registered!"]);
        exit;
    }

    // 5. Hash the password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // 6. Save to Database (English column names)
    $insert_sql = "INSERT INTO users (full_name, email, student_id, password, role) VALUES (?, ?, ?, ?, ?)";
    $insert_stmt = $conn->prepare($insert_sql);

    if (!$insert_stmt) {
        echo json_encode(["ok" => false, "error" => "Statement preparation error: " . $conn->error]);
        exit;
    }

    // 5 "s" for 5 string variables
    $insert_stmt->bind_param("sssss", $full_name, $email, $student_id, $hashed_password, $role);

    if ($insert_stmt->execute()) {
        // Redirect on success
        header("Location: ../frontend/login.html?status=success");
        exit();
    } else {
        echo json_encode(["ok" => false, "error" => "SQL error during registration: " . $insert_stmt->error]);
    }

} catch (Exception $e) {
    echo json_encode(["ok" => false, "error" => "System error: " . $e->getMessage()]);
}

$conn->close();
?>