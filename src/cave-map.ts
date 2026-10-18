export type Point = { x: number; y: number };
export const CELL = 32, CAVE_WIDTH = 9984, CAVE_HEIGHT = 2560;
export const sectors = [
 {name:'Despertar subterrâneo',subtitle:'Hipokute · água · análise do slime',x:21,y:29,kind:'bat'},
 {name:'Lago dos ecos',subtitle:'Morcegos gigantes · ultrassom e dreno',x:65,y:48,kind:'bat'},
 {name:'Galeria de magiminério',subtitle:'Centopeias malignas · hálito paralisante',x:110,y:27,kind:'centipede'},
 {name:'Ninho das tecelãs',subtitle:'Aranhas negras · fio pegajoso e fio de aço',x:155,y:48,kind:'spider'},
 {name:'Abismo da serpente',subtitle:'Serpentes negras · veneno e calor · chefe',x:200,y:27,kind:'serpent'},
 {name:'Passagem das carapaças',subtitle:'Armorsaurus · armadura corporal',x:245,y:48,kind:'armorsaurus'},
 {name:'Câmara do selo',subtitle:'Veldora · Prisão Infinita · encontro amistoso',x:289,y:29,kind:'armorsaurus'},
] as const;
export const center = (i: number): Point => ({ x: sectors[i].x * CELL + CELL / 2, y: sectors[i].y * CELL + CELL / 2 });
export const floor = new Set<string>();
const key = (x: number, y: number) => `${x},${y}`;
function carve(x0: number, y0: number, x1: number, y1: number) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) floor.add(key(x, y)); }
// Broad organic chambers: 35 by 27 tiles, with uneven shoulders and side alcoves.
for(const s of sectors) for(let dy=-14;dy<=14;dy++) {
 const inset=Math.abs(dy)>11?4:Math.abs(dy)>8?2:0;
 const jag=Math.abs(dy*7+s.x)%3;
 carve(s.x-18+inset+jag,s.y+dy,s.x+18-inset-jag,s.y+dy);
}
for(const s of sectors){carve(s.x-20,s.y-4,s.x-16,s.y+4);carve(s.x+16,s.y+4,s.x+20,s.y+9);}

for (let i = 1; i < sectors.length; i++) { const a = sectors[i - 1], b = sectors[i]; carve(a.x, a.y - 3, b.x, a.y + 3); carve(b.x - 3, Math.min(a.y, b.y) - 3, b.x + 3, Math.max(a.y, b.y) + 3); }
// Stone columns are real obstacles; their art uses these same coordinates.
export const pillars = sectors.flatMap(s=>[-1,1].flatMap(dx=>[-1,1].map(dy=>({x:s.x+dx*9,y:s.y+dy*6}))));
for(const p of pillars)for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)floor.delete(key(p.x+dx,p.y+dy));
export const walkable = (p: Point) => floor.has(key(Math.floor(p.x / CELL), Math.floor(p.y / CELL)));
export function clearLine(a: Point, b: Point) { const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 12); for (let i = 0; i <= n; i++) if (!walkable({ x: a.x + (b.x - a.x) * i / Math.max(1,n), y: a.y + (b.y - a.y) * i / Math.max(1,n) })) return false; return true; }
/** Breadth first navigation through carved floor only; four neighbours prevent corner clipping. */
export function route(a: Point, b: Point): Point[] {
 const start = key(Math.floor(a.x / CELL), Math.floor(a.y / CELL)), goal = key(Math.floor(b.x / CELL), Math.floor(b.y / CELL));
 if (!floor.has(start) || !floor.has(goal)) return [];
 const queue = [start], previous = new Map<string, string | null>([[start,null]]);
 for (let i=0; i<queue.length && !previous.has(goal); i++) { const [x,y]=queue[i].split(',').map(Number); for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) { const next=key(x+dx,y+dy); if (floor.has(next)&&!previous.has(next)) { previous.set(next,queue[i]); queue.push(next); } } }
 if (!previous.has(goal)) return [];
 const path: Point[]=[]; for(let at: string | null=goal; at && at!==start; at=previous.get(at)??null) { const [x,y]=at.split(',').map(Number); path.push({x:x*CELL+CELL/2,y:y*CELL+CELL/2}); }
 path.reverse();
 // From an off-centre point, the diagonal to the next tile can cut a pillar corner.
 if(path.length&&!clearLine(a,path[0]))path.unshift({x:Math.floor(a.x/CELL)*CELL+CELL/2,y:Math.floor(a.y/CELL)*CELL+CELL/2});
 return path;
}

export function nearestFloor(p:Point,radius=6):Point|null{
 if(walkable(p))return {x:p.x,y:p.y};let best:Point|null=null,bestDistance=Infinity;
 const cx=Math.floor(p.x/CELL),cy=Math.floor(p.y/CELL);
 for(let y=-radius;y<=radius;y++)for(let x=-radius;x<=radius;x++){const point={x:(cx+x)*CELL+CELL/2,y:(cy+y)*CELL+CELL/2};if(walkable(point)){const d=Math.hypot(point.x-p.x,point.y-p.y);if(d<bestDistance){best=point;bestDistance=d;}}}return best;
}
