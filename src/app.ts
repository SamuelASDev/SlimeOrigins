import {mapMarkup,bindMapTabs,syncMapProgress} from './map-ui';
import {actorSize,actorLayout,contactReach} from './actor-sizes';
import {FrameBudget,BackgroundExpedition,estimateHuntInterval} from './activity';
import {HuntWatchdog,needsApproach} from './hunt-navigation';
import {materialNames,type Material} from './resources.ts';
import {merchantMarkup,renderMerchant,tickMerchant} from './merchant-ui';
import {skillIcon} from './item-icons';
import { preserveMenuState } from './menu-state';
import { inventoryMarkup, renderInventory } from './inventory-ui';
import { offlineReward, decodeSave, nextObjective, type Checkpoint } from './journey';
import { VillageMap } from './village-map';
import type { Building } from './village';
import { villageMarkup, renderVillage } from './village-ui';
import { synthesisMarkup, renderItemMenus } from './synthesis-ui';
import Phaser from 'phaser';
import './game.css';
import {forestRegions,forestCenter,forestNav,forestSpawnPoints,FOREST_WIDTH,FOREST_HEIGHT} from './forest-map';
import { WorldScene } from './world';
import { sectors, center, route, walkable, clearLine, nearestFloor, CAVE_WIDTH, CAVE_HEIGHT, type Point } from './cave-map';
import { CombatEffects, type Telegraph } from './combat-effects';
import { enemyAttacks, slimeAttack, startAttack, advanceAttack, type AttackClock, type AttackSpec } from './attack-timing';
import { preloadSpriteArt, registerSpriteAnimations, makeActor } from './sprite-art';
import { kinds, fusionIds, skillIds, skillRank, skillPower, addItem, itemLabel, creatures, skills, recipes, fresh, migrate, maxHp, attack, neededXp, energyUsed, equipError, toggleEquip, fusionError, fuse, awardKill, applyLevels, effects, damageAgainst, incomingDamage, CAPACITY, type Kind, type SkillId, type FusionId, type DamageType } from './model.ts';

