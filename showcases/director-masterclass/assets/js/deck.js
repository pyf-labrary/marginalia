// Director's Masterclass — per-page mini-deck navigation
// Each page is a self-contained deck of N slides. On the last slide,
// pressing → / clicking next navigates to data-next-url; on the first
// slide, ← navigates to data-prev-url.

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
    // Restart reveal animations
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
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 50) show(delta < 0 ? current + 1 : current - 1);
  });

  show(0);

  // ===== Audio toggle =====
  const audio = document.getElementById('bgAudio');
  const audioBtn = document.getElementById('audioToggle');
  if (audio && audioBtn) {
    let playing = false;
    audio.volume = 0.35;
    audio.loop = true;

    function setIcon() {
      audioBtn.textContent = playing ? '♪' : '♫';
      audioBtn.classList.toggle('playing', playing);
      audioBtn.title = playing ? '静音' : '播放配乐';
    }
    setIcon();

    audioBtn.addEventListener('click', () => {
      if (playing) {
        audio.pause();
        playing = false;
        try { sessionStorage.setItem('deck-audio', 'paused'); } catch (e) {}
      } else {
        const p = audio.play();
        if (p && p.catch) p.catch(() => {});
        playing = true;
        try { sessionStorage.setItem('deck-audio', 'playing'); } catch (e) {}
      }
      setIcon();
    });

    // Resume audio state across chapter navigation
    try {
      if (sessionStorage.getItem('deck-audio') === 'playing') {
        const p = audio.play();
        if (p && p.catch) p.catch(() => {});
        playing = true;
        setIcon();
      }
    } catch (e) {}
  }
})();
