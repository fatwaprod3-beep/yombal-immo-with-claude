'use client';
import {useState, type FormEvent} from 'react';
import {Home, BriefcaseBusiness, Check, Plus, LoaderCircle, Package, PawPrint, Layers} from 'lucide-react';
import {Dialog} from './ui';
import {activityOf, spaceLabel, type Activity} from '../lib/activity';
import type {Space} from '../lib/spaces';
export type SpaceChange = {action:'create';name:string;mode:'owner'|'agency';activity?:Activity}|{action:'switch';id:string};
const kinds = [
  {id:'agency',activity:'realestate',mode:'agency',icon:BriefcaseBusiness,title:'Mon agence',detail:'Logements de mes clients, commissions et reversements.'},
  {id:'owner',activity:'realestate',mode:'owner',icon:Home,title:'Mes logements',detail:'Mes biens, mes locataires et mes loyers.'},
  {id:'equipment',activity:'equipment',mode:'owner',icon:Package,title:'Matériel & bagages',detail:'Inventaire, biens confiés, retours et dépenses.'},
  {id:'animals',activity:'animals',mode:'owner',icon:PawPrint,title:'Animaux',detail:'Fiches, lieux, personnes responsables et rappels.'},
  {id:'other',activity:'other',mode:'owner',icon:Layers,title:'Autres biens',detail:'Un inventaire simple pour le reste de mes biens.'},
] as const;
export function SpaceIcon({space,size=21}:{space:Pick<Space,'mode'|'activity'>;size?:number}) {
  const a=activityOf(space),Icon=a==='animals'?PawPrint:a==='equipment'?Package:a==='other'?Layers:space.mode==='agency'?BriefcaseBusiness:Home;
  return <Icon size={size}/>;
}
export default function WorkspaceDialog({spaces,activeId,onClose,onChange,canCreate=true,onPro}:{canCreate?:boolean;onPro?:()=>void;spaces:Space[];activeId:string;onClose:()=>void;onChange:(body:SpaceChange)=>Promise<void>}) {
  const [creating,setCreating]=useState(false),[name,setName]=useState(''),[kind,setKind]=useState('owner'),[busy,setBusy]=useState(false),[error,setError]=useState('');
  async function send(body:SpaceChange) {setBusy(true);setError('');try{await onChange(body);onClose();}catch(e){setError(e instanceof Error?e.message:'Réessayez.');}finally{setBusy(false);}}
  function submit(e:FormEvent) {e.preventDefault();if(!name.trim()){setError('Donnez un nom à votre nouvel espace.');return;}const k=kinds.find(k=>k.id===kind)!;void send({action:'create',name:name.trim(),mode:k.mode,activity:k.activity});}
  return <Dialog title="Mes espaces" detail="Une activité par espace, avec ses propres données et ses menus." onClose={()=>{if(!busy)onClose();}} wide>
    <div className="form-body">
      <div className="spaces-list">{spaces.map(s=><button key={s.id} disabled={busy} className={'space-option '+(s.id===activeId?'selected':'')} onClick={()=>send({action:'switch',id:s.id})}><span className="space-option-icon"><SpaceIcon space={s}/></span><span><strong>{s.name}</strong><small>{spaceLabel(s)}</small></span>{s.id===activeId&&<Check size={20}/>}</button>)}</div>
      {!creating?<button className="button secondary new-space" disabled={busy||spaces.length>=20} onClick={()=>canCreate?setCreating(true):onPro?.()}><Plus size={17}/>Créer un autre espace{!canCreate&&<span className="pro-small-badge">PRO</span>}</button>:<form onSubmit={submit} noValidate className="new-space-form">
        <h3>Que voulez-vous gérer ?</h3><div className="activity-choices">{kinds.map(k=><button key={k.id} type="button" disabled={busy} className={kind===k.id?'chosen':''} aria-pressed={kind===k.id} onClick={()=>setKind(k.id)}><k.icon size={23}/><span><strong>{k.title}</strong><small>{k.detail}</small></span>{kind===k.id&&<Check size={18}/>}</button>)}</div>
        <label className="field"><span>Nom de votre nouvel espace</span><input value={name} maxLength={120} onChange={e=>setName(e.target.value)} placeholder={kind==='animals'?'Mon élevage':kind==='equipment'?'Mon matériel':kind==='agency'?'Nom de mon agence':'Nom de mon espace'} disabled={busy}/></label>
        <div className="section-actions"><button className="button secondary" type="button" disabled={busy} onClick={()=>setCreating(false)}>Annuler</button><button className="button primary" disabled={busy}>{busy?<LoaderCircle className="spin" size={16}/>:<Plus size={16}/>}Créer cet espace</button></div>
      </form>}
      {error&&<p className="form-error" role="alert">{error}</p>}<p className="form-note">Les fiches, documents et réglages restent dans leur espace. Changer d’espace ne déplace aucune donnée.</p>
    </div><div className="dialog-footer"><button className="button secondary" disabled={busy} onClick={onClose}>Fermer</button></div>
  </Dialog>;
}
