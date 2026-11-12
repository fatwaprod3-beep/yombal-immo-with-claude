'use client';
import {useEffect,useRef,useState} from 'react';
import {Home,UserRound,BriefcaseBusiness,ArrowRight,Sparkles,Check,Plus} from 'lucide-react';
import {propertyTypes,type Mode} from '../lib/model';
import {trackEvent} from '../lib/track-event';

// Juste après le choix propriétaire/agence : un premier logement et son locataire, pré-remplis avec un exemple.
// La personne voit tout de suite à quoi ressemble Yombal rempli ; elle peut tout modifier ou supprimer ensuite.
export type FirstRentalData={property:Record<string,unknown>;tenant:Record<string,unknown>;tenantId:string;owner?:Record<string,unknown>;lease:Record<string,unknown>};
const pad=(n:number)=>String(n).padStart(2,'0');
export default function FirstRental({mode,city,onSave,onSkip,onDone}:{mode:Mode;city?:string;onSave:(data:FirstRentalData)=>Promise<boolean>;onSkip:()=>void;onDone:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 const example={name:'Appartement Mermoz',type:'Appartement',city:city||'Dakar',rent:'150000',tenant:'Awa Diop',phone:'',owner:'Moussa Ndiaye',commission:'10'};
 const [f,setF]=useState(example),[busy,setBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState<string[]>([]),[adding,setAdding]=useState(false);
 useEffect(()=>{const d=ref.current;if(d&&!d.open)d.showModal();},[]);
 const set=(k:keyof typeof example)=>(e:{target:{value:string}})=>setF(v=>({...v,[k]:k==='rent'||k==='commission'?e.target.value.replace(/\D/g,''):e.target.value}));
 const agency=mode==='agency';
 async function save(){
  setError('');const rent=Number(f.rent);
  if(!f.name.trim()||!f.city.trim()||!f.tenant.trim())return setError('Le logement, la ville et le locataire sont nécessaires.');
  if(!rent)return setError('Indiquez le loyer mensuel.');
  if(f.phone&&!/^[+\d().\s-]{6,35}$/.test(f.phone))return setError('Le numéro de téléphone n’est pas valide.');
  const now=new Date(),day=`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`,month=day.slice(0,7);
  const ownerId=agency?crypto.randomUUID():'',propertyId=crypto.randomUUID(),tenantId=crypto.randomUUID();
  const data:FirstRentalData={
   property:{id:propertyId,name:f.name.trim(),type:f.type,city:f.city.trim(),address:'',rent,charges:0,area:0,rooms:0,ownerId,description:'',image:'',createdAt:day},
   tenant:{id:tenantId,name:f.tenant.trim(),phone:f.phone.trim(),email:'',notes:''},tenantId,
   lease:{id:crypto.randomUUID(),propertyId,tenantId,startDate:day,endDate:'',firstMonth:month,rent,charges:0,deposit:0,dueDay:5,commissionRate:agency?Math.min(100,Number(f.commission)||0):0,status:'active',createdAt:day},
  };
  if(agency)data.owner={id:ownerId,name:f.owner.trim()||'Propriétaire',phone:'',email:'',status:'active'};
  setBusy(true);
  try{const edited=(Object.keys(example) as (keyof typeof example)[]).some(k=>f[k]!==example[k]);if(await onSave(data)){trackEvent('onboarding_example_saved',(saved.length?'more':edited?'edited':'example'));setSaved(v=>[...v,f.name.trim()+' · '+f.tenant.trim()]);setAdding(false);}else setError('L’enregistrement n’a pas abouti. Vérifiez les champs puis réessayez.');}
  finally{setBusy(false);}
 }
 function another(){setError('');setF(v=>({...v,name:'',rent:'',tenant:'',phone:''}));setAdding(true);}
 function finish(){ref.current?.close();onDone();}
 function skip(){trackEvent('onboarding_example_skipped');ref.current?.close();onSkip();}
 if(saved.length&&!adding)return <dialog ref={ref} className="first-rental" aria-labelledby="first-rental-title" onCancel={e=>{e.preventDefault();finish();}}>
  <div className="first-rental-head"><span className="first-rental-done"><Check size={30}/></span><h2 id="first-rental-title">{saved.length>1?`${saved.length} logements enregistrés`:'Votre premier logement est prêt'}</h2><p>Chaque mois, Yombal vous montrera qui a payé et préparera les reçus.</p></div>
  <ul className="first-rental-list">{saved.map(x=><li key={x}><Home size={15}/>{x}</li>)}</ul>
  <div className="first-rental-form"><button type="button" className="first-rental-cta" onClick={finish}>Découvrir mon espace<ArrowRight size={18}/></button><button type="button" className="first-rental-more" onClick={another}><Plus size={17}/>Ajouter un autre logement</button><small className="first-rental-hint">Vous pourrez aussi en ajouter plus tard, quand vous voulez.</small></div>
 </dialog>;
 return <dialog ref={ref} className="first-rental" aria-labelledby="first-rental-title" onCancel={e=>{e.preventDefault();if(!busy)skip();}}>
  <div className="first-rental-head"><span className="first-rental-badge"><Sparkles size={14}/>{adding?'Logement n° '+(saved.length+1):'Pour bien démarrer'}</span><h2 id="first-rental-title">{adding?'Ajoutez un autre logement':'Ajoutez votre premier logement'}</h2>{adding?<p>Même chose : le logement, son loyer et le locataire. Le reste se complète plus tard.</p>:<p>On a pré-rempli <strong>un exemple</strong> pour vous montrer. Remplacez-le par vos vraies informations, ou gardez-le pour découvrir : vous pourrez tout modifier ou supprimer après.</p>}</div>
  <form className="first-rental-form" onSubmit={e=>{e.preventDefault();void save();}}>
   <fieldset><legend><Home size={16}/>Le logement</legend>
    <label className="field"><span>Nom du logement</span><input value={f.name} onChange={set('name')} maxLength={150} required/></label>
    <div className="first-rental-row"><label className="field"><span>Type</span><select value={f.type} onChange={set('type')}>{propertyTypes.map(t=><option key={t}>{t}</option>)}</select></label><label className="field"><span>Ville</span><input value={f.city} onChange={set('city')} maxLength={100} required/></label></div>
    <label className="field"><span>Loyer mensuel</span><div className="first-rental-money"><input inputMode="numeric" value={f.rent?Number(f.rent).toLocaleString('fr-FR'):''} onChange={set('rent')} required/><em>F CFA</em></div></label>
   </fieldset>
   <fieldset><legend><UserRound size={16}/>Le locataire</legend>
    <div className="first-rental-row"><label className="field"><span>Nom</span><input value={f.tenant} onChange={set('tenant')} maxLength={120} required/></label><label className="field"><span>Téléphone <small>(facultatif)</small></span><input type="tel" inputMode="tel" value={f.phone} onChange={set('phone')} maxLength={35} placeholder="77 000 00 00"/></label></div>
   </fieldset>
   {agency&&<fieldset><legend><BriefcaseBusiness size={16}/>Le propriétaire qui vous confie ce bien</legend>
    <div className="first-rental-row"><label className="field"><span>Nom</span><input value={f.owner} onChange={set('owner')} maxLength={120}/></label><label className="field"><span>Votre commission</span><div className="first-rental-money"><input inputMode="numeric" value={f.commission} onChange={set('commission')}/><em>%</em></div></label></div>
   </fieldset>}
   {error&&<p className="form-error" role="alert">{error}</p>}
   <button type="submit" className="first-rental-cta" disabled={busy} aria-busy={busy}>{busy?'Enregistrement…':'Enregistrer et découvrir Yombal'}<ArrowRight size={18}/></button>
   {adding?<button type="button" className="first-rental-skip" disabled={busy} onClick={()=>setAdding(false)}>Annuler</button>:<button type="button" className="first-rental-skip" disabled={busy} onClick={skip}>Commencer avec un espace vide</button>}
  </form>
 </dialog>;
}
