// Director's Masterclass — per-page mini-deck navigation + tooltips + audio

(function () {
  const deck = document.getElementById('deck');
  if (!deck) return;

  const slides = document.querySelectorAll('.slide');
  const total = slides.length;
  let current = 0;

  const counter = document.getElementById('frameCounter');
  const progressFill = document.getElementById('progressFill');
  const reelInfo = document.getElementById('reelInfo');

  const prevUrl = deck.dataset.prevUrl || '';
  const nextUrl = deck.dataset.nextUrl || '';
  const chapterNum = deck.dataset.chapter || '01';
  const totalChapters = deck.dataset.totalChapters || '06';

  // ---- Save & restore the active slide index across chapter loads ----
  // When a slide nav crosses the boundary into another chapter HTML page,
  // mark the desired starting slide (first or last) so the next page lands
  // there instead of always slide 0.
  const PAGE_NAV_KEY = 'deck-page-nav';

  function show(idx) {
    if (idx < 0) {
      if (prevUrl) {
        try { sessionStorage.setItem(PAGE_NAV_KEY, 'last'); } catch (e) {}
        window.location.href = prevUrl;
        return;
      }
      idx = 0;
    }
    if (idx >= total) {
      if (nextUrl) {
        try { sessionStorage.setItem(PAGE_NAV_KEY, 'first'); } catch (e) {}
        window.location.href = nextUrl;
        return;
      }
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

  // If we arrived via cross-chapter nav and were asked to land on the last slide
  try {
    const navMark = sessionStorage.getItem(PAGE_NAV_KEY);
    if (navMark) sessionStorage.removeItem(PAGE_NAV_KEY);
    if (navMark === 'last') {
      current = total - 1;
      slides.forEach((s) => s.classList.remove('active'));
      slides[current].classList.add('active');
    }
  } catch (e) {}

  // Initial render
  if (counter) counter.textContent = `FRAME ${String(current + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  if (progressFill) progressFill.style.width = `${((current + 1) / total) * 100}%`;
  if (reelInfo) reelInfo.textContent = `REEL ${chapterNum} / ${totalChapters}`;

  // ---- Keyboard nav ----
  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea, select')) return;
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

  // ---- Touch swipe ----
  let touchStartX = 0;
  document.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; });
  document.addEventListener('touchend', (e) => {
    if (document.querySelector('.toc-drawer.open')) return;
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 50) show(delta < 0 ? current + 1 : current - 1);
  });

  // ---- Chapter pager (now slide-nav, with fall-through to prev/next chapter HTML) ----
  document.querySelectorAll('.pager-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const dir = btn.dataset.dir;
      if (dir === 'prev') show(current - 1);
      else if (dir === 'next') show(current + 1);
    });
  });

  // ===== Audio: persist play state + currentTime across chapter pages =====
  const audio = document.getElementById('bgAudio');
  const audioBtn = document.getElementById('audioToggle');
  const AUDIO_TIME_KEY = 'deck-audio-time';
  const AUDIO_STATE_KEY = 'deck-audio';
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
       .catch(() => {});
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

    // Restore time + state
    try {
      const prevState = sessionStorage.getItem(AUDIO_STATE_KEY);
      if (prevState === 'paused') userMuted = true;
      const savedTime = parseFloat(sessionStorage.getItem(AUDIO_TIME_KEY) || '0');
      if (savedTime > 0 && !isNaN(savedTime)) {
        const setT = () => { try { audio.currentTime = savedTime; } catch (e) {} };
        if (audio.readyState >= 1) setT();
        else audio.addEventListener('loadedmetadata', setT, { once: true });
      }
    } catch (e) {}

    setIcon();

    if (!userMuted) tryPlay();

    // First-interaction kickoff if autoplay blocked
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
          try { sessionStorage.setItem(AUDIO_STATE_KEY, 'paused'); } catch (err) {}
        } else {
          userMuted = false;
          tryPlay();
          try { sessionStorage.setItem(AUDIO_STATE_KEY, 'playing'); } catch (err) {}
        }
      });
    }

    // Persist currentTime continuously (every second) + on visibility change + pagehide
    function saveTime() {
      if (!audio) return;
      try { sessionStorage.setItem(AUDIO_TIME_KEY, String(audio.currentTime || 0)); } catch (e) {}
    }
    setInterval(saveTime, 1000);
    document.addEventListener('visibilitychange', saveTime);
    window.addEventListener('pagehide', saveTime);
    window.addEventListener('beforeunload', saveTime);

    // Intercept chapter-link clicks to save right before navigation
    document.querySelectorAll('a[href$=".html"]').forEach((a) => {
      a.addEventListener('click', saveTime, { capture: true });
    });
  }

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

  // ===== Tooltip popups (compact cards) with hover bridge =====
  // JS-controlled .show-popup state with a small hide delay; pointer can travel
  // from card → popup without flicker. Bounds-check to flip up/left/right.
  function flipForBounds(el) {
    el.classList.remove('popup-up', 'popup-left', 'popup-right');
    const popup = el.querySelector(':scope > p, :scope > .style');
    if (!popup) return;

    // First, force show to measure
    el.classList.add('show-popup');
    const r = el.getBoundingClientRect();
    const pr = popup.getBoundingClientRect();
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    // Vertical: prefer below; flip if not enough space below AND more above
    const spaceBelow = vh - r.bottom;
    const spaceAbove = r.top;
    const needHeight = pr.height + 16;
    if (spaceBelow < needHeight && spaceAbove > spaceBelow) {
      el.classList.add('popup-up');
    }

    // Horizontal: prefer center; check if center alignment overflows
    const centerX = r.left + r.width / 2;
    const halfW = pr.width / 2 + 8;
    if (centerX - halfW < 12) {
      el.classList.add('popup-right');  // anchor to left edge
    } else if (centerX + halfW > vw - 12) {
      el.classList.add('popup-left');   // anchor to right edge
    }
  }

  function bindTooltip(selector) {
    document.querySelectorAll(selector).forEach((el) => {
      let hideTimer = null;
      const popup = el.querySelector(':scope > p, :scope > .style');

      const enter = () => {
        clearTimeout(hideTimer);
        flipForBounds(el);
      };
      const leave = (e) => {
        // If the cursor is moving INTO the popup, ignore
        if (popup && e.relatedTarget && popup.contains(e.relatedTarget)) return;
        hideTimer = setTimeout(() => el.classList.remove('show-popup'), 220);
      };

      el.addEventListener('mouseenter', enter);
      el.addEventListener('mouseleave', leave);
      if (popup) {
        popup.addEventListener('mouseenter', () => clearTimeout(hideTimer));
        popup.addEventListener('mouseleave', (e) => {
          if (e.relatedTarget && el.contains(e.relatedTarget)) return;
          hideTimer = setTimeout(() => el.classList.remove('show-popup'), 220);
        });
      }

      // Mobile tap
      el.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        if (hasHover) return;
        clearTimeout(hideTimer);
        flipForBounds(el);
      });
    });
  }
  bindTooltip('.card-grid.card-compact .card');
  bindTooltip('.director-grid.director-grid-compact .director');

  // Tap-outside-to-close on mobile
  document.addEventListener('click', (e) => {
    const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (hasHover) return;
    if (e.target.closest('.card-grid.card-compact .card, .director-grid.director-grid-compact .director')) return;
    document.querySelectorAll('.show-popup').forEach((c) => c.classList.remove('show-popup'));
  });

  // Reposition popups on scroll/resize
  window.addEventListener('resize', () => {
    document.querySelectorAll('.show-popup').forEach(flipForBounds);
  });
  document.addEventListener('scroll', () => {
    document.querySelectorAll('.show-popup').forEach(flipForBounds);
  }, true);
})();
