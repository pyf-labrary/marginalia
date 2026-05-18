// Director's Masterclass — per-page mini-deck navigation + ambient features

(function () {
  const deck = document.getElementById('deck');
  if (!deck) return;

  const slides = document.querySelectorAll('.slide');
  const total = slides.length;
  let current = 0;

  const counter = document.getElementById('frameCounter');
  const progressFill = document.getElementById('progressFill');
  const reelInfo = document.getElementById('reelInfo');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  const prevUrl = deck.dataset.prevUrl || '';
  const nextUrl = deck.dataset.nextUrl || '';
  const chapterNum = deck.dataset.chapter || '01';
  const totalChapters = deck.dataset.totalChapters || '06';

  function show(idx) {
    if (idx < 0) {
      if (prevUrl) { window.location.href = prevUrl; return; }
      idx = 0;
    }
    if (idx >= total) {
      if (nextUrl) { window.location.href = nextUrl; return; }
      idx = total - 1;
    }
    slides[current].classList.remove('active');
    slides[idx].classList.add('active');
    void slides[idx].offsetWidth;
    current = idx;

    if (counter) counter.textContent = `FRAME ${String(idx + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    if (progressFill) progressFill.style.width = `${((idx + 1) / total) * 100}%`;
    if (reelInfo) reelInfo.textContent = `REEL ${chapterNum} / ${totalChapters}`;
    slides[idx].scrollTop = 0;
  }

  if (prevBtn) prevBtn.addEventListener('click', () => show(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => show(current + 1));

  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea, select')) return;
    // Don't intercept arrows when drawer is open and focus is on it
    const drawerOpen = document.querySelector('.toc-drawer.open');
    if (e.key === 'Escape' && drawerOpen) {
      closeDrawer();
      return;
    }
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case ' ':
      case 'PageDown':
        e.preventDefault();
        show(current + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        show(current - 1);
        break;
      case 'Home':
        e.preventDefault();
        show(0);
        break;
      case 'End':
        e.preventDefault();
        show(total - 1);
        break;
    }
  });

  let touchStartX = 0;
  document.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; });
  document.addEventListener('touchend', (e) => {
    if (document.querySelector('.toc-drawer.open')) return;
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 50) show(delta < 0 ? current + 1 : current - 1);
  });

  show(0);

  // ===== Audio: try autoplay, fall back to first-interaction =====
  const audio = document.getElementById('bgAudio');
  const audioBtn = document.getElementById('audioToggle');
  let playing = false;
  let userMuted = false;

  function setIcon() {
    if (!audioBtn) return;
    audioBtn.textContent = playing ? '♪' : '♫';
    audioBtn.classList.toggle('playing', playing);
    audioBtn.title = playing ? '静音 (M)' : '播放配乐 (M)';
  }

  function tryPlay() {
    if (!audio || userMuted) return;
    const p = audio.play();
    if (p && p.then) {
      p.then(() => { playing = true; setIcon(); })
       .catch(() => { /* blocked; wait for interaction */ });
    } else {
      playing = true; setIcon();
    }
  }

  function stopPlay() {
    if (!audio) return;
    audio.pause();
    playing = false;
    setIcon();
  }

  if (audio) {
    audio.volume = 0.32;
    audio.loop = true;

    // Restore previous state across chapter nav
    try {
      const prev = sessionStorage.getItem('deck-audio');
      if (prev === 'paused') userMuted = true;
    } catch (e) {}

    setIcon();

    // Attempt autoplay (will silently fail if blocked)
    if (!userMuted) tryPlay();

    // First-interaction fallback: when autoplay is blocked, kick off on any
    // user gesture (pointerdown / keydown / touchstart). One-shot.
    if (!userMuted && !playing) {
      const kickoff = () => {
        if (!playing && !userMuted) tryPlay();
        document.removeEventListener('pointerdown', kickoff, true);
        document.removeEventListener('keydown', kickoff, true);
        document.removeEventListener('touchstart', kickoff, true);
      };
      document.addEventListener('pointerdown', kickoff, true);
      document.addEventListener('keydown', kickoff, true);
      document.addEventListener('touchstart', kickoff, true);
    }

    if (audioBtn) {
      audioBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (playing) {
          userMuted = true;
          stopPlay();
          try { sessionStorage.setItem('deck-audio', 'paused'); } catch (err) {}
        } else {
          userMuted = false;
          tryPlay();
          try { sessionStorage.setItem('deck-audio', 'playing'); } catch (err) {}
        }
      });
    }
  }

  // 'M' key toggles audio
  document.addEventListener('keydown', (e) => {
    if (e.key === 'm' || e.key === 'M') {
      if (audioBtn) audioBtn.click();
    }
  });

  // ===== TOC drawer =====
  const navTrigger = document.getElementById('navTrigger');
  const drawer = document.getElementById('tocDrawer');
  const backdrop = document.getElementById('tocBackdrop');
  const drawerClose = document.getElementById('tocDrawerClose');

  function openDrawer() {
    if (drawer) drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
  }
  function closeDrawer() {
    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
  }

  if (navTrigger) navTrigger.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  // ===== Compact-card tooltip popups: flip & mobile tap =====
  // For desktop, hover triggers a CSS popup; we just need to flip up/down based
  // on each card's vertical position so the popup doesn't get clipped below
  // the viewport. For mobile, click toggles .expanded.
  function flipIfNeeded(card) {
    const rect = card.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    if (spaceBelow < 180 && spaceAbove > spaceBelow) {
      card.classList.add('popup-up');
    } else {
      card.classList.remove('popup-up');
    }
  }
  function bindCompact(selector) {
    document.querySelectorAll(selector).forEach((el) => {
      el.addEventListener('mouseenter', () => flipIfNeeded(el));
      el.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        if (hasHover) return;
        flipIfNeeded(el);
        // Toggle this one; close all others in same grid
        const wasExpanded = el.classList.contains('expanded');
        document.querySelectorAll(selector + '.expanded').forEach((other) => {
          other.classList.remove('expanded');
        });
        if (!wasExpanded) el.classList.add('expanded');
      });
    });
  }
  bindCompact('.card-grid.card-compact .card');
  bindCompact('.director-grid.director-grid-compact .director');

  // Close any expanded card if user taps outside it
  document.addEventListener('click', (e) => {
    const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (hasHover) return;
    if (e.target.closest('.card-grid.card-compact .card, .director-grid.director-grid-compact .director')) return;
    document.querySelectorAll('.expanded').forEach((c) => c.classList.remove('expanded'));
  });

})();
