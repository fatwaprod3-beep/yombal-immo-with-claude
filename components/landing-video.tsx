'use client';
import {useRef,useState} from 'react';
import {Play} from 'lucide-react';

/** Vidéo de présentation de la page d’accueil : affiche + bouton lecture, la vidéo ne se charge qu’au clic. */
export default function LandingVideo(){
 const [playing,setPlaying]=useState(false);const ref=useRef<HTMLVideoElement>(null);
 return <div className="lp-video-shell">
  <div className="lp-video-glow" aria-hidden="true"/>
  <div className="lp-video-frame">
   <div className="lp-video-bar" aria-hidden="true"><i/><i/><i/><span>yombal-immo.pro · Guide en 1 minute</span></div>
   <div className="lp-video-screen">
    {playing?<video ref={ref} poster="/media/yombal-guide-poster.jpg" controls autoPlay playsInline preload="auto"><source src="/media/yombal-guide.mp4" type="video/mp4"/><source src="/media/yombal-guide.webm" type="video/webm"/></video>
    :<button type="button" className="lp-video-poster" onClick={()=>setPlaying(true)} aria-label="Lire la vidéo de présentation de Yombal (1 min 22)">
      <img src="/media/yombal-guide-poster.jpg" alt="Aperçu de la vidéo : encaisser un loyer dans Yombal" loading="lazy"/>
      <span className="lp-video-play"><Play size={30} fill="currentColor"/></span>
      <span className="lp-video-time">1:22</span>
     </button>}
   </div>
  </div>
 </div>;
}
