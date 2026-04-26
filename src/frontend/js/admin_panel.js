// --- VARIABLES ---
let currentFilter = 'lost';
let allItems = [];
let currentDeliveryItem = null;
let selectedLostItemId = null;
let activeAttribute = null;

const CATEGORY_OPTIONS = [
    { value: 'electronic', label: 'Electronics' },
    { value: 'wallet', label: 'Wallet/Cardholder' },
    { value: 'bag', label: 'Bag' },
    { value: 'keychain', label: 'Keychain' },
    { value: 'other', label: 'Other' }
];

const LOCATION_OPTIONS = [
    { value: 'bakirkoy', label: 'Bakirkoy Campus' },
    { value: 'gayrettepe', label: 'Gayrettepe Campus' },
    { value: 'mahmutbey campus a block', label: 'Mahmutbey Campus A Block' },
    { value: 'mahmutbey campus d block', label: 'Mahmutbey Campus D Block' }
];

const columnFilters = {
    category: '',
    location: '',
    specificDate: '',
    startDate: '',
    endDate: ''
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Initial data load
    fetchItems();

    // Setup filter buttons
    setupFilterButtons();

    // Setup search box
    const searchInput = document.querySelector('#searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterSearch);
    }

    // Modal Controls
    const cancelBtn = document.getElementById('cancelDelivery');
    const closeBtn = document.querySelector('.modal-close');
    const confirmBtn = document.getElementById('confirmDelivery');
    const modal = document.getElementById('deliveryModal');
    const recipientSelect = document.getElementById('recipientSelect');
    const attributeModal = document.getElementById('attributeFilterModal');
    const imagePreviewModal = document.getElementById('imagePreviewModal');
    const closeImagePreviewBtn = document.getElementById('closeImagePreview');
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

    if (closeImagePreviewBtn) closeImagePreviewBtn.addEventListener('click', closeImagePreview);
    if (imagePreviewModal) {
        imagePreviewModal.addEventListener('click', function (e) {
            if (e.target === this) closeImagePreview();
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeImagePreview();
    });
});

// --- DATA FETCHING ---
function fetchItems() {
    fetch('../backend/get_admin_items.php')
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                allItems = data.items;
                renderItems(getVisibleItems());
                updateOwnerColumnHeader();
                updateColumnFilterButtons();
            } else {
                console.error(data.error);
            }
        })
        .catch(error => console.error('Error fetching items:', error));
}

// --- TABLE RENDERING & FILTERING ---
function isDelivered(item) {
    return item.delivered_to_user_id != null || item.status === 'delivered';
}

function getTabFilteredItems(items) {
    if (currentFilter === 'lost') {
        // Only active lost items should be visible
        return items.filter(item => item.type === 'lost' && item.status === 'active');
    }
    if (currentFilter === 'found') {
        return items.filter(item => item.type === 'found' && !isDelivered(item));
    }
    if (currentFilter === 'delivered') {
        // Delivered tab should show delivered found items
        return items.filter(item => item.type === 'found' && isDelivered(item));
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
                item.type === 'lost' ? 'lost' : 'found',
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
                item.image_path,
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
        tableBody.innerHTML = '<tr><td colspan="9">No items found for this filter.</td></tr>';
        return;
    }

    items.forEach(item => {
        const row = document.createElement('tr');
        const showDeliverBtn = (currentFilter === 'found' && item.type === 'found' && !isDelivered(item));
        
        row.innerHTML = `
    <td>${item.type === 'lost' ? 'Lost' : 'Found'}</td>
    <td>${escapeHtml(item.title)}</td>
    <td>${escapeHtml(item.category)}</td>
    <td>${escapeHtml(item.color || '-')}</td>
    <td>${escapeHtml(item.location)}</td>
    <td>${item.item_date}</td>

    <td>${escapeHtml(item.description)}</td>

    <td>
        ${item.image_path 
            ? `<img class="preview-thumb" src="../${item.image_path}" alt="Item Image" style="width:50px;height:50px;object-fit:cover;border-radius:6px;" onclick="openImagePreview(this.src)">`
            : '-'
        }
    </td>

    <td>${getOwnerCellContent(item)}</td>

    <td>
        ${showDeliverBtn 
            ? `<button class="deliver-btn btn-deliver" onclick="openDeliveryModal(${item.id}, '${escapeHtml(item.title)}')">✓ Deliver</button>` 
            : '-'}
    </td>
        `;
        tableBody.appendChild(row);
    });
}

// --- FILTRATION & SEARCH HELPERS ---
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
    updateOwnerColumnHeader();
    renderItems(getVisibleItems());
}

function updateOwnerColumnHeader() {
    const header = document.getElementById('ownerColumnHeader');
    if (!header) return;
    header.textContent = currentFilter === 'delivered' ? 'Delivered By ' : 'Created By';
}

function getOwnerCellContent(item) {
    const creator = `${escapeHtml(item.full_name || '-')}${item.student_id ? ` (${escapeHtml(item.student_id)})` : ''}`;
    if (currentFilter !== 'delivered') {
        return creator;
    }

    const recipientName = escapeHtml(item.delivered_to_name || '-');
    const recipientStudentId = item.delivered_to_student_id ? ` (${escapeHtml(item.delivered_to_student_id)})` : '';
    return `${recipientName}${recipientStudentId}`;
}

