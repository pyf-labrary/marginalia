// 对局状态机：座位、布局、走子、碰子、亮旗、判负、清子、和棋、历史
import { CELL, CELLS, cellType, getRoute, reachables, cellName, parse } from './board.js';
import { R, NAME2, attack, slotCell, cellSlot, validateLayout } from './pieces.js';

export const MODES = { dark4: '四暗', bright2: '双明', bright4: '全明' };
export const SEAT_NAME = ['南', '东', '北', '西'];
export const SEAT_COLOR = ['orange', 'purple', 'green', 'blue'];
// 四人：对家同队(seat%2)；两人（南北对拼）：各自一队
export const teamOf = (seat, players = 4) => (players === 2 ? seat : seat % 2);
export const isAlly = (a, b, players = 4) => a === b || teamOf(a, players) === teamOf(b, players);

export class Game {
  /** opts: {players:2|4, mode, layouts:[4] (座位不参与则 null)} */
  constructor(opts) {
    this.players = opts.players || 2;
    this.mode = opts.mode || 'dark4';
    this.activeSeats = this.players === 2 ? [0, 2] : [0, 1, 2, 3];
    this.seats = [0, 1, 2, 3].map(s => ({
      seat: s,
      active: this.activeSeats.includes(s),
      alive: this.activeSeats.includes(s),
      layout: null,
      flagShown: false,
      timeouts: 0,
      lostReason: null,
    }));
    this.board = new Map(); // cellId -> {seat, idx}
    this.turn = 0;
    this.step = 0;
    this.noCaptureSteps = 0;
    this.history = [];
    this.phase = 'setup';
    this.winnerTeam = null;
    this.draw = false;
    for (const s of this.activeSeats) if (opts.layouts && opts.layouts[s]) this.setLayout(s, opts.layouts[s]);
  }

  teamOf(seat) { return teamOf(seat, this.players); }
  isAlly(a, b) { return isAlly(a, b, this.players); }

  setLayout(seat, layout) {
    const err = validateLayout(layout);
    if (err) throw new Error(err);
    this.seats[seat].layout = layout.slice();
  }

  start() {
    for (const s of this.activeSeats) {
      if (!this.seats[s].layout) throw new Error(`座位 ${s} 未布局`);
      for (let i = 0; i < 25; i++) this.board.set(slotCell(s, i), { seat: s, idx: i });
    }
    this.phase = 'play';
    this.turn = 0;
  }

  rankAt(cell) { const e = this.board.get(cell); return e ? this.seats[e.seat].layout[e.idx] : null; }
  rankOf(e) { return this.seats[e.seat].layout[e.idx]; }
  occupiedSet() { return new Set(this.board.keys()); }

  /** viewer 能否看到 seat 的棋子 */
  canSee(viewer, seat) {
    if (viewer === seat) return true;
    if (this.mode === 'bright4') return true;
    if (this.mode === 'bright2' && this.teamOf(viewer) === this.teamOf(seat)) return true;
    return false;
  }
  /** viewer 视角某格显示信息：{seat, rank|null, known} ；亮旗后军旗对所有人可见 */
  view(viewer, cell) {
    const e = this.board.get(cell);
    if (!e) return null;
    const rank = this.rankOf(e);
    if (this.canSee(viewer, e.seat)) return { seat: e.seat, idx: e.idx, rank, known: true };
    if (rank === R.FLAG && this.seats[e.seat].flagShown) return { seat: e.seat, idx: e.idx, rank, known: true };
    return { seat: e.seat, idx: e.idx, rank: null, known: false };
  }

  /** 走子合法性：返回路径或 null */
  routeFor(from, to) {
    const fe = this.board.get(from);
    if (!fe) return null;
    const rank = this.rankOf(fe);
    if (rank === R.MINE || rank === R.FLAG) return null;
    if (cellType(from) === 'hq') return null;
    const te = this.board.get(to);
    if (te) {
      if (cellType(to) === 'camp') return null;
      if (this.isAlly(fe.seat, te.seat)) return null;
    }
    return getRoute(from, to, this.occupiedSet(), rank === R.ENG);
  }

