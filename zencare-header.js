(function () {
  var hdr = document.querySelector('.menu-rebrand');
  if (!hdr) return;
  function pad() { document.body.style.paddingTop = hdr.offsetHeight + 'px'; }
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
    var hover = d.getAttribute('data-hover') === 'true';
    d.addEventListener('mouseenter', function () { if (hover && matchMedia('(min-width:992px)').matches) { closeAll(d); toggle(d, true); } });
    d.addEventListener('mouseleave', function () { if (hover && matchMedia('(min-width:992px)').matches) toggle(d, false); });
    var t = d.querySelector('.w-dropdown-toggle');
    if (t) t.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      var open = !d.classList.contains('w--open'); closeAll(d); toggle(d, open);
    });
  });

  var nav = hdr.querySelector('.w-nav'), menu = hdr.querySelector('.w-nav-menu'), btn = hdr.querySelector('.w-nav-button');
  if (btn) btn.addEventListener('click', function () {
    var open = !btn.classList.contains('w--open');
    btn.classList.toggle('w--open', open); menu.classList.toggle('w--open', open);
    menu.style.display = open ? 'flex' : '';
  });

  var side = hdr.querySelector('.side-menu'), burger = hdr.querySelector('.rebrand-menu');
  if (burger && side) burger.addEventListener('click', function () {
    side.style.display = side.style.display === 'flex' ? 'none' : 'flex';
  });
  var pop = hdr.querySelector('.search-pop-up'), mag = hdr.querySelector('.div-block-45');
  if (mag && pop) mag.addEventListener('click', function () {
    pop.style.display = pop.style.display === 'flex' ? 'none' : 'flex';
    var i = pop.querySelector('input[type=search]'); if (pop.style.display === 'flex' && i) i.focus();
  });
})();
