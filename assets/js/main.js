/* Site interactions: theme, header and menu, scroll reveals, scrollspy, copy email. */
(() => {
  'use strict';

  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Theme ---------- */
  const themeToggle = document.getElementById('theme-toggle');
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  const syncTheme = () => {
    const dark = root.dataset.theme === 'dark';
    themeToggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    if (themeMeta) themeMeta.setAttribute('content', dark ? '#0d1110' : '#f6f4ef');
  };

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    try { localStorage.setItem('theme', theme); } catch (e) { /* storage unavailable */ }
    syncTheme();
  };

  themeToggle.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    if (!document.startViewTransition || reduceMotion.matches) {
      applyTheme(next);
      return;
    }
    // Reveal the new theme in a circle that grows out of the toggle button.
    const rect = themeToggle.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    let applied = false;
    const apply = () => {
      if (applied) return;
      applied = true;
      applyTheme(next);
    };
    const transition = document.startViewTransition(apply);
    setTimeout(apply, 500); // Safety net in case the browser never runs the transition callback.
    transition.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 560, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(() => {});
  });

  // Follow the operating system theme until the visitor picks one.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    let saved = null;
    try { saved = localStorage.getItem('theme'); } catch (e) { /* ignore */ }
    if (!saved) {
      root.dataset.theme = event.matches ? 'dark' : 'light';
      syncTheme();
    }
  });
  syncTheme();

  /* ---------- Header shadow and mobile menu ---------- */
  const menuToggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('site-nav');

  const setMenu = (open) => {
    header.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  menuToggle.addEventListener('click', () => setMenu(!header.classList.contains('is-open')));
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('click', (event) => {
    if (header.classList.contains('is-open') && !header.contains(event.target)) setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.classList.contains('is-open')) {
      setMenu(false);
      menuToggle.focus();
    }
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', (event) => {
    if (event.matches) setMenu(false);
  });

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const revealer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.1 });
    revealEls.forEach((el) => revealer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Highlight the nav link for the section in view ---------- */
  const navLinks = Array.from(document.querySelectorAll('.nav__link'));
  const linkFor = new Map(navLinks.map((link) => [link.getAttribute('href').slice(1), link]));
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.remove('is-active');
          link.removeAttribute('aria-current');
        });
        const active = linkFor.get(entry.target.id);
        if (active) {
          active.classList.add('is-active');
          active.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach((section) => spy.observe(section));
  }

  /* ---------- Copy email ---------- */
  const toast = document.getElementById('toast');
  let toastTimer;
  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2400);
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.append(area);
      area.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      area.remove();
      return ok;
    }
  };

  document.querySelectorAll('[data-copy]').forEach((button) => {
    const label = button.querySelector('[data-copy-label]');
    const original = label ? label.textContent : '';
    button.addEventListener('click', async () => {
      const ok = await copyText(button.dataset.copy);
      if (!ok) {
        showToast('Press Ctrl+C to copy: ' + button.dataset.copy);
        return;
      }
      button.classList.add('is-copied');
      if (label) label.textContent = 'Copied';
      showToast('Email address copied');
      setTimeout(() => {
        button.classList.remove('is-copied');
        if (label) label.textContent = original;
      }, 2200);
    });
  });

  /* ---------- Footer year ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
