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
  // ===== Inject motion-demo SVG into camera-movement cards ([data-move]) =====
  // The SVG is prepended into the card's tooltip <p>; CSS keyframes animate
  // it (paused by default, plays only when .show-popup is set on the card).
  const moveDemos = {
    // Subject grows toward camera
    push: '<svg class="md md-push" viewBox="0 0 100 56"><rect class="frame" x="2" y="2" width="96" height="52" rx="1"/><g class="subject"><circle cx="50" cy="32" r="6"/><path d="M40 50 Q40 36 50 36 Q60 36 60 50 Z"/></g><text class="md-tag" x="6" y="11">PUSH IN →</text></svg>',
    pull: '<svg class="md md-pull" viewBox="0 0 100 56"><rect class="frame" x="2" y="2" width="96" height="52" rx="1"/><g class="subject"><circle cx="50" cy="32" r="6"/><path d="M40 50 Q40 36 50 36 Q60 36 60 50 Z"/></g><text class="md-tag" x="6" y="11">← PULL OUT</text></svg>',
    // Background slides; subject mid
    pan: '<svg class="md md-pan" viewBox="0 0 100 56"><rect class="frame" x="2" y="2" width="96" height="52" rx="1"/><g class="bg"><line x1="10" y1="46" x2="22" y2="46"/><line x1="34" y1="46" x2="46" y2="46"/><line x1="58" y1="46" x2="70" y2="46"/><line x1="82" y1="46" x2="94" y2="46"/><polygon points="14,46 20,30 26,46"/><polygon points="62,46 72,22 82,46"/></g><path class="arc" d="M30 14 Q50 6 70 14" fill="none"/><polygon class="arrow" points="68,16 72,12 70,18"/><text class="md-tag" x="6" y="11">PAN ↺</text></svg>',
    tilt: '<svg class="md md-tilt" viewBox="0 0 100 56"><rect class="frame" x="2" y="2" width="96" height="52" rx="1"/><g class="bg"><line x1="20" y1="10" x2="80" y2="10"/><line x1="20" y1="22" x2="80" y2="22"/><line x1="20" y1="34" x2="80" y2="34"/><line x1="20" y1="46" x2="80" y2="46"/></g><path class="arc" d="M88 14 Q92 28 88 42" fill="none"/><polygon class="arrow" points="86,40 90,44 92,38"/><text class="md-tag" x="6" y="11">TILT ↕</text></svg>',
    dolly: '<svg class="md md-dolly" viewBox="0 0 100 56"><rect class="frame" x="2" y="2" width="96" height="52" rx="1"/><g class="bg"><polygon points="14,46 20,28 26,46"/><polygon points="62,46 72,20 82,46"/><polygon points="38,46 46,32 54,46"/></g><line class="track" x1="2" y1="50" x2="98" y2="50"/><polygon class="cam" points="48,48 54,48 56,52 52,54 46,54 46,52"/><text class="md-tag" x="6" y="11">DOLLY →</text></svg>',
    crane: '<svg class="md md-crane" viewBox="0 0 100 56"><rect class="frame" x="2" y="2" width="96" height="52" rx="1"/><g class="bg"><polygon points="14,50 70,50 60,30 24,30"/><line x1="32" y1="40" x2="52" y2="40"/></g><line class="arm" x1="80" y1="52" x2="80" y2="18"/><polygon class="cam" points="74,16 86,16 88,22 84,24 76,24 72,22"/><text class="md-tag" x="6" y="11">CRANE ↑</text></svg>',
    // Subject moves; camera trails (subject stays centered)
    follow: '<svg class="md md-follow" viewBox="0 0 100 56"><rect class="frame" x="2" y="2" width="96" height="52" rx="1"/><g class="bg"><line x1="2" y1="46" x2="98" y2="46"/></g><g class="subject"><circle cx="50" cy="30" r="5"/><path d="M42 46 Q42 34 50 34 Q58 34 58 46 Z"/></g><g class="trail"><line x1="38" y1="44" x2="44" y2="44"/><line x1="58" y1="44" x2="62" y2="44"/></g><text class="md-tag" x="6" y="11">FOLLOW ↦</text></svg>',
    arc: '<svg class="md md-arc" viewBox="0 0 100 56"><rect class="frame" x="2" y="2" width="96" height="52" rx="1"/><circle class="subject-c" cx="50" cy="30" r="4"/><ellipse class="orbit" cx="50" cy="32" rx="28" ry="10" fill="none"/><circle class="cam-dot" cx="78" cy="32" r="2.4"/><text class="md-tag" x="6" y="11">ARC ↻</text></svg>',
    handheld: '<svg class="md md-handheld" viewBox="0 0 100 56"><g class="shake"><rect class="frame" x="2" y="2" width="96" height="52" rx="1"/><circle class="subject-c" cx="50" cy="30" r="6"/><path class="subject-b" d="M40 48 Q40 34 50 34 Q60 34 60 48 Z"/></g><text class="md-tag" x="6" y="11">HANDHELD ↯</text></svg>',
    steadicam: '<svg class="md md-steadicam" viewBox="0 0 100 56"><rect class="frame" x="2" y="2" width="96" height="52" rx="1"/><path class="glide" d="M8 36 Q30 18 50 32 T92 30" fill="none"/><circle class="cam-dot" cx="8" cy="36" r="2.4"/><text class="md-tag" x="6" y="11">STEADICAM ∼</text></svg>',
    crashzoom: '<svg class="md md-crashzoom" viewBox="0 0 100 56"><rect class="frame" x="2" y="2" width="96" height="52" rx="1"/><g class="rings"><circle cx="50" cy="30" r="20" fill="none"/><circle cx="50" cy="30" r="14" fill="none"/><circle cx="50" cy="30" r="8" fill="none"/></g><circle class="subject-c" cx="50" cy="30" r="3.2"/><text class="md-tag" x="6" y="11">CRASH ZOOM ⇉</text></svg>',
    whippan: '<svg class="md md-whippan" viewBox="0 0 100 56"><rect class="frame" x="2" y="2" width="96" height="52" rx="1"/><g class="streaks"><line x1="6" y1="20" x2="94" y2="20"/><line x1="6" y1="28" x2="94" y2="28"/><line x1="6" y1="36" x2="94" y2="36"/><line x1="6" y1="44" x2="94" y2="44"/></g><text class="md-tag" x="6" y="11">WHIP PAN ⤜</text></svg>',
  };

  document.querySelectorAll('.card[data-move]').forEach((card) => {
    const kind = card.dataset.move;
    const svg = moveDemos[kind];
    if (!svg) return;
    const p = card.querySelector(':scope > p');
    if (!p) return;
    const wrap = document.createElement('span');
    wrap.className = 'move-demo';
    wrap.innerHTML = svg;
    p.insertBefore(wrap, p.firstChild);
  });

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

  // ===== Wikipedia hover preview for .ext-link =====
  const wikiCache = new Map();
  let wikiPopup = null;
  let wikiHideTimer = null;
  let wikiCurrentLink = null;

  function ensureWikiPopup() {
    if (wikiPopup) return wikiPopup;
    wikiPopup = document.createElement('div');
    wikiPopup.className = 'wiki-popup';
    wikiPopup.innerHTML = '<div class="wiki-loading">LOADING…</div>';
    document.body.appendChild(wikiPopup);
    wikiPopup.addEventListener('mouseenter', () => { clearTimeout(wikiHideTimer); });
    wikiPopup.addEventListener('mouseleave', scheduleWikiHide);
    return wikiPopup;
  }

  function scheduleWikiHide() {
    clearTimeout(wikiHideTimer);
    wikiHideTimer = setTimeout(() => {
      if (wikiPopup) wikiPopup.classList.remove('show');
      wikiCurrentLink = null;
    }, 220);
  }

  function positionWikiPopup(anchorRect) {
    if (!wikiPopup) return;
    const pw = 360;
    const ph = wikiPopup.offsetHeight || 240;
    const margin = 12;
    let left = anchorRect.left + anchorRect.width / 2 - pw / 2;
    left = Math.max(margin, Math.min(window.innerWidth - pw - margin, left));
    let top = anchorRect.bottom + 10;
    if (top + ph > window.innerHeight - margin) {
      top = anchorRect.top - ph - 10;
    }
    top = Math.max(margin, top);
    wikiPopup.style.left = left + 'px';
    wikiPopup.style.top = top + 'px';
  }

  function extractWikiTitle(href) {
    try {
      const u = new URL(href);
      if (!/wikipedia\.org$/.test(u.hostname)) return null;
      const m = u.pathname.match(/\/wiki\/(.+)$/);
      if (!m) return null;
      return { lang: u.hostname.split('.')[0], title: decodeURIComponent(m[1]) };
    } catch (e) { return null; }
  }

  async function fetchWikiSummary(lang, title) {
    const key = lang + ':' + title;
    if (wikiCache.has(key)) return wikiCache.get(key);

    const tryRest = async (t) => {
      const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(t)}?redirect=true`;
      try {
        const r = await fetch(url, { headers: { Accept: 'application/json' }, redirect: 'follow' });
        if (r.ok) return await r.json();
      } catch (e) {}
      return null;
    };

    const tryAction = async (t) => {
      const url = `https://${lang}.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages|description&exintro=1&explaintext=1&piprop=thumbnail|original&pithumbsize=600&titles=${encodeURIComponent(t)}&redirects=1&format=json&formatversion=2&origin=*`;
      try {
        const r = await fetch(url);
        if (!r.ok) return null;
        const j = await r.json();
        const page = j && j.query && j.query.pages && j.query.pages[0];
        if (!page || page.missing) return null;
        const thumb = (page.thumbnail && page.thumbnail.source)
          || (page.original && page.original.source);
        return {
          title: page.title,
          description: page.description || '',
          extract: page.extract || '',
          thumbnail: thumb ? { source: thumb } : null,
        };
      } catch (e) { return null; }
    };

    const trySearch = async (t) => {
      const url = `https://${lang}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(t)}&limit=1&namespace=0&format=json&origin=*`;
      try {
        const r = await fetch(url);
        if (!r.ok) return null;
        const j = await r.json();
        // opensearch returns [query, [titles], [descriptions], [urls]]
        if (j && j[1] && j[1][0]) return j[1][0];
      } catch (e) {}
      return null;
    };

    const p = (async () => {
      // Try REST summary first (fast, has thumb metadata)
      let data = await tryRest(title);
      if (data && data.type !== 'disambiguation' && data.extract) return data;
      // Fallback to action API (handles redirects + variants robustly)
      const data2 = await tryAction(title);
      if (data2) return data2;
      // Final fallback: search for the closest article title, then re-fetch
      const found = await trySearch(title);
      if (found && found !== title) {
        const data3 = await tryRest(found);
        if (data3 && data3.extract) return data3;
        const data4 = await tryAction(found);
        if (data4) return data4;
      }
      return data; // could be null or disambiguation
    })();
    wikiCache.set(key, p);
    return p;
  }

  function renderWikiPopup(data, anchorHref) {
    if (!wikiPopup) return;
    if (!data || data.type === 'disambiguation' && !data.extract) {
      wikiPopup.innerHTML = '<div class="wiki-loading">无法加载预览。</div>';
      return;
    }
    const thumb = data.thumbnail && data.thumbnail.source;
    const desc = data.description || '';
    const title = data.title || '';
    const extract = data.extract || '';
    wikiPopup.innerHTML = `
      ${thumb ? `<img class="wiki-thumb" alt="" src="${thumb}">` : ''}
      <div class="wiki-body">
        <h4 class="wiki-title">${title}</h4>
        ${desc ? `<p class="wiki-desc">${desc}</p>` : ''}
        <p class="wiki-extract">${extract}</p>
      </div>
      <div class="wiki-foot">
        <span>WIKIPEDIA</span>
        <a href="${anchorHref}" target="_blank" rel="noopener noreferrer">阅读全文 →</a>
      </div>
    `;
  }

  function bindWikiPreview() {
    document.querySelectorAll('a.ext-link').forEach((a) => {
      const href = a.getAttribute('href') || '';
      const info = extractWikiTitle(href);
      if (!info) return;
      a.dataset.wikiBound = '1';

      a.addEventListener('mouseenter', async () => {
        const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        if (!hasHover) return;
        clearTimeout(wikiHideTimer);
        const popup = ensureWikiPopup();
        wikiCurrentLink = a;

        const rect = a.getBoundingClientRect();
        popup.innerHTML = '<div class="wiki-loading">LOADING…</div>';
        popup.classList.add('show');
        positionWikiPopup(rect);

        const data = await fetchWikiSummary(info.lang, info.title);
        if (wikiCurrentLink !== a) return;
        renderWikiPopup(data, href);
        positionWikiPopup(a.getBoundingClientRect());
      });

      a.addEventListener('mouseleave', (e) => {
        if (wikiPopup && e.relatedTarget && wikiPopup.contains(e.relatedTarget)) return;
        scheduleWikiHide();
      });
    });
  }
  bindWikiPreview();
})();
