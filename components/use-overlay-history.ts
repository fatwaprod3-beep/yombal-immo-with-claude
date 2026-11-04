'use client';
import {useEffect,useRef} from 'react';

// Keep mobile Back inside the app while a dialog or drawer is open.
const overlays:string[]=[];
export function liveOverlay(id:unknown){return typeof id==='string'&&overlays.includes(id);}
export function useOverlayHistory(active:boolean,id:string,onClose:()=>void){
 const close=useRef(onClose);close.current=onClose;
 useEffect(()=>{
  if(!active)return;
  const mobile=window.matchMedia('(max-width: 850px)').matches;
  const previous=window.history.state||{};
  const replace=previous.yombalOverlay&&!liveOverlay(previous.yombalOverlay);
  overlays.push(id);
  if(mobile){const next={...previous,yombalOverlay:id};if(replace)window.history.replaceState(next,'');else window.history.pushState(next,'');}
  const back=()=>{if(mobile&&overlays.at(-1)===id&&window.history.state?.yombalOverlay!==id)close.current();};
  window.addEventListener('popstate',back);
  return ()=>{
   window.removeEventListener('popstate',back);
   const index=overlays.indexOf(id);if(index>=0)overlays.splice(index,1);
   if(mobile)queueMicrotask(()=>{if(window.history.state?.yombalOverlay===id&&!liveOverlay(id))window.history.back();});
  };
 },[active,id]);
}
