import type {Kind} from './model.ts';
import type {Material} from './resources.ts';
import {gridNavigation} from './grid-navigation.ts';
export const CELL=32,FOREST_WIDTH=8320,FOREST_HEIGHT=2304;
export const forestRegions:readonly {name:string;subtitle:string;x:number;y:number;kind:Kind;monsters:readonly Kind[];gather:Material;loot:string;danger:string}[]=[
 {name:'Bosque de entrada',subtitle:'Trilhas de Tempest · madeira e hipokute',x:22,y:25,kind:'mushroom',monsters:['mushroom','beetle','mushroom'],gather:'timber',loot:'Madeira · Hipokute · Ferro de besouros',danger:'Suave'},
 {name:'Margens do riacho',subtitle:'Águas rasas · sapos e ervas medicinais',x:65,y:43,kind:'frog',monsters:['frog','frog','snake','mushroom'],gather:'herbs',loot:'Hipokute · Couro · Presas',danger:'Moderada'},
 {name:'Território dos lobos',subtitle:'Matilha de lobos terríveis · rastros entre raízes',x:108,y:25,kind:'wolf',monsters:['wolf','wolf','snake'],gather:'timber',loot:'Couro · Presas · Madeira',danger:'Moderada'},
 {name:'Pedreira de Jura',subtitle:'Afloramentos de ferro · criaturas de carapaça',x:151,y:43,kind:'armorsaurus',monsters:['beetle','armorsaurus','centipede'],gather:'iron',loot:'Ferro · Magiminério · Escamas raras',danger:'Alta'},
 {name:'Ninho das tecelãs',subtitle:'Aranhas negras · seda nas árvores antigas',x:194,y:25,kind:'spider',monsters:['spider','spider','moth'],gather:'timber',loot:'Seda de monstro · Madeira',danger:'Alta'},
 {name:'Coração mágico de Jura',subtitle:'Clareira de magículas · cristais e guardião',x:237,y:43,kind:'wisp',monsters:['wisp','moth','serpent'],gather:'crystal',loot:'Cristais · Seda · Presas e escamas raras',danger:'Alta'},
];
export const forestCenter=(i:number)=>({x:forestRegions[i].x*CELL+CELL/2,y:forestRegions[i].y*CELL+CELL/2});
export const forestFloor=new Set<string>(),forestPaths=new Set<string>(),forestWater=new Set<string>();
const key=(x:number,y:number)=>`${x},${y}`;
const carve=(x0:number,y0:number,x1:number,y1:number,path=false)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){forestFloor.add(key(x,y));if(path)forestPaths.add(key(x,y));}};
for(const r of forestRegions)for(let dy=-14;dy<=14;dy++){const inset=Math.abs(dy)>11?5:Math.abs(dy)>8?2:0;carve(r.x-18+inset,r.y+dy,r.x+18-inset,r.y+dy);}
for(let i=1;i<forestRegions.length;i++){const a=forestRegions[i-1],b=forestRegions[i];carve(a.x,a.y-2,b.x,a.y+2,true);carve(b.x-2,Math.min(a.y,b.y)-2,b.x+2,Math.max(a.y,b.y)+2,true);}
export const forestGround=new Set(forestFloor);
// A real pond with a dry crossing along the main east/west trail.
const river=forestRegions[1];for(let dy=-10;dy<=10;dy++)for(let dx=-6;dx<=3;dx++)if((dx+1.5)**2/25+dy**2/110<1&&Math.abs(dy)>2){const k=key(river.x+dx,river.y+dy);forestFloor.delete(k);forestWater.add(k);}
export const forestObstacles=forestRegions.flatMap((r,zone)=>[[-10,-7],[10,7],[-11,7],[11,-7]].map(([dx,dy],i)=>({x:r.x+dx,y:r.y+dy,zone,frame:zone===3?'iron':zone===5?'crystal':zone===1?'willow':'oak',i})));
for(const p of forestObstacles)for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++)forestFloor.delete(key(p.x+x,p.y+y));
export const forestNav=gridNavigation(forestFloor,CELL);
const spawnCache=new Map<number,{x:number;y:number}[]>();
export function forestSpawnPoints(zone:number){
 const r=forestRegions[zone];if(!r)return [];const cached=spawnCache.get(zone);if(cached)return cached;
 const points=[...forestFloor].map(k=>{const [x,y]=k.split(',').map(Number);return {x:x*CELL+16,y:y*CELL+16};}).filter(p=>Math.abs(p.x-(r.x*CELL+16))<420&&Math.abs(p.y-(r.y*CELL+16))<300);
 spawnCache.set(zone,points);return points;
}
