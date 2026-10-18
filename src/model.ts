import { freshEquipment, addGear, readIdentity, identity, gearSlots, type Equipment, type ItemIdentity, type ItemOrigin } from './equipment.ts';
import { freshVillage, readVillage, villageLoot, villageBonuses, type Village } from './village.ts';
export const kinds = ['beetle', 'snake', 'wolf', 'mushroom', 'moth', 'frog', 'wisp', 'bat', 'serpent', 'centipede', 'armorsaurus', 'spider'] as const;
export type Kind = typeof kinds[number];
export const fusionIds = ['adaptive', 'miasma', 'conductor', 'binding', 'sever', 'perception', 'bastion'] as const;
export type FusionId = typeof fusionIds[number];
export const extraIds = ['steel', 'heat', 'ultrasound', 'waterBlade', 'strength'] as const;
export type SkillId = Kind | FusionId | typeof extraIds[number];
export const skillIds: SkillId[] = [...kinds, ...fusionIds, ...extraIds];
export const SLOT_LIMIT = 3;
export const CAPACITY = 6;
export const GUARANTEE = 8;
export const creatures: Record<Kind, { name: string; hp: number; damage: number; xp: number; color: number; texture: string }> = {
  spider: { name: 'Aranha negra', hp: 68, damage: 7, xp: 22, color: 0xc6b3db, texture: 'spider' },
  serpent: { name: 'Serpente negra', hp: 75, damage: 9, xp: 23, color: 0x9b92c9, texture: 'serpent' },
  centipede: { name: 'Centopeia maligna', hp: 56, damage: 7, xp: 19, color: 0xbc86c6, texture: 'centipede' },
  armorsaurus: { name: 'Armorsaurus', hp: 110, damage: 11, xp: 30, color: 0xadb8cc, texture: 'armorsaurus' },
  beetle: { name: 'Besouro de musgo', hp: 38, damage: 5, xp: 12, color: 0xb1ce75, texture: 'beetle' },
  snake: { name: 'Serpente púrpura', hp: 34, damage: 6, xp: 14, color: 0xc798d5, texture: 'snake' },
  wolf: { name: 'Lobo da clareira', hp: 48, damage: 7, xp: 18, color: 0xb6cbd0, texture: 'wolf' },
  mushroom: { name: 'Cogumelo vital', hp: 52, damage: 4, xp: 16, color: 0xe0ac82, texture: 'mushroom' },
  moth: { name: 'Mariposa da bruma', hp: 30, damage: 5, xp: 16, color: 0xc6d7dd, texture: 'moth' },
  frog: { name: 'Sapo do riacho', hp: 45, damage: 6, xp: 18, color: 0x76bdb6, texture: 'frog' },
  wisp: { name: 'Vaga-lume elétrico', hp: 32, damage: 7, xp: 19, color: 0xe4d585, texture: 'wisp' },
  bat: { name: 'Morcego rubro', hp: 40, damage: 6, xp: 17, color: 0xd7949a, texture: 'bat' },
};
export const skills: Record<SkillId, { name: string; icon: string; description: string; cost: number; tag: string }> = {
  spider: { name: 'Fio pegajoso', icon: '⌘', description: 'Ataques prendem o alvo por 0,8 s. A duração cresce com a evolução.', cost: 1, tag: 'ARANHA · CONTROLE' },
  steel: { name: 'Fio de aço', icon: '╳', description: 'A cada 3 s, corta até três alvos próximos. Ignora carapaças.', cost: 2, tag: 'ARANHA · CORTE' },
  heat: { name: 'Detecção de calor', icon: '◉', description: '+20% de ataque. Aprimoramentos aumentam a precisão ofensiva.', cost: 1, tag: 'SERPENTE · PERCEPÇÃO' },
  ultrasound: { name: 'Ondas ultrassônicas', icon: '◌', description: 'A cada 4 s, causa dano e atrasa ataques de até três inimigos.', cost: 2, tag: 'MORCEGO · SOM' },
  waterBlade: { name: 'Lâmina de água', icon: '≈', description: 'A cada 3 s, corta um alvo e o molha por 4 s. Água atravessa armaduras.', cost: 2, tag: 'SLIME · ÁGUA' },
  strength: { name: 'Fortalecimento corporal', icon: '◆', description: '+25% de ataque. Uma adaptação física do Armorsaurus para o jogo.', cost: 1, tag: 'ARMORSAURUS · CORPO' },
  binding: { name: 'Prisão de seda', icon: '⌘', description: 'A cada 3 s, prende até três inimigos e interrompe sua preparação.', cost: 3, tag: 'CONTROLE' },
  sever: { name: 'Fio cortante aquático', icon: '╳', description: 'A cada 3 s, atinge três inimigos com um corte de água ampliado.', cost: 3, tag: 'CORTE · ÁGUA' },
  perception: { name: 'Percepção mágica', icon: '◉', description: '+30% de ataque e +20% de velocidade de ataque.', cost: 2, tag: 'PERCEPÇÃO' },
  bastion: { name: 'Bastião vivo', icon: '⬡', description: 'Reduz dano em 45% e aumenta ataque em 20%. Não acumula armaduras.', cost: 3, tag: 'CORPO' },
  serpent: { name: 'Hálito venenoso', icon: '☣', description: 'Ataques aplicam veneno: 5 de dano/s por 4 s. Não acumula com Presa venenosa.', cost: 1, tag: 'CAVERNA · VENENO' },
  centipede: { name: 'Hálito paralisante', icon: 'ϟ', description: 'Ataques básicos atrasam o próximo ataque inimigo em 350 ms.', cost: 2, tag: 'CAVERNA · CONTROLE' },
  armorsaurus: { name: 'Armadura corporal', icon: '◈', description: 'Reduz o dano recebido em 35%. Não acumula com Carapaça ou Corpo adaptativo.', cost: 1, tag: 'CAVERNA · DEFESA' },
  beetle: { name: 'Carapaça', icon: '◈', description: 'Passiva · reduz todo dano recebido em 35%.', cost: 1, tag: 'DEFESA' },
  snake: { name: 'Presa venenosa', icon: '☣', description: 'Ataques aplicam veneno: 5 de dano/s por 4 s. Ignora armadura.', cost: 1, tag: 'VENENO' },
  wolf: { name: 'Instinto caçador', icon: 'ϟ', description: '+45% de movimento e +35% de velocidade de ataque. Recua automaticamente do golpe carregado do chefe.', cost: 1, tag: 'MOBILIDADE' },
  mushroom: { name: 'Regeneração', icon: '✚', description: 'Passiva · recupera 3 de vida por segundo, inclusive em combate.', cost: 1, tag: 'RECUPERAÇÃO' },
  moth: { name: 'Véu de névoa', icon: '≋', description: 'Passiva · reduz golpes comuns em 15% e dano de área em 40%.', cost: 1, tag: 'PROTEÇÃO' },
  frog: { name: 'Jato de água', icon: '≈', description: 'A cada 3 s, dispara água e molha o alvo por 4 s. Água atravessa a carapaça do chefe.', cost: 2, tag: 'ÁGUA' },
  wisp: { name: 'Centelha', icon: '↯', description: 'A cada 4 s, atinge até 3 inimigos próximos. Causa +60% de dano em alvos molhados.', cost: 2, tag: 'ELÉTRICO' },
  bat: { name: 'Dreno vital', icon: '♥', description: 'Passiva · ataques básicos curam 25% do dano causado.', cost: 1, tag: 'SUSTENTAÇÃO' },
  adaptive: { name: 'Corpo adaptativo', icon: '⬡', description: 'Passiva · reduz todo dano em 45% e recupera 5 de vida/s. Substitui Carapaça e Regeneração; seus efeitos não acumulam com elas.', cost: 3, tag: 'FUSÃO · CORPO' },
  miasma: { name: 'Miasma', icon: '❋', description: 'A cada segundo, nuvem de veneno causa 9 de dano em todos os inimigos a até 110 passos. Ignora armadura.', cost: 3, tag: 'FUSÃO · VENENO' },
  conductor: { name: 'Tempestade condutora', icon: '✦', description: 'A cada 3 s, molha até 3 alvos e causa dano elétrico base de 30 + nível × 2, ampliado em 60% pela água.', cost: 3, tag: 'FUSÃO · ELEMENTAL' },
};
export const recipes: Record<FusionId, { parents: [SkillId, SkillId]; essence: number; clue: string }> = {
  binding: { parents: ['spider', 'centipede'], essence: 0, clue: '' },
  sever: { parents: ['steel', 'waterBlade'], essence: 0, clue: '' },
  perception: { parents: ['heat', 'ultrasound'], essence: 0, clue: '' },
  bastion: { parents: ['armorsaurus', 'strength'], essence: 0, clue: '' },
  adaptive: { parents: ['beetle', 'mushroom'], essence: 12, clue: 'Uma defesa capaz de se reconstruir.' },
  miasma: { parents: ['snake', 'moth'], essence: 12, clue: 'Uma toxina que permanece suspensa no ar.' },
  conductor: { parents: ['frog', 'wisp'], essence: 12, clue: 'A água abre o caminho para a descarga.' },
};
export type SkillItem = ItemIdentity & { uid: number; skill: SkillId; rank: number };
export type State = { coins:number; equipment:Equipment; skillSlots:(number|null)[]; village: Village; springReadyAt?: number; inventory: SkillItem[]; nextItem: number; pity: Record<Kind, number>; caveWins: number; caveSector: number; visited: number[]; version: 4; level: number; xp: number; kills: number; essence: number; bossWins: number; fragments: Record<Kind, number>; unlocked: Record<SkillId, boolean>; equipped: SkillId[] };
export const fresh = (): State => ({ coins:0, equipment:freshEquipment(), skillSlots:[null,null,null], village: freshVillage(), inventory: [], nextItem: 1, pity: Object.fromEntries(kinds.map(k => [k, 0])) as Record<Kind, number>, caveWins: 0, caveSector: 0, visited: [0], version: 4, level: 1, xp: 0, kills: 0, essence: 0, bossWins: 0, fragments: Object.fromEntries(kinds.map(k => [k, 0])) as Record<Kind, number>, unlocked: Object.fromEntries(skillIds.map(k => [k, false])) as Record<SkillId, boolean>, equipped: [] });
const record = (v: unknown): Record<string, unknown> => v && typeof v === 'object' ? v as Record<string, unknown> : {};
const integer = (v: unknown, fallback = 0, max = 1e9) => typeof v === 'number' && Number.isInteger(v) && v >= 0 ? Math.min(v, max) : fallback;
export function migrate(raw: unknown): State {
  const r = record(raw), result = fresh();
  result.village=readVillage(r.village);result.coins=integer(r.coins);
  const identities=new Set<string>();
  result.level = Math.max(1, integer(r.level, 1, 10000));
  result.xp = integer(r.xp); result.kills = integer(r.kills);
  result.essence = integer(r.essence); result.bossWins = integer(r.bossWins);
  const fragments = record(r.fragments), unlocked = record(r.unlocked);
  for (const k of kinds) result.fragments[k] = integer(fragments[k]);
  for (const k of skillIds) result.unlocked[k] = unlocked[k] === true;
  result.caveWins = integer(r.caveWins); result.caveSector = integer(r.caveSector, 0, 6);
  if(r.springReadyAt!==undefined)result.springReadyAt=integer(r.springReadyAt,0,1e15);
  result.visited = Array.isArray(r.visited) ? [...new Set([0,...r.visited.filter((n): n is number => typeof n==='number' && Number.isInteger(n) && n>=0 && n<7)])] : [0];
  for(const k of kinds) result.pity[k]=integer(record(r.pity)[k],0,7);
  if((r.version===3||r.version===4) && Array.isArray(r.inventory)) {
    const used=new Set<number>();
    for(const raw of r.inventory.slice(0,20000)) {
      const item=record(raw);if(!skillIds.includes(item.skill as SkillId))continue;
      const copy=addItem(result,item.skill as SkillId,Math.max(1,integer(item.rank,1,9)));
      Object.assign(copy,readIdentity(item,identities));
      const uid=integer(item.uid,copy.uid);if(uid>0&&!used.has(uid))copy.uid=uid;
      while(used.has(copy.uid))copy.uid++;
      used.add(copy.uid);result.nextItem=Math.max(result.nextItem,copy.uid+1);
    }
  } else { for(const id of skillIds) if(result.unlocked[id]) addItem(result,id); }
  if(r.version===4) {
    if(Array.isArray(r.skillSlots))for(let slot=0;slot<SLOT_LIMIT;slot++){const uid=r.skillSlots[slot];if(typeof uid==='number')equipSkillItem(result,uid,slot);}
    const gear=record(r.equipment),slots=record(gear.slots);
    const used=new Set(result.inventory.map(i=>i.uid));
    if(Array.isArray(gear.items))for(const rawItem of gear.items.slice(0,20000)){
      const i=record(rawItem);if(!gearSlots.includes(i.slot as typeof gearSlots[number]))continue;
      const item=addGear(result,i.slot as typeof gearSlots[number],Math.max(1,integer(i.tier,1,3)),'legacy');
      Object.assign(item,readIdentity(i,identities));
      const uid=integer(i.uid,item.uid);if(uid>0&&!used.has(uid))item.uid=uid;
      while(used.has(item.uid))item.uid++;used.add(item.uid);result.nextItem=Math.max(result.nextItem,item.uid+1);
    }
    for(const slot of gearSlots){const uid=slots[slot];if(typeof uid==='number'&&result.equipment.items.some(i=>i.uid===uid&&i.slot===slot))result.equipment.slots[slot]=uid;}
  } else {
    const equipped = Array.isArray(r.equipped) ? r.equipped : typeof r.equipped === 'string' ? [r.equipped] : [];
    for (const id of equipped) if (skillIds.includes(id) && !result.equipped.includes(id as SkillId)) toggleEquip(result,id as SkillId);
    for(const slot of ['weapon','armor'] as const)if(result.village[slot]>0){const item=addGear(result,slot,result.village[slot],'legacy');result.equipment.slots[slot]=item.uid;}
  }
  result.nextItem=Math.max(result.nextItem,integer(r.nextItem,1));
  // Old fragments already earned remain useful in the new economy.
  if (r.version !== 2 && r.version !== 3 && r.version !== 4) result.essence = result.kills;
  return result;
}
export const neededXp = (state: State) => 40 + (state.level - 1) * 20;
export const maxHp = (state: State) => 100 + (state.level - 1) * 12;
export const attack = (state: State) => 8 + (state.level - 1) * 2;
export const energyUsed = (state: State) => state.equipped.reduce((sum, id) => sum + skills[id].cost, 0);
export function equipError(state: State, id: SkillId): string | null {
  if (!state.inventory.some(item=>item.skill===id)) return 'Nenhuma cópia disponível no inventário.';
  if (state.equipped.includes(id)) return null;
  if (state.equipped.length >= SLOT_LIMIT) return 'Três espaços ocupados. Remova uma habilidade antes de equipar.';
  if (energyUsed(state) + skills[id].cost > CAPACITY) return 'Capacidade de magia insuficiente: limite de 6 pontos.';
  return null;
}
export function syncSkillSlots(s:State){s.equipped=s.skillSlots.flatMap(uid=>{const item=s.inventory.find(i=>i.uid===uid);return item?[item.skill]:[];});}
export function skillItemError(s:State,uid:number,slot:number):string|null{
 const item=s.inventory.find(i=>i.uid===uid);if(!item)return 'Cópia indisponível.';
 if(!Number.isInteger(slot)||slot<0||slot>=SLOT_LIMIT)return 'Slot inválido.';
 if(s.skillSlots.some((other,n)=>n!==slot&&s.inventory.find(i=>i.uid===other)?.skill===item.skill))return 'Esta habilidade já está alocada em outro slot.';
 const cost=s.skillSlots.reduce<number>((sum,other,n)=>sum+(n===slot?0:skills[s.inventory.find(i=>i.uid===other)?.skill as SkillId]?.cost??0),0);
 return cost+skills[item.skill].cost>CAPACITY?'Capacidade de magia insuficiente: limite de 6 pontos.':null;
}
export function equipSkillItem(s:State,uid:number,slot:number){if(skillItemError(s,uid,slot))return false;s.skillSlots[slot]=uid;syncSkillSlots(s);return true;}
export function removeSkillSlot(s:State,slot:number){if(!Number.isInteger(slot)||slot<0||slot>=SLOT_LIMIT)return false;s.skillSlots[slot]=null;syncSkillSlots(s);return true;}
export function toggleEquip(state: State, id: SkillId): boolean {
 if(state.equipped.includes(id)){const slot=state.skillSlots.findIndex(uid=>state.inventory.find(i=>i.uid===uid)?.skill===id);if(slot>=0)removeSkillSlot(state,slot);else state.equipped=state.equipped.filter(k=>k!==id);return true;}
 if(equipError(state,id))return false;
 const item=[...state.inventory].filter(i=>i.skill===id).sort((a,b)=>b.rank-a.rank)[0];
 return item?equipSkillItem(state,item.uid,state.skillSlots.indexOf(null)):false;
}
export function fusionError(state: State, id: FusionId): string | null {
  const [a,b]=recipes[id].parents;
  return state.inventory.some(i=>i.skill===a)&&state.inventory.some(i=>i.skill===b)?null:'Faltam cópias para sintetizar.';
}
export function fuse(state: State,id:FusionId):boolean {
  const [a,b]=recipes[id].parents;
  const first=state.inventory.find(i=>i.skill===a),second=state.inventory.find(i=>i.skill===b&&i.uid!==first?.uid);
  return first&&second?mix(state,first.uid,second.uid).ok:false;
}
export const drops: Record<Kind, SkillId[]> = Object.fromEntries(kinds.map(k=>[k,[k]])) as Record<Kind, SkillId[]>;
drops.spider=['spider','steel'];drops.bat=['bat','ultrasound'];drops.serpent=['serpent','heat'];drops.armorsaurus=['armorsaurus','strength'];
export function addItem(state:State,skill:SkillId,rank=1,origin:ItemOrigin='hunt',parents:string[]=[]):SkillItem {
 const item={...identity(origin,parents),uid:state.nextItem++,skill,rank};state.inventory.push(item);state.unlocked[skill]=true;return item;
}
export const itemStage=(rank:number)=>['Inicial','Superior','Evoluída'][Math.floor((rank-1)/3)];
export const itemLabel=(item:SkillItem)=>`${skills[item.skill].name} · ${itemStage(item.rank)} ${((item.rank-1)%3)+1}`;
export function skillRank(state:State,id:SkillId){const allocated=state.skillSlots.map(uid=>state.inventory.find(i=>i.uid===uid)).find(i=>i?.skill===id);return allocated?.rank??Math.max(1,...state.inventory.filter(i=>i.skill===id).map(i=>i.rank));}
export const skillPower=(state:State,id:SkillId)=>1+(skillRank(state,id)-1)*.18;
export const mixRecipes: {inputs:[SkillId,SkillId];output:SkillId}[] = [
 ...fusionIds.map(id=>({inputs:recipes[id].parents,output:id})),
 {inputs:['serpent','centipede'],output:'miasma'},
 {inputs:['armorsaurus','mushroom'],output:'adaptive'},
 {inputs:['waterBlade','wisp'],output:'conductor'},
 {inputs:['spider','steel'],output:'binding'},
];
export type MixPreview={ok:boolean;message:string;skill?:SkillId;rank?:number};
export function previewMix(state:State,a:number,b:number):MixPreview {
 if(a===b)return {ok:false,message:'Escolha duas cópias diferentes.'};
 const first=state.inventory.find(i=>i.uid===a),second=state.inventory.find(i=>i.uid===b);
 if(!first||!second)return {ok:false,message:'Selecione dois itens disponíveis.'};
 if(first.favorite||second.favorite)return {ok:false,message:'Remova a proteção de favorito antes de fundir.'};
 if(state.skillSlots.includes(a)||state.skillSlots.includes(b))return {ok:false,message:'Desequipe os ingredientes antes de fundir.'};
 let skill:SkillId,rank:number;
 if(first.skill===second.skill){
  if(first.rank!==second.rank)return {ok:false,message:'Cópias iguais precisam ter o mesmo nível.'};
  if(first.rank>=9)return {ok:false,message:'Essa habilidade já está no nível máximo.'};
  skill=first.skill;rank=first.rank+1;
 }else{
  const recipe=mixRecipes.find(r=>r.inputs.includes(first.skill)&&r.inputs.includes(second.skill));
  if(!recipe)return {ok:false,message:'Combinação incompatível. Nenhum item será consumido.'};
  skill=recipe.output;rank=Math.min(first.rank,second.rank);
 }
 return {ok:true,skill,rank,message:`${skills[skill].name} · Nv. ${rank} · ${skills[skill].cost} magia. Consome apenas as duas cópias selecionadas.`};
}
export function mix(state:State,a:number,b:number):{ok:boolean;message:string;item?:SkillItem} {
 const preview=previewMix(state,a,b);if(!preview.ok)return {ok:false,message:preview.message};
 const parents=[state.inventory.find(i=>i.uid===a)!.instanceId,state.inventory.find(i=>i.uid===b)!.instanceId];
 state.inventory=state.inventory.filter(i=>i.uid!==a&&i.uid!==b);
 const item=addItem(state,preview.skill!,preview.rank!,'fusion',parents);
 return {ok:true,message:`Síntese concluída: ${itemLabel(item)}!`,item};
}
export function awardKill(state: State, kind: Kind, roll = Math.random(), lootRoll=Math.random()): { unlocked: boolean; levels: number; item?: SkillItem } {
 villageLoot(state,kind);state.coins+=2;state.kills++;state.essence++;state.xp+=creatures[kind].xp;state.fragments[kind]++;state.pity[kind]++;
 let item:SkillItem|undefined;let unlocked=false;
 if(roll<.25+villageBonuses(state).absorb||state.pity[kind]>=GUARANTEE){const table=drops[kind];const id=table[Math.min(table.length-1,Math.floor(Math.max(0,lootRoll)*table.length))];unlocked=!state.unlocked[id];item=addItem(state,id);state.pity[kind]=0;}
 return {unlocked,levels:applyLevels(state),item};
}
export function applyLevels(state: State): number {
  let levels = 0;
  while (state.xp >= neededXp(state) && state.level < 10000) { state.xp -= neededXp(state); state.level++; levels++; }
  return levels;
}
export function effects(state: State) {
  const has = (id: SkillId) => state.equipped.includes(id);
  const power=(id:SkillId)=>has(id)?skillPower(state,id):0;
  const village=villageBonuses(state);
  const defense = village.defense+Math.max(power('adaptive')*.45,power('bastion')*.45,power('beetle')*.35,power('armorsaurus')*.35);
  return { defense:Math.min(.75,defense), regen:village.regen+Math.max(power('adaptive')*5,power('mushroom')*3), speed:has('wolf')?1+.45*power('wolf'):1, haste:1+village.haste+(has('wolf')?.35*power('wolf'):0)+(has('perception')?.2*power('perception'):0), dodgeSlam:has('wolf')||has('perception'),mist:has('moth'),drain:Math.min(.65,power('bat')*.25),damageBonus:1+village.attack+power('heat')*.2+power('strength')*.25+power('perception')*.3+power('bastion')*.2 };

}
export type DamageType = 'physical' | 'poison' | 'water' | 'electric' | 'cut';
export function damageAgainst(base: number, type: DamageType, boss: boolean, wet: boolean): number {
  return Math.max(1, Math.round(base * (boss && type === 'physical' ? .4 : 1) * (type === 'electric' && wet ? 1.6 : 1) * (boss && type === 'water' ? 1.25 : 1)));
}
export function incomingDamage(base: number, state: State, area = false): number {
  const fx = effects(state);
  const mist=fx.mist?Math.min(.7,(area?.4:.15)*skillPower(state,'moth')):0;
  return Math.max(1, Math.round(base * (1 - fx.defense) * (1-mist)));
}
