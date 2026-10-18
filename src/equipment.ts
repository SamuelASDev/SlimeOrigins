import type { State } from './model.ts';
export const gearSlots = ['weapon','armor','charm'] as const;
export type GearSlot = typeof gearSlots[number];
export const gearNames:Record<GearSlot,string>={weapon:'Núcleo ofensivo',armor:'Revestimento corporal',charm:'Talismã de Jura'};
export const gearIcons:Record<GearSlot,string>={weapon:'⚔',armor:'⛨',charm:'✧'};
export type ItemOrigin='hunt'|'forge'|'fusion'|'merchant'|'legacy';
export type ItemIdentity={instanceId:string;favorite:boolean;origin:ItemOrigin;parents:string[]};
export type GearItem=ItemIdentity&{uid:number;slot:GearSlot;tier:number};
export type Equipment={items:GearItem[];slots:Record<GearSlot,number|null>};
export const freshEquipment=():Equipment=>({items:[],slots:{weapon:null,armor:null,charm:null}});
export function identity(origin:ItemOrigin='hunt',parents:string[]=[]):ItemIdentity{return {instanceId:crypto.randomUUID(),favorite:false,origin,parents};}
export function readIdentity(raw:Record<string,unknown>,seen:Set<string>):ItemIdentity{
 const id=typeof raw.instanceId==='string'&&/^[a-f0-9-]{36}$/i.test(raw.instanceId)&&!seen.has(raw.instanceId)?raw.instanceId:crypto.randomUUID();seen.add(id);
 return {instanceId:id,favorite:raw.favorite===true,origin:['hunt','forge','fusion','merchant','legacy'].includes(String(raw.origin))?raw.origin as ItemOrigin:'legacy',parents:Array.isArray(raw.parents)?raw.parents.filter((p):p is string=>typeof p==='string'&&/^[a-f0-9-]{36}$/i.test(p)).slice(0,2):[]};
}
export function addGear(s:State,slot:GearSlot,tier=1,origin:ItemOrigin='forge',parents:string[]=[]){const item:GearItem={...identity(origin,parents),uid:s.nextItem++,slot,tier:Math.max(1,Math.min(3,Math.floor(tier)))};s.equipment.items.push(item);return item;}
export function equipGear(s:State,uid:number){const item=s.equipment.items.find(i=>i.uid===uid);if(!item)return false;s.equipment.slots[item.slot]=s.equipment.slots[item.slot]===uid?null:uid;return true;}
export function gearBonuses(s:State){
 const tier=(slot:GearSlot)=>s.equipment?.items.find(i=>i.uid===s.equipment.slots[slot]&&i.slot===slot)?.tier??0;
 return {attack:tier('weapon')*.08,defense:tier('armor')*.05,haste:tier('charm')*.03,regen:tier('charm')*.35};
}
export const gearValue=(item:GearItem)=>20*item.tier*item.tier;
export const gearDescription=(item:GearItem)=>item.slot==='weapon'?`+${item.tier*8}% ataque`:item.slot==='armor'?`+${item.tier*5}% defesa`:`+${item.tier*3}% ritmo · +${(item.tier*.35).toFixed(2)} vida/s`;