  /** 某子所有合法着法 [{from,to,route}] */
  movesOf(from) {
    const fe = this.board.get(from);
    if (!fe) return [];
    const rank = this.rankOf(fe);
    if (rank === R.MINE || rank === R.FLAG || cellType(from) === 'hq') return [];
    const res = [];
    for (const [to, route] of reachables(from, this.occupiedSet(), rank === R.ENG)) {
      const te = this.board.get(to);
      if (te) {
        if (cellType(to) === 'camp') continue;
        if (this.isAlly(fe.seat, te.seat)) continue;
      }
      res.push({ from, to, route });
    }
    return res;
  }
  legalMoves(seat) {
    const res = [];
    for (const [cell, e] of this.board) if (e.seat === seat) res.push(...this.movesOf(cell));
    return res;
  }
  hasMove(seat) {
    for (const [cell, e] of this.board) if (e.seat === seat && this.movesOf(cell).length) return true;
    return false;
  }

  /** 执行走子。返回 event: {seat, from, to, route, result, attacker, defender, captured:[cells], flagShown:[seats], eliminated:[seats], over} */
  move(from, to) {
    if (this.phase !== 'play') throw new Error('对局未进行');
    const fe = this.board.get(from);
    if (!fe || fe.seat !== this.turn) throw new Error('不是该座位的棋子');
    const route = this.routeFor(from, to);
    if (!route) throw new Error('非法走法');
    const te = this.board.get(to);
    const ev = { seat: fe.seat, from, to, route, result: 'move', attacker: this.rankOf(fe), attackerIdx: fe.idx, defender: null, defenderSeat: null, defenderIdx: null, turned: this.routeTurned(route), captured: [], flagShown: [], eliminated: [], over: false, step: this.step + 1 };
    if (!te) {
      this.board.delete(from);
      this.board.set(to, fe);
      this.noCaptureSteps++;
    } else {
      const a = this.rankOf(fe), b = this.rankOf(te);
      ev.defender = b; ev.defenderSeat = te.seat; ev.defenderIdx = te.idx;
      const res = attack(a, b);
      ev.result = res;
      this.noCaptureSteps = 0;
      if (res === 'flag' && a === R.BOMB) { // QQ：炸弹炸军旗同样扛旗，但炸弹也没了（4151 局 QQ 复盘里 17 例证实）
        this.board.delete(from); this.board.delete(to);
        ev.captured.push({ cell: to, seat: te.seat, rank: b }, { cell: from, seat: fe.seat, rank: a });
      } else if (res === 'win' || res === 'flag') {
        this.board.delete(from); this.board.set(to, fe);
        ev.captured.push({ cell: to, seat: te.seat, rank: b });
      } else if (res === 'lose') {
        this.board.delete(from);
        ev.captured.push({ cell: from, seat: fe.seat, rank: a });
      } else { // both
        this.board.delete(from); this.board.delete(to);
        ev.captured.push({ cell: from, seat: fe.seat, rank: a }, { cell: to, seat: te.seat, rank: b });
      }
      // 亮旗
      for (const c of ev.captured) if (c.rank === R.SI && !this.seats[c.seat].flagShown) { this.seats[c.seat].flagShown = true; ev.flagShown.push(c.seat); }
      // 扛旗
      if (res === 'flag') this.eliminate(te.seat, '军旗被扛', ev);
    }
    this.step++;
    ev.stepNo = this.step;
    this.history.push(ev);
    this.afterMove(ev);
    return ev;
  }

  /** 路径是否在铁路上拐了直角（只有工兵能做到）：用非工兵寻路是否能走通判断 */
  routeTurned(route) {
    if (route.length <= 2) return false;
    const occ = this.occupiedSet(); occ.delete(route[0]);
    return !getRoute(route[0], route[route.length - 1], occ, false);
  }

