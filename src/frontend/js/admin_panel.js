// --- DEĞİŞKENLER ---
let currentFilter = 'lost';
let allItems = [];
let currentDeliveryItem = null;
let selectedLostItemId = null;
let activeAttribute = null;
const CATEGORY_OPTIONS = [
    { value: 'electronic', label: 'Elektronik' },
    { value: 'wallet', label: 'Cüzdan/Kartlık' },
    { value: 'bag', label: 'Çanta' },
    { value: 'keychain', label: 'Anahtarlık' },
    { value: 'other', label: 'Diğer' }
];
const LOCATION_OPTIONS = [
    { value: 'bakirkoy', label: 'Bakırköy Kampüs' },
    { value: 'gayrettepe', label: 'Gayrettepe Kampüs' },
    { value: 'mahmutbey campus a block', label: 'Mahmutbey Kampüs A Blok' },
    { value: 'mahmutbey campus d block', label: 'Mahmutbey Kampüs D Blok' }
];
const columnFilters = {
    category: '',
    location: '',
    specificDate: '',
    startDate: '',
    endDate: ''
};

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
    const recipientSelect = document.getElementById('recipientSelect');
    const attributeModal = document.getElementById('attributeFilterModal');
    const closeAttributeModalBtn = document.getElementById('closeAttributeFilter');
    const applyAttributeBtn = document.getElementById('applyAttributeFilter');
    const clearAttributeBtn = document.getElementById('clearAttributeFilter');

    if (cancelBtn) cancelBtn.addEventListener('click', closeDeliveryModal);
    if (closeBtn) closeBtn.addEventListener('click', closeDeliveryModal);
    if (confirmBtn) confirmBtn.addEventListener('click', confirmDelivery);
    if (recipientSelect) {
        recipientSelect.addEventListener('change', function () {
            loadRecipientItems(this.value);
        });
    }

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) closeDeliveryModal();
        });
    }

    document.querySelectorAll('.column-filter-btn').forEach((button) => {
        button.addEventListener('click', () => openAttributeFilter(button.dataset.attr));
    });

    if (closeAttributeModalBtn) closeAttributeModalBtn.addEventListener('click', closeAttributeFilter);
    if (applyAttributeBtn) applyAttributeBtn.addEventListener('click', applyAttributeFilter);
    if (clearAttributeBtn) clearAttributeBtn.addEventListener('click', clearAttributeFilter);

    if (attributeModal) {
        attributeModal.addEventListener('click', function (e) {
            if (e.target === this) closeAttributeFilter();
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
                renderItems(getVisibleItems());
                updateColumnFilterButtons();
            } else {
                console.error(data.error);
            }
        })
        .catch(error => console.error('Error fetching items:', error));
}

// --- TABLO OLUŞTURMA ---
function isDelivered(item) {
    return item.delivered_to_user_id != null || item.status === 'delivered';
}

function getTabFilteredItems(items) {
    if (currentFilter === 'lost') {
        return items.filter(item => item.type === 'lost');
    }
    if (currentFilter === 'found') {
        return items.filter(item => item.type === 'found' && !isDelivered(item));
    }
    if (currentFilter === 'delivered') {
        return items.filter(item => isDelivered(item));
    }
    return items;
}

function applyAttributeFilters(items) {
    return items.filter((item) => {
        const itemCategory = normalizeCategory(item.category);
        const itemLocation = normalizeLocation(item.location);
        const itemDate = item.item_date || '';

        if (columnFilters.category && itemCategory !== normalizeCategory(columnFilters.category)) {
            return false;
        }

        if (columnFilters.location && itemLocation !== normalizeLocation(columnFilters.location)) {
            return false;
        }

        if (columnFilters.specificDate && itemDate !== columnFilters.specificDate) {
            return false;
        }

        if (columnFilters.startDate && itemDate < columnFilters.startDate) {
            return false;
        }

        if (columnFilters.endDate && itemDate > columnFilters.endDate) {
            return false;
        }

        return true;
    });
}

