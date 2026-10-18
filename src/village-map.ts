import Phaser from 'phaser';
import type { Building, Village } from './village';

export const VILLAGE_WIDTH = 1536, VILLAGE_HEIGHT = 1024;
export const villageResidents = [
 {id:'workshop',texture:'npc-kaijin-anime-v2',name:'Kaijin',service:'Forja e equipamentos',x:350,y:530,height:86},
 {id:'lab',texture:'npc-benimaru-anime-v2',name:'Benimaru',service:'Análise e síntese',x:768,y:390,height:100},
 {id:'alchemy',texture:'npc-shuna-anime-v2',name:'Shuna',service:'Alquimia e tônicos',x:1210,y:535,height:96},
] as const;

/** Source-preserving generated background and alpha sprites; UI remains separate from the art. */
export class VillageMap extends Phaser.Scene {
 private down:{lastX:number;lastY:number;distance:number}|null=null;
 private labels=new Map<Building,Phaser.GameObjects.Text>();
 constructor(private readVillage:()=>Village,private openBuilding:(id:Building)=>void){super('VillageMap');}
 preload(){
  this.load.image('village-tempest','/assets/sprites/village-tempest-anime-v2.png');
  for(const p of villageResidents)this.load.atlas(p.texture,`/assets/sprites/${p.texture}.png`,`/assets/sprites/${p.texture}.json`);
 }
 create(){
  this.add.image(0,0,'village-tempest').setOrigin(0).setDisplaySize(VILLAGE_WIDTH,VILLAGE_HEIGHT);
  this.labels.clear();
  for(const p of villageResidents){
   this.add.ellipse(p.x,p.y-3,46,12,0x152b35,.3).setDepth(p.y-1);
   const sprite=this.add.sprite(p.x,p.y,p.texture,'0').setOrigin(.5,1).setDepth(p.y);
   const frame=this.textures.getFrame(p.texture,'0');
   sprite.setScale(p.height/frame.realHeight);
   const animation=`${p.texture}-village-idle`;
   if(!this.anims.exists(animation))this.anims.create({key:animation,frames:['0','1','0','1','2','0','3','0'].map(frame=>({key:p.texture,frame})),frameRate:1.6,repeat:-1});
   sprite.play(animation);
   const marker=this.add.text(p.x,p.y-p.height-20,'◆',{fontFamily:'monospace',fontSize:'18px',color:'#ffe5a4',stroke:'#263749',strokeThickness:4}).setOrigin(.5).setDepth(2000);
   this.tweens.add({targets:marker,y:marker.y-6,duration:900,yoyo:true,repeat:-1,ease:'Sine.InOut'});
   this.add.text(p.x,p.y+13,`${p.name} · ${p.service}`,{fontFamily:'monospace',fontSize:'13px',color:'#fff0d0',backgroundColor:'#182c38ed',padding:{x:10,y:7}}).setOrigin(.5,0).setDepth(2000);
   this.labels.set(p.id,this.add.text(p.x,p.y+45,'',{fontFamily:'monospace',fontSize:'11px',color:'#d0d7bb',backgroundColor:'#182c38e8',padding:{x:8,y:4}}).setOrigin(.5,0).setDepth(2000));
   const zone=this.add.zone(p.x,p.y-35,180,155).setDepth(p.y+1).setInteractive({useHandCursor:true});
   zone.on('pointerover',()=>{sprite.setTint(0xffedc7);marker.setColor('#ffffff');});
   zone.on('pointerout',()=>{sprite.clearTint();marker.setColor('#ffe5a4');});
   zone.on('pointerup',()=>{if(this.down&&this.down.distance<8)this.openBuilding(p.id);});
  }
  const camera=this.cameras.main;camera.setBounds(0,0,VILLAGE_WIDTH,VILLAGE_HEIGHT);camera.roundPixels=true;
  const fit=()=>camera.setZoom(Math.max(this.scale.width/1500,this.scale.height/1050));fit();this.centerVillage();this.refresh();
  this.input.on('pointerdown',(p:Phaser.Input.Pointer)=>{if(p.button===0||p.wasTouch)this.down={lastX:p.x,lastY:p.y,distance:0};});
  this.input.on('pointermove',(p:Phaser.Input.Pointer)=>{if(!this.down)return;const d=this.down,dx=p.x-d.lastX,dy=p.y-d.lastY;d.distance+=Math.hypot(dx,dy);d.lastX=p.x;d.lastY=p.y;camera.scrollX-=dx/camera.zoom;camera.scrollY-=dy/camera.zoom;});
  const release=()=>{this.down=null;};
  this.input.on('pointerup',release);this.input.on('pointerupoutside',release);this.input.on('gameout',release);
  this.input.on('wheel',(_p:unknown,_o:unknown,_x:number,y:number)=>camera.setZoom(Phaser.Math.Clamp(camera.zoom-y*.001,.6,2)));
  this.scale.on('resize',fit);this.events.once('shutdown',()=>this.scale.off('resize',fit));this.events.on('wake',()=>{this.down=null;this.refresh();});
 }
 refresh(){const v=this.readVillage();for(const p of villageResidents)this.labels.get(p.id)?.setText(v.buildings[p.id]?`Instalação · Nv. ${v.buildings[p.id]} · Conversar`:'Projeto disponível · Conversar');}
 centerVillage(){this.cameras.main.centerOn(768,495);}
 focusBuilding(id:Building){const p=villageResidents.find(p=>p.id===id)!;this.cameras.main.pan(p.x,p.y,300,'Sine.easeInOut');}
}
