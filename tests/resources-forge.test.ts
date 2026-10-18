import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fresh,migrate,awardKill} from '../src/model.ts';
import {forgeRecipes,craftRecipe,forgeError} from '../src/village.ts';
import {materialIds,resourceDrops,resourceValues} from '../src/resources.ts';
import {sellResources} from '../src/economy.ts';
import {marketOffers} from '../src/market.ts';
const forgeState=()=>{const s=fresh();s.village.founded=true;s.village.artisan=true;s.village.buildings.workshop=3;s.coins=10000;return s;};
test('Kaijin fabrica as três peças simples apenas por moedas mesmo com oficina máxima',()=>{
 const s=forgeState();for(const slot of ['weapon','armor','charm']){const recipe=forgeRecipes.find(r=>r.id===slot+'-1')!,before=s.coins;assert.equal(craftRecipe(s,recipe.id),true);assert.equal(s.coins,before-recipe.coins);assert.equal(s.equipment.items.at(-1)?.tier,1);}
 assert.equal(s.equipment.items.length,3);assert.ok(materialIds.every(id=>s.village.materials[id]===0));assert.deepEqual(s.equipment.slots,{weapon:null,armor:null,charm:null});
});
test('cada receita avançada cobra exatamente seus próprios materiais e moedas',()=>{
 for(const recipe of forgeRecipes.filter(r=>r.tier>1)){
  const s=forgeState();for(const id of materialIds)s.village.materials[id]=100;
  assert.equal(craftRecipe(s,recipe.id),true);assert.equal(s.coins,10000-recipe.coins);
  for(const id of materialIds)assert.equal(s.village.materials[id],100-(recipe.materials[id]??0));
  assert.equal(s.equipment.items[0].tier,recipe.tier);assert.equal(s.equipment.items[0].slot,recipe.slot);
 }
});
test('receita bloqueada, moeda insuficiente ou material ausente não consomem nada',()=>{
 for(const reason of ['coins','materials','workshop','artisan','unknown']){
  const s=forgeState();for(const id of materialIds)s.village.materials[id]=100;
  if(reason==='coins')s.coins=0;if(reason==='materials')s.village.materials.crystal=0;if(reason==='workshop')s.village.buildings.workshop=2;if(reason==='artisan')s.village.artisan=false;
  const id=reason==='unknown'?'invalid':'charm-3',before=JSON.stringify(s);assert.ok(forgeError(s,id));assert.equal(craftRecipe(s,id),false);assert.equal(JSON.stringify(s),before);
 }
});
test('fontes de recursos são distintas, com materiais garantidos e escamas raras',()=>{
 const has=(kind:Parameters<typeof resourceDrops>[0],id:string,roll=1)=>resourceDrops(kind,roll).some(d=>d.material===id);
 assert.ok(has('centipede','iron'));assert.ok(has('wolf','hide'));assert.ok(has('wolf','fang'));assert.ok(has('wisp','crystal'));assert.ok(has('spider','silk'));
 assert.equal(has('spider','iron'),false);assert.equal(has('serpent','scale',1),false);assert.equal(has('serpent','scale',.2),true);assert.equal(has('armorsaurus','scale',.2),false);assert.equal(has('armorsaurus','scale',.1),true);
 const s=fresh(),out=awardKill(s,'serpent',1,0,.1);assert.equal(s.village.materials.scale,1);assert.ok(out.materials.some(d=>d.material==='scale'));assert.equal(s.coins,2);
});
test('save antigo recebe novos recursos zerados e preserva a coleta já existente',()=>{
 const s=migrate({version:4,level:8,kills:10,village:{materials:{timber:20,ore:12,silk:8,herbs:9}},inventory:[],skillSlots:[]});
 assert.equal(s.village.materials.ore,12);assert.equal(s.village.materials.iron,0);assert.equal(s.village.materials.scale,0);assert.equal(Object.keys(s.village.materials).length,9);
 s.village.materials.crystal=17;assert.deepEqual(migrate(s),s);
});
test('venda de recursos valida quantidade e contexto, e compras nunca permitem arbitragem simples',()=>{
 const s=forgeState();s.village.materials.crystal=5;
 for(const qty of [0,-1,1.5,6,NaN]){const before=JSON.stringify(s);assert.equal(sellResources(s,'crystal',qty,true).ok,false);assert.equal(JSON.stringify(s),before);}
 assert.equal(sellResources(s,'crystal',1,false).ok,false);assert.equal(sellResources(s,'crystal',2,true).ok,true);assert.equal(s.coins,10016);assert.equal(s.village.materials.crystal,3);
 for(const o of marketOffers(s,0))if(o.kind==='material')assert.ok(o.price>o.quantity*resourceValues[o.material]);
});
