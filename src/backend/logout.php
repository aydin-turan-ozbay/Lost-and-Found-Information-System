<?php
session_start();
// Tüm session değerlerini temizle
$_SESSION = array();

// Oturumu yok et
session_destroy();

// Ana sayfaya geri yonlendir
header('Location: index.php');
exit;
?>