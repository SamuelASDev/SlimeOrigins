import Phaser from 'phaser';
import type { Building, Village } from './village';

export const VILLAGE_WIDTH=1600,VILLAGE_HEIGHT=1120;
const places:{id:Building;x:number;y:number;name:string;person:string;color:number}[]=[
 {id:'workshop',name:'Forja de Kaijin',person:'Kaijin · fabricar',x:440,y:530,color:0xc47549},
 {id:'lab',name:'Salão de Benimaru',person:'Benimaru · analisar',x:800,y:370,color:0xb74742},
 {id:'alchemy',name:'Jardim de Shuna',person:'Shuna · alquimia',x:1160,y:530,color:0xe6acbd},
];
/** Pixel geometry stays crisp at the same four-pixel grid throughout the settlement. */
export class VillageMap extends Phaser.Scene {
 private down:{lastX:number;lastY:number;distance:number}|null=null;
 private labels=new Map<Building,Phaser.GameObjects.Text>();
 constructor(private readVillage:()=>Village,private openBuilding:(id:Building)=>void){super('VillageMap');}
 create(){
  const g=this.add.graphics();
  const rect=(x:number,y:number,w:number,h:number,c:number)=>{g.fillStyle(c);g.fillRect(x,y,w,h);};
  rect(0,0,1600,1120,0x416446);
  for(let y=0;y<1120;y+=16)for(let x=0;x<1600;x+=16){const n=(x*13+y*7)%101;if(n<24)rect(x,y,8,4,n<12?0x52764b:0x385d40);}
  // River, embankments and a bridge into the southern gate.
  rect(0,900,1600,144,0x283e3e);rect(0,912,1600,116,0x397b87);
  for(let x=0;x<1600;x+=44)for(let y=924;y<1020;y+=28)rect(x+(y%16),y,24,4,0x68a5aa);
  rect(740,860,120,220,0x655344);for(let y=864;y<1080;y+=16)rect(744,y,112,10,0xb79b6a);
  rect(764,320,72,560,0xb5a580);rect(380,568,844,64,0xb5a580);
  rect(644,612,312,160,0x8d927d);
  for(let y=616;y<772;y+=20)for(let x=648;x<956;x+=28)rect(x,y,24,16,(x+y)%3?0xa7a58c:0xb6b198);
  for(const p of places){
   const x=p.x-108,y=p.y-176;
   rect(x+12,y+30,224,180,0x2c483b);rect(x,y,216,184,0xd7c5a0);
   rect(x,y+80,216,12,0x715344);rect(x+16,y+64,12,120,0x715344);rect(x+188,y+64,12,120,0x715344);
   for(let r=0;r<7;r++){const w=264-r*20;rect(p.x-w/2,y-24+r*12,w,12,r%2?0x344f65:0x466e83);}
   rect(x+88,y+120,40,64,0x483e37);rect(x+36,y+110,32,32,0x415761);rect(x+148,y+110,32,32,0x415761);
   rect(x+40,y+114,24,4,0xb5d1ca);rect(x+152,y+114,24,4,0xb5d1ca);
   this.add.text(p.x,y+76,p.name,{fontFamily:'monospace',fontSize:'12px',color:'#fff1ca',backgroundColor:'#293f3b',padding:{x:6,y:5}}).setOrigin(.5);
   this.labels.set(p.id,this.add.text(p.x,p.y+108,'',{fontFamily:'monospace',fontSize:'12px',color:'#e9d7a9',backgroundColor:'#21352f',padding:{x:10,y:6}}).setOrigin(.5));
   const npc=this.add.container(p.x,p.y+36).setDepth(5);
   const art=this.add.graphics();art.fillStyle(0x263d32,.5);art.fillRect(-16,17,32,8);art.fillStyle(0x40353c);art.fillRect(-10,6,8,14);art.fillRect(2,6,8,14);art.fillStyle(p.color);art.fillRect(-14,-10,28,24);art.fillStyle(0xe4bd90);art.fillRect(-10,-26,20,20);art.fillStyle(p.id==='lab'?0xcc5743:p.id==='alchemy'?0xf0c7dd:0xb7b4ac);art.fillRect(-14,-30,28,12);art.fillStyle(0x29323c);art.fillRect(-6,-16,4,4);art.fillRect(4,-16,4,4);npc.add(art);
   const marker=this.add.text(0,-56,'◆',{fontSize:'20px',color:'#f3d78e'}).setOrigin(.5);npc.add(marker);
   this.tweens.add({targets:marker,y:-62,duration:900,yoyo:true,repeat:-1});
   npc.add(this.add.text(0,40,p.person,{fontFamily:'monospace',fontSize:'13px',color:'#fff3d2',backgroundColor:'#233b32',padding:{x:8,y:5}}).setOrigin(.5));
   this.add.zone(p.x,p.y+28,210,120).setInteractive({useHandCursor:true}).on('pointerup',()=>{if(this.down&&this.down.distance<8)this.openBuilding(p.id);});
  }
  // Fountain, lanterns, gardens and forest create a lived-in town square.
  rect(768,664,64,56,0x526873);rect(776,672,48,40,0x75b9c3);rect(792,652,16,44,0xb9cec0);rect(788,644,24,12,0x8cd9d7);
  for(const x of [316,560,1040,1284]){rect(x,660,8,52,0x5d4837);rect(x-4,652,16,16,0xf0c879);}
  for(let i=0;i<42;i++){
   const x=40+(i*173)%1520,y=i<21?40+(i*61)%180:770+(i*29)%110;
   if(x>640&&x<960)continue;
   rect(x-8,y,16,48,0x674c36);rect(x-36,y-24,72,36,0x284c39);rect(x-28,y-48,56,32,0x315d40);rect(x-16,y-64,32,24,0x4c794a);
  }
  for(const x of [1020,1080,1140,1200])for(let y=716;y<804;y+=24){rect(x,y,44,16,0x594e35);rect(x+8,y-8,8,16,0x89ac68);rect(x+24,y-4,8,8,0xe7a6b7);}
  this.add.text(800,816,'TEMPEST · LAR DOS POVOS DE JURA',{fontFamily:'monospace',fontSize:'16px',color:'#e9dcac',backgroundColor:'#263e32',padding:{x:16,y:10}}).setOrigin(.5);
  const camera=this.cameras.main;camera.setBounds(0,0,VILLAGE_WIDTH,VILLAGE_HEIGHT);camera.roundPixels=true;
  const fit=()=>camera.setZoom(Math.max(this.scale.width/1500,this.scale.height/1050));fit();this.centerVillage();this.refresh();
  this.input.on('pointerdown',(p:Phaser.Input.Pointer)=>{if(p.button===0||p.wasTouch)this.down={lastX:p.x,lastY:p.y,distance:0};});
  this.input.on('pointermove',(p:Phaser.Input.Pointer)=>{if(!this.down)return;const d=this.down,dx=p.x-d.lastX,dy=p.y-d.lastY;d.distance+=Math.hypot(dx,dy);d.lastX=p.x;d.lastY=p.y;camera.scrollX-=dx/camera.zoom;camera.scrollY-=dy/camera.zoom;});
  this.input.on('pointerup',()=>{this.down=null;});this.input.on('gameout',()=>{this.down=null;});
  this.input.on('wheel',(_p:unknown,_o:unknown,_x:number,y:number)=>camera.setZoom(Phaser.Math.Clamp(camera.zoom-y*.001,.6,2)));
  this.scale.on('resize',fit);this.events.once('shutdown',()=>this.scale.off('resize',fit));this.events.on('wake',()=>{this.down=null;this.refresh();});
 }
 refresh(){const v=this.readVillage();for(const p of places)this.labels.get(p.id)?.setText(v.buildings[p.id]?`Instalação · Nv. ${v.buildings[p.id]}`:'Projeto disponível');}
 centerVillage(){this.cameras.main.centerOn(800,540);}
 focusBuilding(id:Building){const p=places.find(p=>p.id===id)!;this.cameras.main.centerOn(p.x,p.y);}
}
