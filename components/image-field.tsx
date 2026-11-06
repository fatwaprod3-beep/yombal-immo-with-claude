'use client';
import {useRef,useState,useEffect,useImperativeHandle,type Ref,type PointerEvent,type KeyboardEvent,type WheelEvent} from 'react';
import {Camera,Crop,Check,Trash2,LoaderCircle,RotateCcw,RotateCw,UserRound,Image as ImageIcon} from 'lucide-react';
import {apiFetch,privateImageData} from '../lib/api-fetch';
import {cropBox,fitBox} from '../lib/image-crop';
import PrivateImage from './private-image';
import {Dialog} from './ui';
type ImageStyle='photo'|'logo';
export type ImageFieldHandle={commit:()=>Promise<string>;getStyle:()=>ImageStyle|undefined};
export default function ImageField({ref,value,onChange,demo=false,onBusy,label='Photo',aspect=1,required=false,contain=false,appearance,onAppearanceChange}:{appearance?:ImageStyle;onAppearanceChange?:(style:ImageStyle)=>void;ref?:Ref<ImageFieldHandle>;contain?:boolean;value:string;onChange:(url:string)=>void;demo?:boolean;onBusy?:(v:boolean)=>void;label?:string;aspect?:number;required?:boolean}){
 const input=useRef<HTMLInputElement>(null);const [cropStyle,setCropStyle]=useState(appearance);
 const [source,setSource]=useState(''),[image,setImage]=useState<HTMLImageElement|null>(null),[fit,setFit]=useState(contain),[zoom,setZoom]=useState(1),[x,setX]=useState(50),[y,setY]=useState(50),[busy,setBusy]=useState(false),[opening,setOpening]=useState(false),[error,setError]=useState('');
 useEffect(()=>{if(!source)setCropStyle(appearance);},[appearance,source]);
 const resize=useRef<{distance:number;zoom:number;cx:number;cy:number}|null>(null);
 const uploadPromise=useRef<Promise<string>|null>(null);const pointers=useRef(new Map<number,{x:number;y:number}>()),drag=useRef<{x:number;y:number;px:number;py:number}|null>(null);
 const local=useRef(''),loading=useRef(0),busyCallback=useRef(onBusy),controller=useRef<AbortController|null>(null);busyCallback.current=onBusy;
 useEffect(()=>()=>{loading.current++;controller.current?.abort();if(local.current)URL.revokeObjectURL(local.current);busyCallback.current?.(false);},[]);
 const {width,height,scale,sourceWidth:cw,sourceHeight:ch,sx,sy}=cropBox(image?.naturalWidth||1,image?.naturalHeight||1,aspect,zoom,x,y);
 const fitted=fitBox(image?.naturalWidth||1,image?.naturalHeight||1,width,height,zoom,x,y);
 function close(){pointers.current.clear();drag.current=null;resize.current=null;loading.current++;controller.current?.abort();setSource('');setImage(null);setOpening(false);onBusy?.(false);}
 async function load(url:string){
  if(demo){setError('Passez dans votre espace pour importer une photo.');return;}
  const ticket=++loading.current;controller.current?.abort();const aborter=new AbortController();controller.current=aborter;
  onBusy?.(true);setOpening(true);setSource('');setImage(null);setError('');
  try{
   const resolved=await privateImageData(url,aborter.signal);
   const img=await new Promise<HTMLImageElement>((resolve,reject)=>{const next=new Image();const timer=setTimeout(()=>reject(new Error('L’image met trop de temps à s’ouvrir. Réessayez.')),15000);next.onload=()=>{clearTimeout(timer);resolve(next);};next.onerror=()=>{clearTimeout(timer);reject(new Error('Cette image ne peut pas être ouverte. Importez un JPG, PNG ou WebP.'));};next.src=resolved;});
   if(ticket!==loading.current)return;
   setImage(img);setSource(resolved);setZoom(1);setFit(appearance?appearance==='logo':contain);setCropStyle(appearance);setX(50);setY(50);
  }catch(e){if(ticket===loading.current){setError(e instanceof Error?e.message:'Image indisponible.');onBusy?.(false);}}
  finally{if(ticket===loading.current)setOpening(false);}
 }
 function choose(file?:File){if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>12000000){setError('Choisissez un JPG, PNG ou WebP de moins de 12 Mo.');return;}if(local.current)URL.revokeObjectURL(local.current);local.current=URL.createObjectURL(file);void load(local.current);}
 async function save():Promise<string>{
  if(uploadPromise.current)return uploadPromise.current;
  if(opening)throw new Error('La photo est encore en cours d’ouverture. Patientez un instant.');
  if(!image)return value;
  const run=async()=>{setBusy(true);setError('');try{
   const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Recadrage indisponible.');
   if(fit)ctx.drawImage(image,0,0,image.naturalWidth,image.naturalHeight,fitted.dx,fitted.dy,fitted.drawnWidth,fitted.drawnHeight);else ctx.drawImage(image,sx,sy,cw,ch,0,0,width,height);
   const asJpeg=!fit&&cropStyle!=='logo';if(asJpeg){ctx.globalCompositeOperation='destination-over';ctx.fillStyle='#ffffff';ctx.fillRect(0,0,width,height);}
   const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Image indisponible.')),asJpeg?'image/jpeg':'image/png',asJpeg?0.9:undefined));
   const body=new FormData();body.append('file',new File([blob],asJpeg?'yombal-image.jpg':'yombal-image.png',{type:asJpeg?'image/jpeg':'image/png'}));
   const r=await apiFetch('/api/files',{method:'POST',body});const d=await r.json() as {url:string;error?:string};if(!r.ok)throw new Error(d.error||'Envoi impossible.');if(cropStyle)onAppearanceChange?.(cropStyle);onChange(d.url);close();return d.url;
  }catch(e){setError(e instanceof Error?e.message:'Envoi impossible.');throw e;}finally{setBusy(false);}};
  uploadPromise.current=run();try{return await uploadPromise.current;}finally{uploadPromise.current=null;}
 }
 useImperativeHandle(ref,()=>({commit:save,getStyle:()=>cropStyle}));
 function beginDrag(e:PointerEvent<SVGSVGElement>){if(busy)return;e.currentTarget.setPointerCapture(e.pointerId);pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});drag.current={x,y,px:e.clientX,py:e.clientY};}
 function moveDrag(e:PointerEvent<SVGSVGElement>){if(!pointers.current.has(e.pointerId)||busy)return;const previous=[...pointers.current.values()];pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});const current=[...pointers.current.values()];if(current.length===2){const distance=(p:typeof current)=>Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);const before=distance(previous),after=distance(current);if(before>0)setZoom(z=>Math.min(4,Math.max(1,z*after/before)));return;}if(!drag.current)return;const rect=e.currentTarget.getBoundingClientRect();const spanX=fit?width-fitted.drawnWidth:width-(image?.naturalWidth||0)*scale,spanY=fit?height-fitted.drawnHeight:height-(image?.naturalHeight||0)*scale;if(Math.abs(spanX)>1)setX(Math.max(0,Math.min(100,drag.current.x+(e.clientX-drag.current.px)/rect.width*width/spanX*100)));if(Math.abs(spanY)>1)setY(Math.max(0,Math.min(100,drag.current.y+(e.clientY-drag.current.py)/rect.height*height/spanY*100)));}
 function endDrag(e:PointerEvent<SVGSVGElement>){pointers.current.delete(e.pointerId);const remaining=[...pointers.current.values()][0];drag.current=remaining?{x,y,px:remaining.x,py:remaining.y}:null;}

 function moveByKey(e:KeyboardEvent<SVGSVGElement>){
  const moves:Record<string,[number,number]>={ArrowLeft:[-5,0],ArrowRight:[5,0],ArrowUp:[0,-5],ArrowDown:[0,5]};
  const move=moves[e.key];if(!move||busy)return;e.preventDefault();
  setX(v=>Math.max(0,Math.min(100,v+move[0])));setY(v=>Math.max(0,Math.min(100,v+move[1])));
 }

 function resizeStart(e:PointerEvent<HTMLButtonElement>){if(busy)return;e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);const r=e.currentTarget.parentElement!.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;resize.current={cx,cy,distance:Math.max(1,Math.hypot(e.clientX-cx,e.clientY-cy)),zoom};}
 function resizeMove(e:PointerEvent<HTMLButtonElement>){if(!resize.current||busy)return;const r=resize.current,d=Math.max(1,Math.hypot(e.clientX-r.cx,e.clientY-r.cy));setZoom(Math.min(4,Math.max(1,r.zoom*r.distance/d)));}

 function reset(){setZoom(1);setX(50);setY(50);}
 // Rotation d’un quart de tour : l’image est redessinée puis rechargée dans l’outil.
 async function rotate(){if(!image||busy)return;const c=document.createElement('canvas');c.width=image.naturalHeight;c.height=image.naturalWidth;const g=c.getContext('2d');if(!g)return;g.translate(c.width/2,c.height/2);g.rotate(Math.PI/2);g.drawImage(image,-image.naturalWidth/2,-image.naturalHeight/2);
  const blob=await new Promise<Blob|null>(r=>c.toBlob(r,'image/png'));if(!blob)return;if(local.current)URL.revokeObjectURL(local.current);local.current=URL.createObjectURL(blob);
  const next=new Image();next.onload=()=>{setImage(next);setSource(local.current);reset();};next.src=local.current;}
 function wheel(e:WheelEvent<SVGSVGElement>){if(busy)return;setZoom(z=>Math.min(4,Math.max(1,z*(e.deltaY<0?1.08:1/1.08))));}
 function chooseStyle(style:ImageStyle){setCropStyle(style);setFit(style==='logo');reset();}
 const picture=image?<image href={source} x={fit?fitted.dx:-sx*scale} y={fit?fitted.dy:-sy*scale} width={fit?fitted.drawnWidth:image.naturalWidth*scale} height={fit?fitted.drawnHeight:image.naturalHeight*scale}/>:null;
 return <div className="image-field">
  <input ref={input} className="image-file-input" type="file" accept="image/jpeg,image/png,image/webp" aria-label={'Importer : '+label} disabled={busy||opening} onChange={e=>{choose(e.target.files?.[0]);e.target.value='';}}/>
  <div className="image-field-top">
   <button type="button" className={'image-field-preview '+(appearance==='photo'?'is-photo':appearance==='logo'?'is-logo':'')} style={{aspectRatio:String(aspect)}} disabled={busy||opening} aria-label={value?'Recadrer : '+label:'Importer : '+label} onClick={()=>value?void load(value):input.current?.click()}>{value?<PrivateImage src={value} alt={label}/>:<Camera size={26}/>}<span className="image-preview-edit"><Camera size={13}/></span></button>
   <div className="image-field-description"><strong>{label}{required?' *':''}</strong><small>JPG, PNG ou WebP · 12 Mo maximum</small><button type="button" className="button secondary" disabled={busy||opening} onClick={()=>input.current?.click()}><Camera size={15}/>{value?'Changer l’image':'Choisir une image'}</button>{value&&<div className="image-edit-actions"><button type="button" className="text-button" disabled={busy||opening} onClick={()=>void load(value)}><Crop size={14}/>Recadrer</button><button type="button" className="text-button" disabled={busy||opening||!!source} onClick={()=>onChange('')}><Trash2 size={14}/>Retirer</button></div>}</div>
  </div>
  {opening&&<p className="image-pending" role="status"><LoaderCircle className="spin" size={16}/>Ouverture de l’image…<button type="button" className="text-button" onClick={close}>Annuler</button></p>}
  {source&&image&&<Dialog title={cropStyle==='logo'?'Ajuster votre logo':'Recadrer votre photo'} detail="Glissez l’image pour la placer. Pincez ou utilisez le zoom." className="photo-crop-dialog" wide onClose={()=>{if(!busy)close();}}>
   <section className="image-cropper">
    {appearance&&<div className="crop-style-picker" aria-label="Présentation de votre image"><button type="button" aria-pressed={cropStyle==='photo'} disabled={busy} onClick={()=>chooseStyle('photo')}><UserRound size={16}/>Photo ronde</button><button type="button" aria-pressed={cropStyle==='logo'} disabled={busy} onClick={()=>chooseStyle('logo')}><ImageIcon size={16}/>Logo entier</button></div>}
    <div className={'crop-viewport '+(aspect===1?'square-crop':'')}><svg className="direct-crop-stage" onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onWheel={wheel} viewBox={'0 0 '+width+' '+height} style={{aspectRatio:String(aspect),width:'100%',height:'auto'}} tabIndex={0} onKeyDown={moveByKey} role="img" aria-label="Déplacer l’image dans le cadre">{picture}</svg><span className="crop-grid" aria-hidden="true"><i/><i/><i/><i/></span>{cropStyle==='photo'&&aspect===1&&<span className="crop-circle-guide" aria-hidden="true"/>}{['tl','tr','bl','br'].map(corner=><button key={corner} type="button" className={'crop-corner '+corner} disabled={busy} aria-label="Ajuster le zoom depuis ce coin" onPointerDown={resizeStart} onPointerMove={resizeMove} onPointerUp={()=>{resize.current=null;}} onPointerCancel={()=>{resize.current=null;}} onKeyDown={e=>{if(e.key==='ArrowUp'||e.key==='ArrowRight'){e.preventDefault();setZoom(v=>Math.min(4,v+.1));}if(e.key==='ArrowDown'||e.key==='ArrowLeft'){e.preventDefault();setZoom(v=>Math.max(1,v-.1));}}}/>)}</div>
    <div className="crop-controls"><label>−<input aria-label="Zoom de l’image" type="range" min="1" max="4" step="0.02" value={zoom} disabled={busy} onChange={e=>setZoom(Number(e.target.value))}/>＋</label><label className="crop-fit-choice"><input type="checkbox" checked={fit} disabled={busy} onChange={e=>{setFit(e.target.checked);reset();}}/>Garder l’image entière</label><button type="button" className="text-button crop-rotate" disabled={busy} onClick={()=>void rotate()}><RotateCw size={14}/>Pivoter</button><button type="button" className="text-button crop-reset" disabled={busy} onClick={reset}><RotateCcw size={14}/>Recentrer</button><span className="crop-zoom-value">{Math.round(zoom*100)} %</span></div>
    <div className="crop-result"><span className={'crop-result-image '+(cropStyle==='photo'?'is-photo':'is-logo')}><svg viewBox={'0 0 '+width+' '+height} role="img" aria-label="Aperçu après recadrage">{picture}</svg></span><div><strong>Votre aperçu</strong><small>{cropStyle==='logo'?'Le logo reste entier dans un cadre arrondi.':cropStyle==='photo'?'La photo remplit le cercle de votre profil.':'Voici l’image qui sera enregistrée.'}</small></div><button type="button" className="text-button" disabled={busy} onClick={()=>input.current?.click()}>Changer</button></div>
    {error&&<p className="form-error" role="alert">{error}</p>}
   </section><div className="dialog-footer"><button type="button" className="button secondary" disabled={busy} onClick={close}>Annuler</button><button type="button" className="button primary" disabled={busy} aria-busy={busy} onClick={()=>void save().catch(()=>{})}>{busy?<LoaderCircle className="spin" size={16}/>:<Check size={16}/>} {busy?'Enregistrement…':'Utiliser cette image'}</button></div>
  </Dialog>}
  {error&&!source&&<p className="form-error" role="alert">{error}</p>}
 </div>;
}
