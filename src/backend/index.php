<?php
session_start();
$loggedIn = isset($_SESSION['user_id']);
$fullName = isset($_SESSION['full_name']) ? $_SESSION['full_name'] : '';
$role = isset($_SESSION['role']) ? $_SESSION['role'] : '';
$isAdmin = ($role === 'admin');
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Öğrenci Paneli - Lost and Found</title>
    <link rel="stylesheet" href="../frontend/style.css">
</head>
<body>
    <div class="page-loader" id="pageLoader" aria-label="Yükleniyor" role="status">
        <div class="loader-spinner"></div>
    </div>

    <nav class="top-nav">
        <a href="index.php" class="brand brand-link" aria-label="Ana sayfaya git">
            <img src="../assets/logo.png" alt="Logo" class="logo" />
            <span>Lost And Found Information System</span>
        </a>

        <div class="nav-actions">
            <?php if ($loggedIn): ?>
                <div class="auth user">
                    <?php if ($isAdmin): ?>
                        <a href="admin_panel.php" class="icon-btn" title="Admin Paneli">🔐 Admin Paneli</a>
                    <?php endif; ?>
                    <a href="profile.php" class="icon-btn" title="Profil">👤 Profil</a>
                    <a href="logout.php" class="link-btn secondary">Çıkış Yap</a>
                </div>
            <?php else: ?>
                <div class="auth guest">
                    <a href="../frontend/login.html" class="link-btn">Giriş Yap</a>
                    <a href="../frontend/register.html" class="link-btn secondary">Kayıt Ol</a>
                </div>
            <?php endif; ?>
        </div>
    </nav>

    <div class="container">
        <section class="hero">
            <?php if ($loggedIn): ?>
                <h1>Hoş Geldin, <?= htmlspecialchars($fullName) ?>!</h1>
            <?php else: ?>
                <h1>Hoş Geldin!</h1>
            <?php endif; ?>
            <p>Kaybolan ya da bulunan eşyaların hızlıca kaydedildiği güvenilir platform.</p>
            <div class="hero-actions">
                <?php if ($loggedIn): ?>
                    <a href="../frontend/dashboard.html" class="action-btn">İlan Ver</a>
                    <a href="../frontend/my_items.html" class="action-btn secondary">İlanlarımı Görüntüle</a>
                <?php else: ?>
                    <a href="../frontend/login.html?next=dashboard" class="action-btn">İlan Ver</a>
                <?php endif; ?>
            </div>
        </section>
    </div>

    <script src="../frontend/js/page-loader.js"></script>
</body>
</html>