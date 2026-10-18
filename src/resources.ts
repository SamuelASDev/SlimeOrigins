import type {Kind} from './model.ts';
export const materialIds=['timber','ore','silk','herbs','iron','hide','fang','crystal','scale'] as const;
export type Material=typeof materialIds[number];
export type ResourceBag=Record<Material,number>;
export const materialNames:Record<Material,string>={timber:'Madeira',ore:'Magiminério',silk:'Seda de monstro',herbs:'Hipokute',iron:'Ferro bruto',hide:'Couro resistente',fang:'Presa de fera',crystal:'Cristal mágico',scale:'Escama ancestral'};
export const resourceSources:Record<Material,string>={timber:'Jura: bosque, território dos lobos e ninho; coleta nas rotas da caverna',ore:'Pedreira de Jura e criaturas minerais da caverna',silk:'Aranhas, morcegos e mariposas',herbs:'Margens do riacho e cogumelos de Jura; nascentes da caverna',iron:'Pedreira de Jura; besouros e centopeias',hide:'Lobos, sapos e Armorsaurus',fang:'Lobos, morcegos e serpentes',crystal:'Coração mágico de Jura; vaga-lumes, mariposas e morcegos raros',scale:'Serpentes negras e Armorsaurus; chefe serpente garante escamas'};
export const resourceValues:Record<Material,number>={timber:1,ore:2,silk:2,herbs:2,iron:3,hide:3,fang:4,crystal:8,scale:18};
export const freshResources=():ResourceBag=>Object.fromEntries(materialIds.map(id=>[id,0])) as ResourceBag;
export type ResourceDrop={material:Material;quantity:number};
export type LootContext={area:'forest'|'cave';sector:number};
export function resourceDrops(kind:Kind,rareRoll=Math.random(),context?:LootContext):ResourceDrop[]{
 if(context?.area==='forest'){
  const drops:ResourceDrop[]=[];const add=(material:Material,quantity=1)=>{const current=drops.find(d=>d.material===material);if(current)current.quantity+=quantity;else drops.push({material,quantity});};
  // Gathering follows the habitat. Monster parts follow the actual defeated species.
  const gathering:Material[]=['timber','herbs','timber','iron','timber','crystal'];
  const sector=Number.isInteger(context.sector)&&context.sector>=0&&context.sector<6?context.sector:0;
  add(gathering[sector]);
  if(kind==='mushroom')add('herbs',2);
  if(['spider','moth'].includes(kind))add('silk');
  if(['wolf','frog','armorsaurus'].includes(kind))add('hide');
  if(['wolf','snake','serpent'].includes(kind))add('fang');
  if(['beetle','centipede'].includes(kind))add('iron');
  if(sector===3&&['beetle','centipede','armorsaurus'].includes(kind))add('ore');
  if(kind==='wisp'||kind==='moth'&&rareRoll<.2)add('crystal');
  if(kind==='serpent'&&rareRoll<.25||kind==='armorsaurus'&&rareRoll<.15)add('scale');
  return drops;
 }
 const drops:ResourceDrop[]=[{material:'timber',quantity:1}];
 const add=(material:Material,quantity=1)=>drops.push({material,quantity});
 if(['spider','bat','moth'].includes(kind))add('silk');
 else if(['beetle','centipede','armorsaurus'].includes(kind))add('ore');
 else add('herbs',kind==='mushroom'?2:1);
 if(kind==='beetle'||kind==='centipede')add('iron');
 if(['wolf','frog','armorsaurus'].includes(kind))add('hide');
 if(['wolf','snake','serpent','bat'].includes(kind))add('fang');
 if(kind==='wisp'||kind==='moth'||kind==='bat'&&rareRoll<.1)add('crystal');
 if(kind==='serpent'&&rareRoll<.25||kind==='armorsaurus'&&rareRoll<.15)add('scale');
 return drops;
}
