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
 for (const name of ['kaijin','benimaru','shuna']) {
  const file=`npc-${name}-anime-v2`;
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
