// 棋子定义、碰子判定、布局索引
import { cid, parse } from './board.js';

export const R = { BOMB: 0, FLAG: 31, ENG: 32, PAI: 33, LIAN: 34, YING: 35, TUAN: 36, LV: 37, SHI: 38, JUN: 39, SI: 40, MINE: 41 };
export const NAME2 = { 0: '炸弹', 31: '军旗', 32: '工兵', 33: '排长', 34: '连长', 35: '营长', 36: '团长', 37: '旅长', 38: '师长', 39: '军长', 40: '司令', 41: '地雷' };
export const NAME1 = { 0: '炸', 31: '旗', 32: '兵', 33: '排', 34: '连', 35: '营', 36: '团', 37: '旅', 38: '师', 39: '军', 40: '司', 41: '雷' };
export const COUNT = { 40: 1, 39: 1, 38: 2, 37: 2, 36: 2, 35: 2, 34: 3, 33: 3, 32: 3, 41: 3, 0: 2, 31: 1 };
export const RANK_LIST = [40, 39, 38, 37, 36, 35, 34, 33, 32, 41, 0, 31];
// 子力价值（启发式 AI 用）
export const VALUE = { 40: 120, 39: 90, 38: 60, 37: 40, 36: 28, 35: 20, 34: 14, 33: 10, 32: 16, 41: 12, 0: 45, 31: 1000 };

/** 碰子：返回 'win' | 'lose' | 'both'（同归） | 'flag'（扛旗） */
export function attack(a, b) {
  if (b === R.FLAG) return 'flag';
  if (a === R.BOMB || b === R.BOMB) return 'both';
  if (b === R.MINE) return a === R.ENG ? 'win' : 'lose';
  if (a === b) return 'both';
  return a > b ? 'win' : 'lose';
}

// 布局索引 0..24 ↔ 本方格子 (y,x,lr)，见 RESEARCH §3.4
const Y_OF = [1, 2, 4, 5, 6, 1, 2, 3, 4, 5, 6, 1, 3, 5, 6, 1, 2, 3, 4, 5, 6, 1, 3, 5, 6];
const X_OF = [3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2];
const L_OF = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
export const LAYOUT_SLOTS = Y_OF.map((y, i) => ({ y, x: X_OF[i], lr: L_OF[i] }));

export function slotCell(seat, idx) { const s = LAYOUT_SLOTS[idx]; return cid(seat + 1, s.y, s.x, s.lr); }
export function cellSlot(id) {
  const { g, y, x, lr } = parse(id);
  if (g === 0) return -1;
  for (let i = 0; i < 25; i++) { const s = LAYOUT_SLOTS[i]; if (s.y === y && s.x === x && (x === 3 || s.lr === lr)) return i; }
  return -1;
}
export const isHQ = idx => LAYOUT_SLOTS[idx].y === 6 && LAYOUT_SLOTS[idx].x === 2;

/** 某种棋子能否放在某索引 */
export function slotAllows(rank, idx) {
  const { y } = LAYOUT_SLOTS[idx];
  if (rank === R.FLAG) return isHQ(idx);
  if (rank === R.MINE) return y >= 5;
  if (rank === R.BOMB) return y !== 1;
  return true;
}
export function validateLayout(layout) {
  if (layout.length !== 25) return '棋子数量不对';
  const cnt = {};
  for (const r of layout) cnt[r] = (cnt[r] || 0) + 1;
  for (const r of RANK_LIST) if ((cnt[r] || 0) !== COUNT[r]) return `${NAME2[r]}数量应为 ${COUNT[r]}`;
  for (let i = 0; i < 25; i++) if (!slotAllows(layout[i], i)) return `${NAME2[layout[i]]}不能放在该位置`;
  return null;
}
export function canSwap(layout, i, j) {
  return slotAllows(layout[i], j) && slotAllows(layout[j], i);
}

