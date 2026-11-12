'use client';
import {useEffect,useRef,useState,type CSSProperties,type PointerEvent} from 'react';
import {Bot,ChevronLeft,ChevronRight,X} from 'lucide-react';
import {supportLink} from '../lib/support';

// Un seul bouton flottant qui alterne toutes les 10 secondes entre un conseiller (WhatsApp) et l'assistant IA.
// Il se déplace du doigt (il se colle au bord le plus proche et garde sa place) et se range en petite languette.
type Spot={side:'left'|'right';y:number};
const spotKey='yombal-bubble-spot',foldKey='yombal-bubble-folded';
const WhatsAppIcon=()=><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.4 5.1 5.2-1.4A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.1.82.83-3-.2-.31a8.2 8.2 0 1 1 6.97 3.82Zm4.5-6.1c-.25-.13-1.46-.72-1.69-.8-.23-.08-.39-.13-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.53.06a6.7 6.7 0 0 1-3.34-2.92c-.25-.43.25-.4.72-1.33.08-.16.04-.3-.02-.43l-.76-1.83c-.2-.48-.4-.41-.56-.42h-.47a.9.9 0 0 0-.66.31 2.77 2.77 0 0 0-.86 2.06 4.8 4.8 0 0 0 1 2.55 11 11 0 0 0 4.2 3.72c1.57.68 2.19.74 2.97.62.48-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.29Z"/></svg>;
export default function HelpBubble({onAssistant}:{onAssistant:()=>void}){
 const [face,setFace]=useState<'wa'|'ai'>('wa'),[spot,setSpot]=useState<Spot|null>(null),[folded,setFolded]=useState(false),[dragging,setDragging]=useState(false),[talk,setTalk]=useState(true);
 const drag=useRef<{x:number;y:number;startY:number;moved:boolean;pointer:number}|null>(null),pos=useRef<{x:number;y:number}|null>(null),[live,setLive]=useState<{x:number;y:number}|null>(null);
 useEffect(()=>{try{const s=JSON.parse(localStorage.getItem(spotKey)||'null') as Spot|null;if(s&&(s.side==='left'||s.side==='right')&&typeof s.y==='number')setSpot(s);setFolded(localStorage.getItem(foldKey)==='1');}catch{}},[]);
 useEffect(()=>{if(folded||dragging)return;const t=setInterval(()=>setFace(f=>f==='wa'?'ai':'wa'),10000);return()=>clearInterval(t);},[folded,dragging]);
 // Le libellé s'affiche 3 secondes à chaque changement, puis le bouton redevient une petite bulle discrète.
 useEffect(()=>{setTalk(true);const t=setTimeout(()=>setTalk(false),3000);return()=>clearTimeout(t);},[face]);
 const save=(s:Spot)=>{setSpot(s);try{localStorage.setItem(spotKey,JSON.stringify(s));}catch{}};
 const fold=(v:boolean)=>{setFolded(v);try{localStorage.setItem(foldKey,v?'1':'0');}catch{}};
 function down(e:PointerEvent){drag.current={x:e.clientX,y:e.clientY,startY:e.clientY,moved:false,pointer:e.pointerId};}
 function move(e:PointerEvent){const d=drag.current;if(!d)return;if(!d.moved&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<8)return;if(!d.moved){d.moved=true;setDragging(true);(e.currentTarget as HTMLElement).setPointerCapture(d.pointer);}pos.current={x:e.clientX,y:e.clientY};setLive({x:e.clientX,y:e.clientY});}
 function up(){const d=drag.current;drag.current=null;if(!d)return;if(d.moved&&pos.current){const h=window.innerHeight;const y=Math.min(Math.max(pos.current.y/h,0.12),0.86);save({side:pos.current.x<window.innerWidth/2?'left':'right',y});setLive(null);pos.current=null;setDragging(false);return;}
  // Simple appui : on ouvre ce qui est affiché.
  activate();}
 function activate(){if(face==='wa')window.open(supportLink(),'_blank','noopener,noreferrer');else onAssistant();}
 const style:CSSProperties=live?{left:live.x-28,top:live.y-28,right:'auto',bottom:'auto'}:spot?{top:`calc(${(spot.y*100).toFixed(1)}vh - 28px)`,bottom:'auto',...(spot.side==='left'?{left:12,right:'auto'}:{right:12,left:'auto'})}:{};
 const side=spot?.side||'right';
 if(folded)return <button type="button" className={'hb-tab '+side} style={spot?{top:`calc(${(spot.y*100).toFixed(1)}vh - 22px)`,bottom:'auto'}:undefined} onClick={()=>fold(false)} aria-label="Afficher l’aide">{side==='right'?<ChevronLeft size={16}/>:<ChevronRight size={16}/>}</button>;
 return <div className={'hb '+side+(dragging?' dragging':'')} style={style}>
  <button type="button" className={'hb-main '+face+(talk?' talk':'')} onPointerDown={down} onPointerMove={move} onPointerUp={up} onClick={e=>{if(e.detail===0)activate();}} onPointerCancel={()=>{drag.current=null;setLive(null);setDragging(false);}} aria-label={face==='wa'?'Parler à un conseiller sur WhatsApp':'Ouvrir l’assistant Yombal'}>
   <span className="hb-icon" key={face}>{face==='wa'?<WhatsAppIcon/>:<Bot size={22}/>}</span>
   <span className="hb-label" key={'l'+face}>{face==='wa'?'Un conseiller':'Assistant IA'}</span>
  </button>
  <button type="button" className="hb-fold" onClick={()=>fold(true)} aria-label="Ranger le bouton d’aide"><X size={11}/></button>
 </div>;
}
