import {skillIcon} from './item-icons.ts';
import {preserveMenuState} from './menu-state.ts';
﻿import {skills,skillIds,itemLabel,mix,mixRecipes,previewMix,type State} from './model.ts';
import {renderSkillBag} from './inventory-ui.ts';
let selected:[number,number]=[0,0],result='',history:string[]=[],redraw:(()=>void)|null=null;
const get=(id:string)=>document.getElementById(id)!;
document.addEventListener('slime:ingredient',e=>{selected=[(e as CustomEvent<number>).detail,0];result='';redraw?.();});
export const synthesisMarkup=`<p class="synthesis-intro">Escolha duas cópias. Confira o resultado antes de fundir.</p><div class="synthesis-machine"><div class="synthesis-input"><span class="label">INGREDIENTE A</span><div id="sigil-a" class="synthesis-sigil">+</div><select id="fusion-a" aria-label="Primeiro item da fusão"></select></div><span class="synthesis-plus">+</span><div class="synthesis-input"><span class="label">INGREDIENTE B</span><div id="sigil-b" class="synthesis-sigil">+</div><select id="fusion-b" aria-label="Segundo item da fusão"></select></div></div><div class="synthesis-output"><span>↓</span><div id="fusion-preview" role="status"></div></div><div class="item-actions"><button id="combine-items" class="hunt-button">Confirmar fusão</button><button id="find-fusion-pair">Encontrar par de evolução</button></div><p id="fusion-result" role="status"></p><p class="hint">Resultado garantido. Consome exatamente os dois itens indicados. Equipados e favoritos não podem ser ingredientes. Combinações entre tipos herdam o menor nível dos ingredientes.</p><details class="evolution-help"><summary>Como evoluir</summary><p>Duas cópias da mesma habilidade e nível geram o nível seguinte, até 9. Três estágios: Inicial (1–3), Superior (4–6), Evoluída (7–9). Cada nível acrescenta 18% de poder. A cópia equipada define o poder usado no combate.</p></details><details class="cheat-sheet"><summary>Livro de receitas</summary><div id="fusion-cheats"></div></details><details><summary>Últimas sínteses desta sessão</summary><div id="fusion-history"></div></details>`;
export function renderItemMenus(s:State,locked:boolean,changed:()=>void,announce:(m:string)=>void,section:'skills'|'fusion'='fusion'){
 redraw=()=>preserveMenuState(document.getElementById(section==='skills'?'skills-panel':'fusion-panel'),()=>renderItemMenus(s,locked,changed,announce,section));
 if(section==='skills'){renderSkillBag(s,locked,changed,announce);return;}
 const available=s.inventory.filter(i=>!i.favorite&&!s.skillSlots.includes(i.uid)).sort((a,b)=>a.skill.localeCompare(b.skill)||a.rank-b.rank||a.uid-b.uid);
 for(let n=0;n<2;n++){
  const select=get(n?'fusion-b':'fusion-a') as HTMLSelectElement;
  if(!available.some(i=>i.uid===selected[n]))selected[n]=0;
  select.innerHTML='<option value="0">Escolher cópia da mochila…</option>'+available.filter(i=>i.uid!==selected[1-n]).map(i=>`<option value="${i.uid}">${itemLabel(i)} · #${i.uid}</option>`).join('');
  select.value=String(selected[n]);select.disabled=locked;
  const item=s.inventory.find(i=>i.uid===selected[n]);get(n?'sigil-b':'sigil-a').innerHTML=item?skillIcon(item.skill):'+';
  select.onchange=()=>{selected[n]=Number(select.value);result='';redraw?.();};
 }
 const preview=previewMix(s,...selected);
 get('fusion-preview').textContent=preview.message;get('fusion-preview').classList.toggle('revealed',preview.ok);
 const combine=get('combine-items') as HTMLButtonElement;combine.disabled=locked||!preview.ok;
 combine.textContent=preview.ok?'Confirmar fusão · 2 itens → 1':'Selecione uma combinação válida';
 get('fusion-result').textContent=result;
 combine.onclick=()=>{if(locked)return;const outcome=mix(s,...selected);result=outcome.message;if(outcome.ok){selected=[0,0];history.unshift(outcome.message);history=history.slice(0,5);announce(outcome.message);}changed();};
 const find=get('find-fusion-pair') as HTMLButtonElement;find.disabled=locked;
 find.onclick=()=>{if(locked)return;const seen=new Map<string,number>();for(const i of available){if(i.rank>=9)continue;const key=`${i.skill}:${i.rank}`;const other=seen.get(key);if(other){selected=[other,i.uid];result='';redraw?.();return;}seen.set(key,i.uid);}result='Nenhum par livre do mesmo nível. Desequipe uma cópia ou busque novas absorções.';get('fusion-result').textContent=result;};
 get('fusion-cheats').innerHTML=mixRecipes.map(r=>`<p>${skillIcon(r.inputs[0])}<b>${skills[r.inputs[0]].name}</b> + <b>${skills[r.inputs[1]].name}</b><span>→ ${skills[r.output].name}</span></p>`).join('');
 get('fusion-history').textContent=history.join('\n')||'Nenhuma fusão nesta sessão.';
}
