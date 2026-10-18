import {skillOrder,skillIcon,gearIcon,supplyIcon,resourceOrder} from '../src/item-icons.ts';
import {materialIds} from '../src/resources.ts';
import {skillIds} from '../src/model.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spriteFiles } from '../src/asset-paths.ts';

const dir = new URL('../public/assets/sprites/', import.meta.url);
test('todos os atlas têm PNG correspondente e recortes válidos', () => {
  for (const [name, file] of Object.entries(spriteFiles)) {
    const png = readFileSync(new URL(`${file}.png`, dir));
    const atlas = JSON.parse(readFileSync(new URL(`${file}.json`, dir), 'utf8'));
    assert.equal(atlas.meta.image, `${file}.png`);
    assert.equal(png.toString('ascii', 1, 4), 'PNG');
    assert.equal(png.readUInt32BE(16), atlas.meta.size.w);
    assert.equal(png.readUInt32BE(20), atlas.meta.size.h);
    assert.equal(Object.keys(atlas.frames).length, name === 'slime' ? 15 : 4);
    for (const [key, value] of Object.entries(atlas.frames) as [string, any][]) {
      const { frame, sourceSize, spriteSourceSize } = value;
      assert.ok(frame.w > 0 && frame.h > 0, `${name}/${key}: nonempty`);
      assert.ok(frame.x >= 0 && frame.y >= 0 && frame.x + frame.w <= atlas.meta.size.w && frame.y + frame.h <= atlas.meta.size.h, `${name}/${key}: source bounds`);
      assert.ok(spriteSourceSize.x >= 0 && spriteSourceSize.y >= 0 && spriteSourceSize.x + frame.w <= sourceSize.w && spriteSourceSize.y + frame.h <= sourceSize.h, `${name}/${key}: trimmed bounds`);
    }
  }
});
test('slime servido no jogo é uma cópia exata do arquivo original', () => {
  const sources = new URL('../Sprites/', import.meta.url);
  const source = readdirSync(sources).find(name => name.endsWith('.png'))!;
  const hash = (data: Buffer) => createHash('sha256').update(data).digest('hex');
  assert.equal(hash(readFileSync(new URL(source, sources))), hash(readFileSync(new URL('slime.png', dir))));
});

test('sprites da vila possuem quatro poses completas e metadados coerentes', () => {
 for (const name of ['kaijin','benimaru','shuna','myourmiles']) {
  const file=`npc-${name}-anime-${name==='myourmiles'?'v1':'v2'}`;
  const png=readFileSync(new URL(`${file}.png`,dir));
  const atlas=JSON.parse(readFileSync(new URL(`${file}.json`,dir),'utf8'));
  assert.equal(png.readUInt32BE(16),atlas.meta.size.w);
  assert.equal(png.readUInt32BE(20),atlas.meta.size.h);
  assert.deepEqual(Object.keys(atlas.frames),['0','1','2','3']);
  const logical=atlas.frames['0'].sourceSize;
  for(const [key,item] of Object.entries(atlas.frames) as [string,any][]){
   assert.deepEqual(item.sourceSize,logical,`${name}/${key}: animation scale`);
   const {x,y,w,h}=item.frame;
   assert.ok(w>0&&h>0&&x>=0&&y>=0&&x+w<=atlas.meta.size.w&&y+h<=atlas.meta.size.h);
   const col=Number(key)%2,row=Math.floor(Number(key)/2);
   assert.ok(x>col*atlas.meta.size.w/2&&x+w<(col+1)*atlas.meta.size.w/2,`${name}/${key}: horizontal margin`);
   assert.ok(y>row*atlas.meta.size.h/2&&y+h<(row+1)*atlas.meta.size.h/2,`${name}/${key}: vertical margin`);
  }
 }
 const map=readFileSync(new URL('village-tempest-anime-v2.png',dir));
 assert.equal(map.readUInt32BE(16),1536);assert.equal(map.readUInt32BE(20),1024);
});

test('atlas de ícones cobrem todas as habilidades e variantes de equipamento',()=>{
 assert.deepEqual([...skillOrder].sort(),[...skillIds].sort());assert.equal(new Set(skillOrder).size,24);
 for(const id of skillIds)assert.match(skillIcon(id),/icon-skills/);
 for(const slot of ['weapon','armor','charm'] as const)for(const tier of [1,2,3])assert.match(gearIcon(slot,tier),/icon-items/);
 assert.deepEqual([...resourceOrder].sort(),[...materialIds].sort());
 for(const id of materialIds)assert.match(supplyIcon(id),/icon-resources/);
 const resources=readFileSync(new URL('icons-resources-anime-v1.png',dir));
 assert.equal(resources.readUInt32BE(16),resources.readUInt32BE(20));
 const skills=readFileSync(new URL('icons-skills-anime-v1.png',dir)),items=readFileSync(new URL('icons-items-anime-v1.png',dir));
 assert.equal(skills.readUInt32BE(16)*4,skills.readUInt32BE(20)*6);assert.equal(items.readUInt32BE(16),items.readUInt32BE(20));
});

test('atlas de Jura possui seis props completos com recortes dentro das células',()=>{
 const file='forest-decor-anime-v2',png=readFileSync(new URL(file+'.png',dir)),atlas=JSON.parse(readFileSync(new URL(file+'.json',dir),'utf8'));
 assert.equal(png.readUInt32BE(16),atlas.meta.size.w);assert.equal(png.readUInt32BE(20),atlas.meta.size.h);
 assert.deepEqual(Object.keys(atlas.frames),['oak','willow','iron','crystal','herbs','log']);
 for(const [i,item] of Object.values(atlas.frames).entries() as ArrayIterator<[number,any]>){const {x,y,w,h}=item.frame;assert.ok(w>0&&h>0);assert.ok(x>=i%3*512&&x+w<=(i%3+1)*512);assert.ok(y>=Math.floor(i/3)*512&&y+h<=(Math.floor(i/3)+1)*512);}
});
