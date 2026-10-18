import type { Kind } from './model.ts';

export type AttackStyle = 'horn' | 'venom' | 'claw' | 'spore' | 'gust' | 'water' | 'bolt' | 'fang' | 'crush' | 'slime';
export type AttackSpec = { label: string; style: AttackStyle; range: number; windup: number; travel: number; recovery: number; cooldown: number; color: number; ranged: boolean };
export const enemyAttacks: Record<Kind | 'guardian', AttackSpec> = {
  spider: { label: 'FIO PEGAJOSO', style: 'gust', range: 130, windup: 500, travel: 350, recovery: 350, cooldown: 2400, color: 0xcfc5e6, ranged: true },
  serpent: { label: 'HÁLITO VENENOSO', style: 'venom', range: 115, windup: 520, travel: 320, recovery: 350, cooldown: 2200, color: 0xb19ddd, ranged: true },
  centipede: { label: 'PRESAS PARALISANTES', style: 'fang', range: 66, windup: 420, travel: 180, recovery: 330, cooldown: 2000, color: 0xc68bdb, ranged: false },
  armorsaurus: { label: 'INVESTIDA BLINDADA', style: 'horn', range: 76, windup: 540, travel: 190, recovery: 400, cooldown: 2300, color: 0xb8cbe0, ranged: false },
  beetle: { label: 'INVESTIDA', style: 'horn', range: 63, windup: 300, travel: 130, recovery: 280, cooldown: 1550, color: 0xb9dd79, ranged: false },
  snake: { label: 'CUSPE VENENOSO', style: 'venom', range: 110, windup: 360, travel: 300, recovery: 280, cooldown: 1800, color: 0xc28be9, ranged: true },
  wolf: { label: 'GARRAS', style: 'claw', range: 66, windup: 280, travel: 130, recovery: 270, cooldown: 1500, color: 0xc1e8ff, ranged: false },
  mushroom: { label: 'ESPOROS', style: 'spore', range: 100, windup: 420, travel: 330, recovery: 280, cooldown: 1900, color: 0xe9ba76, ranged: true },
  moth: { label: 'RAJADA', style: 'gust', range: 120, windup: 400, travel: 300, recovery: 270, cooldown: 1850, color: 0xd1e3ff, ranged: true },
  frog: { label: 'JATO DE ÁGUA', style: 'water', range: 125, windup: 420, travel: 290, recovery: 280, cooldown: 1900, color: 0x72d9ef, ranged: true },
  wisp: { label: 'DESCARGA', style: 'bolt', range: 140, windup: 440, travel: 210, recovery: 270, cooldown: 1900, color: 0xf3df83, ranged: true },
  bat: { label: 'MORDIDA', style: 'fang', range: 70, windup: 300, travel: 150, recovery: 280, cooldown: 1550, color: 0xee8fb2, ranged: false },
  guardian: { label: 'GOLPE PÉTREO', style: 'crush', range: 92, windup: 400, travel: 170, recovery: 320, cooldown: 1500, color: 0xe7bf89, ranged: false },
};
export const slimeAttack: AttackSpec = { label: 'CORTE', style: 'slime', range: 42, windup: 150, travel: 100, recovery: 240, cooldown: 850, color: 0x91e8ff, ranged: false };
export type AttackClock = { elapsed: number; released: boolean; impacted: boolean };
export const startAttack = (): AttackClock => ({ elapsed: 0, released: false, impacted: false });
export function advanceAttack(clock: AttackClock, spec: AttackSpec, delta: number) {
  clock.elapsed += Math.max(0, delta);
  const release = !clock.released && clock.elapsed >= spec.windup;
  const impact = !clock.impacted && clock.elapsed >= spec.windup + spec.travel;
  if (release) clock.released = true;
  if (impact) clock.impacted = true;
  const phase = clock.elapsed < spec.windup ? 'windup' : clock.elapsed < spec.windup + spec.travel ? 'strike' : clock.elapsed < spec.windup + spec.travel + spec.recovery ? 'recovery' : 'done';
  const progress = phase === 'windup' ? clock.elapsed / spec.windup : phase === 'strike' ? (clock.elapsed - spec.windup) / spec.travel : Math.min(1, (clock.elapsed - spec.windup - spec.travel) / spec.recovery);
  return { release, impact, phase, progress };
}
