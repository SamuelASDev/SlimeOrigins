import Phaser from 'phaser';
import {CELL,CAVE_WIDTH,CAVE_HEIGHT,caveGround,center,sectors} from './cave-map';
import {cavePillars,caveProps,cavePools,caveTrail,caveSeal} from './cave-layout';
export function drawCavern(scene:Phaser.Scene){
 const g=scene.add.graphics().setDepth(-30),r=new Phaser.Math.RandomDataGenerator(['sealed-cave-harmony-v4']);
 const has=(x:number,y:number)=>caveGround.has(`${x},${y}`),rocks=new Set<string>();
 g.fillStyle(0x0b1420).fillRect(0,0,CAVE_WIDTH,CAVE_HEIGHT);
 for(const tile of caveGround){const [tx,ty]=tile.split(',').map(Number);for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(!has(tx+dx,ty+dy))rocks.add(`${tx+dx},${ty+dy}`);}
 for(const tile of rocks){const [tx,ty]=tile.split(',').map(Number),x=tx*CELL,y=ty*CELL;
  g.fillStyle(r.pick([0x182536,0x1a293a,0x1d2d3d])).fillPoints([{x:x-3,y:y+4},{x:x+19,y:y-3},{x:x+34,y:y+9},{x:x+30,y:y+33},{x:x-2,y:y+28}],true);
  g.lineStyle(1,0x526171,.28).lineBetween(x+5,y+6,x+25,y+9);
 }
 for(const tile of caveGround){const [tx,ty]=tile.split(',').map(Number),x=tx*CELL,y=ty*CELL,trail=caveTrail.has(tile);
  g.fillStyle(r.pick(trail?[0x354653,0x374853,0x364752]:[0x2c3c4b,0x2d3d4c,0x2e3e4d])).fillRect(x,y,CELL,CELL);
  const noise=r.frac();if(noise>.55){g.fillStyle(0x85929a,.12).fillRect(x+5,y+10,r.between(6,15),1);g.fillStyle(0x192a39,.22).fillRect(x+12,y+23,10,2);}
  if(noise>.985)g.lineStyle(1,0x1b2c3b,.5).lineBetween(x+4,y+5,x+13,y+14).lineBetween(x+13,y+14,x+9,y+24);
  if(!has(tx,ty-1)){g.fillStyle(0x142332).fillRect(x,y,32,17);g.fillStyle(0x526576).fillRect(x,y+15,32,3);g.fillStyle(0x87959e,.4).fillRect(x+5,y+15,18,1);}
  if(!has(tx-1,ty))g.fillStyle(0x142433,.65).fillRect(x,y,6,32);
  if(!has(tx+1,ty))g.fillStyle(0x122231,.6).fillRect(x+26,y,6,32);
  if(!has(tx,ty+1))g.fillStyle(0x728493,.35).fillRect(x,y+29,32,3);
 }
 // Low-contrast mineral seams and moist banks give each chamber a focal point.
 for(const pool of cavePools){const {x,y,width:w,height:h}=pool;
  g.fillStyle(0x1b3440).fillEllipse(x,y,w+26,h+18);g.fillStyle(0x29505c).fillEllipse(x,y,w,h);g.fillStyle(0x386c75).fillEllipse(x-7,y-4,w*.84,h*.78);g.fillStyle(0x568c90,.32).fillEllipse(x-25,y-13,w*.55,h*.45);
  for(let n=0;n<16;n++){const dx=r.between(-w*.3,w*.3),dy=r.between(-h*.22,h*.22);g.fillStyle(0xa0cac8,.32).fillRect(x+dx,y+dy,r.between(5,18),1);}
  scene.add.text(x,y+h/2+18,pool.zone===0?'NASCENTE RASA · HIPOKUTE':'ÁGUAS DOS ECOS',{fontFamily:'monospace',fontSize:'8px',color:'#8eb4b6',letterSpacing:1}).setOrigin(.5).setDepth(-5);
 }
 const prop=(p:typeof caveProps[number])=>{const image=scene.add.image(p.x,p.y,'caveProps',p.frame).setOrigin(.5,1).setDepth(p.y/100-.02);image.setScale(p.width/image.frame.cutWidth);
  g.fillStyle(0x142836,.36).fillEllipse(p.x,p.y-3,p.width*.82,p.width*.2);
 };
 for(const p of cavePillars)prop(p);
 for(const p of caveProps){if(p.frame==='ore')for(let n=2;n>0;n--)g.fillStyle(0x64b2c7,.025).fillEllipse(p.x,p.y-15,p.width*n,p.width*n*.45);prop(p);}
 for(let i=0;i<sectors.length;i++){
  const c=center(i);
  scene.add.text(c.x,c.y-345,`${String(i+1).padStart(2,'0')} / ${sectors[i].name.toUpperCase()}`,{fontFamily:'monospace',fontSize:'9px',color:'#9eacb5',letterSpacing:1}).setOrigin(.5).setDepth(-5);
  // A subtle worn centre and a small waypoint orient without filling the arena.
  g.fillStyle(i===4?0x172536:0x758493,i===4?.25:.035).fillEllipse(c.x,c.y,170,i===4?120:90);
  g.lineStyle(1,0x91a9af,.25).strokeCircle(c.x,c.y,24);
  if(i<6){const nx=c.x+220,ny=c.y-18;g.fillStyle(0x9baba7,.45).fillTriangle(nx-6,ny-5,nx+2,ny,nx-6,ny+5);scene.add.text(nx+8,ny-4,String(i+2).padStart(2,'0'),{fontFamily:'monospace',fontSize:'8px',color:'#8da4aa'}).setDepth(-5);}
  if(i===4){for(let n=0;n<5;n++){g.fillStyle(0xa6a997,.28).fillRect(c.x+95+n*18,c.y+115+(n%2)*4,8,2);}}
 }
 const seal=caveSeal,sx=seal.x,sy=seal.y;
 for(let n=3;n>0;n--)g.fillStyle(0x5cbedb,.022).fillEllipse(sx,sy+25,seal.width+n*30,seal.height+n*15);
 g.lineStyle(1,0x76c9df,.65).strokeEllipse(sx,sy+25,seal.width,seal.height).strokeEllipse(sx,sy+25,seal.width-20,seal.height-12);
 for(let n=0;n<12;n++){const a=n*Math.PI/6;g.lineStyle(1,0xa8e0f0,.7).strokeRect(sx+Math.cos(a)*seal.width/2-3,sy+25+Math.sin(a)*seal.height/2-3,6,6);}
 const dragon=scene.add.image(sx,sy+70,'veldora').setOrigin(.5,1).setDepth((sy+70)/100);dragon.setScale(seal.dragonWidth/dragon.frame.cutWidth);
 scene.add.text(sx,sy+113,'VELDORA · PRISÃO INFINITA',{fontFamily:'monospace',fontSize:'9px',color:'#afd7e2',letterSpacing:1}).setOrigin(.5).setDepth((sy+114)/100);
 // One pixel of overlap prevents hairline gaps between chunks at fractional zoom.
 for(let y=0;y<CAVE_HEIGHT;y+=1024)for(let x=0;x<CAVE_WIDTH;x+=1024){
  const chunk=scene.add.renderTexture(x,y,Math.min(1025,CAVE_WIDTH-x),Math.min(1025,CAVE_HEIGHT-y)).setOrigin(0,0).setDepth(-30).draw(g,-x,-y);
  chunk.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
 }
 g.destroy();
}
