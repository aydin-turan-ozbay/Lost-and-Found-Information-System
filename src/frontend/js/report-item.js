document.addEventListener("DOMContentLoaded", function () {
    var urlParams = new URLSearchParams(window.location.search);
    var itemType = urlParams.get('type');

    var hiddenType = document.getElementById('hidden_type');
    var imageInput = document.getElementById('item_image');
    var imageLabel = document.getElementById('image_label');
    var formTitle  = document.getElementById('form-main-title');
    var errorMsg   = document.getElementById('file_count_error');
    var dateInput  = document.getElementById('item_date');

    // Tarih sınırlaması: bugünden sonrası seçilemesin
    var today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('max', today);
    dateInput.value = today;

    // Form tipi ayarları
    if (itemType === 'found') {
        if (hiddenType) hiddenType.value = 'found';
        imageInput.required = true;
        formTitle.innerText = "Buluntu Eşya Bildirisi";
        imageLabel.innerHTML = 'Eşya Fotoğrafları <span style="color:red;">(En az 1 fotoğraf zorunlu)</span>';
    } else {
        if (hiddenType) hiddenType.value = 'lost';
        imageInput.required = false;
        formTitle.innerText = "Kayıp Eşya Bildirisi";
        imageLabel.innerHTML = 'Eşya Fotoğrafları <span style="color:#888;">(Opsiyonel)</span>';
    }

    var ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif'];

    // Fotoğraf sayısı ve uzantı kontrolü
    imageInput.addEventListener('change', function () {
        if (this.files.length > 5) {
            errorMsg.style.display = 'block';
            errorMsg.innerText = "⚠️ En fazla 5 fotoğraf seçebilirsiniz! Seçiminiz sıfırlandı.";
            this.value = '';
            return;
        }

        var invalid = [];
        for (var i = 0; i < this.files.length; i++) {
            var ext = this.files[i].name.split('.').pop().toLowerCase();
            if (ALLOWED_EXTS.indexOf(ext) === -1) {
                invalid.push(this.files[i].name);
            }
        }

        if (invalid.length > 0) {
            errorMsg.style.display = 'block';
            errorMsg.innerText = "⚠️ Desteklenmeyen format: " + invalid.join(', ') + ". İzin verilenler: jpg, jpeg, png, webp, gif, heic, heif.";
            this.value = '';
        } else {
            errorMsg.style.display = 'none';
        }
    });
});