function uniqueValuesByKey(items, key) {
    const values = new Set();
    items.forEach((item) => {
        if (item[key]) values.add(String(item[key]).trim());
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b, 'en'));
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

// --- ATTRIBUTE FILTER MODAL ---
function openAttributeFilter(attr) {
    activeAttribute = attr;
    const modal = document.getElementById('attributeFilterModal');
    const title = document.getElementById('attributeFilterTitle');
    const body = document.getElementById('attributeFilterBody');
    if (!modal || !title || !body) return;

    if (attr === 'category') {
        title.textContent = 'Category Filter';
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
            <p class="filter-help">Select from existing categories in the database.</p>
            <div class="filter-field">
                <label for="attributeSelect">Category</label>
                <select id="attributeSelect">
                    <option value="">All</option>
                    ${options}
                </select>
            </div>
        `;
    } else if (attr === 'location') {
        title.textContent = 'Location Filter';
        const options = LOCATION_OPTIONS
            .map((opt) => `<option value="${escapeHtml(opt.value)}" ${normalizeLocation(columnFilters.location) === normalizeLocation(opt.value) ? 'selected' : ''}>${escapeHtml(opt.label)}</option>`)
            .join('');
        body.innerHTML = `
            <p class="filter-help">Only items from the selected location will be listed.</p>
            <div class="filter-field">
                <label for="attributeSelect">Location</label>
                <select id="attributeSelect">
                    <option value="">All</option>
                    ${options}
                </select>
            </div>
        `;
    } else if (attr === 'date') {
        title.textContent = 'Date Filter';
        const today = getTodayDateISO();
        body.innerHTML = `
            <p class="filter-help">Select a specific day or a date range. Future dates are disabled.</p>
            <div class="filter-field">
                <label for="specificDateInput">Specific Day</label>
                <input id="specificDateInput" type="date" max="${today}" value="${columnFilters.specificDate}">
            </div>
            <div class="date-grid">
                <div class="filter-field">
                    <label for="startDateInput">Start Date</label>
                    <input id="startDateInput" type="date" max="${today}" value="${columnFilters.startDate}">
                </div>
                <div class="filter-field">
                    <label for="endDateInput">End Date</label>
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

function openImagePreview(src) {
    const modal = document.getElementById('imagePreviewModal');
    const preview = document.getElementById('previewImage');
    if (!modal || !preview || !src) return;
    preview.src = src;
    modal.classList.remove('hidden');
}

function closeImagePreview() {
    const modal = document.getElementById('imagePreviewModal');
    const preview = document.getElementById('previewImage');
    if (modal) modal.classList.add('hidden');
    if (preview) preview.src = '';
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

// --- DELIVERY MODAL OPERATIONS ---
function openDeliveryModal(itemId, itemTitle) {
    currentDeliveryItem = itemId;
    const itemInfoPara = document.getElementById('itemInfo');
    if (itemInfoPara) itemInfoPara.textContent = `Item: ${itemTitle}`;
    
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
    if (select) select.innerHTML = '<option value="">Select...</option>';
    const itemSelect = document.getElementById('recipientItemSelect');
    if (itemSelect) {
        itemSelect.disabled = true;
        itemSelect.innerHTML = '<option value="">Select a lost item owner first</option>';
    }
}

function loadRecipients() {
    const select = document.getElementById('recipientSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">Loading...</option>';
    const itemSelect = document.getElementById('recipientItemSelect');
    if (itemSelect) {
        itemSelect.disabled = true;
        itemSelect.innerHTML = '<option value="">Select a lost item owner first</option>';
    }

    fetch('../backend/deliver_item.php?action=get_users')
        .then(response => response.json())
        .then(data => {
            if (data.ok && data.users.length > 0) {
                select.innerHTML = '<option value="">Select...</option>';
                data.users.forEach(user => {
                    const option = document.createElement('option');
                    option.value = user.id;
                    option.textContent = `${escapeHtml(user.full_name)}`;
                    select.appendChild(option);
                });
            } else {
                select.innerHTML = '<option value="">No users found with active lost items</option>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            select.innerHTML = '<option value="">An error occurred</option>';
        });
}

function loadRecipientItems(userId) {
    const itemSelect = document.getElementById('recipientItemSelect');
    if (!itemSelect) return;

    selectedLostItemId = null;

    if (!userId) {
        itemSelect.disabled = true;
        itemSelect.innerHTML = '<option value="">Select a lost item owner first</option>';
        return;
    }

    itemSelect.disabled = true;
    itemSelect.innerHTML = '<option value="">Loading...</option>';

    fetch(`../backend/deliver_item.php?action=get_user_items&user_id=${encodeURIComponent(userId)}`)
        .then(response => response.json())
        .then(data => {
            if (data.ok && data.items.length > 0) {
                itemSelect.innerHTML = '<option value="">Select a lost item...</option>';
                data.items.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.id;
                    option.textContent = escapeHtml(item.title);
                    itemSelect.appendChild(option);
                });
                itemSelect.disabled = false;
            } else {
                itemSelect.innerHTML = '<option value="">No active lost reports found for this user</option>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            itemSelect.innerHTML = '<option value="">Could not load lost items</option>';
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
        alert('Please select the lost item owner');
        return;
    }

    if (!recipientLostItemId) {
        alert('Please select the lost item to be delivered');
        return;
    }

    const confirmBtn = document.getElementById('confirmDelivery');
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Processing...';

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
            alert('Item successfully delivered!');
            closeDeliveryModal();
            fetchItems(); // Refresh table
        } else {
            alert('Error: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('A connection error occurred');
    })
    .finally(() => {
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Deliver';
    });
}

// --- HELPER FUNCTIONS ---
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

window.openImagePreview = openImagePreview;