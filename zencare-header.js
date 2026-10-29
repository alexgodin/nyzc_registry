(function () {
  var hdr = document.querySelector('.menu-rebrand');
  if (!hdr) return;
  function pad() {
    var nav = hdr.querySelector('.navbar-2');
    document.body.style.paddingTop = hdr.offsetHeight + 'px';
    hdr.style.setProperty('--hdr-h', (nav ? nav.getBoundingClientRect().bottom : hdr.offsetHeight) + 'px');
  }
  pad(); window.addEventListener('resize', pad); window.addEventListener('load', pad);

  var drops = hdr.querySelectorAll('.w-dropdown');
  function closeAll(except) {
    drops.forEach(function (d) {
      if (d === except) return;
      d.classList.remove('w--open');
      var l = d.querySelector('.w-dropdown-list'); if (l) l.classList.remove('w--open');
    });
  }
  function toggle(d, open) {
    var l = d.querySelector('.w-dropdown-list');
    d.classList.toggle('w--open', open);
    if (l) l.classList.toggle('w--open', open);
  }
  drops.forEach(function (d) {
    var t = d.querySelector('.w-dropdown-toggle');
    if (t) t.addEventListener('click', function (e) {
      if (e.target.closest('a') || matchMedia('(min-width:992px)').matches) return;
      var open = !d.classList.contains('w--open'); closeAll(d); toggle(d, open);
    });
  });

  var menu = hdr.querySelector('.w-nav-menu'), btn = hdr.querySelector('.w-nav-button');
  function closeMenu() {
    btn.classList.remove('w--open'); menu.classList.remove('w--open'); closeAll();
  }
  if (btn) btn.addEventListener('click', function () {
    if (btn.classList.contains('w--open')) closeMenu();
    else { btn.classList.add('w--open'); menu.classList.add('w--open'); }
  });
  window.addEventListener('resize', function () {
    if (matchMedia('(min-width:992px)').matches) closeMenu();
  });
})();
