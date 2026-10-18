import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fresh,addItem} from '../src/model.ts';
import {offlineReward,decodeSave,nextObjective} from '../src/journey.ts';
test('offline respeita pausa, dados inválidos, relógio futuro e requisito de build',()=>{
 const s=fresh(),now=10000000,c={at:now-3600000,kind:'bat',interval:10,enabled:true};
 assert.equal(offlineReward(s,c,now).kills,0);addItem(s,'bat');s.equipped=['bat'];
 for(const bad of [{...c,enabled:false},{...c,at:now+1},{...c,interval:0},{...c,interval:NaN},{...c,kind:'boss'},null])assert.equal(offlineReward(s,bad,now).kills,0);
 assert.equal(s.kills,0);
});
test('offline usa metade do ritmo, concede loot real e não avança setores',()=>{
 const s=fresh();addItem(s,'bat');s.equipped=['bat'];
 const result=offlineReward(s,{at:0,kind:'bat',interval:10,enabled:true},3600000);
 assert.equal(result.kills,180);assert.equal(s.kills,180);assert.equal(s.village.materials.silk,180);assert.equal(s.caveSector,0);assert.equal(s.bossWins,0);
 assert.ok(s.inventory.length>1);
});
test('offline limita duração e quantidade; períodos menores que um minuto não concedem loot',()=>{
 const s=fresh();addItem(s,'bat');s.equipped=['bat'];
 assert.deepEqual(offlineReward(s,{at:0,kind:'bat',interval:3,enabled:true},59000),{kills:0,seconds:0});
 assert.deepEqual(offlineReward(s,{at:0,kind:'bat',interval:3,enabled:true},86400000),{kills:240,seconds:7200});
});
test('exportação e importação preservam progresso e rejeitam arquivo sem formato válido',()=>{
 const s=fresh();s.kills=25;s.village.founded=true;addItem(s,'bat',4);
 assert.deepEqual(decodeSave(JSON.stringify({game:'slime-origins',state:s})),s);
 assert.deepEqual(decodeSave(JSON.stringify(s)),s);
 for(const text of ['null','{}','{','{"version":99,"level":2,"kills":3}'])assert.throws(()=>decodeSave(text));
});
test('objetivos acompanham absorção, build e fundação',()=>{
 const s=fresh();assert.equal(nextObjective(s).panel,'skills-panel');addItem(s,'bat');s.equipped=['bat'];s.kills=10;assert.equal(nextObjective(s).panel,'village-panel');
});
