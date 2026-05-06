// Build a sticky TOC for posts. Skips when fewer than 3 H2/H3 — short posts
// don't benefit. kramdown already emits id="..." for headings (incl. Chinese),
// so we just read them.
(function () {
  'use strict';

  const body = document.querySelector('.post-body');
  const tocEl = document.getElementById('toc');
  const aside = document.querySelector('.post-toc');
  if (!body || !tocEl || !aside) return;

  const headings = Array.from(body.querySelectorAll('h2, h3')).filter(h => h.id);
  if (headings.length < 3) return;

  const root = document.createElement('ul');
  root.className = 'toc-list';
  let currentSub = null;

  headings.forEach(h => {
    const li = document.createElement('li');
    li.className = 'toc-' + h.tagName.toLowerCase();
    const a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent.replace(/^[¶#§]\s*/, '');
    li.appendChild(a);

    if (h.tagName === 'H2') {
      root.appendChild(li);
      currentSub = null;
    } else {
      // h3 nests under the most recent h2 li (or root if none yet)
      const lastTopLi = root.lastElementChild;
      if (lastTopLi) {
        if (!currentSub) {
          currentSub = document.createElement('ul');
          currentSub.className = 'toc-sub';
          lastTopLi.appendChild(currentSub);
        }
        currentSub.appendChild(li);
      } else {
        root.appendChild(li);
      }
    }
  });

  tocEl.appendChild(root);
  aside.hidden = false;

  // Scroll spy: highlight the heading whose section is currently in view.
  const linkById = {};
  tocEl.querySelectorAll('a').forEach(a => {
    linkById[decodeURIComponent(a.getAttribute('href').slice(1))] = a;
  });

  let activeLink = null;
  const setActive = (link) => {
    if (activeLink === link) return;
    if (activeLink) activeLink.classList.remove('active');
    activeLink = link;
    if (link) {
      link.classList.add('active');
      // Keep active link visible inside the scrollable TOC nav.
      const navRect = tocEl.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      if (linkRect.top < navRect.top || linkRect.bottom > navRect.bottom) {
        link.scrollIntoView({ block: 'nearest' });
      }
    }
  };

  // Track the topmost heading that's "in" the upper third of the viewport.
  const visible = new Map();
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) visible.set(e.target.id, e.target);
      else visible.delete(e.target.id);
    });
    if (visible.size > 0) {
      // Pick the heading with the smallest (most negative-or-zero) top distance.
      let best = null;
      let bestTop = -Infinity;
      visible.forEach(h => {
        const top = h.getBoundingClientRect().top;
        if (top <= 100 && top > bestTop) { bestTop = top; best = h; }
      });
      if (!best) {
        // Nothing has crossed the threshold yet — pick the nearest below it.
        let nearest = null, nearestTop = Infinity;
        visible.forEach(h => {
          const top = h.getBoundingClientRect().top;
          if (top < nearestTop) { nearestTop = top; nearest = h; }
        });
        best = nearest;
      }
      if (best) setActive(linkById[best.id]);
    }
  }, { rootMargin: '0px 0px -55% 0px', threshold: [0, 1] });

  headings.forEach(h => obs.observe(h));
})();