const SAVE = 'slime-origins-v2';
let state = fresh();
let checkpoint: unknown = null;
let offlineSummary = '';
let observedKills = 0, observationStart = Date.now();
let lastHuntedKind: Kind = 'bat';
let awayExpedition:BackgroundExpedition|null=null;
let audioContext: AudioContext | null = null;
let soundEnabled = localStorage.getItem('slime-sound') === 'true';
function chime(){
 if(!soundEnabled)return;
 try { audioContext ??= new AudioContext(); void audioContext.resume(); const osc=audioContext.createOscillator(),gain=audioContext.createGain(); osc.type='triangle';osc.frequency.setValueAtTime(523,audioContext.currentTime);osc.frequency.exponentialRampToValueAtTime(784,audioContext.currentTime+.12);gain.gain.setValueAtTime(.035,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+.2);osc.connect(gain);gain.connect(audioContext.destination);osc.start();osc.stop(audioContext.currentTime+.21); } catch { /* Audio is optional. */ }
}
try { const raw=JSON.parse(localStorage.getItem(SAVE) ?? localStorage.getItem('slime-origins-v1') ?? 'null');state = migrate(raw);checkpoint=raw?.checkpoint; const reward=offlineReward(state,checkpoint);if(reward.kills)offlineSummary=`Expedição offline: ${reward.kills} criaturas derrotadas, materiais e habilidades recolhidos. Limite: 2h e 240 abates; ritmo reduzido a 50%.`;localStorage.setItem(SAVE,JSON.stringify(state)); } catch { /* A damaged save starts a fresh session. */ }
let inVillage = false;
let paused = false;
let priority: Kind | 'any' = 'any';
let activePanel: string | null = null;
let panelTrigger: HTMLElement | null = null;
let saveWarning = false;
let restoringSave = false;
let lastBossResult = '';
function save() {
  if(restoringSave)return;
  try { const seconds=(Date.now()-observationStart)/1000;
    const interval=observedKills>0?seconds/observedKills:0;
    const checkpoint:Checkpoint={at:Date.now(),kind:scene?.target?.kind??scene?.regions()[scene.sector].kind??lastHuntedKind,interval,context:scene?.lootContext(),enabled:!paused&&!inVillage&&!scene?.bossActive&&scene?.recovering===0&&seconds>=60&&observedKills>=3};
    localStorage.setItem(SAVE, JSON.stringify({...state,checkpoint:awayExpedition?.checkpoint(Date.now())??checkpoint})); }
  catch { if (!saveWarning) { saveWarning = true; log('Não foi possível salvar neste navegador. A sessão continua funcionando.'); } }
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<div id="game" aria-label="Caverna do Selo: mapa de exploração e caça automática"></div>
<div class="game-vignette" aria-hidden="true"></div>
<div class="hud">
  <section class="player-hud frame" aria-label="Personagem">
    <div class="slime-portrait" aria-hidden="true"><span></span></div>
    <div class="player-info"><div class="name-row"><strong>Slime sem nome</strong><span class="rank">II</span></div><small id="level"></small>
      <div class="meter health"><div id="hp-bar"></div><span id="hp-text"></span></div>
      <div class="meter experience"><div id="xp-bar"></div><span id="xp-text"></span></div>
    </div><div class="mini-stats"><span><b id="attack"></b> ATQ</span><span><b id="defense"></b> DEF</span><span><b id="kills"></b> ABATES</span></div>
  </section>
  <section class="location frame"><p>FLORESTA DE JURA</p><h1 id="location-name">Clareira do despertar</h1><div><i class="live-dot"></i><span id="status">CAÇA AUTOMÁTICA</span></div><p class="resources" id="resources"></p></section>
  <nav class="area-tabs frame" aria-label="Áreas do mundo"><button id="area-cave" aria-pressed="true">01 · Caverna do Selo</button><button id="area-forest" aria-pressed="false">02 · Floresta de Jura</button><button data-panel="map-panel">⌖ Mapa</button></nav>
  <div class="village-map-controls frame"><span>ARRASTE · RODA PARA ZOOM · CONVERSE COM OS MORADORES</span><div><button id="leave-village">← Voltar à caça</button><button id="center-village">⌖ Centralizar</button><button data-village-place="workshop">Oficina</button><button data-village-place="lab">Laboratório</button><button data-village-place="alchemy">Alquimia</button><button id="visit-merchant">Myourmiles · Mercador</button></div></div><div class="world-title" aria-hidden="true"><span>SLIME · ORIGENS</span><small>ECOS DA EVOLUÇÃO</small></div>
  <section id="boss-hud" class="boss-hud frame" aria-label="Vida do chefe" hidden><div><strong id="boss-name">Serpente Negra Anciã</strong><span id="boss-hp-text"></span></div><div class="meter boss-meter"><div id="boss-hp-bar"></div></div><p id="boss-action"></p><button id="retreat">Recuar do desafio</button></section>
  <nav class="menu-rail" aria-label="Menus do jogo"><button class="menu-button" data-panel="village-panel" title="Vila (V)"><span>⌂</span>Vila<kbd>V</kbd></button>
    <button class="menu-button" data-panel="inventory-panel" title="Inventário (I)"><span>▣</span>Inventário<kbd>I</kbd></button>
    <button class="menu-button" data-panel="skills-panel" title="Habilidades (H)"><span>◈</span>Habilidades<kbd>H</kbd></button>
    <button class="menu-button" data-panel="fusion-panel" title="Fusões (F)"><span>✦</span>Fusões<kbd>F</kbd></button>
    <button class="menu-button" data-panel="boss-panel" title="Chefe (B)"><span>♜</span>Chefe<kbd>B</kbd></button>
    <button class="menu-button" data-panel="journal-panel" title="Diário (J)"><span>≡</span>Diário<kbd>J</kbd></button>
    <button class="menu-button" data-panel="settings-panel" title="Opções (O)"><span>⚙</span>Opções<kbd>O</kbd></button>
  </nav>
  <div id="notice" class="notice frame" role="status"><span>✧</span><p id="notice-text">Grande Sábio: novas essências detectadas na clareira.</p></div>
  <div class="bottom-hud">
    <button id="journey-objective" class="journey-objective frame" title="Abrir próximo objetivo"></button><section class="target-hud frame"><span class="label">ALVO ATUAL</span><strong id="target">Procurando alvo…</strong><small id="target-action"></small></section>
    <section class="actionbar frame" aria-label="Controles de caça">
      <button id="pause" class="hunt-button">Ⅱ Pausar caça</button>
      <div class="hunt-priority"><label for="priority">PRIORIDADE DA CAÇA</label><select id="priority"><option value="any">Mais próximo</option>${kinds.map(k => `<option value="${k}">${creatures[k].name}</option>`).join('')}</select></div>
      <button id="equipped-button" data-panel="skills-panel" title="Trocar habilidades"><span class="label">BUILD · 3 ESPAÇOS</span><span id="equipped-name">Espaços vazios</span></button>
    </section><span class="save-status">● SAVE LOCAL · PROTÓTIPO 0.4</span>
  </div>
</div>
${villageMarkup}
${inventoryMarkup}
${merchantMarkup}
${mapMarkup(state.activeArea,state.autoExplore)}
<section id="skills-panel" class="game-window frame" role="dialog" aria-labelledby="skills-title" hidden>
  <div class="window-header"><div><p class="label">PREDADOR / ANÁLISE</p><h2 id="skills-title">Habilidades absorvidas</h2></div><button class="close-window" aria-label="Fechar habilidades">×</button></div>
  <div class="window-body"><div class="build-summary"><div class="heading-row"><span class="label">SUA BUILD</span><span id="capacity"></span></div><div id="slot" class="build-slots"></div><p class="hint" id="build-hint"></p></div>
  <div class="heading-row"><span class="label">REGISTRO DE ESSÊNCIAS</span><span id="collection"></span></div><div id="pending-loot" class="pending-loot"><span id="pending-loot-text"></span><button id="show-new-loot">Mostrar novos itens</button></div><div id="skills"></div><p class="hint">Cada habilidade é uma cópia individual, que pode ser equipada, fundida ou vendida. 25% de absorção por abate; no máximo oito abates entre cópias. Você pode guardar e combinar habilidades repetidas.</p></div>
  <div class="window-footer">✧ Três espaços, seis pontos de capacidade. A caça continua ao fundo.</div>
</section>
<section id="fusion-panel" class="game-window frame" role="dialog" aria-labelledby="fusion-title" hidden><div class="window-header"><div><p class="label">PREDADOR / SÍNTESE</p><h2 id="fusion-title">Câmara de síntese</h2></div><button class="close-window" aria-label="Fechar fusões">×</button></div><div class="window-body">${synthesisMarkup}</div><div class="window-footer">Dois ingredientes · confira a prévia e confirme</div></section>
<section id="boss-panel" class="game-window frame" role="dialog" aria-labelledby="boss-title" hidden><div class="window-header"><div><p class="label" id="boss-area-label">DESAFIO DA CAVERNA</p><h2 id="boss-title">Serpente Negra Anciã</h2></div><button class="close-window" aria-label="Fechar chefe">×</button></div><div class="window-body"><div class="boss-art" aria-hidden="true">♜</div><p id="boss-description" class="boss-description">Um antigo besouro coberto de pedra guarda o coração da floresta. Escolha sua build antes de entrar na arena.</p><div id="boss-traits" class="boss-traits"><p><b>Carapaça pétrea</b> · recebe 60% menos dano físico. Veneno ignora a defesa; água causa +25% de dano.</p><p><b>Impacto sísmico</b> · avisa antes de atacar uma área. Instinto caçador recua automaticamente; Véu de névoa reduz o impacto.</p><p><b>Preparação</b> · nível 4 recomendado. Você entra com vida cheia e não pode trocar a build durante o desafio.</p></div><p id="boss-requirements" class="hint"></p><p id="boss-result" class="boss-result"></p><button id="challenge" class="hunt-button">Desafiar guardião</button><p class="hint">Recompensa: 10 essências, 100 EXP e 1 troféu por vitória. Uma derrota não remove seu progresso. O poder do guardião acompanha o nível de entrada até o nível 8.</p></div></section>
<section id="journal-panel" class="game-window frame" role="dialog" aria-labelledby="journal-title" hidden><div class="window-header"><div><p class="label">GRANDE SÁBIO</p><h2 id="journal-title">Diário da expedição</h2></div><button class="close-window" aria-label="Fechar diário">×</button></div><div class="window-body"><div id="log" class="log" role="log"></div></div></section>
<section id="settings-panel" class="game-window frame" role="dialog" aria-labelledby="settings-title" hidden><div class="window-header"><div><p class="label">SLIME · ORIGENS</p><h2 id="settings-title">Opções</h2></div><button class="close-window" aria-label="Fechar opções">×</button></div><div class="window-body settings"><p>Progresso salvo neste navegador. Saves da primeira versão são migrados automaticamente. Ao trocar de janela, a caça visível continua. Com a aba oculta, uma expedição acumula recompensas e retoma automaticamente. Usa 50% do ritmo observado ou uma estimativa inicial, com limite de 2 horas e 240 abates por ausência. Não explora novas regiões nem enfrenta chefes.</p><div class="save-tools"><button id="sound-toggle">Áudio</button><button id="export-save">Exportar save</button><label class="import-save">Importar save<input id="import-save" type="file" accept="application/json,.json"></label></div><details class="save-text-import"><summary>Restaurar save por texto</summary><label>JSON do save<textarea id="import-save-text" aria-label="JSON do save" rows="4" placeholder="Cole aqui o conteúdo do arquivo de save"></textarea></label><button id="import-save-text-button">Validar e restaurar</button></details><div id="restore-confirmation" hidden><p id="restore-description"></p><button id="confirm-restore">Confirmar restauração</button><button id="cancel-restore">Cancelar restauração</button></div><p id="save-feedback" role="status"></p><button id="fullscreen">⛶ Entrar em tela cheia</button><div class="shortcut-guide"><span>I · Inventário</span><span>H · Habilidades</span><span>F · Fusões</span><span>B · Chefe</span><span>J · Diário</span><span>O · Opções</span><span>Esc · Fechar menu</span></div><div class="reset-area"><p>Reinicia nível, essências, troféus e habilidades.</p><button id="reset">Recomeçar aventura</button></div></div></section>`;

const el = (id: string) => document.getElementById(id)!;
const put = (id: string, value: string | number) => { const target=el(id),text=String(value);if(target.textContent!==text)target.textContent=text; };
function togglePanel(id: string | null, trigger?: HTMLElement) {
  if(id==='merchant-panel'&&!inVillage){log('Visite Myourmiles na vila para negociar.');return;}
  if(id==='village-panel'&&!inVillage){enterVillage();return;}
  const next = activePanel === id ? null : id;
  document.querySelectorAll<HTMLElement>('.game-window').forEach(p => p.hidden = p.id !== next);
  document.querySelectorAll<HTMLElement>('[data-panel]').forEach(b => { b.setAttribute('aria-expanded', String(b.dataset.panel === next)); b.setAttribute('aria-controls', b.dataset.panel!); });
  activePanel = next;
  if(next){pendingLoot=0;renderMenus();}
  if(next)chime();
  if (next) { panelTrigger = trigger ?? panelTrigger; document.querySelector<HTMLElement>(`#${next} .close-window`)?.focus({ preventScroll: true }); }
  else panelTrigger?.focus({ preventScroll: true });
}
document.querySelectorAll<HTMLButtonElement>('[data-panel]').forEach(b => { b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', b.dataset.panel!); b.onclick = () => togglePanel(b.dataset.panel!, b); });
document.querySelectorAll<HTMLButtonElement>('[data-panel="village-panel"]').forEach(b=>b.onclick=()=>enterVillage());

document.querySelectorAll<HTMLButtonElement>('.close-window').forEach(b => b.onclick = () => togglePanel(null));
window.addEventListener('keydown', event => {
  if (event.target instanceof HTMLSelectElement || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.ctrlKey || event.altKey || event.metaKey || event.repeat) return;
  if(event.key.toLowerCase()==='v'){event.preventDefault();if(inVillage)leaveVillage();else enterVillage();return;}
  const panel = ({ i:'inventory-panel', v:'village-panel', h: 'skills-panel', f: 'fusion-panel', b: 'boss-panel', j: 'journal-panel', o: 'settings-panel' } as Record<string, string>)[event.key.toLowerCase()];
  if (event.key === 'Escape') togglePanel(null);
  else if (panel) { event.preventDefault(); togglePanel(panel, document.querySelector<HTMLElement>(`[data-panel="${panel}"]`)!); }
});
function log(message: string, special = false) {
  const row = document.createElement('p'), time = document.createElement('time');
  time.textContent = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  row.append(time, document.createTextNode(message)); if (special) row.className = 'special';
  const journalBody=el('log').closest<HTMLElement>('.window-body'),oldTop=journalBody?.scrollTop??0,oldHeight=journalBody?.scrollHeight??0;
  el('log').prepend(row); while (el('log').children.length > 40) el('log').lastElementChild?.remove();
  if(journalBody&&oldTop>0)journalBody.scrollTop=oldTop+journalBody.scrollHeight-oldHeight;
  if(special)chime();
  put('notice-text', message); el('notice').classList.toggle('special-notice', special);
}
let pendingLoot=0;
function updateLiveCounters(){
 put('resources',`${state.coins} MOEDAS · ${state.essence} ESSÊNCIAS · ${state.bossWins} ${state.bossWins===1?'TROFÉU':'TROFÉUS'}`);
 put('journey-objective','◆ '+nextObjective(state).text);
 put('inventory-coins',`◉ ${state.coins} moedas`);
 put('collection',`${state.inventory.length} cópias · ${state.coins} moedas`);
 document.querySelectorAll<HTMLElement>('[data-resource-count]').forEach(node=>{const text=String(state.village.materials[node.dataset.resourceCount as Material]??0);if(node.textContent!==text)node.textContent=text;});
 put('fusion-pending',pendingLoot?`${pendingLoot} novas cópias recebidas. Atualize a mochila para incluí-las.`:'As combinações usam as cópias atuais da mochila.');
 put('pending-loot-text',pendingLoot?`${pendingLoot} ${pendingLoot===1?'nova cópia recebida':'novas cópias recebidas'} na mochila`:'Mochila atualizada · caça independente');
 el('pending-loot').classList.toggle('has-new',pendingLoot>0);el('show-new-loot').style.visibility=pendingLoot?'visible':'hidden';
}
function receiveRewards(copies=0){
 if(activePanel&&copies>0)pendingLoot+=copies;
 updateLiveCounters();
}
function renderMenus(){preserveMenuState(activePanel?el(activePanel):null,renderActiveMenu);}
function renderActiveMenu() {
  const focused=document.activeElement as HTMLElement|null,focusId=focused?.id;
  const cursor=focused instanceof HTMLInputElement&&focused.type==='search'?focused.selectionStart:null;
  const panelScroll=activePanel?document.querySelector<HTMLElement>(`#${activePanel} .window-body`)?.scrollTop:undefined;

  const bossActive = scene?.bossActive ?? false;
  put('journey-objective','◆ '+nextObjective(state).text);
  if(activePanel==='village-panel')renderVillage(state,bossActive,()=>{save();renderMenus();villageMap.refresh();scene.renderHud();},message=>log(message,true));
  put('resources', `${state.coins} MOEDAS · ${state.essence} ESSÊNCIAS · ${state.bossWins} ${state.bossWins === 1 ? 'TROFÉU' : 'TROFÉUS'}`);
  el('equipped-name').innerHTML=state.equipped.length?state.equipped.map(id=>skillIcon(id)).join('')+`<small>${state.equipped.length}/3</small>`:'Espaços vazios';
  el('equipped-button').title = state.equipped.map(id => skills[id].name).join(' + ') || 'Escolher habilidades';
  put('build-hint',bossActive?'Equipamentos, habilidades e negociações travados durante o desafio.':'Cada slot usa uma cópia específica. Clique no slot e escolha um item da mochila.');
  const inventoryChanged=()=>{save();renderMenus();scene.renderHud();};
  if(activePanel==='skills-panel'||activePanel==='fusion-panel')renderItemMenus(state,bossActive,inventoryChanged,message=>log(message,true),activePanel==='skills-panel'?'skills':'fusion');
  if(activePanel==='inventory-panel')renderInventory(state,bossActive,inventoryChanged,message=>log(message,true));
  if(activePanel==='merchant-panel')renderMerchant(state,bossActive,()=>inVillage,inventoryChanged,message=>log(message,true));
  updateLiveCounters();
  if(activePanel!=='boss-panel')return;
  const discoveries = kinds.filter(k => state.unlocked[k]).length;
  put('boss-requirements', state.level < 3 || discoveries < 3 ? `Para desafiar: nível 3 (${state.level}/3) e 3 habilidades absorvidas (${discoveries}/3).` : `Desafio disponível · ${state.equipped.length}/3 habilidades equipadas · ${state.bossWins} ${state.bossWins === 1 ? 'vitória' : 'vitórias'}.`);
  put('boss-result', lastBossResult);
  (el('challenge') as HTMLButtonElement).disabled = bossActive || state.level < 3 || discoveries < 3 || scene.recovering > 0;
  const cave=scene.area==='cave';
  put('challenge',bossActive?'Desafio em andamento':cave?'Desafiar Serpente Anciã':'Desafiar guardião');
  put('boss-title',cave?'Serpente Negra Anciã':'Guardião da carapaça');
  put('boss-area-label',cave?'DESAFIO DA CAVERNA · SETOR 5':'JURA · CORAÇÃO MÁGICO');
  put('boss-description',cave?'Uma serpente anormal domina o abismo. Sua aura anuncia um hálito corrosivo. Variante criada para o jogo; Veldora continua sendo um aliado.':'Um antigo besouro coberto de pedra guarda o coração da floresta.');
  if(cave)el('boss-traits').innerHTML='<p><b>Escamas antigas</b> · reduz dano físico. Água e veneno atravessam a defesa.</p><p><b>Hálito corrosivo</b> · área marcada antes de liberar veneno. Instinto caçador ou Percepção mágica recuam do ataque.</p><p><b>Recompensa</b> · 3 cópias garantidas (veneno, calor e paralisia), 10 essências, 100 EXP, 3 escamas e 2 cristais.</p>';
  else el('boss-traits').innerHTML='<p><b>Carapaça pétrea</b> · reduz dano físico. Água e veneno atravessam a defesa.</p><p><b>Impacto sísmico</b> · preparação marcada no chão. Instinto caçador permite recuar.</p><p><b>Recompensa</b> · 8 ferro, 4 magiminério, 2 cristais, 10 essências, 100 EXP e 1 troféu.</p>';

  (el('priority') as HTMLSelectElement).disabled = bossActive;
  if(focusId){const replacement=document.getElementById(focusId);if(replacement&&replacement!==focused){replacement.focus({preventScroll:true});if(cursor!==null&&replacement instanceof HTMLInputElement&&replacement.type==='search')replacement.setSelectionRange(cursor,cursor);}}
  if(panelScroll!==undefined&&activePanel){const body=document.querySelector<HTMLElement>(`#${activePanel} .window-body`);if(body)body.scrollTop=panelScroll;}

}

type Enemy = { unreachableUntil:number; radius:number; visualHeight:number; barWidth:number; barOffset:number; zone: number; x: number; y: number; baseScale: number; action: { clock: AttackClock; aim: { x: number; y: number }; direction: { x: number; y: number } } | null; kind: Kind; boss: boolean; rooted: number; sprite: Phaser.GameObjects.Sprite; shadow: Phaser.GameObjects.Ellipse; hitUntil: number; hp: number; max: number; bar: Phaser.GameObjects.Graphics; attackAt: number; poisonUntil: number; poisonPower: number; poisonAt: number; wet: number };
class Meadow extends WorldScene {
  frameBudget=new FrameBudget();
  routeWatchdog=new HuntWatchdog();
  player!: Phaser.GameObjects.Sprite;
  playerShadow!: Phaser.GameObjects.Ellipse;
  playerPose = 0;
  playerHit = 0;
  enemies: Enemy[] = [];
  health = maxHp(state);
  target: Enemy | null = null;
  attackAt = 0;
  recovering = 0;
  uiAt = 0;
  bossActive = false;
  bossLevel = 1;
  caveBoss = false;
  returnSector = 0;
  springAt = Math.max(0,(state.springReadyAt??0)-Date.now());
  slamAt = 6500;
  windup = 0;
  warning!: Phaser.GameObjects.Graphics;
  skillTimers: Record<string, number> = {};
  generation = 0;
  combatFX!: CombatEffects;
  playerBaseScale = 1;
  playerAttack: { clock: AttackClock; target: Enemy } | null = null;
  sector = state.caveSector;
  sectorKills = 0;
  destination: number | null = null;
  exploring = state.autoExplore;
  path: Point[] = [];
  pathAt = 0;
  veldoraSeen = false;
  regions(){return this.area==='cave'?sectors:forestRegions;}
  zoneCenter(i:number){return this.area==='cave'?center(i):forestCenter(i);}
  navigation(){return this.area==='cave'?{route,walkable,clearLine,nearestFloor}:forestNav;}
  lootContext(sector=this.sector){return {area:this.area,sector};}
  rememberSector(){if(this.area==='cave')state.caveSector=this.sector;else state.forestSector=this.sector;}
  enemyName(e: Enemy) { return this.area === 'cave' && e.kind === 'bat' ? 'Morcego gigante' : this.area==='forest'&&e.kind==='wolf'?'Lobo terrível':creatures[e.kind].name; }
  setArea(area: 'cave' | 'forest') {
    if(this.bossActive || !this.player) return;
    observationStart=Date.now();observedKills=0;this.clearEncounter();this.rememberSector();this.area=area;state.activeArea=area;this.sector=area==='cave'?state.caveSector:state.forestSector;this.destination=null;this.path=[];this.pathAt=0;this.sectorKills=0;this.routeWatchdog.reset();
    this.drawMap(); this.cameras.main.setBounds(0,0,area==='cave'?CAVE_WIDTH:FOREST_WIDTH,area==='cave'?CAVE_HEIGHT:FOREST_HEIGHT);
    const c=this.zoneCenter(this.sector); this.player.setPosition(c.x,c.y);this.playerShadow.setPosition(c.x,c.y);this.health=maxHp(state);this.recovering=0;
    this.cameras.main.centerOn(c.x,c.y);this.populate();this.renderHud();renderMenus();save();
    el('area-cave').setAttribute('aria-pressed',String(area==='cave'));el('area-forest').setAttribute('aria-pressed',String(area==='forest'));
    priority='any'; (el('priority') as HTMLSelectElement).value='any';
    for(const option of Array.from((el('priority') as HTMLSelectElement).options)) { option.hidden=option.value!=='any'&&(area==='cave'?!['bat','serpent','centipede','armorsaurus','spider'].includes(option.value):!forestRegions.some(r=>r.monsters.includes(option.value as Kind))); if(option.value==='bat')option.textContent=area==='cave'?'Morcego gigante':'Morcego rubro'; }
  }
  travelTo(i: number,area:'cave'|'forest'=this.area) {
    if(this.bossActive||!Number.isInteger(i)||i<0||i>=(area==='cave'?sectors:forestRegions).length)return;
    if(this.area!==area)this.setArea(area);
    this.destination=i;this.target=null;this.playerAttack=null;this.path=[];this.pathAt=0;
    log(`Exploração: seguindo ${this.area==='forest'?'as trilhas':'os corredores'} até ${this.regions()[i].name}.`,true);
    this.renderHud();
  }
  moveToward(goal: Point, step: number) {
    let aim=goal;
    if(!this.navigation().clearLine(this.player,goal)) {
      this.pathAt-=16;
      if(this.pathAt<=0||!this.path.length){this.path=this.navigation().route(this.player,goal);this.pathAt=450;}
      while(this.path.length&&Phaser.Math.Distance.Between(this.player.x,this.player.y,this.path[0].x,this.path[0].y)<5)this.path.shift();
      if(!this.path.length)return false; aim=this.path[0];
    } else this.path=[];
    const distance=Phaser.Math.Distance.Between(this.player.x,this.player.y,aim.x,aim.y);if(distance<1)return false;
    const a=Phaser.Math.Angle.Between(this.player.x,this.player.y,aim.x,aim.y),n=Math.min(step,distance);
    const next={x:this.player.x+Math.cos(a)*n,y:this.player.y+Math.sin(a)*n};
    if(!this.navigation().clearLine(this.player,next)){this.path=[];this.pathAt=0;return false;}
    this.player.setPosition(next.x,next.y).setFlipX(Math.cos(a)<0);return true;
  }
  strikes: { owner: Enemy; remaining: number; aim: { x: number; y: number }; spec: AttackSpec; damage: number }[] = [];
  preload() { preloadSpriteArt(this);this.load.atlas('forestDecor','/assets/sprites/forest-decor-anime-v3.png','/assets/sprites/forest-decor-anime-v3.json'); this.load.image('veldora','/assets/sprites/veldora-cave.png'); this.load.atlas('caveDecor','/assets/sprites/cave-decor-v2.png','/assets/sprites/cave-decor-v2.json'); }
  create() {
    this.frameBudget.reset(performance.now());
    this.events.on('wake',()=>{this.frameBudget.reset(performance.now());this.routeWatchdog.reset();});
    registerSpriteAnimations(this);
    this.playerShadow = this.add.ellipse(400, 240, actorSize('slime').radius*2, 6, 0x10291e, .3);
    this.player = makeActor(this, 400, 240, 'slime');
    this.playerBaseScale = this.player.scaleX;
    this.combatFX = new CombatEffects(this);
    this.warning = this.add.graphics().setDepth(19);
    this.cameras.main.setBounds(0, 0, CAVE_WIDTH, CAVE_HEIGHT);
    const fit = () => this.cameras.main.setZoom(Math.max(this.scale.width / 800, this.scale.height / 480));
    fit(); this.cameras.main.startFollow(this.player, true, .06, .06); this.scale.on('resize', fit);
    this.resetSkillTimers(); this.setArea(state.activeArea); renderMenus(); this.renderHud();
    log('Grande Sábio: você despertou na Caverna do Selo. Abra Mapa para escolher uma rota.', true);
    this.events.once('shutdown', () => this.scale.off('resize', fit));
  }
  populate() { if(this.area==='cave') { for(let zone=0;zone<7;zone++)for(let n=0;n<10;n++)this.spawn(zone===2&&n%4===0?'spider':sectors[zone].kind,false,zone); }else for(let zone=0;zone<forestRegions.length;zone++)for(let n=0;n<10;n++){const monsters=forestRegions[zone].monsters;this.spawn(monsters[n%monsters.length],false,zone);} }
  spawn(kind: Kind, boss = false, zone = this.sector) {
    let x = boss ? 460 : Phaser.Math.Between(75, 725), y = boss ? 225 : Phaser.Math.Between(85, 405);
    if (!boss && Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < 85) x = this.player.x < 400 ? 690 : 100;
    if(this.area==='cave'&&!boss) {const c=center(zone);do{x=zone===6?c.x-Phaser.Math.Between(180,400):c.x+Phaser.Math.Between(-440,440);y=c.y+Phaser.Math.Between(-300,300);}while(!walkable({x,y}));}
    if(this.area==='forest'){const points=forestSpawnPoints(zone),p=boss?forestCenter(zone):Phaser.Utils.Array.GetRandom(points);x=p.x;y=p.y;}
    if(boss&&this.caveBoss){const c=center(4);x=c.x+115;y=c.y;}
    const hp = boss ? (this.caveBoss?780:560) + this.bossLevel * (this.caveBoss?45:20) : creatures[kind].hp;
    const art=boss?(this.caveBoss?'caveBoss':'guardian'):creatures[kind].texture;
    const sprite=makeActor(this,x,y,art),frame=sprite.frame,layout=actorLayout(art,{w:frame.cutWidth,h:frame.cutHeight});
    const enemy: Enemy = { unreachableUntil:0,radius:layout.radius,visualHeight:layout.height,barWidth:layout.barWidth,barOffset:layout.barOffset, x, y, zone, rooted: 0, baseScale: sprite.scaleX, action: null, kind, boss, sprite, shadow: this.add.ellipse(x, y, layout.shadowWidth, layout.shadowHeight, 0x10291e, .3), hitUntil: 0, hp, max: hp, bar: this.add.graphics().setDepth(20), attackAt: Phaser.Math.Between(250, 550), poisonUntil: 0, poisonPower: 1, poisonAt: 1000, wet: 0 };
    this.enemies.push(enemy); return enemy;
  }
  clearEncounter() { this.generation++; this.combatFX?.clear(); this.strikes = []; this.playerAttack = null; this.playerPose = 0; this.playerHit = 0; this.player.clearTint().setScale(this.playerBaseScale); for (const e of this.enemies) { e.sprite.destroy(); e.shadow.destroy(); e.bar.destroy(); } this.enemies = []; this.target = null; this.warning.clear(); }
  resetSkillTimers() { this.skillTimers = Object.fromEntries(['frog','wisp','miasma','conductor','steel','ultrasound','waterBlade','binding','sever'].map((id,i)=>[id,900+i*180])); }
  startBoss() {
    if(inVillage){log('Volte à área de caça para iniciar um desafio.');return;}
    if (this.bossActive || state.level < 3 || kinds.filter(k => state.unlocked[k]).length < 3 || this.recovering > 0) return;
    this.caveBoss=this.area==='cave';this.returnSector=this.sector;
    if(this.caveBoss){this.sector=4;state.caveSector=4;}else{this.sector=5;state.forestSector=5;}
    this.clearEncounter(); this.bossActive = true; this.bossLevel = Math.min(8, state.level); this.health = maxHp(state); this.attackAt = 0; this.slamAt = 6500; this.windup = 0;
    this.anims.resumeAll(); this.tweens.resumeAll(); this.time.paused = false; this.playerPose = 0; this.playerHit = 0; this.player.clearTint(); const entry=this.zoneCenter(this.sector);this.player.setPosition(entry.x-100,entry.y);this.cameras.main.centerOn(entry.x,entry.y);this.path=[];this.destination=null;this.target = this.spawn(this.caveBoss?'serpent':'beetle', true);put('boss-name',this.caveBoss?'Serpente Negra Anciã':'Guardião da carapaça'); this.resetSkillTimers();
    paused = false; put('pause', 'Ⅱ Pausar caça'); el('boss-hud').hidden = false; togglePanel(null); renderMenus();
    log(this.caveBoss?'A Serpente Negra Anciã despertou! Observe a preparação do hálito corrosivo.':'Guardião desperto! Observe o impacto sísmico.',true);
    this.renderHud();
  }
  finishBoss(result: 'win' | 'loss' | 'retreat') {
    if (!this.bossActive) return;
    this.bossActive = false; this.windup = 0; this.clearEncounter(); el('boss-hud').hidden = true;
    if (result === 'win') { if(this.caveBoss){state.caveWins++;addItem(state,'serpent');addItem(state,'heat');addItem(state,'centipede');} if(this.caveBoss)state.village.materials.scale+=3;else{state.village.materials.iron+=8;state.village.materials.ore+=4;}state.village.materials.crystal+=2;state.bossWins++; state.essence += 10; state.xp += 100; applyLevels(state); lastBossResult = `Vitória! ${this.caveBoss?'+3 habilidades (veneno, calor e paralisia), ':''}+10 essências, +100 EXP, ${this.caveBoss?'+3 escamas':'+8 ferro e +4 magiminério'}, +2 cristais e +1 troféu. Total: ${state.bossWins} ${state.bossWins === 1 ? 'troféu' : 'troféus'}.`; save(); }
    else lastBossResult = result === 'loss' ? 'Derrota. Nenhum progresso perdido. Tente defesa e recuperação, ou água e eletricidade. Instinto caçador evita o impacto.' : 'Você recuou. Ajuste sua build e desafie novamente quando quiser.';
    this.sector=this.returnSector;this.rememberSector();const home=this.zoneCenter(this.sector);this.health = maxHp(state); this.player.setPosition(home.x,home.y);this.cameras.main.centerOn(home.x,home.y);this.path=[]; this.resetSkillTimers(); this.populate();save();
    log(lastBossResult, true); renderMenus(); this.renderHud(); if (activePanel !== 'boss-panel') togglePanel('boss-panel');
  }
  float(x: number, y: number, text: string, color = '#fff0bf') {
    const t = this.add.text(x, y - 38, text, { fontFamily: 'monospace', fontSize: '11px', color, stroke: '#17271d', strokeThickness: 3 }).setOrigin(.5).setDepth(40);
    this.tweens.add({ targets: t, y: y - 70, alpha: 0, duration: 800, onComplete: () => t.destroy() });
  }
  pulse(x: number, y: number, radius: number, color: number) {
    const ring = this.add.circle(x, y, radius, color, .15).setStrokeStyle(1, color, .6).setDepth(18);
    this.tweens.add({ targets: ring, alpha: 0, scale: 1.2, duration: 420, onComplete: () => ring.destroy() });
  }
  hurt(enemy: Enemy, base: number, type: DamageType = 'physical'): number {
    if (!this.enemies.includes(enemy)) return 0;
    const damage = damageAgainst(base, type, enemy.boss, enemy.wet > 0), actual = Math.min(enemy.hp, damage);
    enemy.hp -= damage; enemy.hitUntil = 130;
    if (type !== 'poison') this.combatFX.impact(type === 'water' ? 'water' : type === 'electric' ? 'bolt' : 'slime', { x: enemy.x, y: enemy.y - 18 }, type === 'water' ? 0x8ce5f1 : type === 'electric' ? 0xf3df83 : 0xa8eaf2);
    this.float(enemy.x, enemy.y-enemy.visualHeight*.4, `${type === 'poison' ? '☣ ' : type === 'water' ? '≈ ' : type === 'electric' ? 'ϟ ' : ''}${damage}`, type === 'poison' ? '#d1a2e4' : type === 'water' ? '#93dce7' : '#f1e5ad');
    if (enemy.hp <= 0) this.defeat(enemy);
    return actual;
  }
  defeat(enemy: Enemy) {
    if (enemy.boss) { this.finishBoss('win'); return; }
    const k = enemy.kind, x = enemy.x, y = enemy.y;
    this.enemies.splice(this.enemies.indexOf(enemy), 1); enemy.sprite.destroy(); enemy.shadow.destroy(); enemy.bar.destroy(); if (this.target === enemy) this.target = null;
    if(enemy.zone===this.sector && this.destination===null) {this.sectorKills++;if(this.exploring&&this.sectorKills>=6&&this.sector<this.regions().length-1)this.travelTo(this.sector+1);}
    const reward = awardKill(state,k,undefined,undefined,undefined,this.lootContext(enemy.zone));
    const resourceSummary=reward.materials.map(d=>`+${d.quantity} ${materialNames[d.material]}`).join(', '); this.health = Math.min(maxHp(state), this.health + 5);
    if (reward.unlocked) { log(`Absorção concluída: ${skills[reward.item!.skill].name}! Abra Habilidades para equipar.`, true); this.float(this.player.x, this.player.y - 24, 'ABSORÇÃO!', '#d6f49d'); }
    else log(reward.item?`Absorvido: ${itemLabel(reward.item)} · ${resourceSummary}.`:`${this.enemyName(enemy)}: +2 moedas, +${creatures[k].xp} EXP · ${resourceSummary}.`);
    if (reward.levels) { this.health = maxHp(state); log(`Nível ${state.level}! Ataque e vitalidade aumentaram.`, true); }
    const token = this.generation; this.time.delayedCall(3000, () => { if (token === this.generation && !this.bossActive) this.spawn(k,false,enemy.zone); });
    const orb = this.add.circle(x, y, 4, creatures[k].color).setDepth(30); this.tweens.add({ targets: orb, x: this.player.x, y: this.player.y, scale: 0, duration: 400, onComplete: () => orb.destroy() });
    lastHuntedKind=k;observedKills++;save();receiveRewards(reward.item?1:0);
  }
  takePlayerDamage(damage: number, style: AttackSpec['style'], color: number) {
    this.health -= damage; this.playerHit = 180; this.player.setTint(0xffc8ca);
    if (!this.playerAttack) { this.playerPose = 180; this.player.play('slime-hurt'); }
    this.combatFX.impact(style, { x: this.player.x, y: this.player.y - 14 }, color);
    this.float(this.player.x + 12, this.player.y - 6, `−${damage}`, '#efaa98');
  }
  updatePlayerAttack(dt: number) {
    const action = this.playerAttack;
    if (!action) { this.player.setScale(this.playerBaseScale); return; }
    if (!this.enemies.includes(action.target)) { this.playerAttack = null; this.player.setScale(this.playerBaseScale); return; }
    const step = advanceAttack(action.clock, slimeAttack, dt), target = action.target;
    this.player.anims.stop();
    if (step.phase === 'windup') { this.player.setFrame('idle-2').setScale(this.playerBaseScale * (1 + step.progress * .09), this.playerBaseScale * (1 - step.progress * .12)); }
    else if (step.phase === 'strike') this.player.setFrame(`attack-${Math.min(2, Math.floor(step.progress * 3))}`).setScale(this.playerBaseScale);
    else this.player.setFrame('idle-0').setScale(this.playerBaseScale);
    if (step.release) this.combatFX.slash('slime', { x: this.player.x, y: this.player.y - 14 }, { x: target.x, y: target.y - target.visualHeight*.5 }, 0x9aeaff);
    if (step.impact) {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, target.x, target.y);
      if (distance < contactReach(target.radius)+20) {
        if ((state.equipped.includes('snake') || state.equipped.includes('serpent'))) {target.poisonUntil=4000;target.poisonPower=Math.max(state.equipped.includes('snake')?skillPower(state,'snake'):1,state.equipped.includes('serpent')?skillPower(state,'serpent'):1);}
        if(state.equipped.includes('centipede')) target.attackAt += 350*skillPower(state,'centipede');
        if(state.equipped.includes('spider'))target.rooted=Math.max(target.rooted,(target.boss?.35:1)*800*skillPower(state,'spider'));
        const damage = this.hurt(target, attack(state)*effects(state).damageBonus);
        this.health = Math.min(maxHp(state), this.health + damage * effects(state).drain);
      }
    }
    if (step.phase === 'done') this.playerAttack = null;
  }
  updateEnemyAttack(enemy: Enemy, spec: AttackSpec, dt: number, moving: boolean) {
    const action = enemy.action, key = enemy.boss ? this.caveBoss?'caveBoss':'guardian' : enemy.kind;
    let offsetX = 0, offsetY = 0, stretchX = 1, stretchY = 1, angle = 0;
    if (action) {
      const step = advanceAttack(action.clock, spec, dt);
      enemy.sprite.anims.stop();
      if (step.phase === 'windup') {
        enemy.sprite.setFrame('2');
        offsetX = -action.direction.x * step.progress * 5;
        offsetY = -action.direction.y * step.progress * 4;
        stretchX = 1 + step.progress * .07; stretchY = 1 - step.progress * .08;
        angle = -action.direction.x * step.progress * 4;
      } else if (step.phase === 'strike') {
        enemy.sprite.setFrame('3');
        const lunge = Math.sin(step.progress * Math.PI) * (spec.ranged ? 4 : enemy.boss ? 22 : 15);
        offsetX = action.direction.x * lunge; offsetY = action.direction.y * lunge;
        stretchX = 1.06; stretchY = .97;
      } else {
        enemy.sprite.setFrame('0');
        offsetX = -action.direction.x * (1 - step.progress) * 2;
      }
      if (step.release) {
        action.aim = { x: this.player.x, y: this.player.y };
        const aimLength = Math.max(1, Phaser.Math.Distance.Between(enemy.x, enemy.y, action.aim.x, action.aim.y));
        action.direction = { x: (action.aim.x - enemy.x) / aimLength, y: (action.aim.y - enemy.y) / aimLength };
        enemy.sprite.setFlipX(action.direction.x < 0);
        const origin = { x: enemy.x + action.direction.x * 16, y: enemy.y - enemy.visualHeight*.5 };
        const destination = { x: action.aim.x, y: action.aim.y - 14 };
        if (spec.ranged) this.combatFX.shot(spec.style, origin, destination, spec.color, spec.travel);
        else this.combatFX.slash(spec.style, origin, destination, spec.color);
        this.strikes.push({ owner: enemy, remaining: spec.travel, aim: { ...action.aim }, spec, damage: incomingDamage(enemy.boss ? 11 + this.bossLevel * .5 : creatures[enemy.kind].damage, state) });
      }
      if (step.phase === 'done') enemy.action = null;
    } else enemy.sprite.play(`${key}-${moving ? 'walk' : 'idle'}`, true);
    const hover = !enemy.boss && ['moth', 'wisp', 'bat'].includes(enemy.kind) ? Math.sin(this.time.now / 220 + enemy.x) * 1.2 : 0;
    enemy.sprite.setPosition(enemy.x + offsetX, enemy.y + offsetY + hover).setScale(enemy.baseScale * stretchX, enemy.baseScale * stretchY).setAngle(angle);
    if (!action && moving) enemy.sprite.setFlipX(this.player.x < enemy.x);
  }
  updateStrikes(dt: number) {
    const remaining: typeof this.strikes = [];
    for (const strike of this.strikes) {
      if (!strike.spec.ranged && !this.enemies.includes(strike.owner)) continue;
      strike.remaining -= dt;
      if (strike.remaining > 0) { remaining.push(strike); continue; }
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, strike.aim.x, strike.aim.y);
      if (distance <= (strike.spec.ranged ? 25 : 31)) this.takePlayerDamage(strike.damage, strike.spec.style, strike.spec.color);
      else this.combatFX.impact(strike.spec.style, { x: strike.aim.x, y: strike.aim.y - 10 }, strike.spec.color);
    }
    this.strikes = remaining;
  }
  castSkills(dt: number) {
    for (const id of ['frog', 'wisp', 'miasma', 'conductor', 'steel', 'ultrasound', 'waterBlade', 'binding', 'sever'] as const) {
      if (!state.equipped.includes(id)) continue;
      this.skillTimers[id] -= dt; if (this.skillTimers[id] > 0) continue;
      const near = this.enemies.filter(e => this.navigation().clearLine(this.player,e) && Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y) < (id === 'miasma' ? 110 : 175)).sort((a, b) => Number(b === this.target) - Number(a === this.target));
      if (!near.length) continue;
      this.skillTimers[id] = id === 'miasma' ? 1000 : (id === 'wisp'||id==='ultrasound') ? 4000 : 3000;
      this.pulse(this.player.x, this.player.y, id === 'miasma' ? 110 : 35, id === 'miasma' ? 0xb28ac6 : id === 'frog' ? 0x85d5de : 0xe7d48f);
      const targets = (id === 'frog'||id==='waterBlade') ? near.slice(0, 1) : id === 'miasma' ? near : near.slice(0, 3);
      const token = this.generation;
      for (const e of targets) {
        if (token !== this.generation) break;
        if (id === 'frog' || id === 'conductor' || id==='waterBlade'||id==='sever') e.wet = 4000;
        const base = id === 'miasma' ? 9 : id === 'conductor' ? 30 + state.level * 2 : id === 'frog' ? 12 + state.level * 2 : 14 + state.level * 2;
        if(id==='binding'){e.rooted=(e.boss?.35:1)*1500*skillPower(state,id);e.action=null;e.attackAt=Math.max(e.attackAt,1800);}
        if(id==='ultrasound')e.attackAt+=600*skillPower(state,id);
        if(id==='steel'||id==='sever')this.combatFX.slash('claw',{x:this.player.x,y:this.player.y-12},{x:e.x,y:e.y-15},id==='steel'?0xd4e0ec:0x79d4e7);
        this.hurt(e, base*skillPower(state,id)*(id==='sever'?1.6:1), id==='miasma'?'poison':id==='steel'?'cut':id==='frog'||id==='waterBlade'||id==='sever'?'water':id==='ultrasound'||id==='binding'?'physical':'electric');
        if (token !== this.generation) return;
      }
    }
  }
  renderHud() {
    updateLiveCounters();
    const fx = effects(state);
    put('level', `Nível ${state.level} · Slime primordial`); put('hp-text', `${Math.ceil(this.health)} / ${maxHp(state)}`); put('xp-text', `${state.xp} / ${neededXp(state)}`);
    put('attack', Math.round(attack(state)*fx.damageBonus)); put('defense', `${Math.round(fx.defense * 100)}%`); put('kills', state.kills);
    el('hp-bar').style.width = `${Math.max(0, this.health / maxHp(state) * 100)}%`; el('xp-bar').style.width = `${Math.min(100, state.xp / neededXp(state) * 100)}%`;
    put('target', this.recovering > 0 ? 'Recuperando…' : this.target ? this.target.boss ? (this.caveBoss?'Serpente Negra Anciã':'Guardião da carapaça') : this.enemyName(this.target) : 'Procurando alvo…');
    if (this.target?.action) {
      const spec = enemyAttacks[this.target.boss ? this.caveBoss?'serpent':'guardian' : this.target.kind];
      const elapsed = this.target.action.clock.elapsed;
      put('target-action', `${spec.label} · ${elapsed < spec.windup ? 'PREPARANDO' : elapsed < spec.windup + spec.travel ? 'ATAQUE' : 'RECUPERANDO'}`);
    } else put('target-action', this.target ? 'Observando o inimigo' : '');
    put('status', paused ? 'CAÇA PAUSADA' : this.recovering > 0 ? 'RECUPERAÇÃO' : this.bossActive ? 'DESAFIO EM ANDAMENTO' : this.destination!==null?this.area==='forest'?'SEGUINDO AS TRILHAS':'EXPLORANDO CORREDORES':'CAÇA AUTOMÁTICA');
    put('location-name', this.bossActive ? (this.caveBoss?'Abismo · Serpente Anciã':'Arena do guardião') : this.regions()[this.sector].name);
    const heading=document.querySelector('.location>p');if(heading)heading.textContent=this.area==='cave'?'CAVERNA DO SELO · '+String(this.sector+1).padStart(2,'0')+'/07':'FLORESTA DE JURA · '+String(this.sector+1).padStart(2,'0')+'/06';
    put('spring-status',this.springAt>0?`Energia se renovando · ${Math.ceil(this.springAt/1000)} s`:'Água e hipokute: 1 cópia de Lâmina de água e 1 de Regeneração. Recarga de 60 s.');
    put('expedition-status',this.destination!==null?`Seguindo ${this.area==='forest'?'trilhas':'corredores'} → ${this.regions()[this.destination].name}`:`Setor ${this.sector+1}/${this.regions().length} · ${this.exploring?Math.min(6,this.sectorKills)+'/6':this.sectorKills} abates · ${this.exploring?'Exploração automática':'Caça neste setor'}`);
    syncMapProgress(this.area,this.sector,{cave:state.visited,forest:state.forestVisited});
    el('game').setAttribute('aria-label',this.area==='forest'?'Floresta de Jura: trilhas, regiões e caça automática':'Caverna do Selo: mapa de exploração e caça automática');
    if(this.destination!==null)put('target','Explorando → setor '+(this.destination+1));
    const boss = this.enemies.find(e => e.boss);
    if (boss) { put('boss-hp-text', `${Math.ceil(boss.hp)} / ${boss.max}`); el('boss-hp-bar').style.width = `${Math.max(0, boss.hp / boss.max * 100)}%`; put('boss-action', this.windup > 0 ? this.caveBoss?'⚠ HÁLITO CORROSIVO · recue!':'⚠ IMPACTO SÍSMICO · preparando ataque!' : this.caveBoss?'ESCAMAS ANTIGAS · −60% de dano físico':'CARAPAÇA PÉTREA · −60% de dano físico'); }
    if(inVillage){put('location-name','Tempest · Vila dos aliados');put('status','ZONA SEGURA · SEM MONSTROS');document.querySelector('.location>p')!.textContent='VILA · FLORESTA DE JURA';}

  }
  update(_time:number,_delta:number){
    const active=!document.hidden&&!paused&&!inVillage;
    const steps=this.frameBudget.steps(performance.now(),active);
    const elapsed=steps.reduce((sum,dt)=>sum+dt,0),follow=1-Math.exp(-Math.max(16,elapsed)/140);
    this.cameras.main.setLerp(follow,follow);
    if(!active){if(!document.hidden)this.renderHud();return;}
    for(const dt of steps)this.simulate(dt);
  }
  simulate(dt:number){
    if (paused) { this.renderHud(); return; }
    if (this.recovering > 0) { this.recovering -= dt; if (this.recovering <= 0) { this.health = maxHp(state); log('Vitalidade restaurada. Retomando a caça.');receiveRewards(); } this.renderHud(); return; }
    this.springAt=Math.max(0,(state.springReadyAt??0)-Date.now());
    const fx = effects(state), token = this.generation;
    this.playerPose = Math.max(0, this.playerPose - dt); this.playerHit = Math.max(0, this.playerHit - dt);
    if (this.playerHit <= 0) this.player.clearTint();
    let playerMoving = false;
    this.attackAt -= dt; this.health = Math.min(maxHp(state), this.health + dt / 1000 * (1.5 + fx.regen));
    if (!this.target || !this.enemies.includes(this.target) || this.target.unreachableUntil>Date.now() || (!this.bossActive && priority !== 'any' && this.target.kind !== priority && this.enemies.some(e => e.kind === priority))) {
      const local = this.enemies.filter(e=>(e.zone===this.sector)&&e.unreachableUntil<=Date.now());
      const candidates = local.filter(e => this.bossActive || priority === 'any' || e.kind === priority);
      this.target = (candidates.length ? candidates : local).reduce<Enemy | null>((best, e) => !best || Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y) < Phaser.Math.Distance.Between(this.player.x, this.player.y, best.x, best.y) ? e : best, null);
    }
    if(this.destination!==null) {
      this.target=null;const c=this.zoneCenter(this.destination);
      playerMoving=this.moveToward(c,dt*.095*fx.speed);
      if(Phaser.Math.Distance.Between(this.player.x,this.player.y,c.x,c.y)<35) {
        this.sector=this.destination;this.rememberSector();const visited=this.area==='cave'?state.visited:state.forestVisited;if(!visited.includes(this.sector))visited.push(this.sector);save();this.destination=null;this.sectorKills=0;this.path=[];
        log(`Setor descoberto: ${this.regions()[this.sector].name}.`,true);
        if(this.area==='cave'&&this.sector===6&&!this.veldoraSeen){this.veldoraSeen=true;log('Veldora: finalmente alguém para conversar! A Prisão Infinita o mantém selado. Este é um encontro amistoso.',true);togglePanel('map-panel');}
      }
    }
    let evading = false;
    if (this.bossActive && this.target) {
      const boss = this.target;
      this.slamAt -= dt;
      if (this.slamAt <= 0 && this.windup <= 0) { this.windup = 1700; this.slamAt = 8200; boss.action = null; log(this.caveBoss?'A serpente prepara hálito corrosivo! Recue da área marcada.':'Guardião carregando impacto! Instinto caçador pode recuar automaticamente.',true); }
      if (this.windup > 0) {
        this.windup -= dt; this.warning.clear().fillStyle(0xe6a35c, .16).fillCircle(boss.x, boss.y, 100).lineStyle(2, 0xefbb78, .7).strokeCircle(boss.x, boss.y, 100);
        if (fx.dodgeSlam) { evading = true; playerMoving = true; const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, boss.x, boss.y); if (distance < 130) { const a = Phaser.Math.Angle.Between(boss.x, boss.y, this.player.x, this.player.y); const next={x:this.player.x+Math.cos(a)*dt*.16,y:this.player.y+Math.sin(a)*dt*.16};if(this.navigation().clearLine(this.player,next))this.player.setPosition(next.x,next.y); } }
        if (this.windup <= 0) { this.warning.clear(); this.pulse(boss.x, boss.y, 100, 0xe9aa65); if (Phaser.Math.Distance.Between(this.player.x, this.player.y, boss.x, boss.y) <= 103) { const damage = incomingDamage((this.caveBoss?58:42) + this.bossLevel * 3, state, true); this.takePlayerDamage(damage,this.caveBoss?'venom':'crush',this.caveBoss?0xb49bd8:0xe7bf89); this.combatFX.ring({ x: boss.x, y: boss.y }, 0xe7bf89); this.float(this.player.x, this.player.y - 14, 'IMPACTO!', '#f2a781'); } else this.float(this.player.x, this.player.y, 'ESQUIVA!', '#c8e6a0'); }
      }
    }
    if (this.target && !evading && !this.playerAttack) {
      const e = this.target, reach = contactReach(e.radius), distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y);
      if (needsApproach(this.player,e,reach,this.navigation().clearLine(this.player,e))) { playerMoving = this.moveToward(e, dt * .065 * fx.speed); }
      else if (this.attackAt <= 0 && this.navigation().clearLine(this.player,e)) { this.attackAt = 850 / fx.haste; this.playerAttack = { clock: startAttack(), target: e }; this.player.setFlipX(e.x < this.player.x); }
    }
    if(!this.bossActive&&(this.target||this.destination!==null)){
      if(this.routeWatchdog.tick(dt,this.player,`${state.kills}:${this.destination}:${this.target?.hp??0}`)){
        if(this.target)this.target.unreachableUntil=Date.now()+8000;
        this.target=null;this.playerAttack=null;this.path=[];this.pathAt=0;
        if(!this.navigation().walkable(this.player)){const safe=this.navigation().nearestFloor(this.player);if(safe)this.player.setPosition(safe.x,safe.y);}
        log('Rota obstruída: Rimuru está recalculando o caminho.');
      }
    }else this.routeWatchdog.reset();
    this.updatePlayerAttack(dt);
    if (this.playerPose <= 0 && !this.playerAttack) this.player.play(playerMoving ? 'slime-walk' : 'slime-idle', true);
    this.playerShadow.setPosition(this.player.x, this.player.y + 1).setDepth(this.player.y / 100 - .05);
    if (token !== this.generation) return;
    this.castSkills(dt);
    if (token !== this.generation) return;
    for (const e of [...this.enemies]) {
      e.hitUntil = Math.max(0, e.hitUntil - dt);
      e.rooted=Math.max(0,e.rooted-dt);e.attackAt -= dt; e.wet = Math.max(0, e.wet - dt);
      if (e.poisonUntil > 0) { e.poisonUntil -= dt; e.poisonAt -= dt; if (e.poisonAt <= 0) { e.poisonAt = 1000; this.hurt(e, 5*e.poisonPower, 'poison'); if (token !== this.generation) return; if (!this.enemies.includes(e)) continue; } }
      const d = Phaser.Math.Distance.Between(e.x, e.y, this.player.x, this.player.y);
      const baseSpec=enemyAttacks[e.boss ? this.caveBoss?'serpent':'guardian' : e.kind];
      const spec={...baseSpec,range:baseSpec.ranged?baseSpec.range:Math.max(baseSpec.range,contactReach(e.radius)+8)};
      const visible = d<500&&this.navigation().clearLine(e,this.player);
      const enemyMoving = e.rooted<=0 && visible && !e.boss && !e.action && d < spec.range + 35 && d > (spec.ranged ? spec.range * .8 : Math.max(26,contactReach(e.radius)-8));
      if (enemyMoving) { const a = Phaser.Math.Angle.Between(e.x, e.y, this.player.x, this.player.y); const next={x:e.x+Math.cos(a)*dt*.023,y:e.y+Math.sin(a)*dt*.023};if(this.navigation().clearLine(e,next)){e.x=next.x;e.y=next.y;} }
      if (e.rooted<=0 && visible && d <= spec.range && e.attackAt <= 0 && !e.action && !(e.boss && this.windup > 0)) {
        const length = Math.max(1, d);
        e.action = { clock: startAttack(), aim: { x: this.player.x, y: this.player.y }, direction: { x: (this.player.x - e.x) / length, y: (this.player.y - e.y) / length } };
        e.attackAt = spec.cooldown;
        e.sprite.setFlipX(this.player.x < e.x);
      }
      this.updateEnemyAttack(e,spec,dt,enemyMoving);
      e.shadow.setPosition(e.x, e.y + 1).setDepth(e.y / 100 - .05);
      e.sprite.setDepth(e.y / 100); if (e.hitUntil > 0) e.sprite.setTint(0xffddcf); else if(e.rooted>0)e.sprite.setTint(0xd3c3eb);else if (e.wet > 0) e.sprite.setTint(0x9bdde3); else e.sprite.clearTint();
      const width=e.barWidth,offset=e.barOffset;
      e.bar.clear().fillStyle(0x15251a).fillRect(e.x - width / 2, e.y - offset, width, 3).fillStyle(e.poisonUntil > 0 ? 0xc597d2 : e.boss ? 0xd8ad72 : 0xacc67d).fillRect(e.x - width / 2, e.y - offset, width * Math.max(0, e.hp / e.max), 3);
    }
    this.updateStrikes(dt);
    const telegraphs: Telegraph[] = this.enemies.filter(e => e.action && e.action.clock.elapsed < enemyAttacks[e.boss ? this.caveBoss?'serpent':'guardian' : e.kind].windup).map(e => ({ x: e.x, y: e.y, progress: e.action!.clock.elapsed / enemyAttacks[e.boss ? this.caveBoss?'serpent':'guardian' : e.kind].windup, color: enemyAttacks[e.boss ? this.caveBoss?'serpent':'guardian' : e.kind].color, ranged: enemyAttacks[e.boss ? this.caveBoss?'serpent':'guardian' : e.kind].ranged }));
    this.combatFX.update(dt, telegraphs);
    this.player.setDepth(this.player.y / 100 + .1);
    if (this.health <= 0) {
      if (this.bossActive) { this.finishBoss('loss'); return; }
      this.strikes = []; this.playerAttack = null; this.combatFX.clear(); for (const e of this.enemies) { e.action = null; e.sprite.setPosition(e.x, e.y).setScale(e.baseScale).setAngle(0).play(`${e.boss ? this.caveBoss?'caveBoss':'guardian' : e.kind}-idle`); } observationStart=Date.now();observedKills=0;this.health = 0; this.recovering = 5000; this.target = null; this.player.setPosition(this.zoneCenter(this.sector).x,this.zoneCenter(this.sector).y);this.path=[];
      for (const e of this.enemies) { e.poisonUntil = 0; e.attackAt = 1500; }
      log('Vitalidade esgotada. Recuperando por 5 s, sem perder conhecimento.');receiveRewards();
    }
    this.uiAt -= dt; if (this.uiAt <= 0) { this.renderHud(); this.uiAt = 100; }
  }
}
const scene = new Meadow('Meadow');
const villageMap=new VillageMap(()=>state.village,id=>openVillageBuilding(id),()=>openMerchant());
function enterVillage(){
 if(scene.bossActive){log('Recue do desafio para visitar a vila.');return;}
 if(inVillage){togglePanel(null);villageMap.centerVillage();return;}
 observationStart=Date.now();observedKills=0;togglePanel(null);inVillage=true;document.body.classList.add('village-mode');
 scene.scene.sleep();if(scene.scene.isSleeping('VillageMap'))scene.scene.wake('VillageMap');else scene.scene.launch('VillageMap');
 scene.renderHud();put('location-name','Tempest · Vila dos aliados');put('status','ZONA SEGURA · SEM MONSTROS');
 document.querySelector('.location>p')!.textContent='VILA · FLORESTA DE JURA';
 el('game').setAttribute('aria-label','Mapa da vila: arraste com o mouse para explorar e clique nas construções.');
}
function leaveVillage(){
 if(!inVillage)return;togglePanel(null);inVillage=false;document.body.classList.remove('village-mode');villageMap.scene.sleep();scene.scene.wake();scene.renderHud();
 el('game').setAttribute('aria-label','Mapa de caça automática');
}
function openVillageBuilding(id:Building){
 if(!inVillage)return;const panel=el('village-panel');panel.dataset.focus=id;
 if(activePanel==='village-panel')renderMenus();else togglePanel('village-panel');
 const names={workshop:'Kaijin · Forja e equipamentos',lab:'Benimaru · Análise e síntese',alchemy:'Shuna · Jardim e alquimia'};put('village-title',names[id]);
 const body=document.querySelector<HTMLElement>('#village-panel .window-body');if(body)body.scrollTop=0;
}
el('leave-village').onclick=leaveVillage;
el('center-village').onclick=()=>{togglePanel(null);villageMap.centerVillage();};
document.querySelectorAll<HTMLButtonElement>('[data-village-place]').forEach(b=>b.onclick=()=>{const id=b.dataset.villagePlace as Building;villageMap.focusBuilding(id);openVillageBuilding(id);});

