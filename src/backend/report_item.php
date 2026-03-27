<?php
session_start();
require_once 'db_config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    die('Geçersiz istek yöntemi.');
}

$type = $_POST['type'] ?? '';
$title = trim($_POST['title'] ?? '');
$category = trim($_POST['category'] ?? '');
$color = trim($_POST['color'] ?? '');
$location = trim($_POST['location'] ?? '');
$item_date = trim($_POST['item_date'] ?? '');
$description = trim($_POST['description'] ?? '');

if (!in_array($type, ['lost', 'found'], true)) {
    die('Geçersiz ilan türü.');
}

if ($title === '' || $category === '' || $location === '' || $item_date === '') {
    die('Lütfen zorunlu alanları doldurunuz.');
}

$upload_dir = __DIR__ . '/../uploads/';
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

$uploaded_files = [];
$allowed_exts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
$file_count = 0;

if (isset($_FILES['item_image']) && !empty($_FILES['item_image']['name'][0])) {
    $file_count = count($_FILES['item_image']['name']);
    if ($file_count > 5) {
        die('Hata: En fazla 5 fotoğraf yükleyebilirsiniz.');
    }

    for ($i = 0; $i < $file_count; $i++) {
        if ($_FILES['item_image']['error'][$i] === UPLOAD_ERR_OK) {
            $name = $_FILES['item_image']['name'][$i];
            $tmp = $_FILES['item_image']['tmp_name'][$i];
            $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));

            if (in_array($ext, $allowed_exts, true)) {
                $new_name = uniqid('IMG_', true) . '.' . $ext;
                $file_path = $upload_dir . $new_name;
                $relative_path = 'uploads/' . $new_name;

                if (move_uploaded_file($tmp, $file_path)) {
                    $uploaded_files[] = $relative_path;
                }
            }
        }
    }
}

$images_json = json_encode($uploaded_files, JSON_UNESCAPED_UNICODE);

$stmt = $conn->prepare(
    'INSERT INTO reports (type, title, category, color, location, item_date, description, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
);
if (!$stmt) {
    die('Veritabanı sorgusu hazırlanamadı: ' . $conn->error);
}

$stmt->bind_param(
    'ssssssss',
    $type,
    $title,
    $category,
    $color,
    $location,
    $item_date,
    $description,
    $images_json
);

if ($stmt->execute()) {
    $stmt->close();
    $conn->close();
    header('Location: ../frontend/dashboard.html');
    exit;
}

$error_message = $stmt->error ?: 'Bilinmeyen bir hata ortaya çıktı.';
$stmt->close();
$conn->close();
die('Veritabanı kaydı sırasında hata oluştu: ' . $error_message);
?>