// Official API: https://docs.saspay.me/api-reference/payments/checkout-create
// This module is used on the server only. No key is sent to a client component.
const apiOrigin='https://api.saspay.me/api/v1';
export {isSasPayCheckoutUrl as trustedCheckoutUrl} from './billing';
export type SasPayObject=Record<string,unknown>;
export type SasPayFailure='authentication'|'forbidden'|'rate_limit'|'redirect'|'upstream'|'invalid_response'|'timeout'|'network';
const failureMessages:Record<SasPayFailure,string>={
 authentication:'SasPay a refusé cette clé API (401). Vérifiez qu’elle est complète et toujours active.',
 forbidden:'SasPay refuse cet accès (403). Vérifiez la portée Encaissement et l’état du compte marchand.',
 rate_limit:'SasPay reçoit trop de demandes. Patientez un instant puis réessayez.',
 redirect:'SasPay a renvoyé une redirection inattendue. La connexion a été arrêtée pour protéger votre clé.',
 upstream:'SasPay est temporairement indisponible. Réessayez dans un instant.',
 invalid_response:'La réponse de SasPay n’a pas le format attendu. La connexion doit être vérifiée par Yombal.',
 timeout:'SasPay n’a pas répondu dans le délai prévu. Réessayez dans un instant.',
 network:'Yombal n’a pas pu joindre SasPay. Réessayez dans un instant ; votre clé n’a pas été modifiée.',
};
export class SasPayError extends Error {
 public detail='';
 constructor(public readonly code:SasPayFailure='invalid_response',public readonly httpStatus?:number){super(failureMessages[code]);this.name='SasPayError';}
}
function httpFailure(status:number){return new SasPayError(status===401?'authentication':status===403?'forbidden':status===429?'rate_limit':status>=300&&status<400?'redirect':'upstream',status);}
export function object(value:unknown):SasPayObject {
 return value!==null&&typeof value==='object'&&!Array.isArray(value)?value as SasPayObject:{};
}
export function unwrap(value:unknown):SasPayObject {
 const outer=object(value);
 if(outer.success===false)throw new SasPayError();
 return outer.success===true&&outer.data!==undefined?object(outer.data):outer;
}
export async function sasPayRequest(apiKey:string,path:string,body?:SasPayObject,query?:Record<string,string>):Promise<unknown> {
 if(!path.startsWith('/')||path.includes('..')||path.includes('?')||path.includes('#'))throw new SasPayError();
 const search=query?'?'+new URLSearchParams(query).toString():'';
 try{
  // Workers rejects redirect:"error" before making any request. Manual mode
  // plus the non-2xx check also prevents sending the key to a redirect target.
  const response=await fetch(apiOrigin+path+search,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+apiKey,Accept:'application/json',...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),cache:'no-store',redirect:'manual',signal:AbortSignal.timeout(8000)});
  if(!response.ok){
   const failure=httpFailure(response.status);
   // Diagnostic interne : code d’erreur et noms des champs refusés uniquement (aucun secret).
   try{const body=object(JSON.parse((await response.text()).slice(0,20000)));const err=object(body.error);const fields=Object.keys(object(err.details??err.fields??body.errors??(body.success===false?{}:body)));failure.detail=JSON.stringify({code:typeof body.code==='string'||typeof body.code==='number'?body.code:err.code??null,message:typeof err.message==='string'?err.message.slice(0,200):typeof body.message==='string'?String(body.message).slice(0,200):null,fields:fields.slice(0,12)});}catch{}
   throw failure;
  }
  const raw=await response.text();if(raw.length>1_000_000)throw new SasPayError();
  let value:unknown;try{value=JSON.parse(raw);}catch{throw new SasPayError();}
  if(object(value).success===false){const status=object(value).code;throw typeof status==='number'&&status>=400?httpFailure(status):new SasPayError();}return value;
 }catch(error){
  if(error instanceof SasPayError)throw error;
  throw new SasPayError(error instanceof Error&&['AbortError','TimeoutError'].includes(error.name)?'timeout':'network');
 } // Never expose upstream error bodies, headers or credentials.
}
export async function checkSasPayKey(apiKey:string){
 const value=await sasPayRequest(apiKey,'/checkout-sessions/');
 const outer=object(value),inner=outer.success===true?outer.data:value;
 if(!Array.isArray(inner)&&!Array.isArray(object(inner).results))throw new SasPayError();
}
export function providerId(value:unknown):string {
 return typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)?value:'';
}
export function xofAmount(value:unknown):number|null {
 const raw=typeof value==='number'?String(value):value;
 if(typeof raw!=='string'||!/^\d+(?:\.0{1,2})?$/.test(raw))return null;
 const n=Number(raw);return Number.isSafeInteger(n)&&n>=0?n:null;
}
// SasPay signs timestamp + "." + the exact raw UTF-8 request body.
export async function validSasPaySignature(raw:string,headers:Headers,secret:string,now=Date.now()){
 const stamp=headers.get('x-webhook-timestamp')||'',signature=headers.get('x-webhook-signature')||'';
 if(!/^\d{10}$/.test(stamp)||! /^[0-9a-f]{64}$/.test(signature)||Math.abs(now/1000-Number(stamp))>300)return false;
 const bytes=Uint8Array.from(signature.match(/../g)!,s=>parseInt(s,16));
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
 return crypto.subtle.verify('HMAC',key,bytes,new TextEncoder().encode(stamp+'.'+raw));
}
