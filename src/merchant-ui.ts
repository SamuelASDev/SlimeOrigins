import {materialIds,resourceValues,type Material} from './resources.ts';
﻿import {skills,itemLabel,type State} from './model.ts';
import {gearNames,gearDescription,type GearItem} from './equipment.ts';
import {skillValue,sellItem,sellResources} from './economy.ts';
import {marketOffers,remainingStock,purchaseOffer,restockRemaining,marketCycle,type Offer} from './market.ts';
import {materialNames} from './village.ts';
import {skillIcon,gearIcon,supplyIcon} from './item-icons.ts';
import {preserveMenuState} from './menu-state.ts';
const get=(id:string)=>document.getElementById(id)!;
let resourceSale:Material|null=null;
let sale:{kind:'skill'|'gear';uid:number}|null=null,page=0,renderedCycle=-1,redraw:(()=>void)|null=null;
export const merchantMarkup=`<section id="merchant-panel" class="game-window frame merchant-window" role="dialog" aria-labelledby="merchant-title" hidden><div class="window-header"><div><p class="label">VILA DE TEMPEST / EMPÓRIO</p><h2 id="merchant-title">Myourmiles · Mercador</h2></div><button class="close-window" aria-label="Fechar mercador">×</button></div><div class="window-body"><div class="merchant-welcome"><div><h3>Negócios entre aliados</h3><p>“Uma boa oportunidade não dura para sempre, Rimuru!”</p></div><strong id="merchant-wallet"></strong></div><div class="restock-bar"><span>Caravana · estoque limitado</span><strong id="merchant-countdown"></strong></div><p class="hint">Novas ofertas a cada 15 minutos. Compras e vendas somente aqui na vila. Itens equipados e favoritos são protegidos.</p><div id="merchant-offers" class="merchant-offers"></div><details class="resource-trade"><summary>Vender materiais da mochila</summary><p class="hint">A venda de recursos consome unidades usadas nas receitas de Kaijin. Confira antes de confirmar.</p><div id="resource-sell-options" class="resource-sell-options"></div><div id="resource-sell-confirm" class="sale-confirm"></div></details><h3 class="merchant-sale-title">Vender uma cópia</h3><div id="merchant-sale-confirm" class="sale-confirm" role="status"></div><div id="merchant-sales" class="merchant-list"></div><div class="bag-pagination"><button id="trade-prev">← Anterior</button><span id="trade-page"></span><button id="trade-next">Próxima →</button></div></div><div class="window-footer">Estoque e quantidades persistem no save · Renovação automática pela caravana</div></section>`;
const offerName=(o:Offer)=>o.kind==='skill'?`${skills[o.skill].name} · Nv. ${o.rank}`:o.kind==='gear'?`${gearNames[o.slot]} · Nv. ${o.tier}`:`${o.quantity} ${materialNames[o.material]}`;
const offerIcon=(o:Offer)=>o.kind==='skill'?skillIcon(o.skill):o.kind==='gear'?gearIcon(o.slot,o.tier):supplyIcon(o.material);
export function renderMerchant(s:State,locked:boolean,atVillage:()=>boolean,changed:()=>void,announce:(m:string)=>void){
 redraw=()=>preserveMenuState(get('merchant-panel'),()=>renderMerchant(s,locked,atVillage,changed,announce));
 const offers=marketOffers(s);renderedCycle=s.market.cycle;
 get('merchant-wallet').textContent=`${s.coins} moedas`;
 get('merchant-offers').innerHTML=offers.map(o=>{const remaining=remainingStock(s,o);return `<article class="merchant-offer">${offerIcon(o)}<div><h3>${offerName(o)}</h3><p>${o.kind==='gear'?gearDescription({slot:o.slot,tier:o.tier} as GearItem):o.kind==='skill'?`${skills[o.skill].cost} magia · ${(o.rank-1)*18}% de poder adicional`:'Pacote de suprimentos para a vila'}</p><small>${remaining}/${o.stock} disponíveis</small></div><button data-offer="${o.id}" ${locked||!atVillage()||!s.village.founded||!remaining||s.coins<o.price?'disabled':''}>${remaining?`Comprar · ${o.price} moedas`:'Esgotado'}</button></article>`;}).join('');
 get('resource-sell-options').innerHTML=materialIds.map(id=>`<button data-sell-resource="${id}" ${locked||!s.village.materials[id]?'disabled':''}>${supplyIcon(id)}<span>${materialNames[id]}<small>${s.village.materials[id]} unidades · ${resourceValues[id]} moedas/un.</small></span></button>`).join('');
 if(resourceSale&&!s.village.materials[resourceSale])resourceSale=null;
 get('resource-sell-confirm').innerHTML=resourceSale?`<label>Quantidade de ${materialNames[resourceSale]}<input id="resource-sale-quantity" type="number" min="1" max="${s.village.materials[resourceSale]}" value="1"></label><p id="resource-sale-total">Total: ${resourceValues[resourceSale]} moedas</p><button id="confirm-resource-sale" ${locked?'disabled':''}>Confirmar venda de material</button><button id="cancel-resource-sale">Cancelar</button>`:'Escolha o material e a quantidade que deseja vender.';
 document.querySelectorAll<HTMLButtonElement>('[data-sell-resource]').forEach(b=>b.onclick=()=>{resourceSale=b.dataset.sellResource as Material;redraw?.();});
 if(resourceSale){const id=resourceSale,input=get('resource-sale-quantity') as HTMLInputElement;input.oninput=()=>{const quantity=Number(input.value),valid=Number.isInteger(quantity)&&quantity>0&&quantity<=s.village.materials[id];get('resource-sale-total').textContent=valid?`Total: ${quantity*resourceValues[id]} moedas`:'Quantidade inválida';(get('confirm-resource-sale') as HTMLButtonElement).disabled=locked||!valid;};get('cancel-resource-sale').onclick=()=>{resourceSale=null;redraw?.();};get('confirm-resource-sale').onclick=()=>{if(locked)return;const result=sellResources(s,id,Number(input.value),atVillage());if(result.ok)resourceSale=null;announce(result.message);changed();};}
 const selling=[...s.inventory.map(i=>({uid:i.uid,kind:'skill' as const,name:itemLabel(i),value:skillValue(i),icon:skillIcon(i.skill),protected:i.favorite||s.skillSlots.includes(i.uid)})),...s.equipment.items.map(i=>({uid:i.uid,kind:'gear' as const,name:`${gearNames[i.slot]} · Nv. ${i.tier}`,value:20*i.tier*i.tier,icon:gearIcon(i.slot,i.tier),protected:i.favorite||Object.values(s.equipment.slots).includes(i.uid)}))];
 page=Math.min(page,Math.max(0,Math.ceil(selling.length/30)-1));
 const preview=selling.find(i=>i.uid===sale?.uid&&i.kind===sale.kind);
 get('merchant-sale-confirm').innerHTML=preview?`Vender ${preview.name} (#${preview.uid}) por ${preview.value} moedas? <button id="confirm-item-sale" ${locked||preview.protected||!atVillage()||!s.village.founded?'disabled':''}>Confirmar venda</button><button id="cancel-item-sale">Cancelar</button>`:'Selecione a cópia que deseja vender e confira o preço antes de confirmar.';
 get('merchant-sales').innerHTML=selling.slice(page*30,(page+1)*30).map(i=>`<button data-sale-kind="${i.kind}" data-sale-uid="${i.uid}" ${locked||i.protected||!atVillage()||!s.village.founded?'disabled':''}>${i.icon}<span>${i.name}<small>#${i.uid} ${i.protected?'· PROTEGIDO':''}</small></span><b>${i.value} moedas</b></button>`).join('')||'<p class="inventory-empty">A mochila está vazia.</p>';
 (get('trade-prev') as HTMLButtonElement).disabled=page===0;(get('trade-next') as HTMLButtonElement).disabled=(page+1)*30>=selling.length;
 get('trade-page').textContent=`Página ${page+1} / ${Math.max(1,Math.ceil(selling.length/30))}`;
 get('trade-prev').onclick=()=>{page=Math.max(0,page-1);redraw?.();};get('trade-next').onclick=()=>{page++;redraw?.();};
 document.querySelectorAll<HTMLButtonElement>('[data-offer]').forEach(b=>b.onclick=()=>{if(locked)return;const result=purchaseOffer(s,b.dataset.offer!,atVillage());announce(result.message);changed();});
 document.querySelectorAll<HTMLButtonElement>('[data-sale-uid]').forEach(b=>b.onclick=()=>{sale={kind:b.dataset.saleKind as 'skill'|'gear',uid:Number(b.dataset.saleUid)};redraw?.();});
 if(preview){get('cancel-item-sale').onclick=()=>{sale=null;redraw?.();};get('confirm-item-sale').onclick=()=>{if(locked||!sale)return;const result=sellItem(s,sale.kind,sale.uid,atVillage());sale=null;announce(result.message);changed();};}
 tickMerchant(s);
}
export function tickMerchant(s:State){
 const cycle=marketCycle(s);if(cycle!==renderedCycle&&redraw){redraw();return true;}
 const seconds=Math.ceil(restockRemaining(s)/1000);get('merchant-countdown').textContent=`Renova em ${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
 get('merchant-wallet').textContent=`${s.coins} moedas`;return false;
}
