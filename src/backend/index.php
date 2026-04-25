<?php
session_start();
$loggedIn = isset($_SESSION['user_id']);
$fullName = isset($_SESSION['full_name']) ? $_SESSION['full_name'] : '';
$role = isset($_SESSION['role']) ? $_SESSION['role'] : '';
$isAdmin = ($role === 'admin');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Panel - Lost and Found</title>
    <link rel="stylesheet" href="../frontend/style.css?v=20260425">
</head>
<body class="home-page">
    <div class="page-loader" id="pageLoader" aria-label="Loading" role="status">
        <div class="loader-spinner"></div>
    </div>

    <nav class="top-nav">
        <a href="index.php" class="brand brand-link" aria-label="Go to home page">
            <img src="../assets/logo.png" alt="Logo" class="logo" />
            <span>Lost And Found Information System</span>
        </a>

        <button type="button" class="nav-toggle" aria-label="Menu" aria-expanded="false" aria-controls="navActions">☰</button>

        <div class="nav-actions" id="navActions">
            <?php if ($loggedIn): ?>
                <div class="auth user">
                    <?php if ($isAdmin): ?>
                        <?php endif; ?>
                    <a href="profile.php" class="icon-btn" title="Profile">👤 Profile</a>
                    <a href="logout.php" class="link-btn secondary">Logout</a>
                </div>
            <?php else: ?>
                <div class="auth guest">
                    <a href="../frontend/login.html" class="link-btn">Login</a>
                    <a href="../frontend/register.html" class="link-btn secondary">Register</a>
                </div>
            <?php endif; ?>
        </div>
    </nav>

    <div class="container">
        <section class="hero">
            <?php if ($loggedIn): ?>
                <h1>Welcome, <?= htmlspecialchars($fullName) ?>!</h1>
            <?php else: ?>
                <h1>Welcome!</h1>
            <?php endif; ?>
            <p>A reliable platform for quickly reporting lost or found items.</p>
            <div class="hero-actions">
                <?php if ($loggedIn): ?>
                    <?php if ($isAdmin): ?>
                        <a href="admin_panel.php" class="action-btn">Admin Panel</a>
                    <?php else: ?>
                        <a href="../frontend/dashboard.html" class="action-btn">Post an Ad</a>
                        <a href="../frontend/my_items.html" class="action-btn secondary">View My Ads</a>
                    <?php endif; ?>
                <?php else: ?>
                    <a href="../frontend/login.html?next=dashboard" class="action-btn">Post an Ad</a>
                <?php endif; ?>
            </div>
        </section>
    </div>

    <script src="../frontend/js/page-loader.js"></script>
    <script src="../frontend/js/nav.js?v=20260425"></script>
</body>
</html>