  eliminate(seat, reason, ev) {
    const st = this.seats[seat];
    if (!st.alive) return;
    st.alive = false; st.lostReason = reason;
    for (const [cell, e] of [...this.board]) if (e.seat === seat) this.board.delete(cell);
    if (ev) ev.eliminated.push({ seat, reason });
  }

  /** 走子后：无棋可走判负、胜负、和棋、轮转 */
  afterMove(ev) {
    // 检查所有存活家是否无棋可走（QQ：轮到时判）
    this.checkWinner(ev);
    if (this.phase === 'over') { ev.over = true; return; }
    if (this.noCaptureSteps >= 70) { this.phase = 'over'; this.draw = true; ev.over = true; return; }
    this.nextTurn(ev);
  }

  nextTurn(ev) {
    for (let k = 0; k < 4; k++) {
      this.turn = (this.turn + 1) % 4;
      const st = this.seats[this.turn];
      if (!st.active || !st.alive) continue;
      if (!this.hasMove(this.turn)) {
        this.eliminate(this.turn, '无棋可走', ev);
        this.checkWinner(ev);
        if (this.phase === 'over') { if (ev) ev.over = true; return; }
        continue;
      }
      return;
    }
  }

  checkWinner(ev) {
    const aliveTeams = new Set(this.seats.filter(s => s.active && s.alive).map(s => this.teamOf(s.seat)));
    if (aliveTeams.size <= 1) {
      this.phase = 'over';
      this.winnerTeam = aliveTeams.size === 1 ? [...aliveTeams][0] : null;
      if (ev) ev.over = true;
    }
  }

  surrender(seat) {
    const ev = { seat, result: 'surrender', captured: [], flagShown: [], eliminated: [], over: false };
    this.eliminate(seat, '投降', ev);
    this.checkWinner(ev);
    if (this.phase !== 'over' && this.turn === seat) this.nextTurn(ev);
    this.history.push(ev);
    return ev;
  }
  timeout(seat) {
    const st = this.seats[seat];
    st.timeouts++;
    const ev = { seat, result: 'timeout', count: st.timeouts, captured: [], flagShown: [], eliminated: [], over: false };
    if (st.timeouts >= 5) { this.eliminate(seat, '超时 5 次', ev); this.checkWinner(ev); }
    if (this.phase !== 'over') this.nextTurn(ev);
    this.history.push(ev);
    return ev;
  }

  /** 剩余子数 */
  pieceCount(seat) { let n = 0; for (const e of this.board.values()) if (e.seat === seat) n++; return n; }

  describeEvent(ev, viewer = 0) {
    const who = s => SEAT_NAME[s];
    if (ev.result === 'surrender') return `${who(ev.seat)}方投降`;
    if (ev.result === 'timeout') return `${who(ev.seat)}方超时(${ev.count})`;
    const known = r => (r === null || r === undefined ? '?' : NAME2[r]);
    const a = this.canSee(viewer, ev.seat) ? known(ev.attacker) : (ev.result !== 'move' && ev.captured.some(c => c.seat === ev.seat) ? known(ev.attacker) : '棋子');
    let s = `${who(ev.seat)} ${a} ${cellName(ev.from)}→${cellName(ev.to)}`;
    if (ev.result === 'win') s += ` 吃掉${who(ev.defenderSeat)}方棋子`;
    else if (ev.result === 'lose') s += ` 撞死`;
    else if (ev.result === 'both') s += ` 同归于尽`;
    else if (ev.result === 'flag') s += ` 扛旗！`;
    for (const f of ev.flagShown) s += `；${who(f)}方司令阵亡亮旗`;
    for (const e of ev.eliminated) s += `；${who(e.seat)}方${e.reason}出局`;
    return s;
  }
}
