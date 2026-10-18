/** Visible neutral-pose span, in world pixels. Wings and long bodies are wider than their ground footprint. */
export const actorSizes={
 slime:{width:36,radius:13},wisp:{width:18,radius:7},mushroom:{width:27,radius:10},frog:{width:34,radius:14},
 beetle:{width:38,radius:16},moth:{width:42,radius:10},snake:{width:62,radius:18},bat:{width:72,radius:18},
 wolf:{width:78,radius:27},spider:{width:88,radius:28},centipede:{width:96,radius:28},serpent:{width:112,radius:36},
 armorsaurus:{width:118,radius:40},guardian:{width:164,radius:48},caveBoss:{width:210,radius:62},
} as const;
export const actorSize=(key:string)=>actorSizes[key as keyof typeof actorSizes]??actorSizes.slime;
export const contactReach=(radius:number)=>actorSizes.slime.radius+radius+10;
export function actorLayout(key:string,source:{w:number;h:number}){
 const profile=actorSize(key),height=source.h*profile.width/Math.max(1,source.w);
 return {...profile,height,barWidth:Math.max(20,Math.min(84,profile.width*.6)),barOffset:height+9,shadowWidth:profile.radius*2,shadowHeight:Math.max(4,profile.radius*.42)};
}
