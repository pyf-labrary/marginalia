/* =========================================================
   Claude Showcase · Deck Controller
   - Detects multi-slide vs single-slide pages
   - Keyboard / touch / button navigation
   - Hash routing (#3 jumps to slide 3)
   - Cross-page next/prev links via data-next / data-prev
   ========================================================= */

(function () {
  'use strict';

  const slides = Array.from(document.querySelectorAll('.slide'));
  const counter = document.getElementById('counter');
  const progress = document.getElementById('progress');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const fullBtn = document.getElementById('full');
  const homeBtn = document.getElementById('home');

  // External page navigation hooks (set on body via data-* attributes)
  const externalPrev = document.body.dataset.prev || null;
  const externalNext = document.body.dataset.next || null;
  const externalIndex = document.body.dataset.index || 'index.html';

  // If there is only one slide (single-page mode)
  if (slides.length <= 1) {
    document.body.classList.add('single');
    if (counter && slides.length === 1) {
      const pageNo = document.body.dataset.pageNo || '';
      const total = document.body.dataset.pageTotal || '';
      counter.textContent = pageNo && total ? `${pageNo} / ${total}` : '';
    }
    if (progress) {
      const pct = parseFloat(document.body.dataset.progress || '0');
      progress.style.width = pct + '%';
    }
    bindCrossPage();
    return;
  }

  // Multi-slide deck mode
  let idx = 0;
  const fromHash = parseInt((location.hash || '#1').slice(1), 10);
  if (!isNaN(fromHash) && fromHash >= 1 && fromHash <= slides.length) {
    idx = fromHash - 1;
  }

  function render() {
    slides.forEach((s, i) => {
      s.classList.remove('active', 'prev');
      if (i === idx) s.classList.add('active');
      else if (i < idx) s.classList.add('prev');
    });
    if (counter) counter.textContent = (idx + 1) + ' / ' + slides.length;
    if (progress) progress.style.width = ((idx + 1) / slides.length * 100) + '%';
    if (location.hash !== '#' + (idx + 1)) {
      history.replaceState(null, '', '#' + (idx + 1));
    }
  }
  function go(n) {
    idx = Math.max(0, Math.min(slides.length - 1, n));
    render();
  }
  if (nextBtn) nextBtn.onclick = () => idx >= slides.length - 1 ? gotoNextPage() : go(idx + 1);
  if (prevBtn) prevBtn.onclick = () => idx <= 0 ? gotoPrevPage() : go(idx - 1);
  if (fullBtn) fullBtn.onclick = toggleFull;
  if (homeBtn) homeBtn.onclick = () => location.href = externalIndex;

  document.addEventListener('keydown', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      idx >= slides.length - 1 ? gotoNextPage() : go(idx + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      idx <= 0 ? gotoPrevPage() : go(idx - 1);
    } else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(slides.length - 1);
    else if (e.key === 'f' || e.key === 'F') toggleFull();
    else if (e.key === 'Escape' && document.fullscreenElement) document.exitFullscreen();
  });

  // Touch swipe
  let touchStart = 0;
  document.addEventListener('touchstart', e => touchStart = e.touches[0].clientX, { passive: true });
  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(dx) > 60) {
      if (dx < 0) idx >= slides.length - 1 ? gotoNextPage() : go(idx + 1);
      else idx <= 0 ? gotoPrevPage() : go(idx - 1);
    }
  });

  function gotoNextPage() { if (externalNext) location.href = externalNext; }
  function gotoPrevPage() { if (externalPrev) location.href = externalPrev; }
  function toggleFull() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  }
  function bindCrossPage() {
    document.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        if (externalNext) location.href = externalNext;
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        if (externalPrev) location.href = externalPrev;
      } else if (e.key === 'f' || e.key === 'F') toggleFull();
      else if (e.key === 'h' || e.key === 'H') location.href = externalIndex;
    });
    if (nextBtn) nextBtn.onclick = () => externalNext && (location.href = externalNext);
    if (prevBtn) prevBtn.onclick = () => externalPrev && (location.href = externalPrev);
    if (fullBtn) fullBtn.onclick = toggleFull;
    if (homeBtn) homeBtn.onclick = () => location.href = externalIndex;
  }

  render();
})();
