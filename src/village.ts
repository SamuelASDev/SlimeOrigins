import { addGear, gearBonuses, type GearSlot } from './equipment.ts';
import type { State, Kind } from './model.ts';

import {materialIds,materialNames,freshResources,resourceDrops,type Material} from './resources.ts';
export {materialIds,materialNames,type Material} from './resources.ts';
export const buildingIds=['workshop','lab','alchemy'] as const;
export type Building=typeof buildingIds[number];
export type Village={materials:Record<Material,number>;buildings:Record<Building,number>;artisan:boolean;founded:boolean;weapon:number;armor:number;tonicUntil:number};
export const freshVillage=():Village=>({materials:freshResources(),buildings:{workshop:0,lab:0,alchemy:0},artisan:false,founded:false,weapon:0,armor:0,tonicUntil:0});
export const buildings:Record<Building,{name:string;icon:string;benefit:string}>={
 workshop:{name:'Oficina',icon:'⚒',benefit:'Cada nível: +4% de defesa. Com Kaijin, fabrica arma, armadura e talismã para equipar no inventário.'},
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
export type ForgeRecipe={id:string;slot:GearSlot;tier:number;coins:number;materials:Partial<Record<Material,number>>};
export const forgeRecipes:ForgeRecipe[]=[
 {id:'weapon-1',slot:'weapon',tier:1,coins:80,materials:{}},
 {id:'armor-1',slot:'armor',tier:1,coins:90,materials:{}},
 {id:'charm-1',slot:'charm',tier:1,coins:100,materials:{}},
 {id:'weapon-2',slot:'weapon',tier:2,coins:120,materials:{iron:12,ore:4,fang:4}},
 {id:'armor-2',slot:'armor',tier:2,coins:120,materials:{iron:10,hide:10,silk:6}},
 {id:'charm-2',slot:'charm',tier:2,coins:120,materials:{crystal:8,ore:4,silk:6,herbs:8}},
 {id:'weapon-3',slot:'weapon',tier:3,coins:350,materials:{ore:18,iron:20,crystal:8,fang:12}},
 {id:'armor-3',slot:'armor',tier:3,coins:350,materials:{ore:16,iron:16,hide:18,scale:6}},
 {id:'charm-3',slot:'charm',tier:3,coins:350,materials:{ore:12,crystal:16,scale:4,silk:12}},
];
export const forgeTierNames=['','Simples','Forjado','Obra-prima'];
export function forgeError(s:State,id:string):string|null{
 const recipe=forgeRecipes.find(r=>r.id===id);if(!recipe)return 'Receita desconhecida.';
 if(!s.village.founded||!s.village.artisan)return 'Acolha Kaijin na vila para liberar a forja.';
 if(s.village.buildings.workshop<recipe.tier)return `Requer oficina de nível ${recipe.tier}.`;
 if(s.coins<recipe.coins)return `Faltam ${recipe.coins-s.coins} moedas.`;
 const missing=materialIds.filter(id=>s.village.materials[id]<(recipe.materials[id]??0));
 if(missing.length)return 'Faltam materiais: '+missing.map(id=>`${(recipe.materials[id]??0)-s.village.materials[id]} ${materialNames[id]}`).join(' · ');
 return null;
}
export function craftRecipe(s:State,id:string):boolean{
 if(forgeError(s,id))return false;const recipe=forgeRecipes.find(r=>r.id===id)!;
 s.coins-=recipe.coins;pay(s.village,recipe.materials);addGear(s,recipe.slot,recipe.tier);return true;
}
/** Compatibility helper: explicit tier stays available even after upgrading the workshop. */
export function craftGear(s:State,slot:GearSlot,tier=s.village.buildings.workshop):boolean{return craftRecipe(s,`${slot}-${tier}`);}
export function brewTonic(s:State,now=Date.now()):boolean{const v=s.village;if(!v.buildings.alchemy||v.tonicUntil>now||!pay(v,{herbs:8}))return false;v.tonicUntil=now+600000;return true;}
export function villageLoot(s:State,kind:Kind,rareRoll=Math.random()){
 const drops=resourceDrops(kind,rareRoll);for(const drop of drops)s.village.materials[drop.material]+=drop.quantity;return drops;
}
export function villageBonuses(s:State,now=Date.now()) {const v=s.village,g=gearBonuses(s);return {defense:v.buildings.workshop*.04+g.defense,attack:g.attack,haste:v.buildings.lab*.05+g.haste,absorb:v.buildings.lab*.02,regen:v.buildings.alchemy*.75+g.regen+(v.tonicUntil>now?3:0)};}
