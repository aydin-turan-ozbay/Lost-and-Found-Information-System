<?php
session_start();
require_once 'db_config.php';

// Oturum kontrolü
if (!isset($_SESSION['user_id'])) {
    die(json_encode(["ok" => false, "error" => "Lütfen önce giriş yapın."]));
}

$user_id = $_SESSION['user_id'];

// 1. Form Verilerini Al (Görseldeki Form Alanları ile Uyumlu)
$title       = $_POST['title'] ?? '';
$category    = $_POST['category'] ?? '';
$color       = $_POST['color'] ?? '';
$location    = $_POST['location'] ?? '';
$item_date   = $_POST['item_date'] ?? date('Y-m-d');
$description = $_POST['description'] ?? '';
$status      = $_POST['type'] ?? 'lost'; // lost veya found

// 2. Çoklu Dosya Yükleme Mantığı
$uploaded_paths = [];
$allowed_exts   = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
$upload_dir     = '../assets/uploads/'; // Klasörün var olduğundan emin ol

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
                    // Veritabanına kaydedilecek kısa yolu ekle
                    $uploaded_paths[] = 'assets/uploads/' . $new_name;
                }
            }
        }
    }
}

// Fotoğraf yollarını veritabanı sütununa sığması için virgülle birleştiriyoruz
// (Şeman VARCHAR(255) olduğu için çok fazla fotoğraf uzunluğu aşabilir, JSON yerine bu daha güvenli)
$images_string = implode(',', $uploaded_paths);

// 3. Veritabanına INSERT (SQL Sorgusu)
$sql = "INSERT INTO items (user_id, title, category, color, location, item_date, description, status, image_path) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);

if ($stmt) {
    // i (int), s (string) -> Toplam 1 int, 8 string parametre
    $stmt->bind_param("issssssss", $user_id, $title, $category, $color, $location, $item_date, $description, $status, $images_string);
    
    if ($stmt->execute()) {
        // Başarılı! Dashboard'a yönlendir
        header("Location: ../frontend/dashboard.html?status=success");
        exit();
    } else {
        die("Veritabanı Hatası: " . $stmt->error);
    }
} else {
    die("Sorgu Hazırlama Hatası: " . $conn->error);
}

$stmt->close();
$conn->close();
?>