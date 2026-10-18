import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fresh,migrate,addItem,equipSkillItem,removeSkillSlot,skillRank,energyUsed,mix,previewMix,effects} from '../src/model.ts';
import {addGear,equipGear,gearBonuses} from '../src/equipment.ts';
import {sellItem} from '../src/economy.ts';
import {purchaseOffer,marketOffers} from '../src/market.ts';
import {craftGear} from '../src/village.ts';
test('slots usam a cópia exata; substituição respeita capacidade e não equipa duplicadas',()=>{
 const s=fresh(),weak=addItem(s,'heat',1),strong=addItem(s,'heat',9),a=addItem(s,'miasma'),b=addItem(s,'conductor');
 assert.ok(equipSkillItem(s,weak.uid,0));assert.equal(skillRank(s,'heat'),1);
 assert.equal(equipSkillItem(s,strong.uid,1),false);assert.ok(equipSkillItem(s,strong.uid,0));assert.equal(skillRank(s,'heat'),9);
 assert.ok(equipSkillItem(s,a.uid,1));assert.equal(equipSkillItem(s,b.uid,2),false);assert.equal(energyUsed(s),4);
 assert.ok(removeSkillSlot(s,0));assert.ok(equipSkillItem(s,b.uid,2));assert.equal(energyUsed(s),6);
 assert.equal(equipSkillItem(s,123456,0),false);assert.equal(equipSkillItem(s,weak.uid,-1),false);
});
test('fusão antecipa resultado, não altera na prévia e preserva favoritos e equipados',()=>{
 const s=fresh(),a=addItem(s,'beetle',3),b=addItem(s,'mushroom',2);
 const before=JSON.stringify(s);const p=previewMix(s,a.uid,b.uid);assert.equal(p.skill,'adaptive');assert.equal(p.rank,2);assert.equal(JSON.stringify(s),before);
 a.favorite=true;assert.equal(mix(s,a.uid,b.uid).ok,false);a.favorite=false;equipSkillItem(s,a.uid,0);assert.equal(mix(s,a.uid,b.uid).ok,false);removeSkillSlot(s,0);
 const result=mix(s,a.uid,b.uid);assert.ok(result.ok);assert.deepEqual(result.item?.parents,[a.instanceId,b.instanceId]);assert.equal(result.item?.origin,'fusion');assert.notEqual(result.item?.instanceId,a.instanceId);
});
test('equipamento aplica bônus somente no slot e substitui uma cópia sem somar duplicadas',()=>{
 const s=fresh(),a=addGear(s,'weapon',1),b=addGear(s,'weapon',3),armor=addGear(s,'armor',2),charm=addGear(s,'charm',2);
 assert.equal(effects(s).damageBonus,1);equipGear(s,a.uid);assert.equal(gearBonuses(s).attack,.08);equipGear(s,b.uid);assert.equal(gearBonuses(s).attack,.24);
 equipGear(s,armor.uid);equipGear(s,charm.uid);assert.equal(gearBonuses(s).defense,.1);assert.equal(gearBonuses(s).haste,.06);equipGear(s,b.uid);assert.equal(gearBonuses(s).attack,0);assert.equal(s.equipment.items.length,4);
});
test('migração converte componentes antigos sem dobrar bônus e mantém identidades e slots',()=>{
 const s=migrate({version:3,level:10,kills:50,essence:30,village:{founded:true,artisan:true,weapon:2,armor:3,buildings:{workshop:2}},inventory:[{uid:7,skill:'heat',rank:2},{uid:9,skill:'heat',rank:8}],equipped:['heat']});
 assert.equal(s.version,4);assert.equal(s.equipment.items.length,2);assert.equal(effects(s).damageBonus,1+.16+(.2*(1+7*.18)));assert.ok(Math.abs(gearBonuses(s).defense-.15)<1e-10);assert.equal(skillRank(s,'heat'),8);
 assert.deepEqual(migrate(JSON.parse(JSON.stringify(s))),s);
 const ids=[...s.inventory,...s.equipment.items].map(i=>i.instanceId);assert.equal(new Set(ids).size,ids.length);
});
test('mercador vende apenas uma cópia livre, preserva descobertas e impede venda repetida',()=>{
 const s=fresh();s.village.founded=true;const a=addItem(s,'heat',2),b=addItem(s,'heat',1);equipSkillItem(s,a.uid,0);
 const before=JSON.stringify(s);assert.equal(sellItem(s,'skill',a.uid,true).ok,false);assert.equal(JSON.stringify(s),before);
 b.favorite=true;assert.equal(sellItem(s,'skill',b.uid,true).ok,false);b.favorite=false;
 assert.equal(sellItem(s,'skill',b.uid,true).ok,true);assert.equal(s.coins,8);assert.equal(sellItem(s,'skill',b.uid,true).ok,false);assert.equal(s.coins,8);assert.equal(s.unlocked.heat,true);assert.equal(s.skillSlots[0],a.uid);
 const gear=addGear(s,'armor',2);equipGear(s,gear.uid);assert.equal(sellItem(s,'gear',gear.uid,true).ok,false);equipGear(s,gear.uid);assert.equal(sellItem(s,'gear',gear.uid,true).ok,true);assert.equal(s.coins,88);
});
test('compras não cobram saldo insuficiente; materiais e runas chegam à mochila',()=>{
 const s=fresh();s.coins=200;assert.equal(purchaseOffer(s,'0:rune-1',true,0).ok,false);s.village.founded=true;assert.equal(purchaseOffer(s,'0:rune-1',true,0).ok,true);assert.equal(s.coins,120);assert.equal(s.inventory[0].origin,'merchant');assert.equal(purchaseOffer(s,'0:invalid',true,0).ok,false);assert.equal(purchaseOffer(s,'0:material-ore',true,0).ok,true);assert.equal(s.village.materials.ore,5);assert.equal(s.coins,90);s.coins=10;const before=JSON.stringify(s);assert.equal(purchaseOffer(s,'0:material-ore',true,0).ok,false);assert.equal(purchaseOffer(s,'0:rune-1',true,0).ok,false);assert.equal(JSON.stringify(s),before);
});
test('forja entrega cópias independentes e preserva moedas e materiais em falha',()=>{
 const s=fresh();s.village.founded=true;s.village.artisan=true;s.village.buildings.workshop=2;s.coins=1000;for(const id of Object.keys(s.village.materials))s.village.materials[id]=100;
 assert.equal(craftGear(s,'charm'),true);assert.equal(craftGear(s,'charm'),true);assert.equal(s.equipment.items.length,2);assert.equal(s.equipment.slots.charm,null);assert.notEqual(s.equipment.items[0].instanceId,s.equipment.items[1].instanceId);assert.equal(s.equipment.items[0].tier,2);
 s.village.materials.iron=0;const before=JSON.stringify(s);assert.equal(craftGear(s,'weapon'),false);assert.equal(JSON.stringify(s),before);
});
test('migração repara IDs duplicados sem permitir duas referências à mesma instância',()=>{
 const s=fresh(),a=addItem(s,'heat');addItem(s,'bat');s.inventory[1].instanceId=a.instanceId;s.inventory[1].uid=a.uid;
 const g=addGear(s,'armor');g.instanceId=a.instanceId;g.uid=a.uid;
 const loaded=migrate(s),all=[...loaded.inventory,...loaded.equipment.items];assert.equal(new Set(all.map(i=>i.uid)).size,all.length);assert.equal(new Set(all.map(i=>i.instanceId)).size,all.length);
 assert.deepEqual(migrate(loaded),loaded);
});
