import {CELL,center,pillars,sectors,walkable,caveGround} from './cave-map.ts';
export const caveTrail=new Set<string>();
const strip=(x0:number,y0:number,x1:number,y1:number)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(caveGround.has(`${x},${y}`))caveTrail.add(`${x},${y}`);};
for(let i=1;i<sectors.length;i++){const a=sectors[i-1],b=sectors[i];strip(a.x,a.y-1,b.x,a.y+1);strip(b.x-1,Math.min(a.y,b.y),b.x+1,Math.max(a.y,b.y));}
export type CaveProp={zone:number;frame:'ore'|'pillar'|'herbs'|'web';x:number;y:number;width:number};
export const cavePillars:CaveProp[]=pillars.map((p,i)=>({zone:Math.floor(i/4),frame:'pillar',x:p.x*CELL+16,y:p.y*CELL+48,width:[96,104,100,92][i%4]}));
export const cavePools=[0,1].map(zone=>{const c=center(zone);return {zone,x:c.x-210,y:c.y+65,width:zone===0?240:290,height:zone===0?118:142};});
export const caveProps:CaveProp[]=[];
const add=(zone:number,frame:CaveProp['frame'],dx:number,dy:number,width:number)=>{const c=center(zone),x=c.x+dx,y=c.y+dy;
 if(!walkable({x,y})||cavePillars.some(p=>Math.hypot(p.x-x,p.y-y)<112)||caveProps.some(p=>Math.hypot(p.x-x,p.y-y)<84))return;
 caveProps.push({zone,frame,x,y,width});
};
for(let zone=0;zone<sectors.length;zone++){
 if(zone<2){for(const [dx,dy,w] of [[-350,30,30],[-150,140,34],[-70,70,24]])add(zone,'herbs',dx,dy,w);add(zone,'ore',360,-35,46);}
 else if(zone===2){add(zone,'ore',-190,-280,68);add(zone,'ore',385,95,58);add(zone,'ore',130,280,46);}
 else if(zone===3){add(zone,'web',-375,-50,92);add(zone,'web',390,90,100);add(zone,'web',-120,280,76);}
 else if(zone===4){add(zone,'ore',-370,-65,48);add(zone,'ore',365,90,54);}
 else if(zone===5){add(zone,'ore',-180,-280,58);add(zone,'ore',385,85,52);add(zone,'ore',-130,280,42);}
 else{add(zone,'ore',-370,-55,46);add(zone,'ore',-110,280,42);}
}
export const caveSeal={...center(6),x:center(6).x+210,width:320,height:120,dragonWidth:300};
