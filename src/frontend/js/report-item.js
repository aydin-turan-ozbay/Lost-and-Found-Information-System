document.addEventListener("DOMContentLoaded", function () {
    var urlParams = new URLSearchParams(window.location.search);
    var itemType = urlParams.get('type');

    var hiddenType = document.getElementById('hidden_type');
    var imageInput = document.getElementById('item_image');
    var imageLabel = document.getElementById('image_label');
    var formTitle  = document.getElementById('form-main-title');
    var errorMsg   = document.getElementById('file_count_error');
    var dateInput  = document.getElementById('item_date');

    // Date restriction: prevent future dates from being selected
    var today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('max', today);
    dateInput.value = today;

    // Form type settings
    if (itemType === 'found') {
        if (hiddenType) hiddenType.value = 'found';
        imageInput.required = true;
        formTitle.innerText = "Report a Found Item";
        imageLabel.innerHTML = 'Item Photos <span style="color:red;">(At least 1 photo required)</span>';
    } else {
        if (hiddenType) hiddenType.value = 'lost';
        imageInput.required = false;
        formTitle.innerText = "Report a Lost Item";
        imageLabel.innerHTML = 'Item Photos <span style="color:#888;">(Optional)</span>';
    }

    var ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif'];

    // Photo count and extension validation
    imageInput.addEventListener('change', function () {
        if (this.files.length > 5) {
            errorMsg.style.display = 'block';
            errorMsg.innerText = "⚠️ You can select up to 5 photos! Your selection has been reset.";
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
            errorMsg.innerText = "⚠️ Unsupported format: " + invalid.join(', ') + ". Allowed formats: jpg, jpeg, png, webp, gif, heic, heif.";
            this.value = '';
        } else {
            errorMsg.style.display = 'none';
        }
    });
});