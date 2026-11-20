
/* =====================================================================
   Everly — template behaviour + Auto Scroll (vanilla JS, zero dependencies)
   ===================================================================== */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  /* ---- Sticky header ------------------------------------------------ */
  function initHeader() {
    var header = document.getElementById('siteHeader');
    if (!header) return;

    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 40);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Mobile navigation -------------------------------------------- */
  function initMobileNav() {
    var toggle = document.getElementById('navToggle');
    var menu = document.getElementById('navMenu');
    var backdrop = document.getElementById('navBackdrop');

    if (!toggle || !menu) return;

    var open = function (state) {
      menu.classList.toggle('open', state);
      toggle.setAttribute('aria-expanded', state ? 'true' : 'false');
      toggle.setAttribute('aria-label', state ? 'Close menu' : 'Open menu');

      if (backdrop) {
        backdrop.hidden = false;
        backdrop.classList.toggle('show', state);
      }

      document.body.style.overflow = state ? 'hidden' : '';
    };

    toggle.addEventListener('click', function () {
      open(!menu.classList.contains('open'));
    });

    if (backdrop) {
      backdrop.addEventListener('click', function () {
        open(false);
      });
    }

    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) open(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        open(false);
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 767 && menu.classList.contains('open')) {
        open(false);
      }
    });
  }

  /* ---- Countdown ---------------------------------------------------- */
  function initCountdown() {
    var box = document.getElementById('countdown');
    if (!box) return;

    var target = new Date(box.getAttribute('data-date')).getTime();
    if (isNaN(target)) return;

    var els = {
      days: document.getElementById('cd-days'),
      hours: document.getElementById('cd-hours'),
      mins: document.getElementById('cd-mins'),
      secs: document.getElementById('cd-secs'),
      chip: document.getElementById('chipDays')
    };

    var pad = function (n) {
      return (n < 10 ? '0' : '') + n;
    };

    var tick = function () {
      var diff = target - Date.now();
      if (diff < 0) diff = 0;

      var d = Math.floor(diff / 86400000);
      var h = Math.floor((diff % 86400000) / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);

      if (els.days) els.days.textContent = d;
      if (els.hours) els.hours.textContent = pad(h);
      if (els.mins) els.mins.textContent = pad(m);
      if (els.secs) els.secs.textContent = pad(s);
      if (els.chip) els.chip.textContent = d;
    };

    tick();
    setInterval(tick, 1000);
  }

  /* ---- Scroll-spy active nav link ----------------------------------- */
  function initScrollSpy() {
    var links = Array.prototype.slice.call(
      document.querySelectorAll('.nav-menu a[href^="#"]')
    );

    if (!links.length || !('IntersectionObserver' in window)) return;

    var map = {};
    var sections = [];

    links.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      var sec = document.getElementById(id);

      if (sec) {
        map[id] = link;
        sections.push(sec);
      }
    });

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          links.forEach(function (l) {
            l.classList.remove('active');
          });

          var active = map[entry.target.id];
          if (active) active.classList.add('active');
        }
      });
    }, {
      rootMargin: '-45% 0px -50% 0px',
      threshold: 0
    });

    sections.forEach(function (s) {
      obs.observe(s);
    });
  }

  /* ---- Reveal on scroll --------------------------------------------- */
  function initReveal() {
    var items = Array.prototype.slice.call(
      document.querySelectorAll('.reveal')
    );

    if (!items.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) {
        el.classList.add('in');
      });
      return;
    }

    var obs = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.08
    });

    items.forEach(function (el) {
      obs.observe(el);
    });
  }

  /* ---- RSVP form (front-end only) ----------------------------------- */
  function initRsvp() {
    var form = document.getElementById('rsvpForm');
    var success = document.getElementById('rsvpSuccess');

    if (!form || !success) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var declined = form.querySelector(
        'input[name="attending"]:checked'
      );

      if (declined && declined.value === 'no') {
        success.innerHTML =
          "Thank you for letting us know — you'll be missed. We'll raise a glass to you! 🥂";
      }

      form.style.display = 'none';
      success.classList.add('show');

      success.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'center'
      });
    });
  }

  /* ---- Auto Scroll -------------------------------------------------- */
  function initAutoScroll() {

    // Create floating controls using JavaScript
    var controls = document.createElement('div');

    controls.style.cssText = [
      'position:fixed',
      'right:20px',
      'bottom:20px',
      'z-index:99999',
      'display:flex',
      'gap:8px',
      'padding:10px',
      'background:rgba(255,255,255,0.95)',
      'border:1px solid #e8e0d8',
      'border-radius:50px',
      'box-shadow:0 4px 20px rgba(0,0,0,0.12)'
    ].join(';');

    document.body.appendChild(controls);

    function createButton(label) {
      var btn = document.createElement('button');

      btn.textContent = label;

      btn.style.cssText = [
        'border:none',
        'padding:9px 15px',
        'border-radius:30px',
        'cursor:pointer',
        'background:#8b6f60',
        'color:white',
        'font-size:13px'
      ].join(';');

      controls.appendChild(btn);
      return btn;
    }

    var play = createButton('▶ Play');
    var pause = createButton('⏸ Pause');
    var stop = createButton('■ Stop');

    var timer = null;
    var speed = 1;
    var interval = 20;
    var loop = true;

    function startScroll() {
      if (timer || reduceMotion) return;

      timer = setInterval(function () {

        // Don't scroll while mobile menu is open
        var menu = document.getElementById('navMenu');

        if (menu && menu.classList.contains('open')) {
          return;
        }

        var maxScroll =
          document.documentElement.scrollHeight - window.innerHeight;

        if (maxScroll <= 0) return;

        if (window.scrollY >= maxScroll - 2) {

          if (loop) {
            window.scrollTo(0, 0);
          } else {
            pauseScroll();
          }

          return;
        }

        window.scrollBy(0, speed);

      }, interval);
    }

    function pauseScroll() {
      clearInterval(timer);
      timer = null;
    }

    function stopScroll() {
      pauseScroll();

      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
    }

    play.addEventListener('click', startScroll);
    pause.addEventListener('click', pauseScroll);
    stop.addEventListener('click', stopScroll);

    // Automatically start when website opens
    if (!reduceMotion) {
      startScroll();
    }
  }

  /* ---- Boot --------------------------------------------------------- */
  function boot() {
    initHeader();
    initMobileNav();
    initCountdown();
    initScrollSpy();
    initReveal();
    initRsvp();
    initAutoScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
