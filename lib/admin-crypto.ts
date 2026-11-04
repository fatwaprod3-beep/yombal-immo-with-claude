export const adminSessionSeconds=4*60*60;
export const adminPasswordIterations=100000;
const bytes=new TextEncoder();
const hex=(buffer:ArrayBuffer)=>Array.from(new Uint8Array(buffer),b=>b.toString(16).padStart(2,'0')).join('');
const unhex=(value:string)=>new Uint8Array(value.match(/.{2}/g)!.map(v=>parseInt(v,16)));
export async function passwordDigest(password:string,salt:string){const key=await crypto.subtle.importKey('raw',bytes.encode(password),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',iterations:adminPasswordIterations,salt:bytes.encode(salt)},key,256));}
export function sameValue(a:string,b:string){if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;}
async function signingKey(secret:string){return crypto.subtle.importKey('raw',bytes.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
export async function createAdminToken(userId:string,secret:string,at=Date.now()){const expires=at+adminSessionSeconds*1000;const value=userId+'|'+expires;const signature=hex(await crypto.subtle.sign('HMAC',await signingKey(secret),bytes.encode(value)));return expires+'.'+signature;}
export async function verifyAdminToken(token:string,userId:string,secret:string,at=Date.now()){const match=/^(\d{13})\.([a-f0-9]{64})$/.exec(token);if(!match)return false;const expires=Number(match[1]);if(expires<=at||expires>at+adminSessionSeconds*1000)return false;return crypto.subtle.verify('HMAC',await signingKey(secret),unhex(match[2]),bytes.encode(userId+'|'+expires));}
