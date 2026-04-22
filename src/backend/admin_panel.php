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

// Redirect admin users directly to admin panel after login
if ($_SERVER['PHP_SELF'] === '/index.php' && $_SESSION['role'] === 'admin') {
    header('Location: admin_panel.php');
    exit;
}

include 'db_config.php';

$fullName = $_SESSION['full_name'] ?? 'Admin';
$email = $_SESSION['email'] ?? '';

// Get tab parameter, default to 'all'
$activeTab = isset($_GET['tab']) ? $_GET['tab'] : 'lost'; // Default to 'lost' tab
?>
<!DOCTYPE html>
<html lang="tr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Paneli - Lost and Found</title>
    <link rel="stylesheet" href="../frontend/style.css">
    <link rel="stylesheet" href="../frontend/admin_panel.css">
</head>

<body class="admin-panel-page">
    <nav class="top-nav">
        <a href="index.php" class="brand brand-link" aria-label="Ana sayfaya git">
            <img src="../assets/logo.png" alt="Logo" class="logo" />
            <span>Lost And Found Information System</span>
        </a>

        <div class="nav-actions">
            <div class="auth user">
                <span class="admin-badge">🔐 Yetkili Panel</span>
                <a href="../backend/profile.php" class="icon-btn" title="Profil">👤 Profil</a>
                <a href="../backend/logout.php" class="link-btn secondary">Çıkış Yap</a>
            </div>
        </div>
    </nav>

    <div class="container admin-container">
        <div class="admin-panel">
            <h1>İlanlarım</h1>
            <p>Kayıp ve bulundu ilanlarını buradan görüntüleyebilir, filtreleyebilir ve arayabilirsiniz.</p>
            <div class="filter-buttons">
                <button class="filter-btn active" data-filter="lost">Kayıp</button>
                <button class="filter-btn" data-filter="found">Buluntu</button>
                <button class="filter-btn" data-filter="delivered">Teslim Edilenler</button>
            </div>
            <div class="search-bar">
                <input type="text" id="searchInput" placeholder="Tabloda ara (başlık, kategori, konum, açıklama...)" />
            </div>
            <table class="items-table" id="itemsTable">
                <thead>
                    <tr>
                        <th>Tür</th>
                        <th>Başlık</th>
                        <th>Kategori</th>
                        <th>Renk</th>
                        <th>Konum</th>
                        <th>Tarih</th>
                        <th>Açıklama</th>
                        <th>Oluşturan</th>
                        <th>İşlem</th>
                    </tr>
                </thead>
                <tbody id="itemsBody">
                    <tr>
                        <td colspan="9">Yükleniyor...</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
                    <tbody id="delivered-body">
                        <tr>
                            <td colspan="8" class="loading">Yükleniyor...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Logout Button at Bottom -->
    <div class="logout-container">
        <a href="../backend/logout.php" class="logout-btn">Çıkış Yap</a>
    </div>

    <!-- Delivery Modal -->
    <div id="deliveryModal" class="modal hidden">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Eşya Teslim Et</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p id="itemInfo" class="item-info"></p>
                <label for="recipientSelect">Teslim Alıcı Seçiniz:</label>
                <select id="recipientSelect" class="recipient-select">
                    <option value="">Yükleniyor...</option>
                </select>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" id="cancelDelivery">İptal</button>
                <button class="btn-confirm" id="confirmDelivery">Teslim Et</button>
            </div>
        </div>
    </div>

    <script src="../frontend/js/admin_panel.js"></script>
</body>

</html>