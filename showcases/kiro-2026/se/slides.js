// ===== Slide Deck Controller =====
(function () {
  const slides = document.querySelectorAll('.slide');
  const total = slides.length;
  let current = 0;

  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');

  function show(idx) {
    if (idx < 0 || idx >= total) return;
    slides[current].classList.remove('active');
    slides[current].classList.add(idx > current ? 'prev' : '');
    current = idx;
    slides[current].classList.remove('prev');
    slides[current].classList.add('active');
    // Reset scroll position
    const inner = slides[current].querySelector('.slide-inner');
    if (inner) inner.scrollTop = 0;
    updateProgress();
  }

  function next() { show(current + 1); }
  function prev() { show(current - 1); }

  // Expose for TOC links
  window.goSlide = function (n) { show(n - 1); };

  function updateProgress() {
    const pct = ((current + 1) / total) * 100;
    progressFill.style.width = pct + '%';
    progressText.textContent = (current + 1) + ' / ' + total;
  }

  // Keyboard
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
    else if (e.key === 'Home') { e.preventDefault(); show(0); }
    else if (e.key === 'End') { e.preventDefault(); show(total - 1); }
    else if (e.key === 'f' || e.key === 'F') {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    }
  });

  // Buttons
  document.getElementById('btn-next').addEventListener('click', next);
  document.getElementById('btn-prev').addEventListener('click', prev);
  document.getElementById('btn-fs').addEventListener('click', function () {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  });

  // Touch swipe
  let touchStartX = 0;
  document.addEventListener('touchstart', function (e) { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    const diff = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(diff) > 50) { diff < 0 ? next() : prev(); }
  }, { passive: true });

  updateProgress();
})();
