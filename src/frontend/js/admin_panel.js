// --- DEĞİŞKENLER ---
let currentFilter = 'lost';
let allItems = [];
let currentDeliveryItem = null;

// --- SAYFA YÜKLENDİĞİNDE ÇALIŞACAKLAR ---
document.addEventListener('DOMContentLoaded', () => {
    // İlk verileri yükle
    fetchItems();

    // Filtre butonlarına dinleyici ekle
    setupFilterButtons();

    // Arama kutusuna dinleyici ekle
    const searchInput = document.querySelector('#searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterSearch);
    }

    // Modal Kontrolleri
    const cancelBtn = document.getElementById('cancelDelivery');
    const closeBtn = document.querySelector('.modal-close');
    const confirmBtn = document.getElementById('confirmDelivery');
    const modal = document.getElementById('deliveryModal');

    if (cancelBtn) cancelBtn.addEventListener('click', closeDeliveryModal);
    if (closeBtn) closeBtn.addEventListener('click', closeDeliveryModal);
    if (confirmBtn) confirmBtn.addEventListener('click', confirmDelivery);

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) closeDeliveryModal();
        });
    }
});

// --- VERİ ÇEKME FONKSİYONLARI ---
function fetchItems() {
    // Not: tabType parametresini kaldırıp tüm admin itemlarını çekiyoruz
    fetch('../backend/get_admin_items.php')
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                allItems = data.items;
                renderItems(allItems, currentFilter);
            } else {
                console.error(data.error);
            }
        })
        .catch(error => console.error('Error fetching items:', error));
}

// --- TABLO OLUŞTURMA ---
function renderItems(items, filter) {
    const tableBody = document.querySelector('#itemsBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';

    let filteredItems = items;
    if (filter === 'lost') {
        filteredItems = items.filter(item => item.type === 'lost');
    } else if (filter === 'found') {
        // Teslim edilmemiş buluntular
        filteredItems = items.filter(item => item.type === 'found' && (item.status === 'active' || item.delivered_to_user_id == null));
    } else if (filter === 'delivered') {
        // Teslim edilmişler
        filteredItems = items.filter(item => item.delivered_to_user_id != null || item.status === 'delivered');
    }

    if (filteredItems.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9">Bu filtre için ilan bulunamadı.</td></tr>';
        return;
    }

    filteredItems.forEach(item => {
        const row = document.createElement('tr');
        // Sadece 'buluntu' sekmesindeyken 'Teslim Et' butonunu göster
        const showDeliverBtn = (filter === 'found' && item.type === 'found' && item.status !== 'delivered');
        
        row.innerHTML = `
            <td>${item.type === 'lost' ? 'Kayıp' : 'Buluntu'}</td>
            <td>${escapeHtml(item.title)}</td>
            <td>${escapeHtml(item.category)}</td>
            <td>${escapeHtml(item.color || '-')}</td>
            <td>${escapeHtml(item.location)}</td>
            <td>${item.item_date}</td>
            <td>${escapeHtml(item.description)}</td>
            <td>${escapeHtml(item.full_name)} (${item.student_id})</td>
            <td>${showDeliverBtn ? `<button class="deliver-btn btn-deliver" onclick="openDeliveryModal(${item.id}, '${escapeHtml(item.title)}')">✓ Teslim Et</button>` : '-'}</td>
        `;
        tableBody.appendChild(row);
    });
}

// --- FİLTRELEME VE ARAMA ---
function setupFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            filterSearch();
        });
    });
}

function filterSearch() {
    const searchTerm = document.querySelector('#searchInput').value.toLowerCase();
    let filtered = allItems;

    // Önce tab filtresi
    if (currentFilter === 'lost') {
        filtered = allItems.filter(item => item.type === 'lost');
    } else if (currentFilter === 'found') {
        filtered = allItems.filter(item => item.type === 'found' && item.status !== 'delivered');
    } else if (currentFilter === 'delivered') {
        filtered = allItems.filter(item => item.status === 'delivered');
    }

    // Sonra arama terimi filtresi
    if (searchTerm) {
        filtered = filtered.filter(item =>
            item.title.toLowerCase().includes(searchTerm) ||
            item.category.toLowerCase().includes(searchTerm) ||
            item.location.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm)
        );
    }

    renderItems(filtered, currentFilter);
}

// --- MODAL İŞLEMLERİ (TESLİMAT) ---
function openDeliveryModal(itemId, itemTitle) {
    currentDeliveryItem = itemId;
    const itemInfoPara = document.getElementById('itemInfo');
    if (itemInfoPara) itemInfoPara.textContent = `Eşya: ${itemTitle}`;
    
    loadRecipients();
    
    const modal = document.getElementById('deliveryModal');
    if (modal) modal.classList.remove('hidden');
}

function closeDeliveryModal() {
    const modal = document.getElementById('deliveryModal');
    if (modal) modal.classList.add('hidden');
    currentDeliveryItem = null;
    const select = document.getElementById('recipientSelect');
    if (select) select.innerHTML = '<option value="">Seçiniz...</option>';
}

function loadRecipients() {
    const select = document.getElementById('recipientSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">Yükleniyor...</option>';

    // Daha önce konuştuğumuz deliver_item.php?action=get_users endpointini kullanıyoruz
    fetch('../backend/deliver_item.php?action=get_users')
        .then(response => response.json())
        .then(data => {
            if (data.ok && data.users.length > 0) {
                select.innerHTML = '<option value="">Seçiniz...</option>';
                data.users.forEach(user => {
                    const option = document.createElement('option');
                    option.value = user.id;
                    option.textContent = `${escapeHtml(user.full_name)}`;
                    select.appendChild(option);
                });
            } else {
                select.innerHTML = '<option value="">Aktif kayıp ilanı olan kullanıcı bulunamadı</option>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            select.innerHTML = '<option value="">Hata oluştu</option>';
        });
}

function confirmDelivery() {
    if (!currentDeliveryItem) return;

    const recipientSelect = document.getElementById('recipientSelect');
    const recipientId = recipientSelect.value;

    if (!recipientId) {
        alert('Lütfen teslim alıcıyı seçiniz');
        return;
    }

    const confirmBtn = document.getElementById('confirmDelivery');
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'İşleniyor...';

    // HATA ÇÖZÜMÜ: Veriyi PHP'nin beklediği FormData formatında gönderiyoruz
    const formData = new FormData();
    formData.append('item_id', currentDeliveryItem);
    formData.append('recipient_id', recipientId);

    fetch('../backend/deliver_item.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            alert('Eşya başarıyla teslim edildi!');
            closeDeliveryModal();
            fetchItems(); // Tabloyu yenile
        } else {
            alert('Hata: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Bağlantı hatası oluştu');
    })
    .finally(() => {
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Teslim Et';
    });
}

// --- YARDIMCI FONKSİYONLAR ---
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}