const game=new Phaser.Game({ autoFocus:false,fps:{smoothStep:false},type: Phaser.AUTO, parent: 'game', width: 800, height: 480, backgroundColor: '#365639', pixelArt: true, antialias: false, scene: [scene,villageMap], scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH } });
el('pause').onclick = () => { observationStart=Date.now();observedKills=0;paused = !paused; if (paused) { scene.anims.pauseAll(); scene.tweens.pauseAll(); scene.time.paused = true; } else { scene.anims.resumeAll(); scene.tweens.resumeAll(); scene.time.paused = false; } put('pause', paused ? '▶ Retomar caça' : 'Ⅱ Pausar caça'); scene.renderHud(); };
(el('priority') as HTMLSelectElement).onchange = event => { priority = (event.target as HTMLSelectElement).value as Kind | 'any'; scene.target = null; };
el('challenge').onclick = () => scene.startBoss(); el('retreat').onclick = () => scene.finishBoss('retreat');
el('fullscreen').onclick = async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { log('Tela cheia indisponível. Você também pode usar F11.'); } };
document.addEventListener('fullscreenchange', () => put('fullscreen', document.fullscreenElement ? '⛶ Sair da tela cheia' : '⛶ Entrar em tela cheia'));
el('reset').onclick = () => { if (confirm('Recomeçar e apagar o progresso desta aventura?')) { state = fresh(); save(); location.reload(); } };
window.addEventListener('pagehide',()=>{if(awayExpedition)creditBackground();save();});

