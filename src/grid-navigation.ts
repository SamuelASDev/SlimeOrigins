import type {Point} from './cave-map.ts';
export function gridNavigation(floor:Set<string>,cell=32){
 const key=(p:Point)=>`${Math.floor(p.x/cell)},${Math.floor(p.y/cell)}`;
 const walkable=(p:Point)=>floor.has(key(p));
 const clearLine=(a:Point,b:Point)=>{const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/8));for(let i=0;i<=n;i++)if(!walkable({x:a.x+(b.x-a.x)*i/n,y:a.y+(b.y-a.y)*i/n}))return false;return true;};
 const route=(a:Point,b:Point):Point[]=>{
  const start=key(a),goal=key(b);if(!floor.has(start)||!floor.has(goal))return [];
  const queue=[start],prev=new Map<string,string|null>([[start,null]]);
  for(let i=0;i<queue.length&&!prev.has(goal);i++){const [x,y]=queue[i].split(',').map(Number);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const k=`${x+dx},${y+dy}`;if(floor.has(k)&&!prev.has(k)){prev.set(k,queue[i]);queue.push(k);}}}
  if(!prev.has(goal))return [];const out:Point[]=[];
  for(let k:string|null=goal;k&&k!==start;k=prev.get(k)??null){const [x,y]=k.split(',').map(Number);out.push({x:x*cell+cell/2,y:y*cell+cell/2});}out.reverse();
  if(out.length&&!clearLine(a,out[0]))out.unshift({x:Math.floor(a.x/cell)*cell+cell/2,y:Math.floor(a.y/cell)*cell+cell/2});return out;
 };
 const nearestFloor=(p:Point,radius=6):Point|null=>{if(walkable(p))return {...p};let best:Point|null=null,d=Infinity;const cx=Math.floor(p.x/cell),cy=Math.floor(p.y/cell);for(let y=-radius;y<=radius;y++)for(let x=-radius;x<=radius;x++){const q={x:(cx+x)*cell+cell/2,y:(cy+y)*cell+cell/2},n=Math.hypot(q.x-p.x,q.y-p.y);if(walkable(q)&&n<d){d=n;best=q;}}return best;};
 return {walkable,clearLine,route,nearestFloor};
}
