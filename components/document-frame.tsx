'use client';
import {useEffect,useState} from 'react';
import {clientDocument} from '../lib/client-document';
export default function DocumentFrame({html,title,className='invoice-frame',previewOnly=false}:{html:string;title:string;className?:string;previewOnly?:boolean}){
 const [ready,setReady]=useState(''),[error,setError]=useState('');
 useEffect(()=>{let active=true;setReady('');setError('');clientDocument(previewOnly?html.replace(/<button\b[^>]*class="print"[^>]*>[\s\S]*?<\/button>/g,''):html).then(value=>{if(active)setReady(value);}).catch(e=>{if(active)setError(e instanceof Error?e.message:'Document indisponible.');});return()=>{active=false;};},[html,previewOnly]);
 if(error)return <p className="form-error" role="alert">{error}</p>;
 if(!ready)return <p className="form-note" role="status">Préparation du document et de son logo…</p>;
 return <iframe className={className} title={title} srcDoc={ready} sandbox={previewOnly?'':'allow-scripts allow-modals'}/>;
}
