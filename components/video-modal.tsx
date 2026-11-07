'use client';
import {useEffect,useRef,useState} from 'react';
import {PlayCircle,X} from 'lucide-react';

export const videoDoneKey='yombal-video-done';
/** Fenêtre vidéo « Yombal en 1 minute ». En mode bienvenue, elle revient tant que la vidéo n’a pas été regardée jusqu’au bout. */
export default function VideoModal({open,onClose,welcome=false}:{open:boolean;onClose:(finished:boolean)=>void;welcome?:boolean}){
 const ref=useRef<HTMLVideoElement>(null);const [ended,setEnded]=useState(false);const [progress,setProgress]=useState(0);
 useEffect(()=>{if(!open)return;setEnded(false);setProgress(0);const key=(e:KeyboardEvent)=>{if(e.key==='Escape')close();};window.addEventListener('keydown',key);document.body.style.overflow='hidden';return()=>{window.removeEventListener('keydown',key);document.body.style.overflow='';};// eslint-disable-next-line react-hooks/exhaustive-deps
 },[open]);
 if(!open)return null;
 function close(){const v=ref.current;const done=ended||(!!v&&v.duration>0&&v.currentTime/v.duration>0.92);if(done){try{localStorage.setItem(videoDoneKey,'1');}catch{}}v?.pause();onClose(done);}
 return <div className="vm-backdrop" role="dialog" aria-modal="true" aria-labelledby="vm-title" onClick={e=>{if(e.target===e.currentTarget)close();}}>
  <div className="vm-card">
   <header className="vm-head"><span className="vm-ic"><PlayCircle size={18}/></span><div><h2 id="vm-title">{welcome?'Bienvenue ! Regardez ce guide d’1 minute':'Yombal en 1 minute'}</h2><p>{welcome?'Biens, locataires, loyers et factures : tout le parcours, pas à pas.':'Le guide complet, en vidéo.'}</p></div>
    <button type="button" className="vm-x" onClick={close} aria-label="Fermer la vidéo"><X size={18}/></button></header>
   <div className="vm-screen"><video ref={ref} poster="/media/yombal-guide-poster.jpg" controls autoPlay playsInline preload="auto" onEnded={()=>{setEnded(true);try{localStorage.setItem(videoDoneKey,'1');}catch{}}} onTimeUpdate={e=>{const v=e.currentTarget;if(v.duration)setProgress(v.currentTime/v.duration);}}><source src="/media/yombal-guide.mp4" type="video/mp4"/><source src="/media/yombal-guide.webm" type="video/webm"/></video></div>
   <footer className="vm-foot">
    {welcome&&!ended?<><span className="vm-progress"><i style={{width:Math.round(progress*100)+'%'}}/></span><button type="button" className="vm-skip" onClick={close}>Plus tard</button></>
    :<><span className="vm-done">{ended?'Bravo, vous connaissez l’essentiel 🎉':'Revoyez-la quand vous voulez depuis l’accueil.'}</span><button type="button" className="button primary" onClick={close}>{welcome?'Commencer':'Fermer'}</button></>}
   </footer>
  </div>
 </div>;
}
