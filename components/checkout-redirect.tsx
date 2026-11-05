'use client';
import {useEffect,useRef,useState} from 'react';
import {Crown,LoaderCircle,ShieldCheck,TriangleAlert} from 'lucide-react';
import {isSasPayCheckoutUrl,isSasPayPaymentLink} from '../lib/billing';
import {money} from '../lib/model';

// Page de transition jolie et rassurante entre Yombal et SasPay (plus de page blanche).
export default function CheckoutRedirect({planId}:{planId:string}){
 const [error,setError]=useState(''),[amount,setAmount]=useState<number|null>(null);const started=useRef(false);
 useEffect(()=>{
  if(started.current)return;started.current=true;
  void (async()=>{
   try{
    const r=await fetch('/api/subscription',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({planId}),credentials:'same-origin'});
    const d=await r.json().catch(()=>({})) as {checkoutUrl?:string;amount?:number;mode?:string;error?:string};
    if(!r.ok)throw Error(d.error||'Le paiement n’a pas pu être préparé.');
    const ok=d.mode==='link'?isSasPayPaymentLink(d.checkoutUrl):isSasPayCheckoutUrl(d.checkoutUrl);
    if(!ok||!d.checkoutUrl)throw Error('Le lien de paiement reçu n’est pas valide. Réessayez.');
    if(d.amount)setAmount(d.amount);
    window.location.replace(d.checkoutUrl);
   }catch(e){setError(e instanceof Error?e.message:'Réessayez.');}
  })();
 },[planId]);
 return <main className="checkout-redirect"><section className="checkout-redirect-card">
  <span className={'checkout-redirect-symbol'+(error?' is-error':'')}>{error?<TriangleAlert size={30}/>:<Crown size={30}/>}</span>
  <span className="pro-eyebrow">YOMBAL PRO</span>
  {error?<><h1>Le paiement n’a pas pu s’ouvrir</h1><p>{error}</p><div className="checkout-redirect-actions"><button type="button" className="button primary" onClick={()=>window.location.reload()}>Réessayer</button><a className="button secondary" href="/">Retour à Yombal</a></div></>
  :<><h1>Préparation de votre paiement sécurisé</h1><p>{amount?'Montant : '+money(amount)+'. ':''}Vous allez être redirigé vers SasPay pour payer par Wave, Orange Money ou carte.</p><div className="checkout-redirect-loader"><LoaderCircle className="spin" size={22}/><span>Connexion à SasPay…</span></div><p className="checkout-redirect-note"><ShieldCheck size={15}/>Après le paiement, vous revenez automatiquement sur Yombal et votre accès Pro s’active.</p></>}
 </section></main>;
}
