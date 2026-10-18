import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fresh,migrate,addItem,mix,itemStage,awardKill,skillPower,toggleEquip,mixRecipes} from '../src/model.ts';

test('cópias repetidas continuam caindo e a garantia reinicia após cada absorção',()=>{
 const s=fresh();
 for(let cycle=0;cycle<3;cycle++){for(let n=0;n<7;n++)assert.equal(awardKill(s,'spider',.99,0).item,undefined);assert.equal(awardKill(s,'spider',.99,0).item?.skill,'spider');}
 assert.equal(s.inventory.length,3);assert.equal(s.pity.spider,0);
 assert.equal(awardKill(s,'spider',0,.99).item?.skill,'steel');
 assert.equal(awardKill(s,'bat',0,.99).item?.skill,'ultrasound');
 assert.equal(awardKill(s,'serpent',0,.99).item?.skill,'heat');
});
test('evolução consome exatamente duas cópias, muda de estágio e melhora o efeito',()=>{
 const s=fresh();const a=addItem(s,'heat',3),b=addItem(s,'heat',3);toggleEquip(s,'heat');
 const before=skillPower(s,'heat');assert.equal(mix(s,a.uid,b.uid).ok,false);toggleEquip(s,'heat');const result=mix(s,a.uid,b.uid);
 assert.equal(result.ok,true);assert.equal(result.item?.rank,4);assert.equal(itemStage(4),'Superior');
 assert.equal(s.inventory.length,1);toggleEquip(s,'heat');assert.deepEqual(s.equipped,['heat']);assert.ok(skillPower(s,'heat')>before);
 const c=addItem(s,'heat',6),d=addItem(s,'heat',6);assert.equal(mix(s,c.uid,d.uid).item?.rank,7);assert.equal(itemStage(7),'Evoluída');
});
test('inválidos, mesma cópia, níveis diferentes e limite máximo não consomem inventário',()=>{
 for(const ranks of [[1,2],[9,9]]){const s=fresh(),a=addItem(s,'steel',ranks[0]),b=addItem(s,'steel',ranks[1]);const before=JSON.stringify(s);assert.equal(mix(s,a.uid,b.uid).ok,false);assert.equal(JSON.stringify(s),before);}
 const s=fresh(),a=addItem(s,'steel'),b=addItem(s,'bat');const before=JSON.stringify(s);
 for(const [x,y] of [[a.uid,a.uid],[a.uid,99999],[a.uid,b.uid]]){assert.equal(mix(s,x,y).ok,false);assert.equal(JSON.stringify(s),before);}
});
test('todas as combinações funcionam nas duas ordens, preservam sobras e protegem ingredientes equipados',()=>{
 for(const recipe of mixRecipes)for(const reverse of [false,true]){
  const s=fresh(),a=addItem(s,recipe.inputs[0]),b=addItem(s,recipe.inputs[1]),spare=addItem(s,'bat');toggleEquip(s,a.skill);
  const before=JSON.stringify(s);assert.equal(mix(s,a.uid,b.uid).ok,false);assert.equal(JSON.stringify(s),before);toggleEquip(s,a.skill);
  const out=mix(s,reverse?b.uid:a.uid,reverse?a.uid:b.uid);
  assert.equal(out.item?.skill,recipe.output);assert.equal(s.inventory.length,2);assert.ok(s.inventory.some(i=>i.uid===spare.uid));assert.ok(!s.equipped.includes(a.skill));
 }
});
test('save v2 migra uma cópia por descoberta; save v3 preserva níveis, IDs, sobras e progresso da caverna',()=>{
 const old=migrate({version:2,level:22,essence:50,unlocked:{spider:true,serpent:true},equipped:['spider']});
 assert.equal(old.inventory.length,2);assert.equal(old.essence,50);assert.deepEqual(old.equipped,['spider']);
 const a=addItem(old,'spider'),b=addItem(old,'spider');mix(old,a.uid,b.uid);old.caveSector=3;old.visited=[0,3];
 assert.deepEqual(migrate(JSON.parse(JSON.stringify(old))),old);
});