el('area-cave').onclick=()=>{leaveVillage();scene.setArea('cave');};
el('area-forest').onclick=()=>{leaveVillage();scene.setArea('forest');};
bindMapTabs();
document.querySelectorAll<HTMLButtonElement>('[data-map-destination]').forEach(b=>b.onclick=()=>{scene.travelTo(Number(b.dataset.mapDestination),b.dataset.mapArea as 'cave'|'forest');togglePanel(null);});
(el('expedition') as HTMLInputElement).onchange=e=>{scene.exploring=(e.target as HTMLInputElement).checked;state.autoExplore=scene.exploring;save();};

el('analyze-spring').onclick=()=>{
 scene.springAt=Math.max(0,(state.springReadyAt??0)-Date.now());
 if(scene.bossActive||scene.springAt>0){log('A nascente precisa de um minuto para recuperar sua energia.');return;}
 if(scene.area!=='cave'||scene.sector!==0||scene.destination!==null){scene.travelTo(0,'cave');log('Retorne à nascente do primeiro setor para analisar água e hipokute.');return;}
 const c=center(0);if(Phaser.Math.Distance.Between(scene.player.x,scene.player.y,c.x,c.y)>380){scene.travelTo(0,'cave');return;}
 addItem(state,'waterBlade');addItem(state,'mushroom');scene.springAt=60000;state.springReadyAt=Date.now()+60000;save();renderMenus();log('Análise da nascente: +1 Lâmina de água e +1 Regeneração. A fonte se renova em 60 s.',true);
};

