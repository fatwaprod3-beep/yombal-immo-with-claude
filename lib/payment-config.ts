import {eq} from 'drizzle-orm';
import {getDb} from '../db';
import {paymentConfig} from '../db/schema';
import {adminConfig} from './admin-access';

const encoder=new TextEncoder();
async function encryptionKey(){
 const secret=adminConfig().secret;if(!secret)throw Error('Configuration serveur manquante.');
 const material=await crypto.subtle.importKey('raw',encoder.encode(secret),'HKDF',false,['deriveKey']);
 return crypto.subtle.deriveKey({name:'HKDF',hash:'SHA-256',salt:encoder.encode('yombal-payment-config-v1'),info:encoder.encode('saspay-credentials')},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
const encode=(bytes:Uint8Array)=>btoa(String.fromCharCode(...bytes));
const decode=(value:string)=>Uint8Array.from(atob(value),c=>c.charCodeAt(0));
export async function encryptPaymentSecret(value:string,purpose:'api-key'|'webhook'|'ai-key'){
 const iv=crypto.getRandomValues(new Uint8Array(12));
 const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:encoder.encode(purpose)},await encryptionKey(),encoder.encode(value));
 return 'v1.'+encode(iv)+'.'+encode(new Uint8Array(cipher));
}
export async function decryptPaymentSecret(value:string,purpose:'api-key'|'webhook'|'ai-key'){
 const [version,iv,cipher,...extra]=value.split('.');if(version!=='v1'||!iv||!cipher||extra.length)throw Error('Configuration chiffrée invalide.');
 const raw=await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(iv),additionalData:encoder.encode(purpose)},await encryptionKey(),decode(cipher));
 return new TextDecoder().decode(raw);
}
export async function readPaymentConfig(){return (await getDb().select().from(paymentConfig).where(eq(paymentConfig.provider,'saspay')).limit(1))[0]||null;}
export async function paymentCredentials(){
 const row=await readPaymentConfig();if(!row)return null;
 return {apiKey:await decryptPaymentSecret(row.apiKey,'api-key'),mode:row.mode,webhookSecret:await decryptPaymentSecret(row.webhookSecret,'webhook')};
}
export function newWebhookSecret(){return 'whsec_'+Array.from(crypto.getRandomValues(new Uint8Array(32)),n=>n.toString(16).padStart(2,'0')).join('');}
