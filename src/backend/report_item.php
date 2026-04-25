<?php
session_start();
require_once 'db_config.php';

// Session Control
if (!isset($_SESSION['user_id'])) {
    die(json_encode(["ok" => false, "error" => "Please log in first."]));
}

$user_id = $_SESSION['user_id'];

// 1. Get Form Data (Must be compatible with SQL ENUM values)
$title       = $_POST['title'] ?? '';
$category    = $_POST['category'] ?? ''; // SQL ENUM: 'electronic', 'wallet', etc.
$color       = $_POST['color'] ?? NULL;
$location    = $_POST['location'] ?? ''; // SQL ENUM: 'bakirkoy campus', etc.
$item_date   = $_POST['item_date'] ?? date('Y-m-d');
$description = $_POST['description'] ?? NULL;

// Distinguishing 'type' (lost/found) and 'status' (active)
$item_type   = $_POST['type'] ?? 'lost'; 
$item_status = 'active'; // Set to active by default, not taken from user input.

// 2. Multiple File Upload Logic
$uploaded_paths = [];
$allowed_exts   = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
$upload_dir     = '../assets/uploads/';

if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

if (isset($_FILES['item_image'])) {
    $file_count = count($_FILES['item_image']['name']);
    // Limit to maximum 5 images
    for ($i = 0; $i < min($file_count, 5); $i++) {
        if ($_FILES['item_image']['error'][$i] === 0) {
            $name = $_FILES['item_image']['name'][$i];
            $tmp  = $_FILES['item_image']['tmp_name'][$i];
            $ext  = strtolower(pathinfo($name, PATHINFO_EXTENSION));

            if (in_array($ext, $allowed_exts)) {
                $new_name = uniqid('IMG_', true) . '.' . $ext;
                $target_path = $upload_dir . $new_name;
                if (move_uploaded_file($tmp, $target_path)) {
                    $uploaded_paths[] = 'assets/uploads/' . $new_name;
                }
            }
        }
    }
}

$images_string = !empty($uploaded_paths) ? implode(',', $uploaded_paths) : NULL;

// 3. Database INSERT (Column names match SQL schema)
// Columns: user_id, title, category, color, location, item_date, description, type, status, image_path
$sql = "INSERT INTO items (user_id, title, category, color, location, item_date, description, type, status, image_path) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);

if ($stmt) {
    // 10 parameters: 1 integer (i), 9 strings (s)
    $stmt->bind_param("isssssssss", 
        $user_id, 
        $title, 
        $category, 
        $color, 
        $location, 
        $item_date, 
        $description, 
        $item_type,    // Goes to SQL 'type' column (lost/found)
        $item_status,  // Goes to SQL 'status' column (active)
        $images_string // Image file paths
    );
    
    if ($stmt->execute()) {
        header("Location: ../frontend/dashboard.html?status=success");
        exit();
    } else {
        // Technical detail for debugging:
        die("Database Error: " . $stmt->error);
    }
} else {
    die("Query Preparation Error: " . $conn->error);
}

$stmt->close();
$conn->close();
?>