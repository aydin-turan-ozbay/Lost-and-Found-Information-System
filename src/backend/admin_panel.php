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

$fullName = $_SESSION['full_name'] ?? 'Admin';
$email = $_SESSION['email'] ?? '';

// Get tab parameter, default to 'all'
$activeTab = isset($_GET['tab']) ? $_GET['tab'] : 'all';
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
        <div class="admin-header">
            <h1>Admin Yönetim Paneli</h1>
            <p>Tüm kayıp ve buluntu eşyalarını yönetin</p>
        </div>

        <!-- Tab Navigation -->
        <div class="tab-navigation">
            <button class="tab-btn <?php echo $activeTab === 'all' ? 'active' : ''; ?>" data-tab="all">
                📋 Tümü
            </button>
            <button class="tab-btn <?php echo $activeTab === 'lost' ? 'active' : ''; ?>" data-tab="lost">
                🔍 Kayıp Eşyalar
            </button>
            <button class="tab-btn <?php echo $activeTab === 'found' ? 'active' : ''; ?>" data-tab="found">
                📦 Bulunan Eşyalar
            </button>
            <button class="tab-btn <?php echo $activeTab === 'delivered' ? 'active' : ''; ?>" data-tab="delivered">
                ✅ Teslim Edilenler
            </button>
        </div>

        <!-- Items Table Container -->
        <div class="table-container">
            <div id="all-tab" class="tab-content <?php echo $activeTab === 'all' ? 'active' : ''; ?>">
                <table class="admin-table" id="all-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Başlık</th>
                            <th>Tür</th>
                            <th>Kategori</th>
                            <th>Konum</th>
                            <th>İlan Sahibi</th>
                            <th>Durum</th>
                            <th>Tarih</th>
                            <th>İşlem</th>
                        </tr>
                    </thead>
                    <tbody id="all-body">
                        <tr>
                            <td colspan="9" class="loading">Yükleniyor...</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div id="lost-tab" class="tab-content <?php echo $activeTab === 'lost' ? 'active' : ''; ?>">
                <table class="admin-table" id="lost-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Başlık</th>
                            <th>Kategori</th>
                            <th>Konum</th>
                            <th>İlan Sahibi</th>
                            <th>Durum</th>
                            <th>Tarih</th>
                            <th>İşlem</th>
                        </tr>
                    </thead>
                    <tbody id="lost-body">
                        <tr>
                            <td colspan="8" class="loading">Yükleniyor...</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div id="found-tab" class="tab-content <?php echo $activeTab === 'found' ? 'active' : ''; ?>">
                <table class="admin-table" id="found-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Başlık</th>
                            <th>Kategori</th>
                            <th>Konum</th>
                            <th>İlan Sahibi</th>
                            <th>Durum</th>
                            <th>Tarih</th>
                            <th>İşlem</th>
                        </tr>
                    </thead>
                    <tbody id="found-body">
                        <tr>
                            <td colspan="8" class="loading">Yükleniyor...</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div id="delivered-tab" class="tab-content <?php echo $activeTab === 'delivered' ? 'active' : ''; ?>">
                <table class="admin-table" id="delivered-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Başlık</th>
                            <th>Tür</th>
                            <th>Kategori</th>
                            <th>Konum</th>
                            <th>Bulanlar</th>
                            <th>Teslim Alıcı</th>
                            <th>Tarih</th>
                        </tr>
                    </thead>
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

    <script src="../frontend/admin_panel.js"></script>
</body>

</html>