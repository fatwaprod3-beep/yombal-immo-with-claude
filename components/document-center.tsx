'use client';
import {useState} from 'react';
import {FileText,FolderOpen,History} from 'lucide-react';
import InvoicesPage from './invoices-page';
import ContractsPage from './contracts-page';
import {DocumentsPage,type Actions} from './views';
import type {State} from '../lib/model';
export default function DocumentCenter({state,spaceId,demo,actions,period,initialTab='invoices'}:{state:State;spaceId:string;demo:boolean;actions:Actions;period:string;initialTab?:string}){
 const [tab,setTab]=useState(initialTab);
 return <div className="documents-workspace"><div className="document-center-tabs" aria-label="Factures, reçus et documents">{[{id:'invoices',label:'Factures',Icon:FileText},{id:'contracts',label:'Contrats',Icon:FileText},{id:'receipts',label:'Reçus',Icon:History},{id:'files',label:'Fichiers',Icon:FolderOpen}].map(({id,label,Icon})=><button key={id} className={tab===id?'active':''} aria-pressed={tab===id} onClick={()=>setTab(id)}><Icon size={18}/>{label}</button>)}</div>{(tab==='invoices'||tab==='receipts')?<InvoicesPage onlyPaid={tab==='receipts'} state={state} spaceId={spaceId} demo={demo} actions={actions} period={period}/>:tab==='contracts'?<ContractsPage state={state} actions={actions}/>:<DocumentsPage key={tab} initialTab={tab} state={state} period={period} actions={actions}/>}</div>;
}
