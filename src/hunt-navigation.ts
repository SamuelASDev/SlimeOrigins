import type {Point} from './cave-map.ts';
export function needsApproach(a:Point,b:Point,reach:number,lineClear:boolean){return Math.hypot(a.x-b.x,a.y-b.y)>reach||!lineClear;}
/** Movement and dealt damage both count as progress; only a truly stuck route is retried. */
export class HuntWatchdog {
 private anchor:Point|null=null;private signature='';private idle=0;
 reset(){this.anchor=null;this.signature='';this.idle=0;}
 tick(dt:number,p:Point,signature:string){
  if(!this.anchor||signature!==this.signature||Math.hypot(p.x-this.anchor.x,p.y-this.anchor.y)>4){this.anchor={x:p.x,y:p.y};this.signature=signature;this.idle=0;return false;}
  this.idle+=Math.max(0,dt);if(this.idle<6000)return false;this.reset();return true;
 }
}
