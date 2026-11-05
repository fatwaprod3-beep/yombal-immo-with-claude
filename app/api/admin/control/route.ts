import {eq} from 'drizzle-orm';
import {z} from 'zod';
import {getDb} from '../../../../db';
import {users,subscriptions} from '../../../../db/schema';
import {requireAdmin,adminJson} from '../../../../lib/admin-guard';
import {setSetting,getSetting} from '../../../../lib/app-settings';
import {logSecurity} from '../../../../lib/security';
import {encryptPaymentSecret} from '../../../../lib/payment-config';
import {createSessionToken,sessionCookieHeader} from '../../../auth';
import {aiProviders,type AiProvider} from '../../../../lib/assistant';
export const dynamic='force-dynamic';
const input=z.discriminatedUnion('action',[
 z.object({action:z.literal('flag'),flag:z.enum(['registrations','maintenance','assistant']),value:z.boolean()}),
 z.object({action:z.literal('logout_all')}),
 z.object({action:z.enum(['suspend','activate','logout_user','revoke_pro']),userId:z.string().uuid()}),
 z.object({action:z.literal('grant_pro'),userId:z.string().uuid(),months:z.number().int().min(1).max(36)}),
 z.object({action:z.literal('ai_config'),provider:z.enum(['groq','xai','openai','gemini']),model:z.string().trim().max(80),apiKey:z.string().trim().max(300).optional()}),
]);
function addMonths(from:Date,months:number){const d=new Date(from);const day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+months);const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(day,last));return d;}
export async function POST(request:Request){
 const {user,denied}=await requireAdmin(request,true);if(denied||!user)return denied!;
 try{
  const body=await request.text();if(body.length>2000)return adminJson({error:'Requête invalide.'},400);
  const parsed=input.safeParse(JSON.parse(body));if(!parsed.success)return adminJson({error:'Action invalide.'},400);
  const a=parsed.data;const db=getDb();const now=new Date();
  const audit=(detail:string)=>logSecurity('admin_action',{email:user.email,userId:user.userId,request,detail});
  if(a.action==='flag'){
   const value=a.flag==='registrations'?(a.value?'open':'closed'):a.flag==='maintenance'?(a.value?'on':'off'):(a.value?'on':'off');
   await setSetting(a.flag,value);await audit(`Réglage ${a.flag} → ${value}`);return adminJson({ok:true,message:'Réglage enregistré.'});
  }
  if(a.action==='logout_all'){
   await setSetting('sessions_after',String(Date.now()));await audit('Déconnexion de tous les comptes');
   // La session de l'administrateur est renouvelée pour qu'il reste connecté.
   return adminJson({ok:true,message:'Tous les comptes ont été déconnectés.'},200,{'Set-Cookie':sessionCookieHeader(await createSessionToken(user.userId,Date.now()+1000))});
  }
  if(a.action==='ai_config'){
   const current=await getSetting('assistant_config');let key='';if(current){try{key=(JSON.parse(current) as {key?:string}).key||'';}catch{}}
   if(a.apiKey)key=await encryptPaymentSecret(a.apiKey,'ai-key');
   const provider=a.provider as AiProvider;const model=a.model||aiProviders[provider].model;
   await setSetting('assistant_config',JSON.stringify({provider,model,key}));await audit(`Assistant IA configuré (${provider} · ${model})`);
   return adminJson({ok:true,message:a.apiKey?'Clé enregistrée et chiffrée. L’assistant est prêt.':'Réglages de l’assistant enregistrés.'});
  }
  const target=(await db.select().from(users).where(eq(users.id,a.userId)).limit(1))[0];if(!target)return adminJson({error:'Compte introuvable.'},404);
  if(target.id===user.userId&&(a.action==='suspend'||a.action==='logout_user'))return adminJson({error:'Vous ne pouvez pas suspendre ou déconnecter votre propre compte.'},400);
  if(a.action==='suspend'){await db.update(users).set({status:'suspended',sessionsAfter:Date.now()}).where(eq(users.id,target.id));await audit(`Compte suspendu : ${target.email}`);return adminJson({ok:true,message:'Compte suspendu et déconnecté.'});}
  if(a.action==='activate'){await db.update(users).set({status:'active'}).where(eq(users.id,target.id));await audit(`Compte réactivé : ${target.email}`);return adminJson({ok:true,message:'Compte réactivé.'});}
  if(a.action==='logout_user'){await db.update(users).set({sessionsAfter:Date.now()}).where(eq(users.id,target.id));await audit(`Sessions fermées : ${target.email}`);return adminJson({ok:true,message:'Toutes les sessions de ce compte sont fermées.'});}
  if(a.action==='revoke_pro'){await db.update(subscriptions).set({status:'expired',expiresAt:now.toISOString(),updatedAt:now.toISOString()}).where(eq(subscriptions.userId,target.id));await audit(`Pro retiré : ${target.email}`);return adminJson({ok:true,message:'Accès Pro retiré.'});}
  // grant_pro : s'ajoute à la date de fin actuelle si l'abonnement est encore actif.
  const sub=(await db.select().from(subscriptions).where(eq(subscriptions.userId,target.id)).limit(1))[0];
  const base=sub&&sub.status==='active'&&sub.expiresAt&&new Date(sub.expiresAt)>now?new Date(sub.expiresAt):now;
  const expiresAt=addMonths(base,a.months).toISOString();const planId=a.months>=12?'annual':a.months>=3?'quarterly':'monthly';
  await db.insert(subscriptions).values({userId:target.id,planId,status:'active',expiresAt,updatedAt:now.toISOString()}).onConflictDoUpdate({target:subscriptions.userId,set:{planId,status:'active',expiresAt,updatedAt:now.toISOString()}});
  await audit(`Pro offert ${a.months} mois : ${target.email}`);return adminJson({ok:true,message:`Pro activé jusqu’au ${new Date(expiresAt).toLocaleDateString('fr-FR')}.`});
 }catch(e){console.error('admin_control_failed',e instanceof Error?e.message:'unknown');return adminJson({error:'Action impossible. Réessayez.'},503);}
}
