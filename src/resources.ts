import type {Kind} from './model.ts';
export const materialIds=['timber','ore','silk','herbs','iron','hide','fang','crystal','scale'] as const;
export type Material=typeof materialIds[number];
export type ResourceBag=Record<Material,number>;
export const materialNames:Record<Material,string>={timber:'Madeira',ore:'Magiminério',silk:'Seda de monstro',herbs:'Hipokute',iron:'Ferro bruto',hide:'Couro resistente',fang:'Presa de fera',crystal:'Cristal mágico',scale:'Escama ancestral'};
export const resourceSources:Record<Material,string>={timber:'Coleta em todas as rotas de caça',ore:'Besouros, centopeias e Armorsaurus',silk:'Aranhas, morcegos e mariposas',herbs:'Cogumelos, sapos, serpentes, lobos e vaga-lumes',iron:'Besouros e centopeias',hide:'Lobos, sapos e Armorsaurus',fang:'Lobos, morcegos e serpentes',crystal:'Vaga-lumes e mariposas; raramente morcegos',scale:'Serpentes negras e Armorsaurus; chefes garantem escamas'};
export const resourceValues:Record<Material,number>={timber:1,ore:2,silk:2,herbs:2,iron:3,hide:3,fang:4,crystal:8,scale:18};
export const freshResources=():ResourceBag=>Object.fromEntries(materialIds.map(id=>[id,0])) as ResourceBag;
export type ResourceDrop={material:Material;quantity:number};
export function resourceDrops(kind:Kind,rareRoll=Math.random()):ResourceDrop[]{
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
