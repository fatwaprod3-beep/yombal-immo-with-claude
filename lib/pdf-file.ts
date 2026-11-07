'use client';
// Transforme un document Yombal (facture, reçu, contrat) en vrai fichier PDF A4, côté navigateur.
import {clientDocument} from './client-document';
import {whatsappLink} from './sharing';

const clean='<style>.print{display:none!important}html,body{background:#fff!important;margin:0!important}.sheet{margin:0 auto!important;box-shadow:none!important;border-radius:0!important}</style>';
const safeName=(v:string)=>(v||'document').replace(/[\\/:*?"<>|]+/g,'-').replace(/\s+/g,' ').trim().slice(0,90)+'.pdf';

export async function htmlToPdfFile(html:string,name:string):Promise<File>{
 const ready=(await clientDocument(html)).replace('</head>',clean+'</head>');
 const frame=document.createElement('iframe');
 frame.setAttribute('aria-hidden','true');frame.style.cssText='position:fixed;left:-12000px;top:0;width:820px;height:1160px;border:0;opacity:0;pointer-events:none';
 document.body.appendChild(frame);
 try{
  await new Promise<void>(resolve=>{frame.onload=()=>resolve();frame.srcdoc=ready;});
  const doc=frame.contentDocument!;
  await (doc.fonts?.ready||Promise.resolve());
  await Promise.all([...doc.images].map(img=>img.complete?null:new Promise(r=>{img.onload=img.onerror=r;})));
  frame.style.height=Math.max(1160,doc.documentElement.scrollHeight)+'px';
  const [{default:html2canvas},{jsPDF}]=await Promise.all([import('html2canvas'),import('jspdf')]);
  const canvas=await html2canvas(doc.body,{scale:2,backgroundColor:'#ffffff',useCORS:true,logging:false,windowWidth:820,width:820,height:doc.documentElement.scrollHeight});
  const pdf=new jsPDF({unit:'pt',format:'a4',compress:true});
  const pageW=pdf.internal.pageSize.getWidth(),pageH=pdf.internal.pageSize.getHeight(),margin=22;
  const usableH=pageH-margin*2,ratio=pageW/canvas.width,slicePx=Math.floor(usableH/ratio);
  const ctx=canvas.getContext('2d')!;
  // Coupe de page sur une ligne blanche, pour ne jamais trancher une ligne de texte.
  const isBlankRow=(y:number)=>{const row=ctx.getImageData(0,y,canvas.width,1).data;for(let i=0;i<row.length;i+=16)if(row[i]<245||row[i+1]<245||row[i+2]<245)return false;return true;};
  let y=0,page=0;
  while(y<canvas.height-4){
   let h=Math.min(slicePx,canvas.height-y);
   if(y+h<canvas.height){for(let k=0;k<Math.min(260,h-40);k++){if(isBlankRow(y+h-k)){h-=k;break;}}}
   const part=document.createElement('canvas');part.width=canvas.width;part.height=h;
   const pc=part.getContext('2d')!;pc.fillStyle='#fff';pc.fillRect(0,0,part.width,h);pc.drawImage(canvas,0,y,canvas.width,h,0,0,canvas.width,h);
   if(page)pdf.addPage();
   pdf.addImage(part.toDataURL('image/jpeg',0.9),'JPEG',0,margin,pageW,h*ratio,undefined,'FAST');
   y+=h;page++;
  }
  return new File([pdf.output('blob')],safeName(name),{type:'application/pdf'});
 }finally{frame.remove();}
}

export function downloadFile(file:File){const url=URL.createObjectURL(file);const a=document.createElement('a');a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);}
export const canShareFile=(file:File)=>typeof navigator!=='undefined'&&!!navigator.canShare&&navigator.canShare({files:[file]});

/** Partage le PDF : menu de partage du téléphone (WhatsApp, e-mail…), sinon téléchargement + WhatsApp Web. */
export async function sharePdf(file:File,text:string,phone=''):Promise<'shared'|'downloaded'|'cancelled'>{
 if(canShareFile(file)){try{await navigator.share({files:[file],text,title:file.name.replace(/\.pdf$/,'')});return 'shared';}catch(e){if(e instanceof DOMException&&e.name==='AbortError')return 'cancelled';}}
 downloadFile(file);window.open(whatsappLink(text,phone),'_blank','noopener');return 'downloaded';
}
