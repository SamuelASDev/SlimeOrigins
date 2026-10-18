import {forestEdgeTrees,forestDecorations} from './forest-layout';
import Phaser from 'phaser';
import {CELL,FOREST_WIDTH,FOREST_HEIGHT,forestGround,forestPaths,forestWater,forestRegions,forestCenter,forestObstacles} from './forest-map';
export function drawJura(scene:Phaser.Scene){
 const g=scene.add.graphics().setDepth(-30),r=new Phaser.Math.RandomDataGenerator(['great-jura-forest-v1']);
 g.fillStyle(0x1b3b2b).fillRect(0,0,FOREST_WIDTH,FOREST_HEIGHT);
 for(const tile of forestGround){if(forestWater.has(tile))continue;const [tx,ty]=tile.split(',').map(Number),x=tx*CELL,y=ty*CELL,path=forestPaths.has(tile);
  g.fillStyle(r.pick(path?[0x7b7351,0x817957,0x78724d]:[0x345a3e,0x365d40,0x385e40,0x32583d])).fillRect(x,y,CELL,CELL);
  if(r.frac()>.5){g.fillStyle(path?0xb1a17a:0x759a56,.35).fillRect(x+r.between(3,24),y+r.between(3,23),r.between(3,8),2);}
  if(!path&&r.frac()>.78)g.fillStyle(0x92aa68,.35).fillRect(x+10,y+14,2,5).fillRect(x+13,y+12,2,4);

 }
 // Water tiles share the collision model. A five-tile dry crossing remains traversable.
 for(const tile of forestWater){const [tx,ty]=tile.split(',').map(Number),x=tx*CELL,y=ty*CELL;
  g.fillStyle(r.pick([0x245960,0x265c63,0x285f65])).fillRect(x,y,CELL,CELL);if(r.frac()>.4)g.fillStyle(0x83bbb1,.4).fillRect(x+7,y+12,r.between(8,17),1);
 }
 const prop=(frame:string,x:number,y:number,width:number)=>{const im=scene.add.image(x,y,'forestDecor',frame).setOrigin(.5,1).setDepth(y/100-.02);im.setScale(width/im.frame.cutWidth);return im;};
 // Evenly spaced trunks; no duplicate tree canopy around obstacle holes.
 for(const p of forestEdgeTrees){g.fillStyle(0x102f23,.3).fillEllipse(p.x,p.y-3,80,20);prop(p.frame,p.x,p.y,p.width);}
 for(const p of forestDecorations)prop(p.frame,p.x,p.y,p.width);
 for(const p of forestObstacles){const x=p.x*CELL+16,y=p.y*CELL+48;g.fillStyle(0x102d29,.65).fillEllipse(x,y-8,125,35);prop(p.frame,x,y,p.frame==='oak'||p.frame==='willow'?146:110);}
 for(let i=0;i<forestRegions.length;i++){
  const c=forestCenter(i),region=forestRegions[i];
  scene.add.text(c.x,c.y-380,`${String(i+1).padStart(2,'0')} / ${region.name.toUpperCase()}`,{fontFamily:'monospace',fontSize:'10px',color:'#bfd3a1',letterSpacing:1}).setOrigin(.5).setDepth(-6);
  if(i===4){for(const p of forestObstacles.filter(p=>p.zone===4)){
   const x=p.x*CELL+16,y=p.y*CELL+24;
   g.lineStyle(1,0xb7cfbc,.42);for(let n=0;n<=4;n++)g.lineBetween(x-36+n*18,y-48,x,y);for(let n=1;n<=3;n++){const k=n/3;g.lineBetween(x-36*k,y-48*k,x+36*k,y-48*k);}
  }}
  if(i===5){for(let j=0;j<14;j++){const x=c.x+r.between(-350,350),y=c.y+r.between(-230,230);g.fillStyle(0xb7ecce,.6).fillRect(x,y,2,2);}}
  // Signposts sit next to the trail, with resource hints matching the real loot table.
  g.fillStyle(0x493a29).fillRect(c.x+66,c.y+58,5,28);g.fillStyle(0x8c7549).fillRect(c.x+41,c.y+49,57,18);
  scene.add.text(c.x+69,c.y+53,String(i+1).padStart(2,'0')+' JURA',{fontFamily:'monospace',fontSize:'8px',color:'#eddfb2'}).setOrigin(.5,0).setDepth(-5);
 }
 // Bake geometry in chunks once; generated props remain individual culled images.
 for(let y=0;y<FOREST_HEIGHT;y+=1024)for(let x=0;x<FOREST_WIDTH;x+=1024)scene.add.renderTexture(x,y,Math.min(1024,FOREST_WIDTH-x),Math.min(1024,FOREST_HEIGHT-y)).setOrigin(0,0).setDepth(-30).draw(g,-x,-y);
 g.destroy();
}
