import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mapGuides,regionResources,regionSkills} from '../src/map-guide.ts';
import {mapMarkup} from '../src/map-ui.ts';
import {actorSizes,actorLayout,contactReach} from '../src/actor-sizes.ts';
import {spriteFiles} from '../src/asset-paths.ts';
import {readFileSync} from 'node:fs';

test('cada mapa usa uma seção selecionável e o mesmo conjunto de informações',()=>{
 for(const initial of ['cave','forest'] as const){const html=mapMarkup(initial,false);assert.match(html,new RegExp(`id="atlas-${initial}" role="tabpanel" aria-labelledby="map-tab-${initial}" >`));assert.equal((html.match(/role="tabpanel"/g)||[]).length,2);assert.equal((html.match(/<dt>Monstros<\/dt>/g)||[]).length,13);assert.equal((html.match(/<dt>Recursos<\/dt>/g)||[]).length,13);assert.equal((html.match(/<dt>Absorções<\/dt>/g)||[]).length,13);assert.equal((html.match(/data-map-destination=/g)||[]).length,13);assert.equal((html.match(/id="expedition"/g)||[]).length,1);}
 assert.equal(mapGuides.cave.regions.length,7);assert.equal(mapGuides.forest.regions.length,6);
});
test('guia mostra loot real por habitat, raridades e absorções da espécie',()=>{
 assert.equal(regionResources('forest',2).some(r=>r.id==='ore'),false);assert.ok(regionResources('forest',3).some(r=>r.id==='ore'));assert.ok(regionResources('cave',3).some(r=>r.id==='silk'));assert.ok(regionResources('cave',4).some(r=>r.id==='scale'&&r.rare));assert.ok(regionResources('forest',1).some(r=>r.id==='herbs'&&!r.rare));
 assert.ok(regionSkills('cave',3).includes('Fio de aço'));assert.deepEqual(regionSkills('forest',2),['Instinto caçador','Presa venenosa']);assert.equal(mapGuides.cave.regions[6].interest,'Veldora: encontro amistoso');
});
test('proporções distinguem criaturas pequenas, grandes e chefes sem alterar a escala entre poses',()=>{
 const size=actorSizes;assert.ok(size.wisp.width<size.slime.width);assert.ok(size.mushroom.width<size.slime.width);assert.ok(size.wolf.width>size.slime.width*2);assert.ok(size.armorsaurus.width>size.wolf.width);assert.ok(size.serpent.width>size.snake.width);assert.ok(size.guardian.width>size.armorsaurus.width);assert.ok(size.caveBoss.width>size.serpent.width*1.7);
 for(const [key,file] of Object.entries(spriteFiles)){const atlas=JSON.parse(readFileSync(new URL('../public/assets/sprites/'+file+'.json',import.meta.url),'utf8')),neutral=atlas.frames[key==='slime'?'idle-0':'0'].frame,layout=actorLayout(key,neutral);assert.ok(layout.barOffset>layout.height);assert.equal(layout.shadowWidth,layout.radius*2);assert.ok(contactReach(layout.radius)>layout.radius+size.slime.radius);assert.ok(Number.isFinite(layout.height)&&layout.height>0);}
 assert.ok(contactReach(size.guardian.radius)+8<=100);assert.ok(contactReach(size.caveBoss.radius)+8<=115);
});
