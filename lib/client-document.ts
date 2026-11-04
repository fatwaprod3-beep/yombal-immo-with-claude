import {embedPrivateImages} from './document-images';
import {privateImageData} from './api-fetch';
export const clientDocument=(html:string)=>embedPrivateImages(html,privateImageData);
export function openDocument(html:string,onError?:(message:string)=>void){
 const win=window.open('','_blank');if(!win){const message='Autorisez la fenêtre pour ouvrir le document.';if(onError)onError(message);else throw new Error(message);return;}
 win.opener=null;win.document.body.textContent='Préparation de votre document…';
 void clientDocument(html).then(ready=>{if(!win.closed){win.document.open();win.document.write(ready);win.document.close();}}).catch(e=>{const message=e instanceof Error?e.message:'Document indisponible.';if(!win.closed)win.document.body.textContent=message;onError?.(message);});
}
