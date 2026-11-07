'use client';
import Script from 'next/script';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
import {metaPixelId,track} from '../lib/meta-pixel';

/** Charge le Pixel Meta sur le site public et l’application (jamais sur la console d’administration). */
export default function MetaPixel(){
 const path=usePathname()||'/';const off=!metaPixelId||!/^\d{6,20}$/.test(metaPixelId)||path.startsWith('/administration');
 useEffect(()=>{if(off)return;const f=(window as unknown as {fbq?:(...a:unknown[])=>void}).fbq;if(f)f('track','PageView');if(path.startsWith('/ressources/'))track('ViewContent',{content_category:'guide'});},[path,off]);
 useEffect(()=>{if(off)return;let fire=false;try{fire=sessionStorage.getItem('yombal-new-signup')==='1';sessionStorage.removeItem('yombal-new-signup');}catch{}
  const url=new URL(window.location.href);if(url.searchParams.get('inscription')==='1'){fire=true;url.searchParams.delete('inscription');window.history.replaceState(window.history.state,'',url.pathname+url.search+url.hash);}
  if(fire){const t=setTimeout(()=>track('CompleteRegistration',{status:'ok'}),800);return()=>clearTimeout(t);}
 },[off]);
 if(off)return null;
 return <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');`}</Script>;
}
