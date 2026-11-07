'use client';
import {track} from '../lib/meta-pixel';
import {useCallback,useEffect,useRef,useState} from 'react';
import {Check,Clock3,LoaderCircle} from 'lucide-react';
import {Dialog} from './ui';
import {apiFetch} from '../lib/api-fetch';
import {type Subscription} from '../lib/billing';
import {dateLabel} from '../lib/model';

export default function PaymentReturn({onUpdate}:{onUpdate:(subscription:Subscription)=>void}){
 const [order,setOrder]=useState(''),[busy,setBusy]=useState(false),[state,setState]=useState<'pending'|'active'|'test_paid'>('pending'),[error,setError]=useState(''),[expiresAt,setExpiresAt]=useState<string|null>(null);
 const checking=useRef(false),controller=useRef<AbortController|null>(null);
 useEffect(()=>{
  const url=new URL(window.location.href),id=url.searchParams.get('commande');
  if(url.searchParams.get('paiement')==='retour'&&id&&/^[0-9a-f-]{36}$/i.test(id)){
   // The reference comes from the browser URL after hydration, not from a render-derived value.
   // eslint-disable-next-line react-hooks/set-state-in-effect
   setOrder(id);
   // Clean the base history entry before the mobile dialog adds its Back entry.
   url.searchParams.delete('paiement');url.searchParams.delete('commande');window.history.replaceState(window.history.state,'',url.pathname+url.search+url.hash);
  }
  return()=>controller.current?.abort();
 },[]);
 const check=useCallback(async()=>{
  if(!order||checking.current)return false;checking.current=true;setBusy(true);setError('');const abort=new AbortController();controller.current=abort;
  try{const r=await apiFetch('/api/subscription?commande='+encodeURIComponent(order),{cache:'no-store',signal:abort.signal},35000);const data=await r.json() as {error?:string;subscription:Subscription;payment?:{state:string}};if(!r.ok)throw Error(data.error||'Vérification indisponible.');if(abort.signal.aborted)return false;onUpdate(data.subscription);setExpiresAt(data.subscription.expiresAt);if(data.payment?.state==='test_paid'){setState('test_paid');return true;}if(data.payment?.state==='active'&&data.subscription.isPro){setState('active');track('Subscribe',{currency:'XOF',value:0});return true;}return false;}
  catch(e){if(!abort.signal.aborted)setError(e instanceof Error?e.message:'Réessayez.');return false;}finally{checking.current=false;if(!abort.signal.aborted)setBusy(false);}
 },[order,onUpdate]);
 useEffect(()=>{
  if(!order)return;let stopped=false,timer:ReturnType<typeof setTimeout>|undefined,tries=0;
  const poll=async()=>{const done=await check();if(!stopped&&!done&&++tries<6)timer=setTimeout(()=>void poll(),16000);};void poll();
  return()=>{stopped=true;clearTimeout(timer);controller.current?.abort();};
 },[order,check]);
 function close(){controller.current?.abort();const url=new URL(window.location.href);url.searchParams.delete('paiement');url.searchParams.delete('commande');window.history.replaceState(window.history.state,'',url.pathname+url.search+url.hash);setOrder('');}
 // Paiement confirmé : le message de bienvenue Pro (ProWelcome) prend le relais.
 useEffect(()=>{if(state==='active')close();},[state]);
 if(!order)return null;
 return <Dialog title={state==='active'?'Votre accès Pro est actif':state==='test_paid'?'Essai SasPay confirmé':'Vérification de votre paiement'} onClose={close} onBack={close} className="payment-return-dialog"><div className="payment-return-body"><span className={'payment-return-symbol '+state}>{busy?<LoaderCircle className="spin" size={30}/>:state==='active'?<Check size={30}/>:<Clock3 size={30}/>}</span><p>{state==='active'?(expiresAt?'Votre abonnement est disponible jusqu’au '+dateLabel(expiresAt.slice(0,10))+'.':'Votre abonnement est disponible.'):state==='test_paid'?'Le paiement de test est confirmé. Aucun abonnement réel n’a été activé.':'Nous attendons la confirmation de SasPay. Cette page se met à jour automatiquement pendant quelques instants.'}</p>{state==='pending'&&<small>Vous pouvez fermer cette fenêtre et retrouver « Actualiser mon accès » dans les offres Pro.</small>}{error&&<p role="alert" className="form-error">{error}</p>}</div><div className="dialog-footer"><button type="button" className="button secondary" onClick={close}>Retrouver mon espace</button>{state==='pending'&&<button type="button" className="button primary" disabled={busy} onClick={()=>void check()}>{busy?'Vérification…':'Vérifier à nouveau'}</button>}</div></Dialog>;
}