function getVisibleItems() {
    const searchInput = document.querySelector('#searchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    let filtered = getTabFilteredItems(allItems);
    filtered = applyAttributeFilters(filtered);

    if (searchTerm) {
        filtered = filtered.filter((item) => {
            const searchText = [
                item.type === 'lost' ? 'kayıp' : 'buluntu',
                item.title,
                item.category,
                item.color,
                item.location,
                item.item_date,
                item.description,
                item.full_name,
                item.student_id,
                item.email,
                item.status,
                item.delivered_to_name,
                item.delivered_to_student_id
            ]
                .map((v) => (v === null || v === undefined ? '' : String(v).toLowerCase()))
                .join(' ');

            return searchText.includes(searchTerm);
        });
    }

    return filtered;
}

function renderItems(items) {
    const tableBody = document.querySelector('#itemsBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';

    if (items.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9">Bu filtre için ilan bulunamadı.</td></tr>';
        return;
    }

    items.forEach(item => {
        const row = document.createElement('tr');
        // Sadece 'buluntu' sekmesindeyken 'Teslim Et' butonunu göster
        const showDeliverBtn = (currentFilter === 'found' && item.type === 'found' && !isDelivered(item));
        
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
    renderItems(getVisibleItems());
}

function uniqueValuesByKey(items, key) {
    const values = new Set();
    items.forEach((item) => {
        if (item[key]) values.add(String(item[key]).trim());
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b, 'tr'));
}

function normalizeCategory(value) {
    const raw = String(value || '').trim().toLowerCase();
    if (raw === 'electronic' || raw === 'electronics') return 'electronic';
    if (raw === 'wallet') return 'wallet';
    if (raw === 'bag') return 'bag';
    if (raw === 'keychain' || raw === 'keys') return 'keychain';
    if (raw === 'other') return 'other';
    return raw;
}

function normalizeLocation(value) {
    const raw = String(value || '').trim().toLowerCase();
    if (raw === 'bakirkoy' || raw === 'bakırköy campus') return 'bakirkoy';
    if (raw === 'gayrettepe' || raw === 'gayrettepe campus') return 'gayrettepe';
    if (raw === 'mahmutbey' || raw === 'mahmutbey campus a block') return 'mahmutbey campus a block';
    if (raw === 'mahmutbey campus d block') return 'mahmutbey campus d block';
    return raw;
}

function getTodayDateISO() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
}

function openAttributeFilter(attr) {
    activeAttribute = attr;
    const modal = document.getElementById('attributeFilterModal');
    const title = document.getElementById('attributeFilterTitle');
    const body = document.getElementById('attributeFilterBody');
    if (!modal || !title || !body) return;

    if (attr === 'category') {
        title.textContent = 'Kategori Filtresi';
        const knownValues = new Set(CATEGORY_OPTIONS.map((o) => o.value));
        const unknownFromData = uniqueValuesByKey(allItems, 'category')
            .map((v) => normalizeCategory(v))
            .filter((v) => v && !knownValues.has(v))
            .map((v) => ({ value: v, label: v }));
        const allCategoryOptions = [...CATEGORY_OPTIONS, ...unknownFromData];

        const options = allCategoryOptions
            .map((opt) => `<option value="${escapeHtml(opt.value)}" ${normalizeCategory(columnFilters.category) === normalizeCategory(opt.value) ? 'selected' : ''}>${escapeHtml(opt.label)}</option>`)
            .join('');
        body.innerHTML = `
            <p class="filter-help">Veritabanındaki kategori değerlerinden seçim yapabilirsiniz.</p>
            <div class="filter-field">
                <label for="attributeSelect">Kategori</label>
                <select id="attributeSelect">
                    <option value="">Tümü</option>
                    ${options}
                </select>
            </div>
        `;
    } else if (attr === 'location') {
        title.textContent = 'Konum Filtresi';
        const options = LOCATION_OPTIONS
            .map((opt) => `<option value="${escapeHtml(opt.value)}" ${normalizeLocation(columnFilters.location) === normalizeLocation(opt.value) ? 'selected' : ''}>${escapeHtml(opt.label)}</option>`)
            .join('');
        body.innerHTML = `
            <p class="filter-help">Sadece seçtiğiniz konumdaki ilanlar listelenir.</p>
            <div class="filter-field">
                <label for="attributeSelect">Konum</label>
                <select id="attributeSelect">
                    <option value="">Tümü</option>
                    ${options}
                </select>
            </div>
        `;
    } else if (attr === 'date') {
        title.textContent = 'Tarih Filtresi';
        const today = getTodayDateISO();
        body.innerHTML = `
            <p class="filter-help">Tek gün seçebilir veya tarih aralığı belirleyebilirsiniz. Bugünden sonrası seçilemez.</p>
            <div class="filter-field">
                <label for="specificDateInput">Belirli Gün</label>
                <input id="specificDateInput" type="date" max="${today}" value="${columnFilters.specificDate}">
            </div>
            <div class="date-grid">
                <div class="filter-field">
                    <label for="startDateInput">Başlangıç</label>
                    <input id="startDateInput" type="date" max="${today}" value="${columnFilters.startDate}">
                </div>
                <div class="filter-field">
                    <label for="endDateInput">Bitiş</label>
                    <input id="endDateInput" type="date" max="${today}" value="${columnFilters.endDate}">
                </div>
            </div>
        `;
    }

    modal.classList.remove('hidden');
}

function closeAttributeFilter() {
    const modal = document.getElementById('attributeFilterModal');
    if (modal) modal.classList.add('hidden');
    activeAttribute = null;
}

function applyAttributeFilter() {
    if (!activeAttribute) return;

    if (activeAttribute === 'category' || activeAttribute === 'location') {
        const select = document.getElementById('attributeSelect');
        const value = select ? select.value.trim() : '';
        columnFilters[activeAttribute] = value;
    } else if (activeAttribute === 'date') {
        const specificDateInput = document.getElementById('specificDateInput');
        const startDateInput = document.getElementById('startDateInput');
        const endDateInput = document.getElementById('endDateInput');
        const today = getTodayDateISO();
        const selectedSpecificDate = specificDateInput ? specificDateInput.value : '';
        const selectedStartDate = startDateInput ? startDateInput.value : '';
        const selectedEndDate = endDateInput ? endDateInput.value : '';

        columnFilters.specificDate = selectedSpecificDate && selectedSpecificDate <= today ? selectedSpecificDate : '';
        columnFilters.startDate = selectedStartDate && selectedStartDate <= today ? selectedStartDate : '';
        columnFilters.endDate = selectedEndDate && selectedEndDate <= today ? selectedEndDate : '';
    }

    updateColumnFilterButtons();
    closeAttributeFilter();
    filterSearch();
}

function clearAttributeFilter() {
    if (!activeAttribute) return;

    if (activeAttribute === 'category' || activeAttribute === 'location') {
        columnFilters[activeAttribute] = '';
    } else if (activeAttribute === 'date') {
        columnFilters.specificDate = '';
        columnFilters.startDate = '';
        columnFilters.endDate = '';
    }

    updateColumnFilterButtons();
    closeAttributeFilter();
    filterSearch();
}

function updateColumnFilterButtons() {
    const hasDateFilter = Boolean(columnFilters.specificDate || columnFilters.startDate || columnFilters.endDate);
    document.querySelectorAll('.column-filter-btn').forEach((btn) => {
        const attr = btn.dataset.attr;
        const active = (attr === 'date' && hasDateFilter) || (attr !== 'date' && Boolean(columnFilters[attr]));
        btn.classList.toggle('active', active);
    });
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
    selectedLostItemId = null;
    const select = document.getElementById('recipientSelect');
    if (select) select.innerHTML = '<option value="">Seçiniz...</option>';
    const itemSelect = document.getElementById('recipientItemSelect');
    if (itemSelect) {
        itemSelect.disabled = true;
        itemSelect.innerHTML = '<option value="">Önce kayıp ilan sahibini seçiniz</option>';
    }
}

function loadRecipients() {
    const select = document.getElementById('recipientSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">Yükleniyor...</option>';
    const itemSelect = document.getElementById('recipientItemSelect');
    if (itemSelect) {
        itemSelect.disabled = true;
        itemSelect.innerHTML = '<option value="">Önce kayıp ilan sahibini seçiniz</option>';
    }

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

function loadRecipientItems(userId) {
    const itemSelect = document.getElementById('recipientItemSelect');
    if (!itemSelect) return;

    selectedLostItemId = null;

    if (!userId) {
        itemSelect.disabled = true;
        itemSelect.innerHTML = '<option value="">Önce kayıp ilan sahibini seçiniz</option>';
        return;
    }

    itemSelect.disabled = true;
    itemSelect.innerHTML = '<option value="">Yükleniyor...</option>';

    fetch(`../backend/deliver_item.php?action=get_user_items&user_id=${encodeURIComponent(userId)}`)
        .then(response => response.json())
        .then(data => {
            if (data.ok && data.items.length > 0) {
                itemSelect.innerHTML = '<option value="">Kayıp ilan seçiniz...</option>';
                data.items.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.id;
                    option.textContent = escapeHtml(item.title);
                    itemSelect.appendChild(option);
                });
                itemSelect.disabled = false;
            } else {
                itemSelect.innerHTML = '<option value="">Bu kullanıcıya ait aktif kayıp ilan bulunamadı</option>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            itemSelect.innerHTML = '<option value="">Kayıp ilanlar yüklenemedi</option>';
        });

    itemSelect.onchange = function () {
        selectedLostItemId = this.value ? Number(this.value) : null;
    };
}

function confirmDelivery() {
    if (!currentDeliveryItem) return;

    const recipientSelect = document.getElementById('recipientSelect');
    const recipientId = recipientSelect.value;
    const recipientItemSelect = document.getElementById('recipientItemSelect');
    const recipientLostItemId = recipientItemSelect ? recipientItemSelect.value : '';

    if (!recipientId) {
        alert('Lütfen kayıp ilan sahibini seçiniz');
        return;
    }

    if (!recipientLostItemId) {
        alert('Lütfen teslim edilecek kayıp ilanı seçiniz');
        return;
    }

    const confirmBtn = document.getElementById('confirmDelivery');
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'İşleniyor...';

    // HATA ÇÖZÜMÜ: Veriyi PHP'nin beklediği FormData formatında gönderiyoruz
    const formData = new FormData();
    formData.append('item_id', currentDeliveryItem);
    formData.append('recipient_id', recipientId);
    formData.append('recipient_lost_item_id', recipientLostItemId);

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