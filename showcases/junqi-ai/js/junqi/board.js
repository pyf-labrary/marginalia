// 棋盘拓扑 —— 移植自 GwanKei core.cpp（LGPL），编码与邻接规则见 docs/RESEARCH.md §3
// 格子 ID = G*1000 + Y*100 + X*10 + L ；G: 0 九宫 1 南 2 东 3 北 4 西

export const C = 0, S = 1, E = 2, N = 3, W = 4;
export const ORIENT_NAME = ['中', '南', '东', '北', '西'];

export const next = o => (o === 0 ? 0 : ((o - 1) + 1) % 4 + 1);
export const prev = o => (o === 0 ? 0 : ((o - 1) + 3) % 4 + 1);
export const opp = o => (o === 0 ? 0 : ((o - 1) + 2) % 4 + 1);

export function cid(g, y, x, lr = 0) {
  if (g === 0 || x === 3) lr = 0;
  return g * 1000 + y * 100 + x * 10 + lr;
}
export function parse(id) {
  return { g: Math.floor(id / 1000), y: Math.floor((id % 1000) / 100), x: Math.floor((id % 100) / 10), lr: id % 10 };
}
export function cellType(id) {
  const { g, y, x } = parse(id);
  if (g === 0) return 'station';
  if (y === 6 && x === 2) return 'hq';
  if (((y === 2 || y === 4) && x === 2) || (x === 3 && y === 3)) return 'camp';
  return 'station';
}

// 道路: {to, rail, o0, o1}  rail=false 为公路
const road = to => ({ to, rail: false, o0: 0, o1: 0 });
const rail = (to, o0, o1 = o0) => ({ to, rail: true, o0, o1 });

function adjacentsOf(id) {
  const { g, y, x, lr } = parse(id);
  const r = [];
  if (g === 0) {
    if (y === 0 && x === 0) {
      r.push(rail(cid(0, 1, 1), S), rail(cid(0, 2, 2), E), rail(cid(0, 3, 3), N), rail(cid(0, 4, 4), W));
    } else if (y === x) {
      r.push(rail(0, opp(y)));
      r.push(rail(cid(0, y, next(y)), next(y)));
      r.push(rail(cid(0, prev(y), y), prev(y)));
      r.push(rail(cid(y, 1, 3), y));
    } else {
      r.push(rail(cid(0, y, y), opp(x)));
      r.push(rail(cid(0, x, x), opp(y)));
      r.push(rail(cid(y, 1, 1, 1), y));
      r.push(rail(cid(x, 1, 1, 0), x));
    }
    return r;
  }
  if (x === 1) {
    if (y === 1 || y === 5) r.push(rail(cid(g, y, 2, lr), lr ? prev(g) : next(g)));
    else r.push(road(cid(g, y, 2, lr)));
    if (y >= 1 && y <= 4) r.push(rail(cid(g, y + 1, 1, lr), g));
    if (y >= 2 && y <= 5) r.push(rail(cid(g, y - 1, 1, lr), opp(g)));
    if (y === 1) {
      if (lr === 0) r.push(rail(cid(0, prev(g), g), opp(g)));
      else r.push(rail(cid(0, g, next(g)), opp(g)));
      if (lr === 1) r.push(rail(cid(next(g), 1, 1, 0), opp(g), next(g)));
      else r.push(rail(cid(prev(g), 1, 1, 1), opp(g), prev(g)));
    }
    if (y === 5) r.push(road(cid(g, 6, 1, lr)));
    if (y === 6) r.push(road(cid(g, 5, 1, lr)));
    if (y === 1 || y === 3) r.push(road(cid(g, 2, 2, lr)));
    if (y === 3 || y === 5) r.push(road(cid(g, 4, 2, lr)));
  } else if (x === 2) {
    if (y === 1 || y === 5) {
      r.push(rail(cid(g, y, 1, lr), lr ? next(g) : prev(g)));
      r.push(rail(cid(g, y, 3, lr), lr ? prev(g) : next(g)));
    } else {
      r.push(road(cid(g, y, 1, lr)), road(cid(g, y, 3, lr)));
    }
    if (y >= 2 && y <= 6) r.push(road(cid(g, y - 1, 2, lr)));
    if (y >= 1 && y <= 5) r.push(road(cid(g, y + 1, 2, lr)));
    if (y === 2 || y === 4) {
      r.push(road(cid(g, y + 1, 3, lr)), road(cid(g, y + 1, 1, lr)), road(cid(g, y - 1, 3, lr)), road(cid(g, y - 1, 1, lr)));
    }
  } else { // x === 3
    if (y === 1 || y === 5) {
      r.push(rail(cid(g, y, 2, 0), prev(g)), rail(cid(g, y, 2, 1), next(g)));
    } else {
      r.push(road(cid(g, y, 2, 0)), road(cid(g, y, 2, 1)));
    }
    if (y === 1) r.push(rail(cid(0, g, g), opp(g)));
    if (y >= 2 && y <= 6) r.push(road(cid(g, y - 1, 3)));
    if (y >= 1 && y <= 5) r.push(road(cid(g, y + 1, 3)));
    if (y === 1) r.push(road(cid(g, 2, 2, 0)), road(cid(g, 2, 2, 1)));
    if (y === 5) r.push(road(cid(g, 4, 2, 0)), road(cid(g, 4, 2, 1)));
    if (y === 3) r.push(road(cid(g, 4, 2, 0)), road(cid(g, 2, 2, 0)), road(cid(g, 4, 2, 1)), road(cid(g, 2, 2, 1)));
  }
  return r;
}

