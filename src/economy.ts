import { skills, type State, type SkillItem } from './model.ts';
import { gearValue, gearNames } from './equipment.ts';
export const skillValue=(item:SkillItem)=>8*item.rank*item.rank;
export function sellItem(s:State,kind:'skill'|'gear',uid:number,atVillage=false){
 if(!atVillage||!s.village.founded)return {ok:false,message:'Visite Myourmiles na vila para negociar.'};
 const item=kind==='skill'?s.inventory.find(i=>i.uid===uid):s.equipment.items.find(i=>i.uid===uid);
 if(!item)return {ok:false,message:'Este item não está mais disponível.'};
 if(item.favorite)return {ok:false,message:'Item favorito protegido. Remova a estrela antes de vender.'};
 if(kind==='skill'?s.skillSlots.includes(uid):Object.values(s.equipment.slots).includes(uid))return {ok:false,message:'Desequipe o item antes de vender.'};
 const value='skill' in item?skillValue(item):gearValue(item);
 const name='skill' in item?skills[item.skill].name:gearNames[item.slot];
 if(kind==='skill')s.inventory=s.inventory.filter(i=>i.uid!==uid);else s.equipment.items=s.equipment.items.filter(i=>i.uid!==uid);
 s.coins+=value;return {ok:true,message:`${name} vendido por ${value} moedas.`};
}
