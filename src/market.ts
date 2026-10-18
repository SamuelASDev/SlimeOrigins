import {resourceValues} from './resources.ts';
﻿import {addItem,type State,type SkillId} from './model.ts';
import {addGear,type GearSlot} from './equipment.ts';
import {materialIds,type Material} from './village.ts';
export const MARKET_INTERVAL=15*60*1000;
export type Offer={id:string;kind:'skill';skill:SkillId;rank:number;price:number;stock:number}|{id:string;kind:'material';material:Material;quantity:number;price:number;stock:number}|{id:string;kind:'gear';slot:GearSlot;tier:number;price:number;stock:number};
const pool:SkillId[]=['beetle','wolf','mushroom','bat','spider','heat','moth','frog','wisp','waterBlade','steel','ultrasound'];
export function marketCycle(s:State,now=Date.now()){
 const cycle=Math.max(s.market.cycle,Math.floor(Math.max(0,now)/MARKET_INTERVAL));
 if(s.market.cycle!==cycle){s.market.cycle=cycle;s.market.purchased={};}
 return cycle;
}
export function marketOffers(s:State,now=Date.now()):Offer[]{
 const cycle=marketCycle(s,now),offers:Offer[]=[];
 for(let n=0;n<3;n++)offers.push({id:`${cycle}:rune-${n}`,kind:'skill',skill:pool[(cycle*3+n)%pool.length],rank:1,price:80,stock:3});
 for(const id of materialIds)offers.push({id:`${cycle}:material-${id}`,kind:'material',material:id,quantity:5,price:Math.max(30,resourceValues[id]*15),stock:id==='scale'||id==='crystal'?1:4});
 for(let n=0;n<2;n++){const tier=1+(cycle+n)%3,slot=(['weapon','armor','charm'] as const)[(cycle+n)%3];offers.push({id:`${cycle}:gear-${n}`,kind:'gear',slot,tier,price:20*tier*tier*4,stock:1});}
 offers.push({id:`${cycle}:rare`,kind:'skill',skill:pool[(cycle+7)%pool.length],rank:2+cycle%2,price:8*(2+cycle%2)**2*4,stock:1});
 return offers;
}
export function remainingStock(s:State,offer:Offer){return Math.max(0,offer.stock-(s.market.purchased[offer.id]??0));}
export function purchaseOffer(s:State,id:string,atVillage:boolean,now=Date.now()){
 if(!atVillage||!s.village.founded)return {ok:false,message:'Visite Myourmiles na vila para negociar.'};
 const offer=marketOffers(s,now).find(o=>o.id===id);
 if(!offer)return {ok:false,message:'Essa oferta expirou. Confira o novo estoque.'};
 if(!remainingStock(s,offer))return {ok:false,message:'Oferta esgotada até a próxima caravana.'};
 if(s.coins<offer.price)return {ok:false,message:'Moedas insuficientes.'};
 s.coins-=offer.price;s.market.purchased[offer.id]=(s.market.purchased[offer.id]??0)+1;
 if(offer.kind==='skill')addItem(s,offer.skill,offer.rank,'merchant');
 else if(offer.kind==='gear')addGear(s,offer.slot,offer.tier,'merchant');
 else s.village.materials[offer.material]+=offer.quantity;
 return {ok:true,message:'Compra concluída. O item foi entregue na mochila.'};
}
export function restockRemaining(s:State,now=Date.now()){return Math.max(0,(marketCycle(s,now)+1)*MARKET_INTERVAL-now);}
