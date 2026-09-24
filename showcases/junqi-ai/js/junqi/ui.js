// SVG 棋盘渲染与交互 —— 一比一复刻 QQ 游戏「四国军棋」经典皮肤
// 配色与几何取样自真实截图，见 docs/RESEARCH.md §6
import { CELLS, CELL, renderCoord, parse, cellType } from './board.js';
import { NAME2, NAME1, R } from './pieces.js';
import { SEAT_COLOR } from './game.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };

// QQ 像素实测（q4 经典皮肤，格距 24.5px 正方）：棋子 21.6×14 → 宽 0.88、高 0.57 格距
const PW = 0.88, PH = 0.57, PR = 0.045;
const CAMP_R = 0.39;   // 行营圆环中径（实测 9.5px / 24.5），环粗 0.10

export class BoardUI {
  constructor(svg, opts = {}) {
    this.svg = svg;
    this.perspective = opts.perspective ?? 0;
    this.wordMode = opts.wordMode || 'two';
    this.layers = {
      lines: svg.querySelector('#layer-lines'), cells: svg.querySelector('#layer-cells'),
      route: svg.querySelector('#layer-route'), pieces: svg.querySelector('#layer-pieces'),
      fx: svg.querySelector('#layer-fx'),
    };
    this.hitLayer = el('g', { id: 'layer-hit' }, svg);
    this.handlers = {};
    this.marks = {};
    this.pieceEls = new Map();
    this.drawStatic();
  }
  on(evt, fn) { this.handlers[evt] = fn; }
  coord(cell) { return renderCoord(cell, this.perspective); }
  /** 棋子朝向：东西两方旋转 ±90°，南北正立（同 QQ） */
  rot(cell) {
    const { g } = parse(cell);
    if (g === 0) return 0;
    const rel = ((g - 1) - this.perspective + 4) % 4;
    return rel === 1 ? 90 : rel === 3 ? -90 : 0;
  }

  // ── 静态层：铁路 / 公路 / 格位 ──
  drawStatic() {
    const L = this.layers.lines, Cl = this.layers.cells;
    L.innerHTML = ''; Cl.innerHTML = ''; this.hitLayer.innerHTML = '';
    const seen = new Set(), roads = [], rails = [];
    for (const id of CELLS) for (const b of CELL.get(id).adj) {
      const key = id < b.to ? `${id}-${b.to}` : `${b.to}-${id}`;
      if (seen.has(key)) continue; seen.add(key);
      (b.rail ? rails : roads).push([id, b.to]);
    }
    // 弧线：两方第 1 行外侧格之间的铁路（棋盘四角的圆弧）
    const isArc = (a, b) => {
      const pa = parse(a), pb = parse(b);
      return pa.g !== 0 && pb.g !== 0 && pa.g !== pb.g && pa.y === 1 && pb.y === 1 && pa.x === 1 && pb.x === 1;
    };
    const path = (a, b) => {
      const A = this.coord(a), B = this.coord(b);
      if (isArc(a, b)) {
        const cx = Math.abs(A.x) > Math.abs(B.x) ? A.x : B.x;
        const cy = Math.abs(A.y) > Math.abs(B.y) ? A.y : B.y;
        return `M${A.x},${A.y} Q${cx},${cy} ${B.x},${B.y}`;
      }
      return `M${A.x},${A.y} L${B.x},${B.y}`;
    };
    // 公路在下，铁路压在上（QQ 观感）
    for (const [a, b] of roads) el('path', { d: path(a, b), class: 'road' }, L);
    for (const [a, b] of rails) el('path', { d: path(a, b), class: 'rail' }, L);
    for (const [a, b] of rails) el('path', { d: path(a, b), class: 'rail-tie' }, L);
    // 格位
    for (const id of CELLS) {
      const p = this.coord(id), t = cellType(id), r = this.rot(id);
      const g = el('g', { transform: `translate(${p.x},${p.y}) rotate(${r})` }, Cl);
      if (t === 'camp') {
        el('circle', { r: CAMP_R, class: 'cell-camp' }, g);
      } else if (t === 'hq') {
        el('rect', { x: -PW / 2 - .03, y: -PH / 2 - .05, width: PW + .06, height: PH + .1, rx: .07, class: 'cell-hq' }, g);
      } else if (parse(id).g === 0) {
        el('rect', { x: -.305, y: -.305, width: .61, height: .61, rx: .13, class: 'cell-slot nine' }, g);
      } else {
        el('rect', { x: -PW / 2, y: -PH / 2, width: PW, height: PH, rx: PH / 2.6, class: 'cell-slot' }, g);
      }
      const hit = el('rect', { x: p.x - .5, y: p.y - .48, width: 1, height: .96, class: 'cell-hit', 'data-cell': id }, this.hitLayer);
      hit.addEventListener('click', ev => { ev.stopPropagation(); this.handlers.cellClick?.(id, ev); });
      hit.addEventListener('contextmenu', ev => { ev.preventDefault(); ev.stopPropagation(); this.handlers.cellContext?.(id, ev); });
    }
  }

  label(view, seat, idx) {
    if (view.known) return this.wordMode === 'one' ? NAME1[view.rank] : NAME2[view.rank];
    return this.marks[`${seat}:${idx}`] || '';
  }

