(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile menu
  var btn = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');
  if (btn && nav) {
    var label = btn.querySelector('.visually-hidden');
    var setOpen = function (open) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      nav.classList.toggle('is-open', open);
      if (label) label.textContent = open ? btn.dataset.close : btn.dataset.open;
    };
    btn.addEventListener('click', function () { setOpen(btn.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setOpen(false); btn.focus(); }
    });
  }

  // Gentle reveal on scroll (content stays visible without JS or with reduced motion)
  var items = document.querySelectorAll('.reveal');
  if (!reduce && 'IntersectionObserver' in window && items.length) {
    document.documentElement.classList.add('js-reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  // Contact form: Netlify Forms via fetch. NOT TESTED until deployed on Netlify (GitHub Pages cannot receive forms).
  var form = document.querySelector('.contact-form');
  if (form && window.fetch) {
    var status = form.querySelector('.form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var body = new URLSearchParams(new FormData(form)).toString();
      status.className = 'form-status';
      fetch(window.location.pathname, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
        .then(function (r) {
          if (!r.ok) throw new Error('bad status');
          status.textContent = form.dataset.success;
          status.classList.add('is-ok');
          form.reset();
        })
        .catch(function () {
          status.textContent = form.dataset.error;
          status.classList.add('is-error');
        });
    });
  }
})();

// Header state + very light hero parallax (transform only; skipped for reduced motion)
(function () {
  'use strict';
  var header = document.querySelector('.site-header');
  var bg = document.querySelector('.hero-bg');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var home = !!document.getElementById('home');
  if (header && !home) header.classList.add('is-solid');
  var ticking = false;
  function update() {
    ticking = false;
    var y = window.scrollY || 0;
    if (header) header.classList.toggle('is-scrolled', y > 24);
    if (bg && !reduce && y < window.innerHeight * 1.2) bg.style.transform = 'translate3d(0,' + Math.round(y * 0.18) + 'px,0)';
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
})();
