// 第 13 页：一局真实对局（神经网络南北 vs 原来的引擎东西）的自动播放复盘。
// 棋盘渲染与规则直接用游戏本体的模块（js/junqi/ 是 game/2026-09-07-junqi/js 的拷贝），全明视角逐手重放。
// 翻到这一页才开始播，离开就暂停；播完停 4 秒从头再来。
import { Game } from './junqi/game.js';
import { BoardUI } from './junqi/ui.js';

const NS = 'http://www.w3.org/2000/svg';
const $ = s => document.querySelector(s);
const rec = await (await fetch(new URL('../data/game.json', import.meta.url))).json();
const N = rec.moves.length;
const ui = new BoardUI($('#rp-svg'), { perspective: 0, wordMode: 'two' });

let g = null, i = 0, playing = true, active = false, timer = null, busy = false, speed = 1;
const lines = []; // 已走过每手的文字

function fresh() {
  g = new Game({ players: rec.players, mode: 'bright4', layouts: rec.layouts });
  g.start(); i = 0; lines.length = 0;
  ui.render(g, 0, {});
  $('#rp-over').classList.remove('on');
}
function apply(m) {
  if (m.k === 'surrender') return g.surrender(m.s);
  if (m.k === 'timeout') return g.timeout(m.s);
  return g.move(m.f, m.t);
}
function describe(ev) { return g.describeEvent(ev, 0).replace(/^(.)方/, '$1 '); }

async function step() {
  if (i >= N) return;
  busy = true;
  const ev = apply(rec.moves[i]);
  lines.push({ n: i + 1, text: describe(ev), hit: ev.result !== 'move' });
  i++;
  if (ev.from !== undefined) await ui.animateMove(ev);
  ui.render(g, 0, { lastMove: ev });
  update();
  busy = false;
  if (i >= N) finish();
}
function finish() {
  const o = $('#rp-over'); o.firstElementChild.textContent = rec.result.title || '对局结束';
  o.classList.add('on');
}
/** 跳到第 n 手之后的局面（不播动画） */
function jump(n) {
  fresh();
  for (; i < Math.min(n, N); i++) { const ev = apply(rec.moves[i]); lines.push({ n: i + 1, text: describe(ev), hit: ev.result !== 'move' }); }
  const last = g.history[g.history.length - 1];
  ui.render(g, 0, { lastMove: last });
  update();
  if (i >= N) finish();
}

function loop() {
  clearTimeout(timer);
  if (!active || !playing) return;
  if (busy) { timer = setTimeout(loop, 100); return; }
  if (i >= N) { timer = setTimeout(() => { fresh(); update(); loop(); }, 4000); return; }
  step().then(() => { timer = setTimeout(loop, (i >= N ? 0 : 950) / speed); });
}

/* ---------- 胜率曲线 ---------- */
const svg = $('#rp-chart');
const W = 700, H = 170, L = 44, R = 12, T = 12, B = 26, iw = W - L - R, ih = H - T - B;
const X = n => L + (n - 1) / (N - 1) * iw, Y = v => T + (1 - v) * ih;
const mk = (t, a, p = svg) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); p.appendChild(e); return e; };
for (const v of [0, .5, 1]) {
  mk('line', { x1: L, x2: L + iw, y1: Y(v), y2: Y(v), stroke: v === .5 ? '#8d8870' : '#3a3f28', 'stroke-width': 1, 'stroke-dasharray': v === .5 ? '5 5' : '' });
  const t = mk('text', { x: L - 8, y: Y(v) + 5, 'text-anchor': 'end', fill: '#8d8870', 'font-size': 14, 'font-family': 'JQMono, monospace' }); t.textContent = Math.round(v * 100) + '%';
}
const pts = rec.value.map((v, k) => (v == null ? null : [k + 1, v])).filter(Boolean);
mk('path', { d: pts.map(([n, v], k) => (k ? 'L' : 'M') + X(n) + ',' + Y(v)).join(''), fill: 'none', stroke: '#e8b04a', 'stroke-width': 2.5, 'stroke-linejoin': 'round' });
// 关键手：扛旗
rec.moves.forEach((m, k) => {
  if (k !== 78 && k !== 86) return;
  mk('line', { x1: X(k + 1), x2: X(k + 1), y1: T, y2: T + ih, stroke: '#efe9d2', 'stroke-width': 1, opacity: .35 });
  const t = mk('text', { x: X(k + 1) - 5, y: T + 14, 'text-anchor': 'end', fill: '#c2bca1', 'font-size': 14 }); t.textContent = k === 78 ? '扛东旗' : '扛西旗';
});
const lo = pts.reduce((a, b) => (b[1] < a[1] ? b : a));
const lt = mk('text', { x: X(lo[0]), y: T + ih + 20, 'text-anchor': 'middle', fill: '#c2bca1', 'font-size': 14 }); lt.textContent = `第 ${lo[0]} 手 ${Math.round(lo[1] * 100)}%`;
const cur = mk('line', { y1: T, y2: T + ih, stroke: '#f3cf7a', 'stroke-width': 2 });
const dot = mk('circle', { r: 6, fill: '#f3cf7a', stroke: '#16180f', 'stroke-width': 3 });
svg.addEventListener('click', e => {
  const p = svg.getBoundingClientRect(), sx = (e.clientX - p.left) / p.width * W;
  const n = Math.max(0, Math.min(N, Math.round((sx - L) / iw * (N - 1) + 1)));
  clearTimeout(timer); busy = false; jump(n); loop();
});

function update() {
  $('#rp-pos').textContent = `${i} / ${N}`;
  // 当前（含之前最近一次）神经网络的估计
  let v = null, at = 0;
  for (let k = i - 1; k >= 0; k--) if (rec.value[k] != null) { v = rec.value[k]; at = k + 1; break; }
  $('#rp-wp').textContent = v == null ? '—' : Math.round(v * 100) + '%';
  const x = X(Math.max(1, i));
  cur.setAttribute('x1', x); cur.setAttribute('x2', x); cur.style.opacity = i ? 1 : 0;
  if (v != null) { dot.setAttribute('cx', X(at)); dot.setAttribute('cy', Y(v)); dot.style.opacity = 1; } else dot.style.opacity = 0;
  const log = $('#rp-log'); log.innerHTML = '';
  for (const [k, l] of lines.slice(-9).entries()) {
    const d = document.createElement('div');
    d.className = (l.hit ? 'hit' : '') + (k === Math.min(lines.length, 9) - 1 ? ' now' : '');
    d.innerHTML = `<i>${l.n}</i>`; d.append(l.text);
    log.appendChild(d);
  }
}

/* ---------- 控件 ---------- */
$('#rp-play').onclick = () => { playing = !playing; $('#rp-play').textContent = playing ? '暂停' : '播放'; $('#rp-play').classList.toggle('on', playing); loop(); };
$('#rp-restart').onclick = () => { clearTimeout(timer); busy = false; fresh(); update(); loop(); };
$('#rp-speed').onclick = () => { speed = speed === 1 ? 2 : speed === 2 ? 4 : 1; $('#rp-speed').textContent = speed + '×'; };

fresh(); update();
const onSlide = el => { active = el && el.id === 's-replay'; if (active) loop(); else clearTimeout(timer); };
document.addEventListener('slide', e => onSlide(e.detail.el));
onSlide(window.__deck?.slides[window.__deck.cur]);
window.__replay = { get i() { return i; }, jump, N };
