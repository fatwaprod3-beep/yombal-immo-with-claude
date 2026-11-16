'use client';
import {useEffect} from 'react';
import {trackPurchase} from '../lib/meta-pixel';

// Envoie « Achat » au pixel Meta pour un paiement Pro confirmé, même si la personne revient plus tard
// (depuis la notification de bienvenue, ou un autre jour). Une seule fois par paiement et par navigateur.
export default function PurchaseTracker({active}:{active:boolean}){
 useEffect(()=>{
  if(!active)return;
  try{if(sessionStorage.getItem('yombal-purchase-checked'))return;sessionStorage.setItem('yombal-purchase-checked','1');}catch{}
  void fetch('/api/subscription',{cache:'no-store',credentials:'same-origin'}).then(r=>r.ok?r.json():null).then((d:{lastPurchase?:{id:string;amount:number;planId:string}|null}|null)=>{if(d?.lastPurchase)trackPurchase(d.lastPurchase);}).catch(()=>{});
 },[active]);
 return null;
}
