import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startAttack, advanceAttack, enemyAttacks } from '../src/attack-timing.ts';

test('golpe só aplica impacto após preparação e deslocamento; evento ocorre uma vez', () => {
  const clock = startAttack(), spec = enemyAttacks.snake;
  let step = advanceAttack(clock, spec, spec.windup - 1);
  assert.equal(step.phase, 'windup'); assert.equal(step.impact, false); assert.equal(step.release, false);
  step = advanceAttack(clock, spec, 1);
  assert.equal(step.phase, 'strike'); assert.equal(step.release, true); assert.equal(step.impact, false);
  step = advanceAttack(clock, spec, spec.travel);
  assert.equal(step.impact, true); assert.equal(step.release, false);
  step = advanceAttack(clock, spec, spec.recovery + 100);
  assert.equal(step.phase, 'done'); assert.equal(step.impact, false); assert.equal(step.release, false);
});
test('uma atualização longa não perde nem duplica a liberação ou o impacto', () => {
  const clock = startAttack(), spec = enemyAttacks.wolf;
  const step = advanceAttack(clock, spec, 1000);
  assert.equal(step.release, true); assert.equal(step.impact, true);
  assert.equal(advanceAttack(clock, spec, 1000).impact, false);
});
test('pausa não avança o ataque e novos ataques começam sem eventos antigos', () => {
  const clock = startAttack(), spec = enemyAttacks.frog;
  advanceAttack(clock, spec, 150); const before = { ...clock };
  advanceAttack(clock, spec, 0); assert.deepEqual(clock, before);
  assert.deepEqual(startAttack(), { elapsed: 0, released: false, impacted: false });
});
