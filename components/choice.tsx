'use client';
import {useEffect,useRef,useState,useId} from 'react';
import {useOverlayHistory} from './use-overlay-history';
import { Select } from 'radix-ui';
import { Check, ChevronDown, Building2, Home, BedDouble, Store, MapPin, Wallet, Landmark, CreditCard } from 'lucide-react';
const visualOptions = new Set(['Wave','Orange Money','Virement','Carte','Espèces','Appartement','Villa','Maison','Studio','Chambre','Commerce','Immeuble','Terrain']);
export function ChoiceIcon({ value }: { value: string }) {
 if(value==='Wave')return <span className="method-mark wave-mark" aria-hidden="true">W</span>;
 if(value==='Orange Money')return <span className="method-mark orange-mark" aria-hidden="true">OM</span>;
 const Icon=value==='Virement'?Landmark:value==='Carte'?CreditCard:value==='Espèces'?Wallet:['Maison','Villa'].includes(value)?Home:['Studio','Chambre'].includes(value)?BedDouble:value==='Commerce'?Store:value==='Terrain'?MapPin:Building2;
 return <Icon size={17} aria-hidden="true"/>;
}
export default function Choice({ value, onChange, options, label, required=false, name }: {value:string;onChange:(value:string)=>void;options:{value:string;label:string;detail?:string}[];label:string;required?:boolean;name?:string}) {
 const trigger=useRef<HTMLButtonElement>(null),overlayId=useId();const [open,setOpen]=useState(false),[portalHost,setPortalHost]=useState<HTMLElement|null>(null);
 useOverlayHistory(open,overlayId,()=>setOpen(false));
 useEffect(()=>{setPortalHost(trigger.current?.closest('dialog')||document.body);},[]);
 const selected=options.find(o=>o.value===value);
 return <Select.Root open={open} onOpenChange={setOpen} value={value||'__empty__'} onValueChange={v=>onChange(v==='__empty__'?'':v)} name={name} required={required}><Select.Trigger ref={trigger} className="choice-trigger" aria-label={label}><span>{visualOptions.has(value)&&<ChoiceIcon value={value}/>}<Select.Value><span className="choice-copy"><span>{selected?.label||'Choisir…'}</span>{selected?.detail&&<small>{selected.detail}</small>}</span></Select.Value></span><Select.Icon><ChevronDown size={16}/></Select.Icon></Select.Trigger><Select.Portal container={portalHost||undefined}><Select.Content collisionBoundary={portalHost?.tagName==='DIALOG'?portalHost:undefined} className="choice-content" position="popper" sideOffset={5} align="start"><Select.Viewport>{options.map(o=><Select.Item className="choice-option" key={o.value||'__empty__'} value={o.value||'__empty__'}>{visualOptions.has(o.value)&&<ChoiceIcon value={o.value}/>}<Select.ItemText className="choice-label"><span className="choice-copy"><span>{o.label}</span>{o.detail&&<small>{o.detail}</small>}</span></Select.ItemText><Select.ItemIndicator><Check size={15}/></Select.ItemIndicator></Select.Item>)}</Select.Viewport></Select.Content></Select.Portal></Select.Root>;
}
