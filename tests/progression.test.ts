import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fresh, migrate, awardKill, fuse, toggleEquip, effects, energyUsed, damageAgainst, incomingDamage, addItem, mix, skillPower } from '../src/model.ts';

test('migra save original preservando progressão e equipamento, sem conceder fusões', () => {
  const result = migrate({ level: 8, xp: 44, kills: 60, fragments: { beetle: 12, snake: 30, wolf: 18 }, unlocked: { beetle: true, snake: true, wolf: true }, equipped: 'snake' });
  assert.equal(result.level, 8); assert.equal(result.xp, 44); assert.equal(result.essence, 60);
  assert.deepEqual(result.equipped, ['snake']); assert.equal(result.fragments.snake, 30);
  assert.equal(result.unlocked.miasma, false); assert.equal(result.unlocked.mushroom, false);
  assert.deepEqual(migrate(JSON.parse(JSON.stringify(result))), result);
});
test('absorção tem garantia e concede recurso, experiência e nível', () => {
  const state = fresh();
  for (let i = 0; i < 7; i++) assert.equal(awardKill(state, 'frog', .99).unlocked, false);
  assert.equal(awardKill(state, 'frog', .99).unlocked, true);
  assert.equal(state.essence, 8); assert.equal(state.kills, 8); assert.ok(state.level > 1);
  assert.equal(awardKill(state, 'frog', 0).unlocked, false);
});
test('fusão consome cópias, mantém o registro e pode ser repetida sem custo em moeda', () => {
  const state = fresh(); state.essence = 20;
  assert.equal(fuse(state, 'adaptive'), false); assert.equal(state.essence, 20);
  addItem(state,'beetle'); addItem(state,'mushroom');
  assert.equal(fuse(state, 'adaptive'), true); assert.equal(state.essence, 20);
  assert.equal(state.unlocked.beetle, true); assert.equal(state.unlocked.mushroom, true);
  assert.equal(fuse(state, 'adaptive'), false); assert.equal(state.inventory.length,1);
  addItem(state,'beetle');addItem(state,'mushroom');assert.equal(fuse(state,'adaptive'),true);
  assert.equal(state.inventory.filter(i=>i.skill==='adaptive').length,2);
});
test('três espaços e capacidade bloqueiam excesso e permitem remover', () => {
  const state = fresh(); for (const id of ['adaptive', 'miasma', 'conductor', 'snake'] as const) addItem(state,id);
  assert.equal(toggleEquip(state, 'adaptive'), true); assert.equal(toggleEquip(state, 'miasma'), true);
  assert.equal(energyUsed(state), 6); assert.equal(toggleEquip(state, 'snake'), false);
  assert.equal(toggleEquip(state, 'adaptive'), true); assert.equal(toggleEquip(state, 'snake'), true);
  assert.equal(toggleEquip(state, 'beetle'), false);
  addItem(state,'wolf'); assert.equal(toggleEquip(state, 'wolf'), true); addItem(state,'bat');
  assert.equal(toggleEquip(state, 'bat'), false);
});
test('efeitos defensivos da fusão não duplicam os pais', () => {
  const state = fresh(); state.equipped = ['adaptive', 'beetle', 'mushroom'];
  assert.equal(effects(state).defense, .45); assert.equal(effects(state).regen, 5);
  assert.equal(incomingDamage(100, state), 55);
  state.equipped = ['beetle', 'moth']; assert.equal(incomingDamage(100, state, true), 39);
});
test('fraquezas do chefe fazem duas builds causarem danos diferentes', () => {
  assert.equal(damageAgainst(30, 'physical', true, false), 12);
  assert.equal(damageAgainst(30, 'poison', true, false), 30);
  assert.equal(damageAgainst(30, 'water', true, false), 38);
  assert.equal(damageAgainst(30, 'electric', true, true), 48);
  assert.equal(damageAgainst(30, 'electric', true, false), 30);
});
test('save inválido é sanitizado e duplicatas não removem equipamento', () => {
  const state = migrate({ level: -3, essence: '999', unlocked: { snake: true }, equipped: ['snake', 'snake', 'unknown'] });
  assert.equal(state.level, 1); assert.equal(state.essence, 0); assert.deepEqual(state.equipped, ['snake']);
  assert.equal(migrate(null).kills, 0);
});