// 全部格子
export const CELLS = [];
export const CELL = new Map(); // id -> {id,g,y,x,lr,type,adj}
(function build() {
  const ids = [0];
  for (let y = 1; y <= 4; y++) { ids.push(cid(0, y, y)); ids.push(cid(0, y, next(y))); }
  for (let g = 1; g <= 4; g++)
    for (let y = 1; y <= 6; y++)
      for (let x = 1; x <= 3; x++)
        for (let lr = 0; lr <= (x === 3 ? 0 : 1); lr++) ids.push(cid(g, y, x, lr));
  for (const id of ids) {
    const p = parse(id);
    CELL.set(id, { id, ...p, type: cellType(id), adj: adjacentsOf(id) });
    CELLS.push(id);
  }
})();

export function cellsOfGroup(g) { return CELLS.filter(id => CELL.get(id).g === g); }

/** BFS 寻路。occupied: Set<cellId>；canTurn: 工兵。返回路径数组（含起终点）或 null */
export function getRoute(from, to, occupied, canTurn) {
  if (from === to) return null;
  const queue = [{ cell: from, bound: null, route: [from] }];
  const visited = new Set();
  visited.add(String(from));
  while (queue.length) {
    const node = queue.shift();
    for (const b of CELL.get(node.cell).adj) {
      const t = b.to;
      if (t === from) continue;
      if (occupied.has(t) && t !== to) continue;
      // 连接判定
      if (node.bound !== null) {
        if (!(node.bound.rail && b.rail)) continue;
        if (!canTurn && node.bound.o1 !== b.o0) continue;
      }
      const key = (b.rail && !canTurn) ? `${t}:${b.o1}` : String(t);
      if (visited.has(key)) continue;
      const route = node.route.concat(t);
      if (t === to) return route;
      visited.add(key);
      queue.push({ cell: t, bound: b, route });
    }
  }
  return null;
}

/** 从 from 出发所有可达格（不含 from），返回 Map<to, route> */
export function reachables(from, occupied, canTurn) {
  const res = new Map();
  const queue = [{ cell: from, bound: null, route: [from] }];
  const visited = new Set([String(from)]);
  while (queue.length) {
    const node = queue.shift();
    for (const b of CELL.get(node.cell).adj) {
      const t = b.to;
      if (t === from) continue;
      if (node.bound !== null) {
        if (!(node.bound.rail && b.rail)) continue;
        if (!canTurn && node.bound.o1 !== b.o0) continue;
      }
      const key = (b.rail && !canTurn) ? `${t}:${b.o1}` : String(t);
      if (visited.has(key)) continue;
      visited.add(key);
      const route = node.route.concat(t);
      if (!res.has(t)) res.set(t, route);
      if (occupied.has(t)) continue; // 有子：可作为终点（碰子），不可穿越
      queue.push({ cell: t, bound: b, route });
    }
  }
  return res;
}

// ---------- 渲染坐标（U=1 单位，南在下；perspective 为视角座位 0..3，对应 group-1）----------
export function renderCoord(id, perspective = 0) {
  const { g, y, x, lr } = parse(id);
  const rel = gg => (gg === 0 ? 0 : ((gg - 1) - perspective + 4) % 4 + 1);
  const rot = (a, b, r) => {
    if (r === 1) return { x: a, y: b };
    if (r === 2) return { x: b, y: -a };
    if (r === 3) return { x: -a, y: -b };
    return { x: -b, y: a };
  };
  if (g === 0) {
    if (y === 0 && x === 0) return { x: 0, y: 0 };
    if (x === y) return rot(0, 2, rel(y));
    return rot(2, 2, rel(y));
  }
  return rot((lr ? 1 : -1) * (3 - x), 3 + (y - 1), rel(g));
}

export function cellName(id) {
  const { g, y, x, lr } = parse(id);
  if (g === 0) {
    if (y === 0) return '中心';
    if (x === y) return ORIENT_NAME[y] + '门';
    return ORIENT_NAME[y] + ORIENT_NAME[x] + '角';
  }
  const col = x === 3 ? 3 : (lr ? (x === 1 ? 5 : 4) : x); // 左→右 1..5
  return `${ORIENT_NAME[g]}${y}${col}`;
}
