(function () {
  var menuButton = document.querySelector('.menu-button');
  var nav = document.querySelector('.navigation');
  var header = document.querySelector('.site-header');
  var bar = document.querySelector('.progress i');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Mobile menu */
  function setMenu(open) {
    nav.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
  }
  menuButton.addEventListener('click', function () {
    setMenu(!nav.classList.contains('open'));
  });
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* Scroll reveal */
  var items = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
    /* safety net: never leave content hidden */
    setTimeout(function () { items.forEach(function (el) { el.classList.add('in'); }); }, 4000);
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* Header state, progress bar and gentle parallax */
  var frame = document.querySelector('.visual-frame img');
  var ticking = false;
  function update() {
    var y = window.scrollY || 0;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('scrolled', y > 40);
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    if (frame && !reduce && y < 900) frame.style.transform = 'translateY(' + (y * 0.06).toFixed(1) + 'px) scale(1.06)';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();

  /* Ribbon: duplicate for a seamless loop */
  var track = document.querySelector('.ribbon-track');
  if (track && !reduce) {
    var clones = Array.prototype.map.call(track.children, function (n) {
      var c = n.cloneNode(true); c.alt = ''; c.setAttribute('aria-hidden', 'true'); return c;
    });
    clones.forEach(function (c) { track.appendChild(c); });
    track.classList.add('run');
  }
})();