  /** 画一枚棋子（QQ：扁平纯色 + 顶部高光；暗子画背面横杠） */
  drawPiece(parent, cell, e, v) {
    const p = this.coord(cell), r = this.rot(cell);
    const g = el('g', {
      class: `piece ${SEAT_COLOR[e.seat]}${v.known ? '' : ' unknown'}`,
      'data-cell': cell, transform: `translate(${p.x},${p.y}) rotate(${r})`,
    }, parent);
    el('rect', { x: -PW / 2, y: -PH / 2, width: PW, height: PH, rx: PR, class: 'body' }, g);
    // QQ 的棋子都有一条顶部高光做立体边；暗子（未知敌子）就是纯色块，无花纹无字
    el('line', { x1: -PW / 2 + .03, y1: -PH / 2 + .022, x2: PW / 2 - .03, y2: -PH / 2 + .022, class: 'hi' }, g);
    const mark = this.marks[`${e.seat}:${e.idx}`];
    if (v.known || mark) {
      const txt = el('text', { class: v.known ? (this.wordMode === 'one' ? 'one' : 'two') : 'mark', y: .012 }, g);
      txt.textContent = this.label(v, e.seat, e.idx);
    }
    return g;
  }

  render(game, viewer, state = {}) {
    const P = this.layers.pieces; P.innerHTML = ''; this.pieceEls.clear();
    for (const [cell, e] of game.board) {
      const v = game.view(viewer, cell);
      const g = this.drawPiece(P, cell, e, v);
      if (v.known && v.rank === R.FLAG && game.seats[e.seat].flagShown && e.seat !== viewer) g.classList.add('flag-shown');
      if (state.selected === cell) g.classList.add('selected');
      if (state.lastMove && state.lastMove.to === cell) g.classList.add('last-moved');
      if (e.seat === viewer) g.classList.add('mine');
      this.pieceEls.set(cell, g);
    }
    this.renderReach(state.reachable);
  }

  renderReach(reach) {
    const Rl = this.layers.route; Rl.innerHTML = '';
    for (const h of this.hitLayer.children) h.classList.remove('reachable');
    if (!reach) return;
    for (const to of reach.keys()) {
      const p = this.coord(to);
      if (this.pieceEls.has(to)) {
        el('rect', {
          x: p.x - PW / 2 - .04, y: p.y - PH / 2 - .04, width: PW + .08, height: PH + .08, rx: .06,
          class: 'reach-ring', transform: `rotate(${this.rot(to)} ${p.x} ${p.y})`,
        }, Rl);
      } else {
        el('circle', { cx: p.x, cy: p.y, r: .1, class: 'reach-dot' }, Rl);
      }
      const hit = this.hitLayer.querySelector(`[data-cell="${to}"]`); if (hit) hit.classList.add('reachable');
    }
  }

  /** 走子动画：黄色路径 + 箭头，棋子沿路径逐段移动 */
  /** onArrive：棋子落到目标格那一刻回调（碰子音效在这里放，不等特效播完） */
  async animateMove(ev, { onArrive } = {}) {
    const g = this.pieceEls.get(ev.from);
    if (!g) { onArrive?.(); return; }
    const Rl = this.layers.route; Rl.innerHTML = '';
    const pts = ev.route.map(c => this.coord(c));
    el('path', { d: pts.map((p, i) => (i ? 'L' : 'M') + p.x + ',' + p.y).join(' '), class: 'route-line' }, Rl);
    const a = pts[pts.length - 2], b = pts[pts.length - 1];
    const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
    el('path', { d: 'M-.13,-.11 L.14,0 L-.13,.11 Z', class: 'route-arrow', transform: `translate(${b.x},${b.y}) rotate(${ang})` }, Rl);
    g.parentNode.appendChild(g);
    const r = this.rot(ev.to); // 按目标格区域定朝向：从东西两侧（横放）走进南北/中央要当场竖过来，别等碰子特效播完重绘
    // 同 QQ 原版：棋子直接落到目标格（路线线条保留），落点即出声，不做滑动
    g.style.transition = '';
    g.setAttribute('transform', `translate(${b.x},${b.y}) rotate(${r})`);
    onArrive?.();
    if (ev.result !== 'move') await this.fxCombat(ev);
    Rl.innerHTML = '';
  }

  async fxCombat(ev) {
    const p = this.coord(ev.to), F = this.layers.fx;
    const boom = el('circle', { cx: p.x, cy: p.y, r: .2, class: 'fx-boom' }, F);
    const label = { win: '吃', lose: '亡', both: '同归于尽', flag: '扛 旗' }[ev.result] || '';
    const t = el('text', { x: p.x, y: p.y - .62, class: 'fx-text' }, F); t.textContent = label;
    const t0 = performance.now();
    await new Promise(res => {
      const step = now => {
        const k = Math.min(1, (now - t0) / 400);
        boom.setAttribute('r', .2 + k * .55); boom.setAttribute('opacity', .95 * (1 - k * k));
        t.setAttribute('y', p.y - .62 - k * .45);
        if (k < 1) requestAnimationFrame(step); else res();
      };
      requestAnimationFrame(step);
    });
    for (const c of ev.captured) { const pe = this.pieceEls.get(c.cell); if (pe) pe.classList.add('dead'); }
    await new Promise(res => setTimeout(res, 240));
    F.innerHTML = '';
  }

  setMark(seat, idx, text) { if (text) this.marks[`${seat}:${idx}`] = text; else delete this.marks[`${seat}:${idx}`]; }
  clearMarks() { this.marks = {}; }
}
