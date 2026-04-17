<?php
session_start();
require_once 'db_config.php';

// Oturum kontrolü
if (!isset($_SESSION['user_id'])) {
    die(json_encode(["ok" => false, "error" => "Lütfen önce giriş yapın."]));
}

$user_id = $_SESSION['user_id'];

// 1. Form Verilerini Al (ENUM değerleriyle uyumlu olmalı)
$title       = $_POST['title'] ?? '';
$category    = $_POST['category'] ?? ''; // SQL ENUM: 'electronic', 'wallet', etc.
$color       = $_POST['color'] ?? NULL;
$location    = $_POST['location'] ?? ''; // SQL ENUM: 'bakırköy campus', etc.
$item_date   = $_POST['item_date'] ?? date('Y-m-d');
$description = $_POST['description'] ?? NULL;

// SQL Şemandaki 'type' (lost/found) ve 'status' (active) ayrımı
$item_type   = $_POST['type'] ?? 'lost'; 
$item_status = 'active'; // Kullanıcıdan almıyoruz, varsayılan olarak active set ediyoruz.

// 2. Çoklu Dosya Yükleme Mantığı
$uploaded_paths = [];
$allowed_exts   = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
$upload_dir     = '../assets/uploads/';

if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

if (isset($_FILES['item_image'])) {
    $file_count = count($_FILES['item_image']['name']);
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

// 3. Veritabanına INSERT (Sütun isimleri SQL şemanla %100 uyumlu)
// Sütunlar: user_id, title, category, color, location, item_date, description, type, status, image_path
$sql = "INSERT INTO items (user_id, title, category, color, location, item_date, description, type, status, image_path) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);

if ($stmt) {
    // Toplam 10 parametre: 1 int (i), 9 string (s)
    $stmt->bind_param("isssssssss", 
        $user_id, 
        $title, 
        $category, 
        $color, 
        $location, 
        $item_date, 
        $description, 
        $item_type,    // SQL'deki 'type' sütununa (lost/found) gider
        $item_status,  // SQL'deki 'status' sütununa (active) gider
        $images_string // Fotoğraf yolları
    );
    
    if ($stmt->execute()) {
        header("Location: ../frontend/dashboard.html?status=success");
        exit();
    } else {
        // Hata durumunda teknik detayı görmek için:
        die("Veritabanı Hatası: " . $stmt->error);
    }
} else {
    die("Sorgu Hazırlama Hatası: " . $conn->error);
}

$stmt->close();
$conn->close();
?>