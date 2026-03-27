(function () {
    var params = new URLSearchParams(window.location.search);
    var next = params.get('next');
    if (next) {
        document.getElementById('next').value = next;
    }
})();
