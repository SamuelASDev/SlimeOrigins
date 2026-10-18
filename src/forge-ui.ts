import {forgeRecipes,forgeError,forgeTierNames,craftRecipe,type ForgeRecipe} from './village.ts';
import {gearNames,gearDescription,type GearItem} from './equipment.ts';
import {materialIds,materialNames} from './resources.ts';
import {gearIcon,supplyIcon} from './item-icons.ts';
import type {State} from './model.ts';
let tier=1;
export function forgeMarkup(s:State,locked:boolean){
 const recipeCard=(r:ForgeRecipe)=>{const error=forgeError(s,r.id);return `<article class="forge-recipe">${gearIcon(r.slot,r.tier)}<div><h3>${gearNames[r.slot]}</h3><p>${forgeTierNames[r.tier]} · ${gearDescription({slot:r.slot,tier:r.tier} as GearItem)}</p></div><div class="forge-costs"><span class="${s.coins>=r.coins?'cost-ready':'cost-missing'}">${supplyIcon('coins')} ${r.coins} moedas</span>${materialIds.filter(id=>r.materials[id]).map(id=>`<span class="${s.village.materials[id]>=(r.materials[id]??0)?'cost-ready':'cost-missing'}" title="${materialNames[id]}">${supplyIcon(id)} ${s.village.materials[id]} / ${r.materials[id]} ${materialNames[id]}</span>`).join('')||'<small>Somente moedas · não consome materiais</small>'}</div><button data-forge-recipe="${r.id}" ${locked||error?'disabled':''}>Fabricar ${r.slot==='weapon'?'arma':r.slot==='armor'?'armadura':'amuleto'}</button><small class="forge-requirement">${locked?'Disponível após sair do desafio.':error??'Materiais disponíveis. Entrega uma cópia na mochila.'}</small></article>`;};
 return `<section class="village-gear forge-section"><div class="heading-row"><h3>Forja de Kaijin</h3><strong>${s.coins} moedas</strong></div><p class="hint">Escolha a qualidade. Simples usa apenas moedas; versões melhores exigem oficina e recursos específicos. Fabricar não equipa automaticamente.</p><div class="forge-tiers">${[1,2,3].map(n=>`<button data-forge-tier="${n}" aria-pressed="${n===tier}">${forgeTierNames[n]} <small>Nv. ${n}</small></button>`).join('')}</div><div class="forge-recipes">${forgeRecipes.filter(r=>r.tier===tier).map(recipeCard).join('')}</div></section>`;
}
export function bindForge(s:State,locked:boolean,changed:()=>void,announce:(m:string)=>void){
 document.querySelectorAll<HTMLButtonElement>('[data-forge-tier]').forEach(b=>b.onclick=()=>{tier=Number(b.dataset.forgeTier);changed();});
 document.querySelectorAll<HTMLButtonElement>('[data-forge-recipe]').forEach(b=>b.onclick=()=>{if(locked)return;const id=b.dataset.forgeRecipe!,error=forgeError(s,id);if(error){announce(error);return;}if(craftRecipe(s,id)){announce('Kaijin concluiu o equipamento. Abra o inventário (I) para equipar.');changed();}});
}
