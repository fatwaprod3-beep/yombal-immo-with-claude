import {list,put} from '@vercel/blob';
// Fichiers privés (logos, photos, PDF) dans Vercel Blob. Les clés contiennent un
// identifiant aléatoire et ne sont servies qu’au propriétaire via /api/files.
export function storageReady(){return !!process.env.BLOB_READ_WRITE_TOKEN;}
export async function putFile(key:string,bytes:ArrayBuffer,contentType:string){
 await put(key,Buffer.from(bytes),{access:'public',contentType,addRandomSuffix:false,cacheControlMaxAge:60});
}
export async function getFile(key:string):Promise<ArrayBuffer|null>{
 const {blobs}=await list({prefix:key,limit:1});const blob=blobs.find(b=>b.pathname===key);if(!blob)return null;
 const response=await fetch(blob.url,{cache:'no-store'});return response.ok?response.arrayBuffer():null;
}
