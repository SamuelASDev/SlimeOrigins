import { awardKill, kinds, migrate, type State, type Kind } from './model.ts';
export type Checkpoint={at:number;kind:Kind;interval:number;enabled:boolean};
export function offlineReward(state:State,checkpoint:unknown,now=Date.now()){
 const c=checkpoint as Partial<Checkpoint>|null;
 if(!c||c.enabled!==true||!kinds.includes(c.kind as Kind)||!Number.isFinite(c.at)||!Number.isFinite(c.interval)||c.interval!<3||c.interval!>120||c.at!>now||!state.equipped.length)return {kills:0,seconds:0};
 const seconds=Math.min(7200,Math.max(0,(now-c.at!)/1000));
 if(seconds<60)return {kills:0,seconds:0};
 // A conservative expedition: at most 240 kills, half the measured live rate.
 const kills=Math.min(240,Math.floor(seconds/(c.interval!*2)));
 for(let i=0;i<kills;i++)awardKill(state,c.kind as Kind);
 return {kills,seconds};
}
export function decodeSave(text:string):State{
 if(text.length>5_000_000)throw new Error('Arquivo muito grande.');
 const raw=JSON.parse(text),data=raw?.state??raw;
 if(!data||typeof data!=='object'||![1,2,3].includes(data.version)||!Number.isFinite(data.level)||!Number.isFinite(data.kills))throw new Error('Save incompatível ou inválido.');
 return migrate(data);
}
export function nextObjective(s:State):{text:string;panel:string}{
 if(!s.inventory.length)return {text:'Despertar: absorva sua primeira habilidade na caçada.',panel:'skills-panel'};
 if(!s.equipped.length)return {text:'Prepare-se: equipe uma habilidade absorvida.',panel:'skills-panel'};
 if(s.kills<10)return {text:`Um novo lar: derrote ${10-s.kills} criaturas para fundar a vila.`,panel:'village-panel'};
 if(!s.village.founded)return {text:'Visite Tempest e estabeleça o lar dos seus aliados.',panel:'village-panel'};
 if(!s.village.buildings.workshop)return {text:'Converse com Kaijin e construa a oficina.',panel:'village-panel'};
 if(!s.village.artisan)return {text:`Acolha Kaijin na vila: ${Math.min(s.kills,20)}/20 abates.`,panel:'village-panel'};
 if(!s.village.buildings.lab||!s.village.buildings.alchemy)return {text:'Expanda Tempest: construa o laboratório e a alquimia.',panel:'village-panel'};
 if(!s.bossWins)return {text:'Prove sua build: prepare-se para o primeiro chefe.',panel:'boss-panel'};
 return {text:'A vila prospera. Experimente sínteses e aprimore seus equipamentos.',panel:'fusion-panel'};
}
