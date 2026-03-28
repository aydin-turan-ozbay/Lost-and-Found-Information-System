<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header('Location: ../frontend/login.html');
    exit;
}
$fullName  = isset($_SESSION['full_name'])  ? $_SESSION['full_name']  : '-';
$role      = isset($_SESSION['role'])       ? $_SESSION['role']       : '-';
$email     = isset($_SESSION['email'])      ? $_SESSION['email']      : '-';
$studentId = isset($_SESSION['student_id']) ? $_SESSION['student_id'] : '-';

// Avatar initials (first letters of each word, max 2)
$words    = explode(' ', trim($fullName));
$initials = '';
foreach ($words as $w) {
    if ($w !== '') $initials .= mb_strtoupper(mb_substr($w, 0, 1));
}
$initials = mb_substr($initials, 0, 2);

$roleLabels = [
    'student'      => ['label' => 'Öğrenci',    'color' => '#4f70ff'],
    'staff'        => ['label' => 'Personel',   'color' => '#27ae60'],
    'academician'  => ['label' => 'Akademisyen','color' => '#e67e22'],
    'visitor'      => ['label' => 'Ziyaretçi',  'color' => '#8e44ad'],
];
$roleMeta = isset($roleLabels[$role]) ? $roleLabels[$role] : ['label' => htmlspecialchars($role), 'color' => '#888'];
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profilim - Lost and Found</title>
    <link rel="stylesheet" href="../frontend/style.css">
    <style>
        .profile-wrapper {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 16px;
        }

        .profile-card {
            background: #fff;
            border-radius: 24px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
            width: 100%;
            max-width: 420px;
        }

        .profile-card-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 36px 24px 52px;
            text-align: center;
            position: relative;
            border-radius: 24px 24px 0 0;
        }

        .profile-card-header h2 {
            color: rgba(255,255,255,0.85);
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            margin-bottom: 0;
        }

        .avatar {
            width: 88px;
            height: 88px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border: 4px solid #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            font-weight: 700;
            color: #fff;
            position: absolute;
            bottom: -44px;
            left: 50%;
            transform: translateX(-50%);
            box-shadow: 0 8px 28px rgba(102, 126, 234, 0.45);
            letter-spacing: 1px;
        }

        .profile-card-body {
            padding: 60px 32px 32px;
            text-align: center;
        }

        .profile-name {
            font-size: 22px;
            font-weight: 700;
            color: #1a1a2e;
            margin-bottom: 6px;
        }

        .role-badge {
            display: inline-block;
            padding: 4px 14px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 700;
            color: #fff;
            margin-bottom: 28px;
            letter-spacing: 0.5px;
        }

        .info-list {
            background: #f7f8ff;
            border-radius: 14px;
            padding: 4px 0;
            margin-bottom: 28px;
            text-align: left;
        }

        .info-row {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 14px 20px;
            border-bottom: 1px solid #eef0fb;
        }

        .info-row:last-child {
            border-bottom: none;
        }

        .info-icon {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            flex-shrink: 0;
        }

        .info-text {
            display: flex;
            flex-direction: column;
        }

        .info-label {
            font-size: 11px;
            font-weight: 600;
            color: #aaa;
            text-transform: uppercase;
            letter-spacing: 0.8px;
        }

        .info-value {
            font-size: 15px;
            font-weight: 600;
            color: #2d2d44;
            margin-top: 1px;
        }

        .profile-actions {
            display: flex;
            gap: 12px;
        }

        .profile-actions a {
            flex: 1;
            text-align: center;
            padding: 12px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 14px;
            text-decoration: none;
            transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
        }

        .profile-actions a:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 18px rgba(0,0,0,0.12);
            filter: brightness(0.96);
        }

        .btn-home {
            background: #f0f2ff;
            color: #4f70ff;
            border: 1.5px solid #d8e0ff;
        }

        .btn-logout {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: #fff;
        }
    </style>
</head>
<body>
    <div class="profile-wrapper">
        <div class="profile-card">
            <div class="profile-card-header">
                <h2>Profil Bilgilerim</h2>
                <div class="avatar"><?= htmlspecialchars($initials) ?></div>
            </div>

            <div class="profile-card-body">
                <div class="profile-name"><?= htmlspecialchars($fullName) ?></div>
                <span class="role-badge" style="background:<?= $roleMeta['color'] ?>;">
                    <?= htmlspecialchars($roleMeta['label']) ?>
                </span>

                <div class="info-list">
                    <div class="info-row">
                        <div class="info-icon">👤</div>
                        <div class="info-text">
                            <span class="info-label">Ad Soyad</span>
                            <span class="info-value"><?= htmlspecialchars($fullName) ?></span>
                        </div>
                    </div>
                    <div class="info-row">
                        <div class="info-icon">🎓</div>
                        <div class="info-text">
                            <span class="info-label">Öğrenci / Personel No</span>
                            <span class="info-value"><?= htmlspecialchars($studentId) ?></span>
                        </div>
                    </div>
                    <div class="info-row">
                        <div class="info-icon">✉️</div>
                        <div class="info-text">
                            <span class="info-label">E-posta</span>
                            <span class="info-value"><?= htmlspecialchars($email) ?></span>
                        </div>
                    </div>
                </div>

                <div class="profile-actions">
                    <a href="index.php" class="btn-home">Geri</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>