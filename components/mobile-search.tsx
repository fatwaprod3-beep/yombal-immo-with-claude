'use client';
import {useEffect,useId,useRef} from 'react';
import {Search,X,ArrowUpRight} from 'lucide-react';
export type SearchResult={id:string;name:string;detail:string;onClick:()=>void};
export default function MobileSearch({query,onQuery,results,onClose,realEstate}:{query:string;onQuery:(value:string)=>void;results:SearchResult[];onClose:()=>void;realEstate:boolean}){
  const dialog=useRef<HTMLDialogElement>(null),input=useRef<HTMLInputElement>(null),titleId=useId();
  useEffect(()=>{const node=dialog.current;if(!node)return;node.showModal();input.current?.focus({preventScroll:true});return()=>node.close();},[]);
  return <dialog ref={dialog} id="mobile-search-dialog" className="mobile-search-dialog" aria-labelledby={titleId} onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div className="mobile-search-surface">
      <div className="mobile-search-heading"><h2 id={titleId}>Rechercher</h2><button type="button" className="icon-button" aria-label="Fermer la recherche" onClick={onClose}><X size={21}/></button></div>
      <div className="mobile-search-input"><Search size={20}/><input ref={input} type="search" aria-label={realEstate?'Rechercher un bien ou un locataire':'Rechercher dans mon inventaire'} placeholder={realEstate?'Un bien, un locataire…':'Un nom, une référence…'} value={query} onChange={e=>onQuery(e.target.value)} autoComplete="off" enterKeyHint="search"/>{query&&<button type="button" className="icon-button" aria-label="Effacer la recherche" onClick={()=>{onQuery('');input.current?.focus();}}><X size={17}/></button>}</div>
      <div className="mobile-search-matches">{!query.trim()?<p className="mobile-search-hint">{realEstate?'Retrouvez un bien par son nom ou son quartier, ou un locataire par son nom ou ses coordonnées.':'Retrouvez vos biens par leur nom, leur référence ou leur lieu.'}</p>:results.length?<><p className="mobile-search-count" role="status">{results.length} résultat(s)</p><ul aria-label="Résultats de recherche">{results.map((result,index)=><li key={result.id+':'+index}><button type="button" onClick={()=>{onClose();result.onClick();}}><Search size={17}/><span><strong>{result.name}</strong><small>{result.detail}</small></span><ArrowUpRight size={17}/></button></li>)}</ul></>:<p className="mobile-search-hint" role="status">Aucun résultat. Essayez un autre nom.</p>}</div>
    </div>
  </dialog>;
}
