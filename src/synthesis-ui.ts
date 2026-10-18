import { skills, skillIds, itemLabel, itemStage, mix, mixRecipes, toggleEquip, equipError, type State, type SkillId } from './model.ts';

let selected: [number,number] = [0,0];
let result = '';
let flashed = false;
const get=(id:string)=>document.getElementById(id)!;
export const synthesisMarkup = `
 <p class="synthesis-intro">Duas essências. Uma nova possibilidade.</p>
 <div class="synthesis-machine"><div class="synthesis-input"><span class="label">ESSÊNCIA A</span><div id="sigil-a" class="synthesis-sigil">+</div><select id="fusion-a" aria-label="Primeira habilidade"></select></div><span class="synthesis-plus">+</span><div class="synthesis-input"><span class="label">ESSÊNCIA B</span><div id="sigil-b" class="synthesis-sigil">+</div><select id="fusion-b" aria-label="Segunda habilidade"></select></div></div>
 <div class="synthesis-output"><span>↓</span><div id="fusion-result" role="status">?</div></div>
 <button id="combine-items" class="hunt-button">Combinar essências</button>
 <p class="hint">Uma síntese bem-sucedida consome as duas cópias. Tentativas incompatíveis devolvem ambas. Consumir a última cópia equipada remove a habilidade da build.</p>
 <details class="evolution-help"><summary>Como evoluir uma habilidade</summary><p>Duas cópias iguais, do mesmo nível, produzem uma cópia de nível maior. Cada estágio tem três níveis: Inicial 1–3 → Superior 1–3 → Evoluída 1–3. O poder aumenta a cada nível. A build usa a melhor cópia disponível de cada habilidade equipada.</p></details>
 <details class="cheat-sheet"><summary>Colinha provisória · abrir para testes</summary><div id="fusion-cheats"></div></details>`;

export function renderItemMenus(state:State,locked:boolean,changed:()=>void,announce:(message:string)=>void) {
 get('collection').textContent=`${state.inventory.length} cópias · ${skillIds.filter(id=>state.unlocked[id]).length} descobertas`;
 const groups=new Map<string,{skill:SkillId;rank:number;count:number}>();
 for(const i of state.inventory){const key=`${i.skill}:${i.rank}`;const group=groups.get(key);if(group)group.count++;else groups.set(key,{skill:i.skill,rank:i.rank,count:1});}
 get('skills').innerHTML=[...groups.values()].sort((a,b)=>a.skill.localeCompare(b.skill)||b.rank-a.rank).map(item=>{
  const def=skills[item.skill],equipped=state.equipped.includes(item.skill),error=equipError(state,item.skill);
  return `<article class="skill-card item-card stage-${Math.floor((item.rank-1)/3)}"><div class="skill-icon">${def.icon}</div><div><h3>${def.name} <small>×${item.count}</small></h3><p class="item-stage">${itemStage(item.rank)} ${((item.rank-1)%3)+1} · ${def.cost} magia · poder +${(item.rank-1)*18}%</p><p>${def.description}</p></div><button data-item-equip="${item.skill}" ${locked||error?'disabled':''}>${equipped?'Remover':'Equipar'}</button></article>`;
 }).join('') || '<p class="inventory-empty">Ainda não há cópias. Cace monstros ou analise a nascente no primeiro setor.</p>';
 document.querySelectorAll<HTMLButtonElement>('[data-item-equip]').forEach(b=>b.onclick=()=>{if(locked)return;if(toggleEquip(state,b.dataset.itemEquip as SkillId)){changed();announce('Build atualizada. A melhor cópia disponível será usada.');}});
 for(let n=0;n<2;n++) {
  const select=get(n?'fusion-b':'fusion-a') as HTMLSelectElement;
  if(!state.inventory.some(i=>i.uid===selected[n]))selected[n]=0;
  select.innerHTML='<option value="0">Escolher uma cópia…</option>'+[...state.inventory].sort((a,b)=>a.skill.localeCompare(b.skill)||b.rank-a.rank).map(i=>`<option value="${i.uid}">${itemLabel(i)} · #${i.uid}</option>`).join('');
  select.value=String(selected[n]);select.disabled=locked;
  const item=state.inventory.find(i=>i.uid===selected[n]);get(n?'sigil-b':'sigil-a').textContent=item?skills[item.skill].icon:'+';
  select.onchange=()=>{selected[n]=Number(select.value);const i=state.inventory.find(i=>i.uid===selected[n]);get(n?'sigil-b':'sigil-a').textContent=i?skills[i.skill].icon:'+';(get('combine-items') as HTMLButtonElement).disabled=locked||!selected[0]||!selected[1];};
 }
 const button=get('combine-items') as HTMLButtonElement;button.disabled=locked||!selected[0]||!selected[1];
 get('fusion-result').textContent=result||'?';get('fusion-result').classList.toggle('revealed',flashed);
 button.onclick=()=>{if(locked)return;const outcome=mix(state,...selected);result=outcome.message;flashed=outcome.ok;if(outcome.ok){selected=[0,0];announce(outcome.message);}changed();};
 get('fusion-cheats').innerHTML='<p>Mesma habilidade + mesma habilidade, no mesmo nível → nível seguinte. No nível 3 e 6, a próxima síntese muda o estágio. Nível 9 é o limite.</p>'+mixRecipes.map(r=>`<p><b>${skills[r.inputs[0]].name}</b> + <b>${skills[r.inputs[1]].name}</b><span>→ ${skills[r.output].name}</span></p>`).join('');
}
