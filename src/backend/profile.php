<?php
session_start();


if (!isset($_SESSION['user_id'])) {
    header('Location: ../frontend/login.html');
    exit;
}

$fullName  = $_SESSION['full_name']  ?? '-';
$role      = $_SESSION['role']       ?? 'visitor';
$email     = $_SESSION['email']      ?? '-';
$studentId = $_SESSION['student_id'] ?? '-';


$words    = explode(' ', trim($fullName));
$initials = '';
foreach ($words as $w) {
    if ($w !== '') $initials .= mb_strtoupper(mb_substr($w, 0, 1));
}
$initials = mb_substr($initials, 0, 2);

$roleLabels = [
    'student'     => ['label' => 'Öğrenci',     'color' => '#4f70ff'],
    'staff'       => ['label' => 'Personel',    'color' => '#27ae60'],
    'academician' => ['label' => 'Akademisyen', 'color' => '#e67e22'],
    'visitor'     => ['label' => 'Ziyaretçi',   'color' => '#8e44ad'],
];

$roleMeta = $roleLabels[$role] ?? ['label' => htmlspecialchars($role), 'color' => '#888'];

include '../frontend/profile.html';
?>