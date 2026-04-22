let currentFilter = 'lost';
let allItems = [];

// Load items on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchItems();
});

// Fetch items from server
function fetchItems() {
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

// Render items based on filter
function renderItems(items, filter) {
    const tableBody = document.querySelector('#itemsBody');
    tableBody.innerHTML = '';

    let filteredItems = items;
    if (filter === 'lost') {
        filteredItems = items.filter(item => item.type === 'lost');
    } else if (filter === 'found') {
        filteredItems = items.filter(item => item.type === 'found' && item.delivered_to_user_id == null);
    } else if (filter === 'delivered') {
        // Show delivered items (items with delivered_to_user_id not null)
        filteredItems = items.filter(item => item.delivered_to_user_id != null);
    }

    if (filteredItems.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9">Bu filtre için ilan bulunamadı.</td></tr>';
        return;
    }

    filteredItems.forEach(item => {
        const row = document.createElement('tr');
        const showDeliverBtn = (filter === 'found' && item.type === 'found');
        row.innerHTML = `
            <td>${item.type === 'lost' ? 'Kayıp' : 'Buluntu'}</td>
            <td>${item.title}</td>
            <td>${item.category}</td>
            <td>${item.color}</td>
            <td>${item.location}</td>
            <td>${item.item_date}</td>
            <td>${item.description}</td>
            <td>${item.full_name} (${item.student_id})</td>
            <td>${showDeliverBtn ? `<button class="deliver-btn" data-item-id="${item.id}">Teslim Et</button>` : ''}</td>
        `;
        tableBody.appendChild(row);
    });

    setupDeliverButtons();
}

// Filter buttons event listeners
document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentFilter = button.dataset.filter;
        renderItems(allItems, currentFilter);
        filterSearch();
    });
});

// Search functionality
document.querySelector('#searchInput').addEventListener('input', filterSearch);

function filterSearch() {
    const searchTerm = document.querySelector('#searchInput').value.toLowerCase();
    let filteredItems = allItems;

    if (currentFilter === 'lost') {
        filteredItems = allItems.filter(item => item.type === 'lost');
    } else if (currentFilter === 'found') {
        filteredItems = allItems.filter(item => item.type === 'found');
    } else if (currentFilter === 'delivered') {
        filteredItems = allItems.filter(item => item.delivered_to_user_id != null);
    }

    if (searchTerm) {
        filteredItems = filteredItems.filter(item =>
            item.title.toLowerCase().includes(searchTerm) ||
            item.category.toLowerCase().includes(searchTerm) ||
            item.location.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm)
        );
    }

    renderItems(filteredItems, currentFilter);
}

// Event listener for 'Teslim Et' button
function setupDeliverButtons() {
    document.querySelectorAll('.deliver-btn').forEach(button => {
        button.addEventListener('click', event => {
            const itemId = event.target.dataset.itemId;
            fetch('../backend/deliver_item.php?action=get_users')
                .then(response => response.json())
                .then(data => {
                    if (data.ok) {
                        showUserDropdown(data.users, itemId);
                    } else {
                        alert(data.error);
                    }
                })
                .catch(error => console.error('Error fetching users:', error));
        });
    });
}

function showUserDropdown(users, itemId) {
    const dropdown = document.createElement('select');
    dropdown.innerHTML = '<option value="">Kullanıcı Seçin</option>';
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.full_name;
        dropdown.appendChild(option);
    });

    dropdown.addEventListener('change', () => {
        const userId = dropdown.value;
        if (userId) {
            fetch(`../backend/deliver_item.php?action=get_user_items&user_id=${userId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.ok) {
                        showItemDropdown(data.items, itemId);
                    } else {
                        alert(data.error);
                    }
                })
                .catch(error => console.error('Error fetching user items:', error));
        }
    });

    document.body.appendChild(dropdown);
}

function showItemDropdown(items, foundItemId) {
    const dropdown = document.createElement('select');
    dropdown.innerHTML = '<option value="">İlan Seçin</option>';
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.title;
        dropdown.appendChild(option);
    });

    dropdown.addEventListener('change', () => {
        const lostItemId = dropdown.value;
        if (lostItemId) {
            deliverItem(foundItemId, lostItemId);
        }
    });

    document.body.appendChild(dropdown);
}

function deliverItem(foundItemId, lostItemId) {
    fetch('../backend/deliver_item.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: foundItemId, recipient_id: lostItemId })
    })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                alert('İlan başarıyla teslim edildi!');
                location.reload();
            } else {
                alert(data.error);
            }
        })
        .catch(error => console.error('Error delivering item:', error));
}

// Initialize deliver buttons setup
document.addEventListener('DOMContentLoaded', setupDeliverButtons);