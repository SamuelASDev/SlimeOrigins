import { test } from 'node:test';
import assert from 'node:assert/strict';
import { center, route, clearLine, walkable, sectors, floor, CELL, CAVE_WIDTH, CAVE_HEIGHT } from '../src/cave-map.ts';
import { migrate, effects, fresh } from '../src/model.ts';

test('todos os setores e suas conexões são alcançáveis sem atravessar pedra', () => {
  for(let i=0;i<sectors.length;i++) for(let j=0;j<sectors.length;j++) {
    if(i===j)continue;
    const path=route(center(i),center(j));assert.ok(path.length>0);
    let last=center(i);for(const point of path){assert.ok(walkable(point));assert.ok(clearLine(last,point));last=point;}
    assert.deepEqual(last,center(j));
  }
  assert.equal(route({x:0,y:0},center(0)).length,0);
  assert.equal(clearLine(center(0),center(2)),false);
  for(const tile of floor){const [x,y]=tile.split(',').map(Number);assert.ok(x>=0&&y>=0&&x*CELL<CAVE_WIDTH&&y*CELL<CAVE_HEIGHT);}
});
test('save anterior recebe novas essências sem perder habilidades nem somar armaduras', () => {
 const old={...fresh(),version:2};old.level=12;old.unlocked.beetle=true;old.equipped=['beetle'];
 const migrated=migrate(old);assert.equal(migrated.level,12);assert.deepEqual(migrated.equipped,['beetle']);
 assert.equal(migrated.fragments.centipede,0);assert.equal(migrated.unlocked.serpent,false);
 migrated.equipped=['beetle','armorsaurus'];assert.equal(effects(migrated).defense,.35);
 migrated.equipped.push('adaptive');assert.equal(effects(migrated).defense,.45);
});
