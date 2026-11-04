'use client';
import {createContext,useContext,useEffect,useId,useState,type ReactNode} from 'react';
import {ChevronDown} from 'lucide-react';
export function useMobileSettings(){
 const [mobile,setMobile]=useState(false);
 useEffect(()=>{const media=window.matchMedia('(max-width:850px)');const update=()=>setMobile(media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
 return mobile;
}
const settingKey=(title:string)=>title.toLowerCase().replace(/[^a-z0-9]/g,'-');
const SettingsTabsContext=createContext<{active:string;select:(title:string)=>void;id:string}|null>(null);
export function MobileSettingsGroup({mobile,children,documents=true,extraTabs=[],tabs:providedTabs,value,onChange}:{value?:string;onChange?:(title:string)=>void;mobile:boolean;children:ReactNode;documents?:boolean;extraTabs?:Array<[string,string]>;tabs?:Array<[string,string]>}){
 const [localActive,setLocalActive]=useState(()=>providedTabs?.[0]?.[0]||'Coordonnées et agence');const id=useId();const active=value??localActive,select=onChange||setLocalActive;
 if(!mobile)return <>{children}</>;
 const tabs=providedTabs||[['Coordonnées et agence','Coordonnées'],['Photo ou logo','Photo / logo'],...(documents?[['Factures, relances et signature','Factures']]:[]),['Type d’espace','Mon espace'],...extraTabs];
 return <SettingsTabsContext.Provider value={{active,select,id}}><div className="mobile-settings-tabs-layout"><div className="mobile-settings-tabs" role="tablist" aria-label="Rubriques des paramètres">{tabs.map(([title,label],index)=><button type="button" role="tab" id={id+'-tab-'+settingKey(title)} aria-selected={active===title} aria-controls={id+'-panel-'+settingKey(title)} tabIndex={active===title?0:-1} key={title} onClick={()=>select(title)} onKeyDown={event=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;select(tabs[next][0]);const list=event.currentTarget.parentElement;requestAnimationFrame(()=>list?.querySelectorAll<HTMLButtonElement>('[role=tab]')[next]?.focus());}}}>{label}</button>)}</div>{children}</div></SettingsTabsContext.Provider>;
}
export function revealInvalidSetting(form:HTMLFormElement){
 const invalid=form.querySelector<HTMLElement>(':invalid');
 invalid?.dispatchEvent(new Event('invalid',{cancelable:true}));
 let parent=invalid?.parentElement;
 while(parent){if(parent instanceof HTMLDetailsElement)parent.open=true;parent=parent.parentElement;}
 requestAnimationFrame(()=>{invalid?.focus();invalid?.scrollIntoView({block:'center',behavior:'smooth'});});
}
export default function MobileSettingsSection({mobile,title,children,defaultOpen=false}:{mobile:boolean;title:string;children:ReactNode;defaultOpen?:boolean}){
 const [open,setOpen]=useState(defaultOpen);const tabs=useContext(SettingsTabsContext);
 if(children===false||children===null||children===undefined)return null;
 if(!mobile)return <>{children}</>;
 if(tabs)return <section className="mobile-settings-tab-panel" role="tabpanel" id={tabs.id+'-panel-'+settingKey(title)} aria-labelledby={tabs.id+'-tab-'+settingKey(title)} hidden={tabs.active!==title} onInvalidCapture={()=>tabs.select(title)}><h3>{title}</h3><SettingsTabsContext.Provider value={null}>{children}</SettingsTabsContext.Provider></section>;
 return <details className="mobile-settings-section" open={open} onToggle={event=>setOpen(event.currentTarget.open)}><summary>{title}<ChevronDown size={18}/></summary><div className="mobile-settings-content">{children}</div></details>;
}
