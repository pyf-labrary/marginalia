// 复盘：把棋谱重跑成任意一步的局面。
// 每次跳转都从头重跑——一局最多几百手，重跑一遍不到 1ms，比维护增量快照可靠得多。
import { Game, SEAT_NAME } from './game.js';

/** 重跑到第 step 手（0 = 开局前）。返回 {game, events, event}
 *  默认用全明模式重跑：mode 只影响可见性、不影响走子合法性，复盘当然要看清每家的子。 */
export function replayTo(rec, step, reveal = true) {
  const game = new Game({ players: rec.players, mode: reveal ? 'bright4' : rec.mode });
  for (const s of game.activeSeats) if (rec.layouts[s]) game.setLayout(s, rec.layouts[s]);
  game.start();
  const events = [];
  for (let i = 0; i < Math.min(step, rec.moves.length); i++) {
    const m = rec.moves[i];
    try {
      if (m.k === 'surrender') events.push(game.surrender(m.s));
      else if (m.k === 'timeout') events.push(game.timeout(m.s));
      else events.push(game.move(m.f, m.t));
    } catch (e) {
      // 棋谱与当前规则对不上（改过规则的旧存档）就停在这里，不把整个复盘炸掉
      events.push({ seat: m.s, result: 'broken', error: String(e.message || e), captured: [], flagShown: [], eliminated: [] });
      break;
    }
  }
  return { game, events, event: events[events.length - 1] || null };
}

/** 棋谱每手的一行文字（复盘列表用，视角固定为全知） */
export function moveLines(rec) {
  const { game, events } = replayTo(rec, rec.moves.length);
  return events.map((ev, i) => {
    if (ev.result === 'broken') return `${i + 1}. 棋谱在此中断：${ev.error}`;
    return `${i + 1}. ${game.describeEvent(ev, 0)}`;
  });
}

export function recordTitle(rec) {
  const d = new Date(rec.ts);
  const p = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${p} · ${rec.players === 2 ? '两国' : '四国'} · ${rec.result.title || '未结束'} · ${rec.moves.length} 手`;
}
export { SEAT_NAME };
