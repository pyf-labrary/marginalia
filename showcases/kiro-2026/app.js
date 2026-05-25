// ===== Toggle expandable blocks =====
function toggleBlock(header) {
  const body = header.nextElementSibling;
  const arrow = header.querySelector('.arrow');
  body.classList.toggle('open');
  arrow.classList.toggle('open');
}

// ===== Sidebar navigation =====
(function () {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('menu-toggle');
  const main = document.getElementById('main');
  const navLinks = document.querySelectorAll('#nav a');

  toggle.addEventListener('click', () => sidebar.classList.toggle('show'));

  // Close sidebar on mobile after clicking a link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 900) sidebar.classList.remove('show');
    });
  });

  // Active link on scroll
  const sections = [];
  navLinks.forEach(a => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) sections.push({ el, link: a });
  });

  function updateActive() {
    const scrollY = window.scrollY + 120;
    let current = sections[0];
    for (const s of sections) {
      if (s.el.offsetTop <= scrollY) current = s;
    }
    navLinks.forEach(a => a.classList.remove('active'));
    if (current) current.link.classList.add('active');
  }
  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
})();

// ===== Scroll fade-in animation =====
(function () {
  const observer = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.08 }
  );
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
})();

// ===== Back to top button =====
(function () {
  const btn = document.getElementById('back-top');
  window.addEventListener('scroll', () => {
    btn.style.display = window.scrollY > 600 ? 'flex' : 'none';
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

// ===== Skill bar animation =====
(function () {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.fill').forEach(fill => {
          fill.style.width = fill.style.width; // trigger reflow
        });
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.skill-bar').forEach(el => {
    const fill = el.querySelector('.fill');
    if (fill) {
      const w = fill.style.width;
      fill.style.width = '0';
      observer.observe(el);
      // Restore after a tick so transition plays
      setTimeout(() => { fill.style.width = w; }, 300);
    }
  });
})();
