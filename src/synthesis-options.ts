import {previewMix,mixRecipes,type State,type SkillItem,type SkillId} from './model.ts';
export function synthesisItems(s:State):SkillItem[]{
 return s.inventory.filter(i=>!i.favorite&&!s.skillSlots.includes(i.uid)).sort((a,b)=>a.skill.localeCompare(b.skill)||a.rank-b.rank||a.uid-b.uid);
}
export function synthesisSelection(s:State,selected:readonly number[]):[number,number]{
 const available=new Set(synthesisItems(s).map(i=>i.uid));
 const a=available.has(selected[0])?selected[0]:0,b=available.has(selected[1])&&selected[1]!==a?selected[1]:0;return [a,b];
}
export type InventoryFusion={a:SkillItem;b:SkillItem;skill:SkillId;rank:number;type:'evolution'|'combination'};
/** Only concrete pairs in the bag; the discovery register never supplies ingredients. */
export function inventoryFusions(s:State):InventoryFusion[]{
 const free=synthesisItems(s),bySkill=new Map<SkillId,SkillItem[]>(),groups=new Map<string,SkillItem[]>(),out:InventoryFusion[]=[];
 for(const item of free){const list=bySkill.get(item.skill)??[];list.push(item);bySkill.set(item.skill,list);const key=`${item.skill}:${item.rank}`,group=groups.get(key)??[];group.push(item);groups.set(key,group);}
 const add=(a:SkillItem|undefined,b:SkillItem|undefined,type:InventoryFusion['type'])=>{if(!a||!b)return;const p=previewMix(s,a.uid,b.uid);if(p.ok)out.push({a,b,skill:p.skill!,rank:p.rank!,type});};
 for(const group of groups.values())if(group.length>=2&&group[0].rank<9)add(group[0],group[1],'evolution');
 for(const recipe of mixRecipes)add(bySkill.get(recipe.inputs[0])?.[0],bySkill.get(recipe.inputs[1])?.[0],'combination');
 return out;
}