// 预设布局（索引顺序见 RESEARCH §3.4：0-4 中轴 y1,2,4,5,6；5-10 左边列 y1..6；11-14 左次列 y1,3,5,6；15-20 右边列；21-24 右次列）
export const PRESETS = {};
// 用可读方式定义：每行 5 格（左→右），行 1..6；行营写 null
function fromRows(rows) {
  const grid = rows.map(r => r.slice());
  const layout = new Array(25);
  for (let i = 0; i < 25; i++) {
    const s = LAYOUT_SLOTS[i];
    const col = s.x === 3 ? 2 : (s.lr ? (s.x === 1 ? 4 : 3) : (s.x - 1));
    layout[i] = grid[s.y - 1][col];
  }
  return layout;
}
const { BOMB, FLAG, ENG, PAI, LIAN, YING, TUAN, LV, SHI, JUN, SI, MINE } = R;
PRESETS['稳守型'] = fromRows([
  [PAI, TUAN, LIAN, PAI, ENG],
  [YING, null, SHI, null, LIAN],
  [JUN, SI, null, LV, LIAN],
  [BOMB, null, TUAN, null, BOMB],
  [SHI, MINE, YING, MINE, LV],
  [ENG, FLAG, ENG, PAI, MINE],
]);
PRESETS['进攻型'] = fromRows([
  [LIAN, JUN, SI, SHI, LIAN],
  [PAI, null, ENG, null, PAI],
  [LV, TUAN, null, TUAN, LV],
  [BOMB, null, SHI, null, BOMB],
  [YING, MINE, YING, MINE, ENG],
  [LIAN, MINE, ENG, FLAG, PAI],
]);
PRESETS['双旗迷惑'] = fromRows([
  [PAI, LIAN, TUAN, LIAN, PAI],
  [SHI, null, ENG, null, LV],
  [JUN, YING, null, SI, YING],
  [BOMB, null, TUAN, null, BOMB],
  [LV, MINE, SHI, MINE, LIAN],
  [ENG, FLAG, PAI, MINE, ENG],
]);
for (const k of Object.keys(PRESETS)) { const e = validateLayout(PRESETS[k]); if (e) throw new Error(`预设布局 ${k} 非法: ${e}`); }

/** 随机合法布局（带一点常识：旗在大本营、雷围旗、司令军长不在第一行） */
export function randomLayout(rng = Math.random) {
  const pool = [];
  for (const r of RANK_LIST) for (let i = 0; i < COUNT[r]; i++) pool.push(r);
  for (let tries = 0; tries < 2000; tries++) {
    const layout = new Array(25).fill(null);
    const bag = pool.slice();
    const take = r => { const i = bag.indexOf(r); bag.splice(i, 1); return r; };
    const free = pred => { const c = []; for (let i = 0; i < 25; i++) if (layout[i] === null && pred(i)) c.push(i); return c; };
    const pick = arr => arr[Math.floor(rng() * arr.length)];
    // 军旗
    const hq = pick(free(isHQ)); layout[hq] = take(FLAG);
    // 地雷：优先旗周围（第 5/6 行且靠近）
    const hqSlot = LAYOUT_SLOTS[hq];
    const sameSide = i => LAYOUT_SLOTS[i].x === 3 || LAYOUT_SLOTS[i].lr === hqSlot.lr;
    for (let k = 0; k < 3; k++) {
      const near = free(i => LAYOUT_SLOTS[i].y >= 5 && sameSide(i));
      const c = k < 2 && near.length && rng() < 0.8 ? near : free(i => LAYOUT_SLOTS[i].y >= 5);
      layout[pick(c)] = take(MINE);
    }
    // 炸弹
    for (let k = 0; k < 2; k++) layout[pick(free(i => LAYOUT_SLOTS[i].y >= 2 && LAYOUT_SLOTS[i].y <= 4))] = take(BOMB);
    // 司令军长不在第一行
    layout[pick(free(i => LAYOUT_SLOTS[i].y >= 2))] = take(SI);
    layout[pick(free(i => LAYOUT_SLOTS[i].y >= 2))] = take(JUN);
    // 其余随机
    while (bag.length) {
      const r = bag[Math.floor(rng() * bag.length)];
      const c = free(i => slotAllows(r, i));
      if (!c.length) break;
      layout[pick(c)] = take(r);
    }
    if (!bag.length && !validateLayout(layout)) return layout;
  }
  return PRESETS['稳守型'].slice();
}
