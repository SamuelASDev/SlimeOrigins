import {equipGear} from '../src/equipment.ts';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fresh,migrate,awardKill,effects} from '../src/model.ts';
import {foundVillage,recruitArtisan,upgradeBuilding,craftGear,brewTonic,buildingIds,materialIds} from '../src/village.ts';
test('fundação e recrutamento exigem marcos e recompensas só são concedidas uma vez',()=>{
 const s=fresh();assert.equal(foundVillage(s),false);s.kills=10;assert.equal(foundVillage(s),true);assert.equal(s.village.materials.timber,24);assert.equal(foundVillage(s),false);assert.equal(s.village.materials.timber,24);
 assert.equal(recruitArtisan(s),false);s.kills=20;assert.equal(recruitArtisan(s),true);assert.equal(recruitArtisan(s),false);
});
test('caça fornece materiais coerentes e laboratório melhora a absorção sem remover a garantia',()=>{
 const s=fresh();awardKill(s,'spider',.99,0);assert.equal(s.village.materials.silk,1);assert.equal(s.village.materials.timber,1);
 awardKill(s,'armorsaurus',.99,0);assert.equal(s.village.materials.ore,1);
 s.village.buildings.lab=3;assert.ok(awardKill(s,'bat',.30,0).item);assert.equal(effects(s).haste,1.15);
});
test('construções cobram materiais, respeitam limites e componentes exigem artesão e oficina',()=>{
 const s=fresh();s.kills=20;foundVillage(s);assert.equal(craftGear(s,'weapon'),false);
 assert.equal(upgradeBuilding(s,'workshop'),true);assert.equal(s.village.materials.timber,16);assert.equal(craftGear(s,'weapon'),false);recruitArtisan(s);
 s.coins=10000;for(const id of materialIds)s.village.materials[id]=1000;
 assert.equal(craftGear(s,'weapon'),true);assert.equal(craftGear(s,'weapon'),true);assert.equal(s.equipment.items.length,2);assert.equal(effects(s).damageBonus,1);equipGear(s,s.equipment.items[0].uid);
 for(const id of buildingIds){while(s.village.buildings[id]<3)assert.equal(upgradeBuilding(s,id),true);const before=JSON.stringify(s);assert.equal(upgradeBuilding(s,id),false);assert.equal(JSON.stringify(s),before);}
 assert.equal(craftGear(s,'armor'),true);assert.ok(effects(s).damageBonus>1);assert.ok(effects(s).defense>0);assert.ok(effects(s).regen>0);
});
test('tônico não acumula, expira e vila inteira persiste na migração',()=>{
 const s=fresh();s.village.buildings.alchemy=1;s.village.materials.herbs=20;assert.equal(brewTonic(s,1000),true);assert.equal(brewTonic(s,2000),false);assert.equal(s.village.materials.herbs,12);assert.equal(brewTonic(s,601001),true);
 assert.deepEqual(migrate(JSON.parse(JSON.stringify(s))),s);
 const old=migrate({version:3,level:15,inventory:[],equipped:[]});assert.equal(old.level,15);assert.equal(old.village.founded,false);
});
