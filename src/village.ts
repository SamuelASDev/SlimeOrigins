import type { State, Kind } from './model.ts';

export const materialIds=['timber','ore','silk','herbs'] as const;
export type Material=typeof materialIds[number];
export const materialNames:Record<Material,string>={timber:'Madeira',ore:'Magiminério',silk:'Fibras',herbs:'Hipokute'};
export const buildingIds=['workshop','lab','alchemy'] as const;
export type Building=typeof buildingIds[number];
export type Village={materials:Record<Material,number>;buildings:Record<Building,number>;artisan:boolean;founded:boolean;weapon:number;armor:number;tonicUntil:number};
export const freshVillage=():Village=>({materials:{timber:0,ore:0,silk:0,herbs:0},buildings:{workshop:0,lab:0,alchemy:0},artisan:false,founded:false,weapon:0,armor:0,tonicUntil:0});
export const buildings:Record<Building,{name:string;icon:string;benefit:string}>={
 workshop:{name:'Oficina',icon:'⚒',benefit:'Cada nível: +4% de defesa. Com o artesão, fabrica e aprimora núcleo ofensivo e revestimento.'},
 lab:{name:'Laboratório',icon:'◈',benefit:'Cada nível: +2 pontos percentuais na chance de absorção e +5% de velocidade de ataque. Sínteses continuam disponíveis.'},
 alchemy:{name:'Alquimia',icon:'✚',benefit:'Cada nível: +0,75 vida/s. Permite preparar um tônico de vitalidade com duração de 10 minutos.'},
};
export function readVillage(raw:unknown):Village {
 const v=freshVillage();if(!raw||typeof raw!=='object')return v;
 const r=raw as Record<string,unknown>;
 const num=(n:unknown,max=1e9)=>typeof n==='number'&&Number.isFinite(n)?Math.min(max,Math.max(0,Math.floor(n))):0;
 const m=(r.materials??{}) as Record<string,unknown>,b=(r.buildings??{}) as Record<string,unknown>;
 for(const id of materialIds)v.materials[id]=num(m[id]);for(const id of buildingIds)v.buildings[id]=num(b[id],3);
 v.founded=r.founded===true;v.artisan=r.artisan===true&&v.founded;v.weapon=num(r.weapon,3);v.armor=num(r.armor,3);v.tonicUntil=num(r.tonicUntil,1e15);return v;
}
export function foundVillage(s:State):boolean {
 if(s.village.founded||s.kills<10)return false;
 s.village.founded=true;const m=s.village.materials;m.timber+=24;m.ore+=12;m.silk+=12;m.herbs+=12;return true;
}
export function recruitArtisan(s:State):boolean {if(!s.village.founded||s.kills<20||s.village.artisan)return false;s.village.artisan=true;return true;}
export const buildingCost=(id:Building,level:number):Partial<Record<Material,number>>=>{
 const n=level+1;return id==='workshop'?{timber:8*n,ore:6*n}:id==='lab'?{timber:6*n,ore:5*n,silk:4*n}:{timber:6*n,herbs:6*n};
};
export const afford=(v:Village,cost:Partial<Record<Material,number>>)=>materialIds.every(id=>v.materials[id]>=(cost[id]??0));
function pay(v:Village,cost:Partial<Record<Material,number>>){if(!afford(v,cost))return false;for(const id of materialIds)v.materials[id]-=cost[id]??0;return true;}
export function upgradeBuilding(s:State,id:Building):boolean {const v=s.village;if(!v.founded||v.buildings[id]>=3||!pay(v,buildingCost(id,v.buildings[id])))return false;v.buildings[id]++;return true;}
export const gearCost=(level:number):Partial<Record<Material,number>>=>({ore:8*(level+1),silk:5*(level+1)});
export function craftGear(s:State,slot:'weapon'|'armor'):boolean{const v=s.village;if(!v.artisan||!v.buildings.workshop||v[slot]>=v.buildings.workshop||!pay(v,gearCost(v[slot])))return false;v[slot]++;return true;}
export function brewTonic(s:State,now=Date.now()):boolean{const v=s.village;if(!v.buildings.alchemy||v.tonicUntil>now||!pay(v,{herbs:8}))return false;v.tonicUntil=now+600000;return true;}
export function villageLoot(s:State,kind:Kind){
 const m=s.village.materials;
 // Supplies are gathered on the hunting route; drops follow each creature's habitat/body.
 m.timber++;if(kind==='spider'||kind==='bat'||kind==='moth')m.silk++;
 else if(kind==='armorsaurus'||kind==='beetle'||kind==='centipede')m.ore++;
 else m.herbs++;
}
export function villageBonuses(s:State,now=Date.now()) {const v=s.village;return {defense:v.buildings.workshop*.04+v.armor*.05,attack:v.weapon*.08,haste:v.buildings.lab*.05,absorb:v.buildings.lab*.02,regen:v.buildings.alchemy*.75+(v.tonicUntil>now?3:0)};}
