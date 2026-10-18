export type MarketState={cycle:number;purchased:Record<string,number>};
export const freshMarket=():MarketState=>({cycle:-1,purchased:{}});
export function readMarket(raw:unknown):MarketState{
 const out=freshMarket();if(!raw||typeof raw!=='object')return out;
 const r=raw as Record<string,unknown>;if(typeof r.cycle==='number'&&Number.isInteger(r.cycle)&&r.cycle>=0&&r.cycle<=1e9)out.cycle=r.cycle;
 if(r.purchased&&typeof r.purchased==='object')for(const [id,n] of Object.entries(r.purchased).slice(0,32))if(/^\d+:(rune-[0-2]|material-(timber|ore|silk|herbs)|gear-[01]|rare)$/.test(id)&&typeof n==='number'&&Number.isInteger(n)&&n>=0)out.purchased[id]=Math.min(n,99);
 return out;
}
