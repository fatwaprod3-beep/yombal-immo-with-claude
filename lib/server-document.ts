import {getFile} from './storage';
import {embedPrivateImages} from './document-images';
export async function serverDocument(html:string,userId:string){return embedPrivateImages(html,async url=>{
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(userId));const scope=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
 const key=new URL(url,'https://local.test').searchParams.get('key')||'';
 if(!key.startsWith(scope+'/')||!/^[a-f0-9]{64}\/[a-f0-9-]+\.(png|jpg|webp)$/.test(key))throw new Error('Logo inaccessible.');
 const image=await getFile(key);if(!image)throw new Error('Logo introuvable. Réimportez-le dans votre profil.');
 const bytes=new Uint8Array(image);if(bytes.length>12000000)throw new Error('Logo trop volumineux.');let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
 const type=key.endsWith('.jpg')?'jpeg':key.endsWith('.webp')?'webp':'png';return 'data:image/'+type+';base64,'+btoa(binary);
});}
