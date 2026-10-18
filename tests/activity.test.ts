import {test} from 'node:test';
import assert from 'node:assert/strict';
import {FrameBudget,BackgroundExpedition,estimateHuntInterval} from '../src/activity.ts';
import {HuntWatchdog,needsApproach} from '../src/hunt-navigation.ts';
import {fresh} from '../src/model.ts';
import {pillars,CELL,walkable,clearLine,route,nearestFloor} from '../src/cave-map.ts';
test('tempo visível avança mesmo com frames lentos, sem depender de foco da janela',()=>{
 const clock=new FrameBudget();assert.deepEqual(clock.steps(0),[]);const steps=clock.steps(1000);assert.equal(steps.reduce((a,b)=>a+b,0),1000);assert.ok(steps.every(dt=>dt<=50));
 assert.equal(clock.steps(9000).reduce((a,b)=>a+b,0),2000);assert.deepEqual(clock.steps(10000,false),[]);assert.equal(clock.steps(10016).reduce((a,b)=>a+b,0),16);
 clock.reset(20000);assert.deepEqual(clock.steps(19000),[]);
});
test('ausência curta acumula recompensas sem duplicar ao receber ticks e ao retornar',()=>{
 const bg=new BackgroundExpedition({at:0,kind:'bat',interval:5,enabled:true});assert.equal(bg.claim(9000),0);assert.equal(bg.claim(20000),2);assert.equal(bg.claim(20000),0);assert.equal(bg.claim(31000),1);assert.equal(bg.claim(15000),0);
 const checkpoint=bg.checkpoint(31000);assert.equal(checkpoint.at,30000);const resumed=new BackgroundExpedition(checkpoint);assert.equal(resumed.claim(40000),1);
});
test('ausência respeita pausa, limite de 240 abates, duas horas e relógio futuro',()=>{
 const off=new BackgroundExpedition({at:0,kind:'bat',interval:5,enabled:false});assert.equal(off.claim(3600000),0);
 const bg=new BackgroundExpedition({at:1000,kind:'bat',interval:3,enabled:true});assert.equal(bg.claim(0),0);assert.equal(bg.claim(86400000),240);assert.equal(bg.claim(86400000),0);assert.equal(bg.checkpoint(86400000).enabled,false);
 const slow=new BackgroundExpedition({at:0,kind:'bat',interval:120,enabled:true});assert.equal(slow.claim(86400000),30);
 const s=fresh();assert.ok(estimateHuntInterval(s,'bat')>=5);
});
test('alvo próximo atrás de coluna exige contorno em vez de ficar parado tentando bater',()=>{
 const p=pillars[0],x=(p.x-1)*CELL,y=(p.y-1)*CELL,a={x:x-2,y:y+10},b={x:x+10,y:y-2};
 assert.ok(walkable(a));assert.ok(walkable(b));assert.equal(clearLine(a,b),false);assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<42);assert.equal(needsApproach(a,b,42,clearLine(a,b)),true);
 let previous=a;const path=route(a,b);assert.ok(path.length);for(const point of path){assert.ok(clearLine(previous,point));previous=point;}
 assert.ok(clearLine(previous,b));assert.equal(needsApproach(a,{x:a.x+3,y:a.y},42,true),false);
});
test('detector recupera apenas rota sem movimento nem dano e reinicia com progresso',()=>{
 const watch=new HuntWatchdog(),p={x:100,y:100};assert.equal(watch.tick(0,p,'hp40'),false);assert.equal(watch.tick(5900,p,'hp40'),false);assert.equal(watch.tick(100,p,'hp39'),false);assert.equal(watch.tick(5900,p,'hp39'),false);assert.equal(watch.tick(100,p,'hp39'),true);
 watch.tick(0,p,'hp30');assert.equal(watch.tick(6000,{x:110,y:100},'hp30'),false);
 const pillar=pillars[0],safe=nearestFloor({x:pillar.x*CELL+16,y:pillar.y*CELL+16});assert.ok(safe&&walkable(safe));
});
