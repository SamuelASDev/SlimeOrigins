import Phaser from 'phaser';
import { CELL, CAVE_WIDTH, CAVE_HEIGHT, floor, sectors, center, pillars } from './cave-map';

export class WorldScene extends Phaser.Scene {
  area: 'cave' | 'forest' = 'cave';
  mapObjects: Phaser.GameObjects.GameObject[] = [];
  drawMap() {
    this.mapObjects.forEach(o => o.destroy());
    const old = new Set(this.children.list);
    if (this.area === 'forest') this.drawForest(); else this.drawCave();
    this.mapObjects = this.children.list.filter(o => !old.has(o));
  }
  drawCave() {
    const g=this.add.graphics().setDepth(-30),r=new Phaser.Math.RandomDataGenerator(['sealed-cave-rich-v3']);
    g.fillStyle(0x070d18).fillRect(0,0,CAVE_WIDTH,CAVE_HEIGHT);
    const has=(x:number,y:number)=>floor.has(`${x},${y}`);
    const rocks=new Set<string>();
    for(const tile of floor){const [tx,ty]=tile.split(',').map(Number);for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(!has(tx+dx,ty+dy))rocks.add(`${tx+dx},${ty+dy}`);}
    // Uncut rock follows the chamber's irregular silhouette, leaving distant stone in darkness.
    for(const tile of rocks){const [tx,ty]=tile.split(',').map(Number),x=tx*CELL,y=ty*CELL;
      g.fillStyle(r.pick([0x141f30,0x172436,0x1c293c])).fillPoints([{x:x-4,y:y+3},{x:x+20,y:y-5},{x:x+36,y:y+12},{x:x+28,y:y+35},{x:x-3,y:y+29}],true);
      g.lineStyle(1,0x344359,.45).lineBetween(x+4,y+4,x+25,y+9);
      if(r.frac()>.72)g.fillStyle(0x3d4e61,.35).fillTriangle(x+8,y+9,x+25,y+13,x+14,y+22);
    }
    for(const tile of floor){const [tx,ty]=tile.split(',').map(Number),x=tx*CELL,y=ty*CELL;
      g.fillStyle(r.pick([0x293849,0x293949,0x2a394a,0x2a3849,0x293748])).fillRect(x,y,CELL,CELL);
      const noise=r.frac();
      if(noise>.35){g.fillStyle(0x667687,.13).fillRect(x+4,y+6,r.between(6,20),2);g.fillStyle(0x111f30,.22).fillRect(x+8,y+19,12,2);}
      if(noise>.96){g.lineStyle(1,0x142236,.4).lineBetween(x+2,y+4,x+12,y+13).lineBetween(x+12,y+13,x+7,y+25).lineBetween(x+12,y+13,x+23,y+17);}
      if(noise<.03){g.fillStyle(0x152333).fillEllipse(x+15,y+20,13,6);g.fillStyle(0x526174).fillRect(x+10,y+15,7,4);g.fillStyle(0x74818b,.6).fillRect(x+11,y+15,4,1);}
      if(!has(tx,ty-1)){g.fillStyle(0x0b1423,.85).fillRect(x,y,32,26);g.fillStyle(0x3a4b61).fillRect(x,y+20,32,5);g.fillStyle(0x66758a,.6).fillRect(x+r.between(0,8),y+20,20,2);}
      if(!has(tx-1,ty)){g.fillStyle(0x0b1828,.6).fillRect(x,y,9,32);g.fillStyle(0x4e6072,.4).fillRect(x+8,y+6,2,20);}
      if(!has(tx+1,ty))g.fillStyle(0x081421,.65).fillRect(x+25,y,7,32);
      if(!has(tx,ty+1))g.fillStyle(0x516277,.5).fillRect(x,y+28,32,4);
    }
    const prop=(frame:string,x:number,y:number,width:number,alpha=1)=>{
      const image=this.add.image(x,y,'caveDecor',frame).setOrigin(.5,1).setDepth(-8).setAlpha(alpha);image.setScale(width/image.frame.cutWidth);return image;
    };
    // Every formation has a shared base, one main silhouette and smaller satellites.
    // Decorations belong to banks, mineral outcrops or nest corners, never a scatter ring.
    const formation=(type:'ore'|'herbs'|'web',x:number,y:number,size=1)=>{
      g.fillStyle(type==='herbs'?0x24443f:0x182835,.65).fillEllipse(x,y-4,106*size,31*size);
      g.fillStyle(type==='herbs'?0x355d4d:0x344655,.32).fillEllipse(x-12*size,y-8,70*size,18*size);
      for(const [dx,dy,w] of [[-37,1,10],[32,3,13],[46,-4,7]]){
        g.fillStyle(0x172635).fillEllipse(x+dx*size,y+dy*size,w*size,5*size);
        g.fillStyle(0x55616a,.7).fillRect(x+(dx-3)*size,y+(dy-4)*size,w*.55*size,3*size);
      }
      if(type==='ore'){
        for(let glow=3;glow>0;glow--)g.fillStyle(0x58bed1,.018).fillEllipse(x,y-22*size,glow*40*size,glow*25*size);
        prop('0',x-9*size,y,55*size);prop('0',x+34*size,y+5*size,25*size,.9);
      }else if(type==='herbs'){
        prop('2',x-18*size,y,42*size,.9);prop('2',x+22*size,y+4*size,27*size,.85);
      }else prop('3',x,y,128*size,.78);
    };
    for(const [index,p] of pillars.entries()){
      const x=p.x*CELL+16,y=p.y*CELL+50;
      g.fillStyle(0x12232e,.6).fillEllipse(x,y-9,118,33);
      prop('1',x,y,index%3===0?105:88);
    }
    for(let i=0;i<sectors.length;i++){
      const c=center(i);
      this.add.text(c.x,c.y-355,`${String(i+1).padStart(2,'0')} / ${sectors[i].name.toUpperCase()}`,{fontFamily:'monospace',fontSize:'9px',color:'#7896ac',letterSpacing:1}).setOrigin(.5).setDepth(-10).setAlpha(.7);
      // Pools and wet banks echo the underground water from Rimuru's awakening.
      if(i<2){const px=c.x-240,py=c.y+110;
        g.fillStyle(0x102738).fillEllipse(px,py,350,180);g.fillStyle(0x1b4356).fillEllipse(px,py-3,325,157);g.fillStyle(0x2c5f70).fillEllipse(px-10,py-10,273,126);g.fillStyle(0x407f89,.35).fillEllipse(px-40,py-30,170,70);
        for(let n=0;n<25;n++){const x=px+r.between(-120,120),y=py+r.between(-45,45);g.fillStyle(0x9ccfd0,.24).fillRect(x,y,r.between(5,22),1);}
      }
      if(i<2){
        // Vegetation follows the waterline; ore grows at the dry opposite rock face.
        for(const [dx,dy,size] of [[-355,58,.85],[-315,192,1.1],[-128,168,.75],[-88,82,.6]])formation('herbs',c.x+dx,c.y+dy,size);
        formation('ore',c.x+310,c.y-145,.95);
        formation('ore',c.x+425,c.y+205,.65);
      }else if(i===2){
        formation('ore',c.x-315,c.y-140,1.35);
        formation('ore',c.x-390,c.y-220,.7);
        formation('ore',c.x+320,c.y+240,1.1);
        formation('ore',c.x+400,c.y+175,.65);
      }else if(i===3){
        formation('web',c.x-310,c.y-135,1.2);
        formation('web',c.x+310,c.y+245,1.15);
        formation('web',c.x+420,c.y-205,.8);
        formation('ore',c.x-425,c.y+205,.55);
      }else if(i===4){
        formation('ore',c.x-315,c.y-140,1);
        formation('ore',c.x-390,c.y-205,.6);
        formation('ore',c.x+330,c.y+240,.8);
      }else if(i===5){
        formation('ore',c.x+315,c.y-140,1.1);
        formation('ore',c.x-320,c.y+240,.8);
      }else{
        formation('ore',c.x-320,c.y-145,.8);
        formation('ore',c.x+395,c.y+235,.65);
      }
      // A few roots hang together above the damp bank, not across every chamber.
      if(i<2)for(const dx of [-390,-378,-362]){
        const x=c.x+dx,y=c.y-305;
        g.lineStyle(2,0x3d514d,.8).lineBetween(x,y,x+6,y+23).lineBetween(x+6,y+23,x-4,y+34);
      }
      if(i===4){g.fillStyle(0x0c1825,.65).fillEllipse(c.x+170,c.y+30,260,110);for(let n=0;n<7;n++){g.fillStyle(0xa2a28e,.35).fillRect(c.x+100+n*24,c.y+70+(n%3)*6,12,3);}}
    }
    // The seal and dragon remain scenery, never a hostile target.
    const seal=center(6),sx=seal.x+230,sy=seal.y;
    for(let n=4;n>0;n--)g.fillStyle(0x5cbedb,.025).fillCircle(sx,sy,n*65);
    g.lineStyle(2,0x73cde8,.7).strokeCircle(sx,sy,160).strokeCircle(sx,sy,147).strokeEllipse(sx,sy,380,112);
    for(let n=0;n<16;n++){const a=n*Math.PI/8;g.lineStyle(1,0xa8e0f0,.65).strokeRect(sx+Math.cos(a)*154-4,sy+Math.sin(a)*154-4,8,8);}
    this.add.image(sx,sy-60,'veldora').setDisplaySize(320,300).setDepth(-7).setAlpha(.88);
    this.add.text(sx,sy+165,'VELDORA · PRISÃO INFINITA',{fontFamily:'monospace',fontSize:'10px',color:'#b1ddeb',letterSpacing:2}).setOrigin(.5).setDepth(-6);
    // Bake static geometry once into modest textures. Off-screen chunks can be culled,
    // rather than replaying the entire cavern's graphics commands every frame.
    for(let y=0;y<CAVE_HEIGHT;y+=1024)for(let x=0;x<CAVE_WIDTH;x+=1024){
      this.add.renderTexture(x,y,Math.min(1024,CAVE_WIDTH-x),Math.min(1024,CAVE_HEIGHT-y)).setOrigin(0,0).setDepth(-30).draw(g,-x,-y);
    }
    g.destroy();
  }
  drawForest() {
    const g = this.add.graphics(); const rand = new Phaser.Math.RandomDataGenerator(['slime-clearing']);
    for (let y = 0; y < 480; y += 16) for (let x = 0; x < 800; x += 16) {
      g.fillStyle(rand.pick([0x365639, 0x385b3d, 0x3b5d3d, 0x3c603f]), 1).fillRect(x, y, 16, 16);
      if (rand.frac() > .55) { g.fillStyle(0x678052, .45).fillRect(x + rand.between(1, 13), y + rand.between(1, 13), 2, 3); }
    }
    // A winding earth path and a shallow pool make the clearing readable.
    for (let x = 0; x < 800; x += 8) { const y = 260 + Math.sin(x / 110) * 38; g.fillStyle(0x7e7950).fillRect(x, y, 8, 38); g.fillStyle(0x989062, .4).fillRect(x, y + 4, 6, 3); }
    g.fillStyle(0x294b42).fillRect(540, 65, 142, 65).fillRect(556, 49, 105, 96);
    g.fillStyle(0x568a7e).fillRect(548, 72, 125, 50).fillRect(563, 57, 89, 78);
    for (let i = 0; i < 12; i++) g.fillStyle(0x8ec0a1, .5).fillRect(rand.between(565, 650), rand.between(76, 115), 12, 2);
    // Border trees are outside the walkable clearing.
    const tree = (x: number, y: number) => { g.fillStyle(0x1b3529, .45).fillEllipse(x + 5, y + 30, 54, 17); g.fillStyle(0x634d31).fillRect(x - 5, y, 10, 29); g.fillStyle(0x203e2c).fillRect(x - 25, y - 20, 50, 30).fillRect(x - 17, y - 32, 34, 18); g.fillStyle(0x2c5034).fillRect(x - 22, y - 26, 40, 25).fillRect(x - 12, y - 37, 25, 22); g.fillStyle(0x456640).fillRect(x - 13, y - 32, 18, 6).fillRect(x - 21, y - 14, 13, 5); };
    for (let x = 12; x < 820; x += 43) { tree(x, 28 + rand.between(-8, 8)); tree(x, 468 + rand.between(-7, 7)); }
    for (let y = 70; y < 450; y += 43) { tree(12, y); tree(788, y); }
    for (let i = 0; i < 65; i++) { const x = rand.between(55, 740), y = rand.between(65, 425); g.fillStyle(rand.pick([0xcbb88b, 0xb2c887, 0x9aafc4]), .8).fillRect(x, y, 2, 2); }
    g.fillStyle(0x89927a).fillRect(165, 106, 24, 15).fillRect(172, 99, 13, 8); g.fillStyle(0xaab098).fillRect(172, 101, 10, 3);
    this.add.text(24, 450, 'FLORESTA DE JURA · CLAREIRA I', { fontFamily: 'monospace', fontSize: '9px', color: '#b4c7a3' }).setDepth(30);
  }
}
