(function () {
    var toggle = document.querySelector('.nav-toggle');
    var actions = document.getElementById('navActions');
    if (!toggle || !actions) return;

    var mq = window.matchMedia ? window.matchMedia('(max-width: 634px)') : null;

    function setOpen(open) {
        document.body.classList.toggle('nav-open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    toggle.addEventListener('click', function () {
        var isOpen = document.body.classList.contains('nav-open');
        setOpen(!isOpen);
    });

    document.addEventListener('click', function (e) {
        if (!document.body.classList.contains('nav-open')) return;
        if (toggle.contains(e.target) || actions.contains(e.target)) return;
        setOpen(false);
    });

    window.addEventListener('resize', function () {
        if (!mq) return;
        if (!mq.matches) setOpen(false);
    });
})();
