import {sectors} from './cave-map.ts';
import {forestRegions} from './forest-map.ts';
import {creatures,drops,skills,type Kind} from './model.ts';
import {materialNames,resourceDrops,type Material} from './resources.ts';
export type MapArea='cave'|'forest';
export type RegionGuide={name:string;subtitle:string;monsters:readonly Kind[];danger:string;interest:string;x:number;y:number};
export const mapGuides:Record<MapArea,{name:string;intro:string;regions:readonly RegionGuide[]}>= {
 cave:{name:'Caverna do Selo',intro:'Corredores subterrâneos, minérios e monstros alimentados por magículas. Siga até a Câmara do Selo para encontrar Veldora.',regions:sectors.map((s,i)=>({...s,monsters:i===2?['centipede','spider']:[s.kind],danger:i<2?'Moderada':'Alta',interest:i===0?'Nascente: analisar água e hipokute':i===4?'Desafio: Serpente Negra Anciã':i===6?'Veldora: encontro amistoso':'Caça e absorção'}))},
 forest:{name:'Floresta de Jura',intro:'Trilhas entre bosques, riachos e afloramentos. Recursos seguem o ambiente; partes de monstros seguem a espécie derrotada.',regions:forestRegions.map((r,i)=>({...r,interest:i===5?'Desafio: Guardião da carapaça':'Caça e coleta ambiental'}))},
};
export function regionResources(area:MapArea,index:number){
 const region=mapGuides[area].regions[index];if(!region)return [];
 const guaranteed=new Set<Material>(),possible=new Set<Material>();
 for(const kind of region.monsters){for(const d of resourceDrops(kind,1,{area,sector:index}))guaranteed.add(d.material);for(const d of resourceDrops(kind,0,{area,sector:index}))possible.add(d.material);}
 return [...new Set([...guaranteed,...possible])].map(id=>({id,name:materialNames[id],rare:!guaranteed.has(id)}));
}
export function regionSkills(area:MapArea,index:number){const region=mapGuides[area].regions[index];return region?[...new Set(region.monsters.flatMap(k=>drops[k]))].map(id=>skills[id].name):[];}
export function monsterName(area:MapArea,kind:Kind){return area==='cave'&&kind==='bat'?'Morcego gigante':creatures[kind].name;}
