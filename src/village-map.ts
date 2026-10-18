import Phaser from 'phaser';
import type { Building, Village } from './village';

export const VILLAGE_WIDTH=2400,VILLAGE_HEIGHT=1600;
const places:{id:Building;x:number;y:number;box:[number,number,number,number];name:string}[]=[
 {id:'workshop',name:'Oficina',x:.23,y:.63,box:[.03,.23,.36,.43]},
 {id:'lab',name:'Laboratório',x:.48,y:.38,box:[.37,.08,.24,.32]},
 {id:'alchemy',name:'Alquimia',x:.79,y:.72,box:[.63,.27,.35,.48]},
];
/** A peaceful scene with its own camera. No combat scene or enemy population runs here. */
export class VillageMap extends Phaser.Scene {
 private down:{x:number;y:number;lastX:number;lastY:number;distance:number}|null=null;
 private labels=new Map<Building,Phaser.GameObjects.Text>();
 constructor(private readVillage:()=>Village,private openBuilding:(id:Building)=>void){super('VillageMap');}
 preload(){this.load.image('villageWorld','/assets/sprites/village-camp.png');}
 create(){
  this.add.image(0,0,'villageWorld').setOrigin(0).setDisplaySize(VILLAGE_WIDTH,VILLAGE_HEIGHT);
  const camera=this.cameras.main;camera.setBounds(0,0,VILLAGE_WIDTH,VILLAGE_HEIGHT);
  const fit=()=>{camera.setZoom(Math.max(this.scale.width/1750,this.scale.height/1100));};fit();this.centerVillage();
  for(const place of places){
   const x=place.x*VILLAGE_WIDTH,y=place.y*VILLAGE_HEIGHT;
   this.add.ellipse(x,y+12,170,34,0x14251e,.28);
   this.labels.set(place.id,this.add.text(x,y,place.name,{fontFamily:'monospace',fontSize:'14px',color:'#f0ddaa',backgroundColor:'#13261ee8',padding:{x:16,y:10}}).setOrigin(.5).setDepth(10));
  }
  this.refresh();this.input.setDefaultCursor('grab');
  this.input.on('pointerdown',(p:Phaser.Input.Pointer)=>{if(p.button!==0&&!p.wasTouch)return;this.down={x:p.x,y:p.y,lastX:p.x,lastY:p.y,distance:0};this.input.setDefaultCursor('grabbing');});
  this.input.on('pointermove',(p:Phaser.Input.Pointer)=>{
   if(!this.down)return;const d=this.down;
   const dx=p.x-d.lastX,dy=p.y-d.lastY;d.distance+=Math.hypot(dx,dy);d.lastX=p.x;d.lastY=p.y;
   camera.scrollX-=dx/camera.zoom;camera.scrollY-=dy/camera.zoom;
  });
  this.input.on('pointerup',(p:Phaser.Input.Pointer)=>{
   const d=this.down;this.down=null;this.input.setDefaultCursor('grab');if(!d||d.distance>8)return;
   const point=camera.getWorldPoint(p.x,p.y);
   for(const place of places){const [x,y,w,h]=place.box;if(point.x>=x*VILLAGE_WIDTH&&point.x<=(x+w)*VILLAGE_WIDTH&&point.y>=y*VILLAGE_HEIGHT&&point.y<=(y+h)*VILLAGE_HEIGHT){this.openBuilding(place.id);break;}}
  });
  this.input.on('pointerupoutside',()=>{this.down=null;this.input.setDefaultCursor('grab');});
  this.input.on('gameout',()=>{this.down=null;this.input.setDefaultCursor('grab');});
  this.scale.on('resize',fit);this.events.once('shutdown',()=>this.scale.off('resize',fit));
  this.events.on('wake',()=>{this.down=null;this.refresh();});
 }
 refresh(){const v=this.readVillage();for(const place of places)this.labels.get(place.id)?.setText(`${place.name} · ${v.buildings[place.id]?'Nv. '+v.buildings[place.id]:'Construir'}`);}
 centerVillage(){this.cameras.main.centerOn(VILLAGE_WIDTH*.5,VILLAGE_HEIGHT*.50);}
 focusBuilding(id:Building){const p=places.find(p=>p.id===id)!;this.cameras.main.centerOn(p.x*VILLAGE_WIDTH,p.y*VILLAGE_HEIGHT*.9);}
}