put('sound-toggle',soundEnabled?'Áudio: ligado':'Áudio: desligado');
el('sound-toggle').onclick=()=>{soundEnabled=!soundEnabled;localStorage.setItem('slime-sound',String(soundEnabled));put('sound-toggle',soundEnabled?'Áudio: ligado':'Áudio: desligado');chime();};
el('journey-objective').onclick=()=>{const goal=nextObjective(state);if(goal.panel==='village-panel'){enterVillage();openVillageBuilding(!state.village.buildings.workshop?'workshop':!state.village.buildings.lab?'lab':'alchemy');}else togglePanel(goal.panel);};
el('export-save').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({game:'slime-origins',state},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='slime-origins-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);put('save-feedback','Save exportado. Guarde o arquivo para restaurar sua aventura.');};
let pendingRestore:ReturnType<typeof decodeSave>|null=null;
function stageRestore(text:string){pendingRestore=decodeSave(text);put('restore-description',`Substituir a aventura atual pelo save de nível ${pendingRestore.level}, com ${pendingRestore.kills} abates? O progresso atual será substituído.`);el('restore-confirmation').hidden=false;put('save-feedback','Arquivo validado. Confirme a restauração abaixo.');}
el('confirm-restore').onclick=()=>{if(!pendingRestore)return;try{restoringSave=true;localStorage.setItem(SAVE,JSON.stringify(pendingRestore));location.reload();}catch{restoringSave=false;put('save-feedback','Não foi possível gravar o save.');}};
el('cancel-restore').onclick=()=>{pendingRestore=null;el('restore-confirmation').hidden=true;put('save-feedback','Restauração cancelada.');};
(el('import-save') as HTMLInputElement).onchange=async event=>{const input=event.target as HTMLInputElement,file=input.files?.[0];if(!file)return;try{if(file.size>5_000_000)throw new Error('Arquivo muito grande.');stageRestore(await file.text());}catch(error){pendingRestore=null;el('restore-confirmation').hidden=true;put('save-feedback',error instanceof Error?error.message:'Não foi possível importar.');}finally{input.value='';}};
setInterval(()=>{if(!document.hidden)save();},15000);
function startBackground(){
 if(awayExpedition||restoringSave)return;
 const seconds=(Date.now()-observationStart)/1000;
 const kind=scene.target?.kind??(scene.regions()[scene.sector].kind);
 const interval=seconds>=60&&observedKills>=3?Math.min(120,Math.max(3,seconds/observedKills)):estimateHuntInterval(state,kind);
 awayExpedition=new BackgroundExpedition({at:Date.now(),kind,interval,context:scene.lootContext(),enabled:!paused&&!inVillage&&!scene.bossActive&&scene.recovering<=0});
 scene.frameBudget.reset(performance.now());save();
}
function creditBackground(){
 if(!awayExpedition||restoringSave)return;const kills=awayExpedition.claim(Date.now());if(!kills)return;
 const before=state.inventory.length;
 for(let i=0;i<kills;i++)awardKill(state,awayExpedition.start.kind,undefined,undefined,undefined,awayExpedition.start.context);
 receiveRewards(state.inventory.length-before);save();
}
function resumeVisible(){
 if(document.hidden)return;creditBackground();awayExpedition=null;
 observationStart=Date.now();observedKills=0;scene.frameBudget.reset(performance.now());scene.routeWatchdog.reset();
 game.loop.resetDelta();if(!game.loop.running)game.loop.wake();
 if(!paused&&!inVillage&&scene.player){scene.anims.resumeAll();scene.tweens.resumeAll();scene.time.paused=false;}
 if(scene.player)scene.renderHud();save();
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)startBackground();else resumeVisible();});
window.addEventListener('focus',()=>{if(!document.hidden&&awayExpedition)resumeVisible();});
setInterval(()=>{if(document.hidden){startBackground();creditBackground();}},1000);


setTimeout(()=>{if(offlineSummary){log(offlineSummary,true);offlineSummary='';}},1000);

el('import-save-text-button').onclick=()=>{try{stageRestore((el('import-save-text') as HTMLTextAreaElement).value);}catch(error){pendingRestore=null;el('restore-confirmation').hidden=true;put('save-feedback',error instanceof Error?error.message:'Não foi possível restaurar o save.');}};

el('show-new-loot').onclick=()=>{pendingLoot=0;renderMenus();};
document.addEventListener('slime:synthesis-rendered',()=>{pendingLoot=0;updateLiveCounters();});
document.addEventListener('slime:bag-rendered',()=>{pendingLoot=0;updateLiveCounters();});

function openMerchant(){if(!inVillage){log('Visite Myourmiles na vila para negociar.');return;}if(!state.village.founded){openVillageBuilding('workshop');log('Estabeleça a vila para receber a caravana.');return;}if(activePanel==='merchant-panel')renderMenus();else togglePanel('merchant-panel');save();}
el('visit-merchant').onclick=openMerchant;
setInterval(()=>{if(inVillage&&activePanel==='merchant-panel'&&tickMerchant(state))save();},1000);
