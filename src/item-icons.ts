import type {SkillId} from './model.ts';
import type {GearSlot} from './equipment.ts';
const skillOrder:SkillId[]=['beetle','snake','wolf','mushroom','moth','frog','wisp','bat','serpent','centipede','armorsaurus','spider','adaptive','miasma','conductor','binding','sever','perception','bastion','steel','heat','ultrasound','waterBlade','strength'];
const icon=(sheet:'skills'|'items',index:number,columns:number,rows:number)=>`<span class="game-icon icon-${sheet}" aria-hidden="true" style="--icon-x:${(index%columns)*100/(columns-1)}%;--icon-y:${Math.floor(index/columns)*100/(rows-1)}%"></span>`;
export const skillIcon=(id:SkillId)=>icon('skills',Math.max(0,skillOrder.indexOf(id)),6,4);
export const gearIcon=(slot:GearSlot,tier=1)=>icon('items',(Math.max(1,Math.min(3,tier))-1)*4+(['weapon','armor','charm'] as const).indexOf(slot),4,4);
export const supplyIcon=(id:'coins'|'timber'|'ore'|'silk'|'herbs'|'purse'|'chest')=>icon('items',{coins:3,timber:7,ore:11,silk:12,herbs:13,purse:14,chest:15}[id],4,4);
export {skillOrder};
