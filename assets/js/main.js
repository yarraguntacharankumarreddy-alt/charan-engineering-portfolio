(function () {
  'use strict';

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  // Reveal animations with IntersectionObserver
  function initReveals() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const setVisible = (el) => el.setAttribute('data-visible', 'true');

    if (!('IntersectionObserver' in window)) {
      reveals.forEach(setVisible);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisible(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    reveals.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        setVisible(el);
      } else {
        observer.observe(el);
      }
    });
  }

  // Typewriter
  function initTypewriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;
    const roles = [
      'Automotive Embedded System Engineer',
      'Automotive Testing Engineer',
      'ECU Validation | CAN | UDS',
    ];
    let roleIndex = 0;
    let text = '';
    let deleting = false;
    let timer = null;

    function tick() {
      const full = roles[roleIndex];
      const done = !deleting && text === full;
      const cleared = deleting && text === '';
      const delay = done ? 1600 : cleared ? 200 : deleting ? 35 : 70;

      timer = setTimeout(() => {
        if (done) {
          deleting = true;
        } else if (cleared) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
        } else {
          text = deleting
            ? full.slice(0, text.length - 1)
            : full.slice(0, text.length + 1);
        }

        // Update text before the caret (last child)
        const caret = el.querySelector('.caret');
        // Remove old text nodes before caret
        Array.from(el.childNodes).forEach((node) => {
          if (node !== caret) node.remove();
        });
        if (text) {
          el.insertBefore(document.createTextNode(text), caret);
        }
        tick();
      }, delay);
    }

    tick();
  }

  // Counters
  function initCounters() {
    const counters = document.querySelectorAll('[data-counter-to]');
    if (!counters.length) return;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const animate = (el) => {
      const to = parseInt(el.dataset.counterTo, 10);
      const suffix = el.nextElementSibling && el.nextElementSibling.textContent.includes('+') ? '+' : '';
      const start = performance.now();
      const duration = 1400;
      function step(now) {
        const p = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(to * easeOutCubic(p)) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    };

    if (!('IntersectionObserver' in window)) {
      counters.forEach(animate);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    counters.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        animate(el);
      } else {
        observer.observe(el);
      }
    });
  }

  // Navbar scroll and active section
  function initNavbar() {
    const header = document.querySelector('header');
    if (!header) return;

    const links = Array.from(document.querySelectorAll('nav a[href^="#"]'));
    const mobileLinks = Array.from(document.querySelectorAll('#mobile-menu a'));
    const sections = [
      'home', 'about', 'skills', 'projects', 'certifications', 'resume', 'contact',
    ].map((id) => document.getElementById(id)).filter(Boolean);

    function update() {
      const scrolled = window.scrollY > 20;
      header.classList.toggle('border-b', scrolled);
      header.classList.toggle('border-border/70', scrolled);
      header.classList.toggle('bg-background/80', scrolled);
      header.classList.toggle('backdrop-blur-xl', scrolled);
      header.classList.toggle('border-transparent', !scrolled);

      const pos = window.scrollY + 120;
      let current = 'home';
      for (const s of sections) {
        if (s.offsetTop <= pos) current = s.id;
      }
      links.forEach((a) => {
        const isActive = a.getAttribute('href') === '#' + current;
        a.classList.toggle('bg-secondary', isActive);
        a.classList.toggle('text-cyan', isActive);
        a.classList.toggle('text-muted-foreground', !isActive);
        a.classList.toggle('hover:text-foreground', !isActive);
      });
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // Mobile menu
  function initMobileMenu() {
    const btn = document.querySelector('nav button[aria-label]');
    const menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;

    const close = () => {
      menu.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Open menu');
    };

    const open = () => {
      menu.classList.remove('hidden');
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-label', 'Close menu');
    };

    btn.addEventListener('click', () => {
      if (menu.classList.contains('hidden')) open(); else close();
    });

    menu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', close);
    });

    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && !btn.contains(e.target)) close();
    });
  }

  // Back to top
  function initBackToTop() {
    const btn = document.querySelector('button[aria-label="Back to top"]');
    if (!btn) return;
    btn.classList.add('translate-y-4', 'opacity-0', 'pointer-events-none');
    function update() {
      const show = window.scrollY > 600;
      btn.classList.toggle('translate-y-0', show);
      btn.classList.toggle('opacity-100', show);
      btn.classList.toggle('translate-y-4', !show);
      btn.classList.toggle('opacity-0', !show);
      btn.classList.toggle('pointer-events-none', !show);
    }
    window.addEventListener('scroll', update, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    update();
  }

  // Contact form validation
  function initContactForm() {
    const form = document.querySelector('form');
    const toast = document.getElementById('toast');
    if (!form) return;

    function showToast(message, type) {
      if (!toast) return;
      toast.textContent = message;
      toast.style.display = 'block';
      toast.style.color = type === 'success' ? 'var(--primary)' : 'var(--destructive)';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 3000);
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const email = String(data.get('email') || '').trim();
      const subject = String(data.get('subject') || '').trim();
      const message = String(data.get('message') || '').trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!name) return showToast('Please enter your name', 'error');
      if (!emailRegex.test(email)) return showToast('Please enter a valid email', 'error');
      if (!subject) return showToast('Please enter a subject', 'error');
      if (!message) return showToast('Please enter a message', 'error');

      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.textContent = 'Sending...';
      setTimeout(() => {
        form.reset();
        if (btn) btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send"><path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/></svg> Send message';
        showToast('Thanks for reaching out! I\'ll get back to you soon.', 'success');
      }, 700);
    });
  }

  onReady(() => {
    initReveals();
    initTypewriter();
    initCounters();
    initNavbar();
    initMobileMenu();
    initBackToTop();
    initContactForm();
  });
})();
