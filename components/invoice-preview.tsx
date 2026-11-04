'use client';
import {useEffect,useRef,useState,useDeferredValue} from 'react';
import {embedPrivateImages} from '../lib/document-images';
import {privateImageData} from '../lib/api-fetch';
export default function InvoicePreview({html,title='Aperçu de votre facture'}:{html:string;title?:string}){
 const source=useDeferredValue(html);const logos=useRef(new Map<string,Promise<string>>());const box=useRef<HTMLDivElement>(null);const [scale,setScale]=useState(.4),[ready,setReady]=useState(''),[error,setError]=useState('');
 useEffect(()=>{if(!box.current)return;const observer=new ResizeObserver(entries=>setScale(Math.min(1,entries[0].contentRect.width/860)));observer.observe(box.current);return()=>observer.disconnect();},[]);
 useEffect(()=>{let active=true;setError('');embedPrivateImages(source.replace('</head>','<style>.print{display:none!important}body{background:white}.sheet{margin:0;border:0;border-radius:0;max-width:none}</style></head>'),url=>{let image=logos.current.get(url);if(!image){image=privateImageData(url).catch(error=>{logos.current.delete(url);throw error;});logos.current.set(url,image);}return image;}).then(value=>{if(active)setReady(value);}).catch(()=>{if(active)setReady(source.replace(/<img\b[^>]*>/g,''));if(active)setError('Logo indisponible dans cet aperçu.');});return()=>{active=false;};},[source]);
 return <div className="invoice-live-preview" ref={box}><div className="preview-caption"><i/>Aperçu en direct <span>Non émis</span></div>{error&&<small className="muted">{error}</small>}<div className="preview-paper" style={{height:1216*scale}}>{ready?<iframe title={title} width={860} height={1216} srcDoc={ready} sandbox="" style={{transform:'scale('+scale+')',transformOrigin:'top left'}}/>:<p role="status">Chargement de l’aperçu…</p>}</div></div>;
}
