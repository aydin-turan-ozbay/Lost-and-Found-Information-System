// Admin Panel JavaScript

let currentDeliveryItem = null;

document.addEventListener('DOMContentLoaded', function() {
    // Load initial tab
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });

    // Load items for active tab
    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab) {
        loadItems(activeTab.dataset.tab);
    } else {
        loadItems('all');
    }

    // Modal controls
    document.getElementById('cancelDelivery').addEventListener('click', closeDeliveryModal);
    document.getElementById('confirmDelivery').addEventListener('click', confirmDelivery);
    document.querySelector('.modal-close').addEventListener('click', closeDeliveryModal);

    // Close modal when clicking outside
    document.getElementById('deliveryModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeDeliveryModal();
        }
    });
});

function switchTab(tabName) {
    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update active tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName + '-tab').classList.add('active');

    // Load items for this tab
    loadItems(tabName);
}

function loadItems(tabType) {
    let tableBodyId = '';
    
    switch(tabType) {
        case 'all':
            tableBodyId = 'all-body';
            break;
        case 'lost':
            tableBodyId = 'lost-body';
            break;
        case 'found':
            tableBodyId = 'found-body';
            break;
        case 'delivered':
            tableBodyId = 'delivered-body';
            break;
    }

    const tableBody = document.getElementById(tableBodyId);
    tableBody.innerHTML = '<tr><td colspan="9" class="loading">Yükleniyor...</td></tr>';

    fetch('../backend/get_admin_items.php?type=' + tabType)
        .then(response => response.json())
        .then(data => {
            if (data.ok && data.items.length > 0) {
                tableBody.innerHTML = '';
                data.items.forEach(item => {
                    const row = createTableRow(item, tabType);
                    tableBody.appendChild(row);
                });
            } else {
                tableBody.innerHTML = '<tr><td colspan="9" class="loading">Kayıt bulunamadı</td></tr>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            tableBody.innerHTML = '<tr><td colspan="9" class="loading">Hata oluştu</td></tr>';
        });
}

function createTableRow(item, tabType) {
    const row = document.createElement('tr');
    
    if (tabType === 'all') {
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${escapeHtml(item.title)}</td>
            <td><span class="type-badge type-${item.type}">${item.type === 'lost' ? 'Kayıp' : 'Buluntu'}</span></td>
            <td>${escapeHtml(item.category)}</td>
            <td>${escapeHtml(item.location)}</td>
            <td>${escapeHtml(item.full_name)}</td>
            <td><span class="status-badge status-${item.status}">${getStatusLabel(item.status)}</span></td>
            <td>${item.item_date}</td>
            <td>${getActionButton(item, tabType)}</td>
        `;
    } else if (tabType === 'lost') {
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${escapeHtml(item.title)}</td>
            <td>${escapeHtml(item.category)}</td>
            <td>${escapeHtml(item.location)}</td>
            <td>${escapeHtml(item.full_name)}</td>
            <td><span class="status-badge status-${item.status}">${getStatusLabel(item.status)}</span></td>
            <td>${item.item_date}</td>
            <td>${getActionButton(item, tabType)}</td>
        `;
    } else if (tabType === 'found') {
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${escapeHtml(item.title)}</td>
            <td>${escapeHtml(item.category)}</td>
            <td>${escapeHtml(item.location)}</td>
            <td>${escapeHtml(item.full_name)}</td>
            <td><span class="status-badge status-${item.status}">${getStatusLabel(item.status)}</span></td>
            <td>${item.item_date}</td>
            <td>${getActionButton(item, tabType)}</td>
        `;
    } else if (tabType === 'delivered') {
        const recipientName = item.delivered_to_user ? escapeHtml(item.delivered_to_user.full_name) : '-';
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${escapeHtml(item.title)}</td>
            <td><span class="type-badge type-${item.type}">${item.type === 'lost' ? 'Kayıp' : 'Buluntu'}</span></td>
            <td>${escapeHtml(item.category)}</td>
            <td>${escapeHtml(item.location)}</td>
            <td>${escapeHtml(item.full_name)}</td>
            <td>${recipientName}</td>
            <td>${item.item_date}</td>
        `;
    }

    return row;
}

function getActionButton(item, tabType) {
    // Only show "Teslim Et" button for found items that are still active
    if (tabType === 'found' && item.status === 'active') {
        return `
            <div class="delivery-controls">
                <button class="btn-deliver" onclick="openDeliveryModal(${item.id}, '${escapeHtml(item.title)}')">
                    ✓ Teslim Et
                </button>
            </div>
        `;
    }
    return '';
}

function getStatusLabel(status) {
    const labels = {
        'active': 'Aktif',
        'delivered': 'Teslim Edildi',
        'archived': 'Arşivlendi',
        'passive': 'Teslim Edildi'
    };
    return labels[status] || status;
}

function openDeliveryModal(itemId, itemTitle) {
    currentDeliveryItem = itemId;
    document.getElementById('itemInfo').textContent = `Başlık: ${itemTitle}`;
    
    // Load recipients (users with active lost items)
    loadRecipients();
    
    document.getElementById('deliveryModal').classList.remove('hidden');
}

function closeDeliveryModal() {
    document.getElementById('deliveryModal').classList.add('hidden');
    currentDeliveryItem = null;
    document.getElementById('recipientSelect').innerHTML = '<option value="">Seçiniz...</option>';
}

function loadRecipients() {
    const select = document.getElementById('recipientSelect');
    select.innerHTML = '<option value="">Yükleniyor...</option>';

    fetch('../backend/get_lost_item_users.php')
        .then(response => response.json())
        .then(data => {
            if (data.ok && data.users.length > 0) {
                select.innerHTML = '<option value="">Seçiniz...</option>';
                data.users.forEach(user => {
                    const option = document.createElement('option');
                    option.value = user.id;
                    option.textContent = `${escapeHtml(user.full_name)} (${escapeHtml(user.student_id)})`;
                    select.appendChild(option);
                });
            } else {
                select.innerHTML = '<option value="">Aktif kayıp ilanı bulunamadı</option>';
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

    // Disable button during submission
    const confirmBtn = document.getElementById('confirmDelivery');
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Teslim Ediliyor...';

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
            // Reload found items tab
            loadItems('found');
            // Reload delivered items tab
            loadItems('delivered');
        } else {
            alert('Hata: ' + (data.error || 'Teslim işlemi başarısız'));
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
