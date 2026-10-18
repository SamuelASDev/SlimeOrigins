import Phaser from 'phaser';
import type { AttackStyle } from './attack-timing';

type Point = { x: number; y: number };
type Effect = { kind: 'shot' | 'slash' | 'impact' | 'ring'; style: AttackStyle; start: Point; end: Point; elapsed: number; duration: number; color: number; seed: number };
export type Telegraph = { x: number; y: number; progress: number; color: number; ranged: boolean };

/** Game-native, low-resolution effects. Every line is constructed from square pixel clusters. */
export class CombatEffects {
  private graphics: Phaser.GameObjects.Graphics;
  private effects: Effect[] = [];
  private seed = 0;
  constructor(scene: Phaser.Scene) { this.graphics = scene.add.graphics().setDepth(35); }
  private add(kind: Effect['kind'], style: AttackStyle, start: Point, end: Point, color: number, duration: number) {
    this.effects.push({ kind, style, start: { ...start }, end: { ...end }, color, duration, elapsed: 0, seed: ++this.seed });
    if (this.effects.length > 70) this.effects.shift();
  }
  shot(style: AttackStyle, start: Point, end: Point, color: number, duration: number) { this.add('shot', style, start, end, color, duration); }
  slash(style: AttackStyle, start: Point, end: Point, color: number) { this.add('slash', style, start, end, color, 280); }
  impact(style: AttackStyle, at: Point, color: number) { this.add('impact', style, at, at, color, 300); }
  ring(at: Point, color: number) { this.add('ring', 'crush', at, at, color, 500); }
  clear() { this.effects = []; this.graphics.clear(); }
  private pixel(x: number, y: number, size: number, color: number, alpha = 1) { this.graphics.fillStyle(color, alpha).fillRect(Math.round(x / 2) * 2, Math.round(y / 2) * 2, size, size); }
  private line(a: Point, b: Point, color: number, width = 2, alpha = 1) {
    const steps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 2));
    for (let i = 0; i <= steps; i++) this.pixel(a.x + (b.x - a.x) * i / steps, a.y + (b.y - a.y) * i / steps, width, color, alpha);
  }
  update(dt: number, telegraphs: Telegraph[]) {
    this.graphics.clear();
    for (const t of telegraphs) {
      const r = 10 + t.progress * 5;
      for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; this.pixel(t.x + Math.cos(a) * r, t.y + Math.sin(a) * r * .38, 2, t.color, .35 + t.progress * .5); }
      // A small diamond above the attacker fills as it prepares the strike.
      const y = t.y - 49;
      this.line({ x: t.x, y: y - 4 }, { x: t.x + 4, y }, t.color, 2, .85);
      this.line({ x: t.x + 4, y }, { x: t.x, y: y + 4 }, t.color, 2, .85);
      this.line({ x: t.x, y: y + 4 }, { x: t.x - 4, y }, t.color, 2, .85);
      this.line({ x: t.x - 4, y }, { x: t.x, y: y - 4 }, t.color, 2, .85);
      if (t.progress > .4) this.pixel(t.x, y, 2 + Math.floor(t.progress * 2), 0xfff5cf);
    }
    this.effects = this.effects.filter(e => e.elapsed < e.duration);
    for (const e of this.effects) {
      e.elapsed = Math.min(e.duration, e.elapsed + dt);
      const t = e.elapsed / e.duration, alpha = 1 - t * .85;
      const dx = e.end.x - e.start.x, dy = e.end.y - e.start.y, angle = Math.atan2(dy, dx);
      if (e.kind === 'shot') {
        const at = { x: e.start.x + dx * t, y: e.start.y + dy * t };
        if (e.style === 'bolt') {
          const start = { x: at.x - Math.cos(angle) * 25, y: at.y - Math.sin(angle) * 25 };
          const middle = { x: (start.x + at.x) / 2 + Math.sin(angle) * 6, y: (start.y + at.y) / 2 - Math.cos(angle) * 6 };
          this.line(start, middle, e.color, 4); this.line(middle, at, e.color, 4); this.line(middle, at, 0xfff9da, 2);
        } else {
          for (let i = 5; i >= 0; i--) {
            const drift = e.style === 'spore' || e.style === 'gust' ? Math.sin(t * 15 + i) * 4 : 0;
            this.pixel(at.x - Math.cos(angle) * i * 4 + Math.sin(angle) * drift, at.y - Math.sin(angle) * i * 4 - Math.cos(angle) * drift, i === 0 ? 6 : 3, i === 0 ? 0xf3fff1 : e.color, 1 - i * .12);
            if (e.style === 'gust') this.pixel(at.x - Math.cos(angle) * i * 4 + Math.sin(angle) * 7, at.y - Math.sin(angle) * i * 4 - Math.cos(angle) * 7, 2, e.color, .65);
          }
        }
      } else if (e.kind === 'slash') {
        const center = { x: (e.start.x + e.end.x) / 2, y: (e.start.y + e.end.y) / 2 };
        const count = e.style === 'claw' ? 3 : e.style === 'fang' ? 2 : 1;
        for (let k = 0; k < count; k++) {
          const offset = (k - (count - 1) / 2) * 6;
          let prev: Point | null = null;
          for (let i = 0; i <= 14; i++) {
            const arc = angle - 1.5 + i / 14 * 2.4;
            const r = 16 + Math.sin(t * Math.PI) * 9;
            const point = { x: center.x + Math.cos(arc) * r + Math.sin(angle) * offset, y: center.y + Math.sin(arc) * r - Math.cos(angle) * offset };
            if (prev) this.line(prev, point, i > 9 ? 0xf7fff0 : e.color, i > 6 ? 3 : 2, alpha);
            prev = point;
          }
        }
      } else if (e.kind === 'impact') {
        const r = 3 + t * 21;
        for (let i = 0; i < 8; i++) {
          const a = i * Math.PI / 4 + e.seed * .4;
          const from = { x: e.start.x + Math.cos(a) * r * .55, y: e.start.y + Math.sin(a) * r * .55 };
          const to = { x: e.start.x + Math.cos(a) * r, y: e.start.y + Math.sin(a) * r };
          this.line(from, to, e.color, i % 2 ? 2 : 3, alpha);
        }
        if (t < .35) { this.pixel(e.start.x - 3, e.start.y - 3, 6, 0xfffce8); this.line({ x: e.start.x - 8, y: e.start.y }, { x: e.start.x + 8, y: e.start.y }, 0xfffce8, 2); }
      } else {
        const r = 10 + t * 95;
        for (let i = 0; i < 44; i++) { const a = i / 44 * Math.PI * 2; this.pixel(e.start.x + Math.cos(a) * r, e.start.y + Math.sin(a) * r * .55, 3, e.color, alpha); }
      }
    }
  }
}
