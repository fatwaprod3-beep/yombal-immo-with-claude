import {getCurrentUser} from '../../../auth';
import {hasAdminAccess} from '../../../../lib/admin-access';
import {isDevelopmentAdmin} from '../../../../lib/development-admin';
import {getDb} from '../../../../db';
import {paymentConfig} from '../../../../db/schema';
import {decryptPaymentSecret,encryptPaymentSecret,newWebhookSecret,readPaymentConfig} from '../../../../lib/payment-config';
import {checkSasPayKey,SasPayError} from '../../../../lib/saspay';

const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','Pragma':'no-cache'}});
async function authorized(){const user=await getCurrentUser();return !!user&&await isDevelopmentAdmin(user.userId)&&await hasAdminAccess(user.userId);}
export async function GET(){
 if(!await authorized())return json({error:'Accès administrateur nécessaire.'},403);
 try{const row=await readPaymentConfig();return json({configured:!!row,mode:row?.mode||null,verifiedAt:row?.verifiedAt||null,lastWebhookAt:row?.lastWebhookAt||null});}
 catch{return json({error:'La configuration ne peut pas être lue.'},503);}
}
export async function POST(request:Request){
 if(!await authorized())return json({error:'Accès administrateur nécessaire.'},403);
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Origine non autorisée.'},403);
 let stage:'verification'|'configuration'='verification';
 try{
  const raw=await request.text();if(raw.length>4096)return json({error:'Demande trop longue.'},413);
  const body=JSON.parse(raw) as {action?:string;apiKey?:unknown};
  if(body.action==='webhook_secret'){
   const row=await readPaymentConfig();if(!row)return json({error:'Connectez d’abord votre clé SasPay.'},400);
   return json({webhookSecret:await decryptPaymentSecret(row.webhookSecret,'webhook')});
  }
  if(body.action!=='save')return json({error:'Action inconnue.'},400);
  const apiKey=typeof body.apiKey==='string'?body.apiKey.trim():'';
  if(!/^sk_(live|test)_[A-Za-z0-9_-]{12,500}$/.test(apiKey))return json({error:'Collez une clé API SasPay complète, commençant par sk_live_ ou sk_test_.'},400);
  await checkSasPayKey(apiKey); // Authenticated read; no payment is opened or charged.
  stage='configuration';
  const previous=await readPaymentConfig(),stamp=new Date().toISOString(),mode=apiKey.startsWith('sk_live_')?'live':'test';
  const apiCipher=await encryptPaymentSecret(apiKey,'api-key');
  const secretCipher=previous?.webhookSecret||await encryptPaymentSecret(newWebhookSecret(),'webhook');
  await getDb().insert(paymentConfig).values({provider:'saspay',apiKey:apiCipher,webhookSecret:secretCipher,mode,verifiedAt:stamp,updatedAt:stamp})
   .onConflictDoUpdate({target:paymentConfig.provider,set:{apiKey:apiCipher,mode,verifiedAt:stamp,updatedAt:stamp}});
  return json({configured:true,mode,verifiedAt:stamp,message:mode==='live'?'SasPay est connecté. Les paiements réels peuvent être préparés.':'Clé de test connectée. Les paiements de test ne débloquent pas les comptes réels.'});
 }catch(error){
  const provider=error instanceof SasPayError?error:null;
  // Stable diagnostic fields only: never log the submitted key or provider body.
  console.warn(JSON.stringify({event:'saspay_connection_failed',stage,code:provider?.code||'configuration',...(provider?.httpStatus?{upstreamStatus:provider.httpStatus}:{})}));
  return json({error:(provider?.message||'La connexion SasPay n’a pas pu être enregistrée dans Yombal. Réessayez dans un instant.')+' La configuration précédente est conservée.',code:provider?.code||'configuration'},503);
 }
}
