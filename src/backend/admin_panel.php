<?php
session_start();

// Admin Access Control
if (!isset($_SESSION['user_id'])) {
    header('Location: ../frontend/login.html');
    exit;
}

if ($_SESSION['role'] !== 'admin') {
    header('Location: index.php');
    exit;
}

include 'db_config.php';

// Data
$fullName = $_SESSION['full_name'] ?? 'Admin';
$email = $_SESSION['email'] ?? '';
$activeTab = $_GET['tab'] ?? 'lost';

// View çağır
include '../frontend/admin_panel.html';