<?php
// Veritabanı bilgileri
$host = "localhost";
$username = "root";
$password = "261907fb"; // Buraya kendi Workbench şifreni yaz!
$db_name = "lost_found_db"; // Veritabanı adını güncelledim

// Bağlantıyı oluştur
$conn = new mysqli($host, $username, $password, $db_name);

// Bağlantıyı kontrol et
if ($conn->connect_error) {
    // Eğer bağlantı hatası varsa JSON olarak döndür ki register.php yakalayabilsin
    header('Content-Type: application/json');
    die(json_encode(["ok" => false, "error" => "Veritabanına bağlanılamadı: " . $conn->connect_error]));
}

// Türkçe karakter desteği
$conn->set_charset("utf8mb4");
?>