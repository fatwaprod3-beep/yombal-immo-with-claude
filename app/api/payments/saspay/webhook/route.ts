import {eq} from 'drizzle-orm';
import {getDb} from '../../../../../db';
import {paymentConfig} from '../../../../../db/schema';
import {paymentCredentials} from '../../../../../lib/payment-config';
import {object,providerId,validSasPaySignature} from '../../../../../lib/saspay';
import {reconcileWebhook} from '../../../../../lib/subscription-payments';

const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request){
 // The provider is authenticated by its HMAC signature, never by a user session.
 try{
  if(Number(request.headers.get('content-length')||0)>65536)return json({error:'Requête trop longue.'},413);
  const raw=await request.text();if(new TextEncoder().encode(raw).length>65536)return json({error:'Requête trop longue.'},413);
  const credentials=await paymentCredentials();if(!credentials)return json({error:'Configuration manquante.'},503);
  if(!await validSasPaySignature(raw,request.headers,credentials.webhookSecret))return json({error:'Signature invalide.'},401);
  const envelope=object(JSON.parse(raw)),event=envelope.event;
  if(typeof event!=='string'||event!==request.headers.get('x-webhook-event'))return json({error:'Événement invalide.'},400);
  await getDb().update(paymentConfig).set({lastWebhookAt:new Date().toISOString()}).where(eq(paymentConfig.provider,'saspay'));
  if(event!=='transaction.success')return json({received:true,ignored:true});
  const data=object(envelope.data),id=providerId(data.id);
  if(!id||data.status!=='SUCCESS'||data.type!=='PAIEMENT')return json({error:'Transaction invalide.'},400);
  const result=await reconcileWebhook(id,credentials);return json({received:true,result});
 }catch{return json({error:'Confirmation temporairement indisponible. Réessayez.'},503);}
}
