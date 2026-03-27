<?php
session_start();
require_once 'db_config.php';

// 1. Dosya Sayısı Kontrolü
if (isset($_FILES['item_image'])) {
    $file_count = count($_FILES['item_image']['name']);
    
    if ($file_count > 5) {
        die("Hata: En fazla 5 fotoğraf yükleyebilirsiniz.");
    }
}

// 2. Çoklu Dosya Yükleme Mantığı
$uploaded_files = [];
$allowed_exts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

for ($i = 0; $i < $file_count; $i++) {
    if ($_FILES['item_image']['error'][$i] === 0) {
        $name = $_FILES['item_image']['name'][$i];
        $tmp  = $_FILES['item_image']['tmp_name'][$i];
        $ext  = strtolower(pathinfo($name, PATHINFO_EXTENSION));

        if (in_array($ext, $allowed_exts)) {
            $new_name = uniqid('IMG_', true) . '.' . $ext;
            $path = '../uploads/' . $new_name;

            if (move_uploaded_file($tmp, $path)) {
                $uploaded_files[] = $path; // Veritabanına kaydedilmek üzere diziye ekle
            }
        }
    }
}

// 3. Veritabanı Kaydı
// Fotoğraf yollarını veritabanında saklamak için genelde JSON formatı 
// veya virgülle ayrılmış bir string tercih edilir.
$images_json = json_encode($uploaded_files);

// SQL Sorgunuza $images_json değişkenini dahil edilebilir.
?>