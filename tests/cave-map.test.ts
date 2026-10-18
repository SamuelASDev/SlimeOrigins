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
import {caveGround} from '../src/cave-map.ts';
import {cavePillars,caveProps,cavePools,caveTrail,caveSeal} from '../src/cave-layout.ts';
test('composição da caverna preserva chão sob pilares e mantém percurso dentro dos corredores',()=>{
 for(const p of cavePillars){const tx=Math.floor(p.x/CELL),ty=Math.floor((p.y-32)/CELL);assert.ok(caveGround.has(`${tx},${ty}`));assert.equal(walkable({x:tx*CELL+16,y:ty*CELL+16}),false);assert.ok(p.width>=92&&p.width<=104);}
 for(const tile of caveTrail)assert.ok(caveGround.has(tile));
});
test('decoração da caverna tem escala contida e fica separada de pilares e outras formações',()=>{
 for(let zone=0;zone<7;zone++)assert.ok(caveProps.filter(p=>p.zone===zone).length>=2);
 for(let i=0;i<caveProps.length;i++){const p=caveProps[i];assert.ok(walkable(p));assert.ok(p.width>=24&&p.width<=100);for(const pillar of cavePillars)assert.ok(Math.hypot(p.x-pillar.x,p.y-pillar.y)>=112);for(const other of caveProps.slice(i+1))assert.ok(Math.hypot(p.x-other.x,p.y-other.y)>=84);if(p.frame==='herbs')assert.ok(p.zone<2);if(p.frame==='web')assert.equal(p.zone,3);}
 for(const pool of cavePools){assert.ok(pool.width<=290&&pool.height<=142);assert.ok(walkable({x:pool.x,y:pool.y}));}
 assert.ok(caveSeal.dragonWidth>210);assert.ok(caveSeal.width>=caveSeal.dragonWidth);
});
