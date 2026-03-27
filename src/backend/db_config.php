<?php
// Veritabanı bağlantı ayarları
$DB_HOST = 'localhost';
$DB_USER = 'root';
$DB_PASS = '';
$DB_NAME = 'lost_found_system';

$conn = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
if ($conn->connect_error) {
    die('Database bağlantısı başarısız: ' . $conn->connect_error);
}
$conn->set_charset('utf8mb4');
