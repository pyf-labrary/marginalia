// Build a sticky TOC for posts. kramdown emits id="..." on headings (incl.
// Chinese), so we just read them. Hierarchy: H2 (top, never collapses) →
// H3 (collapsible, expanded by default) → H4 (collapsible, collapsed by default).
(function () {
  'use strict';

  const body = document.querySelector('.post-body');
  const tocEl = document.getElementById('toc');
  const aside = document.querySelector('.post-toc');
  if (!body || !tocEl || !aside) return;

  const headings = Array.from(body.querySelectorAll('h2, h3, h4')).filter(h => h.id);
  if (headings.length < 3) return;

  // Build nested list. Stack tracks open <ul> at each depth.
  // depth: 2=H2 list, 3=H3 list under an H2, 4=H4 list under an H3.
  const root = document.createElement('ul');
  root.className = 'toc-list';
  const liStack = { 2: null, 3: null }; // most recent <li> at depth 2 and 3

  const makeLi = (h) => {
    const li = document.createElement('li');
    li.className = 'toc-' + h.tagName.toLowerCase();
    const a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent.replace(/^[¶#§]\s*/, '');
    li.appendChild(a);
    return li;
  };

  // Ensure a <ul class="toc-sub level-N"> exists under parentLi; return it.
  const ensureSub = (parentLi, level, defaultExpanded) => {
    let sub = parentLi.querySelector(':scope > ul.toc-sub');
    if (sub) return sub;
    sub = document.createElement('ul');
    sub.className = 'toc-sub level-' + level;
    // Toggle button on the parent <li> (placed before its <a>'s text via flex).
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'toc-toggle';
    btn.setAttribute('aria-expanded', defaultExpanded ? 'true' : 'false');
    btn.setAttribute('aria-label', '展开/折叠子目录');
    btn.textContent = '▸';
    parentLi.classList.add('has-children');
    if (defaultExpanded) parentLi.classList.add('expanded');
    parentLi.insertBefore(btn, parentLi.firstChild);
    parentLi.appendChild(sub);
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      parentLi.classList.toggle('expanded');
      btn.setAttribute('aria-expanded',
        parentLi.classList.contains('expanded') ? 'true' : 'false');
    });
    return sub;
  };

  headings.forEach(h => {
    const li = makeLi(h);
    if (h.tagName === 'H2') {
      root.appendChild(li);
      liStack[2] = li;
      liStack[3] = null;
    } else if (h.tagName === 'H3') {
      const parent = liStack[2];
      if (!parent) { root.appendChild(li); return; }
      // H3 list under H2 — expanded by default
      const sub = ensureSub(parent, 3, true);
      sub.appendChild(li);
      liStack[3] = li;
    } else if (h.tagName === 'H4') {
      const parent = liStack[3] || liStack[2];
      if (!parent) { root.appendChild(li); return; }
      // H4 list — collapsed by default
      const isUnderH3 = parent.classList.contains('toc-h3');
      const sub = ensureSub(parent, 4, !isUnderH3);
      sub.appendChild(li);
    }
  });

  tocEl.appendChild(root);
  aside.hidden = false;

  // ---- Scroll-spy ----
  const linkById = {};
  tocEl.querySelectorAll('a').forEach(a => {
    linkById[decodeURIComponent(a.getAttribute('href').slice(1))] = a;
  });

  const expandAncestors = (link) => {
    let li = link.closest('li');
    while (li) {
      const parentLi = li.parentElement && li.parentElement.closest('li');
      if (parentLi && parentLi.classList.contains('has-children')) {
        if (!parentLi.classList.contains('expanded')) {
          parentLi.classList.add('expanded');
          const btn = parentLi.querySelector(':scope > .toc-toggle');
          if (btn) btn.setAttribute('aria-expanded', 'true');
        }
      }
      li = parentLi;
    }
  };

  let activeLink = null;
  const setActive = (link) => {
    if (activeLink === link) return;
    if (activeLink) activeLink.classList.remove('active');
    activeLink = link;
    if (!link) return;
    link.classList.add('active');
    expandAncestors(link);
    // Keep active link visible inside the scrollable nav.
    const navRect = tocEl.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    if (linkRect.top < navRect.top || linkRect.bottom > navRect.bottom) {
      link.scrollIntoView({ block: 'nearest' });
    }
  };

  const visible = new Map();
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) visible.set(e.target.id, e.target);
      else visible.delete(e.target.id);
    });
    if (visible.size === 0) return;
    let best = null, bestTop = -Infinity;
    visible.forEach(h => {
      const top = h.getBoundingClientRect().top;
      if (top <= 100 && top > bestTop) { bestTop = top; best = h; }
    });
    if (!best) {
      let nearest = null, nearestTop = Infinity;
      visible.forEach(h => {
        const top = h.getBoundingClientRect().top;
        if (top < nearestTop) { nearestTop = top; nearest = h; }
      });
      best = nearest;
    }
    if (best) setActive(linkById[best.id]);
  }, { rootMargin: '0px 0px -55% 0px', threshold: [0, 1] });

  headings.forEach(h => obs.observe(h));
})();
