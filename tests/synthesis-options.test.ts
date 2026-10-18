import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fresh,addItem,mix,skillIds,equipSkillItem,type State} from '../src/model.ts';
import {synthesisItems,synthesisSelection,inventoryFusions} from '../src/synthesis-options.ts';

test('registro de habilidades descobertas não cria ingredientes ou receitas sem cópias',()=>{
 const s=fresh();for(const id of skillIds)s.unlocked[id]=true;
 assert.deepEqual(synthesisItems(s),[]);assert.deepEqual(inventoryFusions(s),[]);assert.deepEqual(synthesisSelection(s,[17,29]),[0,0]);
 addItem(s,'heat');assert.equal(synthesisItems(s).length,1);assert.equal(inventoryFusions(s).length,0);
});
test('síntese usa duas cópias livres e respeita favorito, equipamento, nível e limite',()=>{
 const s=fresh(),a=addItem(s,'wolf',2),b=addItem(s,'wolf',2);assert.equal(inventoryFusions(s).length,1);assert.equal(inventoryFusions(s)[0].rank,3);
 a.favorite=true;assert.equal(inventoryFusions(s).length,0);assert.deepEqual(synthesisSelection(s,[a.uid,b.uid]),[0,b.uid]);a.favorite=false;
 equipSkillItem(s,a.uid,0);assert.equal(inventoryFusions(s).length,0);s.skillSlots=[null,null,null];
 b.rank=3;assert.equal(inventoryFusions(s).length,0);a.rank=9;b.rank=9;assert.equal(inventoryFusions(s).length,0);
});
test('ingredientes consumidos permanecem descobertos mas desaparecem da síntese',()=>{
 const s=fresh(),a=addItem(s,'beetle'),b=addItem(s,'mushroom');assert.equal(inventoryFusions(s)[0].skill,'adaptive');
 assert.ok(mix(s,a.uid,b.uid).ok);assert.ok(s.unlocked.beetle&&s.unlocked.mushroom);assert.deepEqual(synthesisItems(s).map(i=>i.skill),['adaptive']);assert.deepEqual(inventoryFusions(s),[]);assert.deepEqual(synthesisSelection(s,[a.uid,b.uid]),[0,0]);
});
test('sugestões não inventam duplicatas e toda prévia referencia itens atuais da mochila',()=>{
 const s=fresh();for(const id of ['spider','centipede','steel','waterBlade','heat','ultrasound','armorsaurus','strength'] as const)addItem(s,id,2);
 for(const p of inventoryFusions(s)){assert.ok(s.inventory.includes(p.a)&&s.inventory.includes(p.b));assert.notEqual(p.a.uid,p.b.uid);assert.equal(p.rank,2);}
 assert.equal(inventoryFusions(s).length,5);const uid=s.inventory[0].uid;assert.deepEqual(synthesisSelection(s,[uid,uid]),[uid,0]);s.inventory=[];assert.deepEqual(inventoryFusions(s),[]);
});
