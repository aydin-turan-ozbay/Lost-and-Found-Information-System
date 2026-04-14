(function () {
    const tableBody = document.getElementById("itemsTableBody");
    const searchInput = document.getElementById("searchInput");
    const tabButtons = document.querySelectorAll(".filter-tab");

    let allItems = [];
    let activeFilter = "all";

    function normalizeType(value) {
        if (!value) return "";
        const lower = String(value).toLowerCase();
        if (lower === "lost") return "lost";
        if (lower === "found") return "found";
        return lower;
    }

    function typeLabel(type) {
        if (type === "lost") return "Kayıp";
        if (type === "found") return "Buluntu";
        return "-";
    }

    function safeText(value) {
        if (value === null || value === undefined || value === "") return "-";
        return String(value);
    }

    function renderRows(items) {
        if (!items.length) {
            tableBody.innerHTML = '<tr><td colspan="7" class="table-message">Bu filtre için ilan bulunamadı.</td></tr>';
            return;
        }

        const rows = items.map((item) => {
            const itemType = normalizeType(item.item_type);
            const badgeClass = itemType === "found" ? "found" : (itemType === "lost" ? "lost" : "");

            return `
                <tr>
                    <td><span class="badge ${badgeClass}">${typeLabel(itemType)}</span></td>
                    <td>${safeText(item.title)}</td>
                    <td>${safeText(item.category)}</td>
                    <td>${safeText(item.color)}</td>
                    <td>${safeText(item.location)}</td>
                    <td>${safeText(item.item_date)}</td>
                    <td class="cell-description">${safeText(item.description)}</td>
                </tr>
            `;
        });

        tableBody.innerHTML = rows.join("");
    }

    function applyFilters() {
        const searchTerm = searchInput.value.trim().toLowerCase();

        const filtered = allItems.filter((item) => {
            const itemType = normalizeType(item.item_type);
            const byType = activeFilter === "all" || itemType === activeFilter;

            if (!byType) return false;

            if (!searchTerm) return true;

            const searchableText = [
                item.title,
                item.category,
                item.color,
                item.location,
                item.item_date,
                item.description,
                item.item_type
            ]
                .map((v) => (v ? String(v).toLowerCase() : ""))
                .join(" ");

            return searchableText.includes(searchTerm);
        });

        renderRows(filtered);
    }

    async function loadItems() {
        try {
            const response = await fetch("../backend/get_my_items.php", {
                method: "GET",
                credentials: "same-origin"
            });

            if (response.status === 401) {
                window.location.href = "login.html?next=my_items";
                return;
            }

            const data = await response.json();

            if (!data.ok) {
                tableBody.innerHTML = `<tr><td colspan="7" class="table-message">${safeText(data.error)}</td></tr>`;
                return;
            }

            allItems = Array.isArray(data.items) ? data.items : [];
            applyFilters();
        } catch (error) {
            tableBody.innerHTML = '<tr><td colspan="7" class="table-message">İlanlar yüklenirken bir hata oluştu.</td></tr>';
        }
    }

    tabButtons.forEach((button) => {
        button.addEventListener("click", function () {
            tabButtons.forEach((btn) => btn.classList.remove("active"));
            this.classList.add("active");
            activeFilter = this.dataset.filter;
            applyFilters();
        });
    });

    searchInput.addEventListener("input", applyFilters);

    loadItems();
})();
