/** Preserve nested scroll regions, disclosure state and focused text controls during intentional UI renders. */
export function preserveMenuState(root:HTMLElement|null,render:()=>void){
 if(!root){render();return;}
 const regions=Array.from(root.querySelectorAll<HTMLElement>('.window-body,.item-grid,.merchant-list'));
 const positions=regions.map(e=>({top:e.scrollTop,left:e.scrollLeft}));
 const disclosures=Array.from(root.querySelectorAll('details')).map(e=>e.open);
 const active=document.activeElement as HTMLInputElement|null;
 const id=active&&root.contains(active)?active.id:'';
 const selection=active instanceof HTMLInputElement&&['text','search'].includes(active.type)?active.selectionStart:null;
 render();
 root.querySelectorAll<HTMLElement>('.window-body,.item-grid,.merchant-list').forEach((e,n)=>{if(positions[n]){e.scrollTop=positions[n].top;e.scrollLeft=positions[n].left;}});
 root.querySelectorAll('details').forEach((e,n)=>{if(disclosures[n]!==undefined)e.open=disclosures[n];});
 const replacement=id?document.getElementById(id):null;
 if(replacement&&replacement!==active){replacement.focus({preventScroll:true});if(selection!==null&&replacement instanceof HTMLInputElement)replacement.setSelectionRange(selection,selection);}
}
