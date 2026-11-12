'use client';
import {useEffect,useRef,useState} from 'react';
import {Home,BriefcaseBusiness,ArrowRight,ArrowLeft,Check,Phone,MapPin} from 'lucide-react';
import type {Mode,Profile} from '../lib/model';
import ImageField,{type ImageFieldHandle} from './image-field';

// Première question d'un nouveau compte : propriétaire ou agence. Pour une agence, on demande aussitôt
// le nom, le téléphone (affiché aux locataires sur les reçus) et le logo : l'espace est prêt dès le départ.
export type RoleDetails=Partial<Pick<Profile,'company'|'phone'|'city'|'image'|'imageStyle'>>;
export default function RoleChoice({onChoose,profile}:{onChoose:(mode:Mode,details?:RoleDetails)=>Promise<void>|void;profile?:Profile}){
 const ref=useRef<HTMLDialogElement>(null),logo=useRef<ImageFieldHandle>(null);
 const [mode,setMode]=useState<Mode|null>(null),[step,setStep]=useState<'role'|'agency'>('role'),[busy,setBusy]=useState(false),[uploading,setUploading]=useState(false),[error,setError]=useState('');
 const [agency,setAgency]=useState({company:profile?.company||'',phone:profile?.phone||'',city:profile?.city||'',image:profile?.image||''});
 useEffect(()=>{const d=ref.current;if(d&&!d.open)d.showModal();},[]);
 async function next(){if(!mode||busy)return;if(mode==='agency'){setStep('agency');return;}setBusy(true);try{await onChoose(mode);ref.current?.close();}finally{setBusy(false);}}
 async function saveAgency(){
  setError('');
  if(agency.company.trim().length<2)return setError('Indiquez le nom de votre agence.');
  if(!/^[+\d().\s-]{6,35}$/.test(agency.phone.trim()))return setError('Indiquez un numéro de téléphone valide : vos locataires le verront sur leurs reçus.');
  setBusy(true);
  try{const image=agency.image?await logo.current?.commit()||agency.image:'';await onChoose('agency',{company:agency.company.trim(),phone:agency.phone.trim(),city:agency.city.trim()||profile?.city||'Dakar',...(image?{image,imageStyle:'logo' as const}:{})});ref.current?.close();}
  catch(e){setError(e instanceof Error?e.message:'Enregistrement impossible, réessayez.');}
  finally{setBusy(false);}
 }
 if(step==='agency')return <dialog ref={ref} className="role-choice" aria-labelledby="role-choice-title" onCancel={e=>e.preventDefault()}>
  <div className="role-choice-head"><span className="role-choice-eyebrow">Votre agence</span><h2 id="role-choice-title">Présentez votre agence</h2><p>Ces informations apparaissent sur les reçus, factures et contrats envoyés à vos locataires et propriétaires.</p></div>
  <form className="role-agency" onSubmit={e=>{e.preventDefault();void saveAgency();}}>
   <div className="role-agency-logo"><ImageField ref={logo} contain appearance="logo" label="Logo de l’agence (facultatif)" value={agency.image} onChange={image=>setAgency(a=>({...a,image}))} onBusy={setUploading}/></div>
   <label className="field"><span>Nom de l’agence</span><input value={agency.company} onChange={e=>setAgency(a=>({...a,company:e.target.value}))} maxLength={120} placeholder="Ex. : Teranga Immobilier" autoComplete="organization" required/></label>
   <label className="field"><span><Phone size={13}/>Téléphone de l’agence</span><input type="tel" inputMode="tel" value={agency.phone} onChange={e=>setAgency(a=>({...a,phone:e.target.value}))} maxLength={35} placeholder="77 000 00 00" autoComplete="tel" required/><small>Le numéro où vos locataires peuvent vous joindre.</small></label>
   <label className="field"><span><MapPin size={13}/>Ville</span><input value={agency.city} onChange={e=>setAgency(a=>({...a,city:e.target.value}))} maxLength={100} placeholder="Dakar" autoComplete="address-level2"/></label>
   {error&&<p className="form-error" role="alert">{error}</p>}
   <button type="submit" className="role-choice-cta" disabled={busy||uploading} aria-busy={busy}>{busy?'Enregistrement…':'Continuer'}<ArrowRight size={18}/></button>
   <button type="button" className="role-choice-back" disabled={busy} onClick={()=>{setError('');setStep('role');}}><ArrowLeft size={15}/>Retour</button>
  </form>
 </dialog>;
 return <dialog ref={ref} className="role-choice" aria-labelledby="role-choice-title" onCancel={e=>e.preventDefault()}>
  <div className="role-choice-head"><img src="/icons/yombal-192.png" alt=""/><span className="role-choice-eyebrow">Bienvenue sur Yombal</span><h2 id="role-choice-title">Comment gérez-vous vos biens ?</h2><p>Une seule question, pour adapter votre espace. Vous pourrez changer plus tard dans les paramètres.</p></div>
  <div className="role-choice-options" role="radiogroup" aria-label="Votre profil">
   <button type="button" role="radio" aria-checked={mode==='owner'} className={mode==='owner'?'chosen':''} onClick={()=>setMode('owner')}><span className="role-choice-icon"><Home size={24}/></span><div><strong>Je gère mes propres biens</strong><small>Propriétaire : mes logements, mes locataires, mes loyers.</small></div><i><Check size={15}/></i></button>
   <button type="button" role="radio" aria-checked={mode==='agency'} className={mode==='agency'?'chosen':''} onClick={()=>setMode('agency')}><span className="role-choice-icon agency"><BriefcaseBusiness size={24}/></span><div><strong>Je suis une agence</strong><small>Je gère les biens de mes clients : propriétaires, commissions et reversements.</small></div><i><Check size={15}/></i></button>
  </div>
  <button type="button" className="role-choice-cta" disabled={!mode||busy} aria-busy={busy} onClick={()=>void next()}>{busy?'Un instant…':'Continuer'}<ArrowRight size={18}/></button>
 </dialog>;
}
