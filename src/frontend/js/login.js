(function () {
    var params = new URLSearchParams(window.location.search);
    var next = params.get('next');
    if (next) {
        var nextInput = document.getElementById('next');
        if (nextInput) nextInput.value = next;
    }

    var identifierInput = document.getElementById('identifier');
    var passwordInput = document.getElementById('password');
    var rememberCheckbox = document.getElementById('remember_me');

    var LS_REMEMBER = 'lf_remember_me';
    var LS_IDENTIFIER = 'lf_identifier';
    var LS_PASSWORD = 'lf_password';
    var saveTimer = null;

    function restoreRemembered() {
        try {
            var remember = localStorage.getItem(LS_REMEMBER) === '1';
            if (rememberCheckbox) rememberCheckbox.checked = remember;
            if (!remember) return;

            var savedIdentifier = localStorage.getItem(LS_IDENTIFIER) || '';
            var savedPassword = localStorage.getItem(LS_PASSWORD) || '';

            if (identifierInput && savedIdentifier) identifierInput.value = savedIdentifier;
            if (passwordInput && savedPassword) passwordInput.value = savedPassword;
        } catch (_) {
            // ignore storage errors (privacy mode, disabled storage, etc.)
        }
    }

    function persistRemembered(checked) {
        try {
            if (!checked) {
                localStorage.removeItem(LS_REMEMBER);
                localStorage.removeItem(LS_IDENTIFIER);
                localStorage.removeItem(LS_PASSWORD);
                return;
            }

            localStorage.setItem(LS_REMEMBER, '1');
            localStorage.setItem(LS_IDENTIFIER, identifierInput ? identifierInput.value : '');
            localStorage.setItem(LS_PASSWORD, passwordInput ? passwordInput.value : '');
        } catch (_) {
            // ignore
        }
    }

    function schedulePersist() {
        if (!(rememberCheckbox && rememberCheckbox.checked)) return;
        if (saveTimer) window.clearTimeout(saveTimer);
        saveTimer = window.setTimeout(function () {
            persistRemembered(true);
        }, 150);
    }

    restoreRemembered();

    var form = (identifierInput && identifierInput.form) || (passwordInput && passwordInput.form);
    if (form) {
        form.addEventListener('submit', function () {
            persistRemembered(!!(rememberCheckbox && rememberCheckbox.checked));
        });
    }

    if (rememberCheckbox) {
        rememberCheckbox.addEventListener('change', function () {
            persistRemembered(!!rememberCheckbox.checked);
        });
    }

    if (identifierInput) identifierInput.addEventListener('input', schedulePersist);
    if (passwordInput) passwordInput.addEventListener('input', schedulePersist);
})();
