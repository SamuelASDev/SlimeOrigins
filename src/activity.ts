import {attack,effects,creatures,type State,type Kind} from './model.ts';
import type {Checkpoint} from './journey.ts';
/** Use elapsed wall time while visible, regardless of keyboard focus. Split stalls into safe combat steps. */
export class FrameBudget {
 private previous:number|null=null;
 reset(now:number){this.previous=now;}
 steps(now:number,active=true):number[]{
  const before=this.previous;this.previous=now;
  if(!active||before===null||!Number.isFinite(now)||now<=before)return [];
  let remaining=Math.min(2000,now-before);const out:number[]=[];
  while(remaining>0){const step=Math.min(50,remaining);out.push(step);remaining-=step;}return out;
 }
}
export function estimateHuntInterval(s:State,kind:Kind){
 const fx=effects(s),dps=attack(s)*fx.damageBonus*fx.haste/.85;
 return Math.min(120,Math.max(5,creatures[kind].hp/Math.max(1,dps)+4));
}
/** Monotonic reward cursor; timer ticks and returning to the tab can never claim the same kill twice. */
export class BackgroundExpedition {
 private awarded=0;
 readonly start:Checkpoint;
 constructor(start:Checkpoint){this.start=start;}
 claim(now:number){
  const c=this.start;if(!c.enabled||!Number.isFinite(c.at)||!Number.isFinite(c.interval)||c.interval<3||c.interval>120||!Number.isFinite(now)||now<c.at)return 0;
  const elapsed=Math.min(7200,(now-c.at)/1000),total=Math.min(240,Math.floor(elapsed/(c.interval*2)));
  const delta=Math.max(0,total-this.awarded);this.awarded+=delta;return delta;
 }
 checkpoint(now:number):Checkpoint{return {...this.start,at:this.start.at+this.awarded*this.start.interval*2000,enabled:this.start.enabled&&this.awarded<240&&now-this.start.at<7200000};}
}
