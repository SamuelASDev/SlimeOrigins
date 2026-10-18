import {test} from 'node:test';
import assert from 'node:assert/strict';
import {forestRegions,forestCenter,forestFloor,forestWater,forestObstacles,forestNav,forestSpawnPoints,FOREST_WIDTH,FOREST_HEIGHT,CELL} from '../src/forest-map.ts';
import {fresh,migrate,awardKill,kinds,equipSkillItem,addItem} from '../src/model.ts';
import {resourceDrops} from '../src/resources.ts';
import {offlineReward} from '../src/journey.ts';
import {BackgroundExpedition} from '../src/activity.ts';
test('as seis regiões de Jura estão conectadas e as rotas respeitam água, raízes e rochas',()=>{
 for(let i=0;i<forestRegions.length;i++)for(let j=0;j<forestRegions.length;j++)if(i!==j){const start=forestCenter(i),end=forestCenter(j),path=forestNav.route(start,end);assert.ok(path.length);let last=start;for(const p of path){assert.ok(forestNav.walkable(p));assert.ok(forestNav.clearLine(last,p));last=p;}assert.deepEqual(last,end);}
 for(const tile of forestWater){const [x,y]=tile.split(',').map(Number);assert.equal(forestNav.walkable({x:x*CELL+16,y:y*CELL+16}),false);}
 for(const p of forestObstacles)assert.equal(forestNav.walkable({x:p.x*CELL+16,y:p.y*CELL+16}),false);
 for(const tile of forestFloor){const [x,y]=tile.split(',').map(Number);assert.ok(x>=0&&y>=0&&x*CELL<FOREST_WIDTH&&y*CELL<FOREST_HEIGHT);}
 assert.equal(forestNav.route({x:0,y:0},forestCenter(0)).length,0);
});
test('cada ponto de spawn é alcançável e cada região possui espécies e recursos válidos',()=>{
 for(let i=0;i<forestRegions.length;i++){const region=forestRegions[i],points=forestSpawnPoints(i);assert.ok(points.length>100);for(const k of region.monsters)assert.ok(kinds.includes(k));
  // Test every spawn tile via a flood fill, including both banks of the pond.
  const visited=new Set<string>(),queue=[forestCenter(i)];for(let at=0;at<queue.length;at++){const p=queue[at],key=`${p.x},${p.y}`;if(visited.has(key)||!forestNav.walkable(p))continue;visited.add(key);for(const [x,y] of [[32,0],[-32,0],[0,32],[0,-32]])queue.push({x:p.x+x,y:p.y+y});}
  for(const p of points)assert.ok(visited.has(`${p.x},${p.y}`));
 }
});
test('loot de Jura separa ambiente e partes da espécie, sem madeira no riacho ou minério nos lobos',()=>{
 const drops=(k:Parameters<typeof resourceDrops>[0],sector:number,roll=1)=>resourceDrops(k,roll,{area:'forest',sector});
 const has=(k:Parameters<typeof resourceDrops>[0],sector:number,id:string)=>drops(k,sector).some(d=>d.material===id);
 assert.ok(has('wolf',2,'hide'));assert.ok(has('wolf',2,'fang'));assert.ok(has('wolf',2,'timber'));assert.equal(has('wolf',2,'ore'),false);
 assert.ok(has('frog',1,'herbs'));assert.equal(has('frog',1,'timber'),false);assert.equal(has('frog',1,'ore'),false);
 assert.ok(has('beetle',3,'iron'));assert.ok(has('beetle',3,'ore'));assert.equal(has('beetle',0,'ore'),false);
 assert.ok(has('spider',4,'silk'));assert.equal(has('spider',4,'hide'),false);
 assert.ok(has('wisp',5,'crystal'));assert.equal(has('wisp',5,'timber'),false);
 assert.ok(drops('serpent',5,.1).some(d=>d.material==='scale'));assert.equal(drops('serpent',5,1).some(d=>d.material==='scale'),false);
 for(let i=0;i<forestRegions.length;i++)for(const k of forestRegions[i].monsters){const s=fresh(),out=awardKill(s,k,1,1,1,{area:'forest',sector:i});assert.deepEqual(out.materials,drops(k,i));for(const d of out.materials)assert.equal(s.village.materials[d.material],d.quantity);}
});
test('save preserva floresta e caverna independentemente e saneia índices inválidos',()=>{
 const old=migrate({version:4,level:10,kills:22,caveSector:4,visited:[0,4]});assert.equal(old.forestSector,0);assert.deepEqual(old.forestVisited,[0]);assert.equal(old.activeArea,'cave');assert.equal(old.caveSector,4);
 old.activeArea='forest';old.forestSector=3;old.forestVisited=[0,2,3];assert.deepEqual(migrate(old),old);
 const bad=migrate({...old,forestSector:999,forestVisited:[-1,0,2,2,6,'3'],activeArea:'bad'});assert.equal(bad.forestSector,5);assert.deepEqual(bad.forestVisited,[0,2]);assert.equal(bad.activeArea,'cave');
});
test('recompensas offline e expedição oculta conservam o habitat do checkpoint',()=>{
 const s=fresh();equipSkillItem(s,addItem(s,'wolf').uid,0);const c={at:1000,kind:'frog' as const,interval:5,enabled:true,context:{area:'forest' as const,sector:1}};
 const result=offlineReward(s,c,121000);assert.equal(result.kills,12);assert.equal(s.village.materials.herbs,12);assert.equal(s.village.materials.hide,12);assert.equal(s.village.materials.timber,0);
 const away=new BackgroundExpedition(c);assert.equal(away.claim(21000),2);assert.deepEqual(away.checkpoint(21000).context,c.context);
});
