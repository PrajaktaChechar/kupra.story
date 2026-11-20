
/* =====================================================================
   EVERLY — Complete Website Behaviour
   Vanilla JavaScript | Zero Dependencies
   Auto Scroll | Tap to Play/Pause | Pause on Interaction
   ===================================================================== */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;


  /* ---- Sticky Header ------------------------------------------------ */

  function initHeader() {

    var header = document.getElementById('siteHeader');

    if (!header) return;

    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 40);
    };

    onScroll();

    window.addEventListener('scroll', onScroll, {
      passive: true
    });
  }


  /* ---- Mobile Navigation -------------------------------------------- */

  function initMobileNav() {

    var toggle = document.getElementById('navToggle');
    var menu = document.getElementById('navMenu');
    var backdrop = document.getElementById('navBackdrop');

    if (!toggle || !menu) return;

    var open = function (state) {

      menu.classList.toggle('open', state);

      toggle.setAttribute(
        'aria-expanded',
        state ? 'true' : 'false'
      );

      toggle.setAttribute(
        'aria-label',
        state ? 'Close menu' : 'Open menu'
      );

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
      if (e.target.closest('a')) {
        open(false);
      }
    });

    document.addEventListener('keydown', function (e) {

      if (
        e.key === 'Escape' &&
        menu.classList.contains('open')
      ) {
        open(false);
      }
    });

    window.addEventListener('resize', function () {

      if (
        window.innerWidth > 767 &&
        menu.classList.contains('open')
      ) {
        open(false);
      }
    });
  }


  /* ---- Countdown ---------------------------------------------------- */

  function initCountdown() {

    var box = document.getElementById('countdown');

    if (!box) return;

    var target = new Date(
      box.getAttribute('data-date')
    ).getTime();

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


  /* ---- Scroll Spy --------------------------------------------------- */

  function initScrollSpy() {

    var links = Array.prototype.slice.call(
      document.querySelectorAll('.nav-menu a[href^="#"]')
    );

    if (
      !links.length ||
      !('IntersectionObserver' in window)
    ) return;

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

          if (active) {
            active.classList.add('active');
          }
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


  /* ---- Reveal On Scroll --------------------------------------------- */

  function initReveal() {

    var items = Array.prototype.slice.call(
      document.querySelectorAll('.reveal')
    );

    if (!items.length) return;

    if (
      reduceMotion ||
      !('IntersectionObserver' in window)
    ) {

      items.forEach(function (el) {
        el.classList.add('in');
      });

      return;
    }

    var obs = new IntersectionObserver(
      function (entries, observer) {

        entries.forEach(function (entry) {

          if (entry.isIntersecting) {

            entry.target.classList.add('in');

            observer.unobserve(entry.target);
          }
        });

      },
      {
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.08
      }
    );

    items.forEach(function (el) {
      obs.observe(el);
    });
  }


  /* ---- RSVP Form (Front-end only) ----------------------------------- */

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


  /* ---- Auto Scroll: Tap to Play / Pause ----------------------------- */

  function initAutoScroll() {

    if (window.everlyAutoScrollInitialized) return;

    window.everlyAutoScrollInitialized = true;

    var running = false;
    var animation = null;
    var lastTime = 0;

    var speed = 25; // Pixels per second
    var loop = true;


    /* Start scrolling */

    function startScroll() {

      if (running || reduceMotion) return;

      running = true;
      lastTime = 0;

      animation = requestAnimationFrame(scrollFrame);
    }


    /* Pause scrolling without resetting position */

    function pauseScroll() {

      running = false;

      if (animation !== null) {

        cancelAnimationFrame(animation);

        animation = null;
      }

      lastTime = 0;
    }


    /* Check mobile navigation */

    function isMenuOpen() {

      var menu = document.getElementById('navMenu');

      return menu && menu.classList.contains('open');
    }


    /* Scrolling animation */

    function scrollFrame(time) {

      if (!running) return;

      if (!lastTime) {
        lastTime = time;
      }

      var delta = Math.min(time - lastTime, 50);

      lastTime = time;

      if (!isMenuOpen()) {

        var maxScroll =
          document.documentElement.scrollHeight -
          window.innerHeight;

        if (maxScroll > 0) {

          if (window.scrollY >= maxScroll - 2) {

            if (loop) {

              // Loop only after reaching the bottom
              window.scrollTo(0, 0);

            } else {

              pauseScroll();

              return;
            }

          } else {

            window.scrollBy(
              0,
              speed * delta / 1000
            );
          }
        }
      }

      animation = requestAnimationFrame(scrollFrame);
    }


    /* Identify buttons, links and form elements */

    function isInteractive(target) {

      if (!target || !target.closest) return false;

      return !!target.closest(
        'a, button, input, textarea, select, label, ' +
        'form, video, audio, [role="button"], ' +
        '[contenteditable="true"], [role="checkbox"], ' +
        '[role="radio"], [role="switch"], ' +
        '#navToggle, #navBackdrop'
      );
    }


    /* Pause immediately when user touches a control */

    document.addEventListener('pointerdown', function (e) {

      if (isInteractive(e.target)) {
        pauseScroll();
      }

    }, true);


    /* Also support keyboard and accessibility focus */

    document.addEventListener('focusin', function (e) {

      if (isInteractive(e.target)) {
        pauseScroll();
      }

    }, true);


    /* Pause when clicking interactive elements.
       Tap empty areas to toggle Play / Pause. */

    document.addEventListener('click', function (e) {

      if (isInteractive(e.target)) {

        pauseScroll();

        return;
      }

      if (isMenuOpen()) {

        pauseScroll();

        return;
      }

      if (running) {

        // Pause at current position
        pauseScroll();

      } else {

        // Resume at current position
        startScroll();
      }

    });


    /* Pause when user starts typing */

    document.addEventListener('keydown', function (e) {

      if (
        isInteractive(e.target) &&
        e.key !== 'Tab' &&
        e.key !== 'Shift' &&
        e.key !== 'Control' &&
        e.key !== 'Alt'
      ) {
        pauseScroll();
      }

    }, true);


    /* Pause when the page becomes hidden */

    document.addEventListener('visibilitychange', function () {

      if (document.hidden) {
        pauseScroll();
      }

    });


    /* Automatically start when website opens */

    if (!reduceMotion) {
      startScroll();
    }

    console.log(
      'Everly Auto Scroll initialized successfully!'
    );
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


  /* ---- Initialize Website ------------------------------------------- */

  if (document.readyState === 'loading') {

    document.addEventListener(
      'DOMContentLoaded',
      boot
    );

  } else {

    boot();
  }

})();
