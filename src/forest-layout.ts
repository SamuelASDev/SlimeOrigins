import {CELL,forestGround,forestWater,forestRegions,forestCenter,forestObstacles,forestNav} from './forest-map.ts';
export type ForestProp={frame:string;x:number;y:number;width:number};
const roots=forestObstacles.map(p=>({x:p.x*CELL+16,y:p.y*CELL+48}));
const edge=new Set<string>();
for(const key of forestGround){const [x,y]=key.split(',').map(Number);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const next=`${x+dx},${y+dy}`;if(!forestGround.has(next)&&!forestWater.has(next))edge.add(next);}}
export const forestEdgeTrees:ForestProp[]=[];
for(const key of [...edge].sort((a,b)=>{const [ax,ay]=a.split(',').map(Number),[bx,by]=b.split(',').map(Number);return ay-by||ax-bx;})){
 const [tx,ty]=key.split(',').map(Number),x=tx*CELL+16,y=ty*CELL+40;
 if(roots.some(p=>Math.hypot(p.x-x,p.y-y)<145)||forestEdgeTrees.some(p=>Math.hypot(p.x-x,p.y-y)<128))continue;
 forestEdgeTrees.push({frame:'oak',x,y,width:132});
}
export const forestDecorations:ForestProp[]=[];
for(let zone=0;zone<forestRegions.length;zone++){
 const c=forestCenter(zone),frame=zone===3?'iron':zone===5?'crystal':zone===0||zone===1?'herbs':'log',width=frame==='herbs'?36:frame==='log'?72:65;
 const offsets=zone===1?[[190,95],[-240,115],[170,-160],[-140,255]]:[[120,245],[-140,-245],[360,110],[-350,-100],[260,180]];
 let placed=0;for(const [dx,dy] of offsets){const x=c.x+dx,y=c.y+dy;if(!forestNav.walkable({x,y})||roots.some(p=>Math.hypot(p.x-x,p.y-y)<140)||forestDecorations.some(p=>Math.hypot(p.x-x,p.y-y)<110))continue;forestDecorations.push({frame,x,y,width});if(++placed===3)break;}
}
