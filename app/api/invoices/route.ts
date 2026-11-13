import {usesProStyle,freeStyled} from '../../../lib/billing';
import {serverDocument} from '../../../lib/server-document';
import {and,eq,desc,inArray,sql} from 'drizzle-orm';
import {z} from 'zod';
import {getCurrentUser} from '../../auth';
import {getDb} from '../../../db';
import {invoiceLinks} from '../../../db/schema';
import {getWorkspace} from '../../../lib/spaces';
import {subscriptionFor} from '../../../lib/subscription-server';
import {freeInvoiceLimit} from '../../../lib/install-bonus';
import {invoiceSnapshot,invoiceHtml,withInvoiceMessage} from '../../../lib/invoices';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
function liveData(state:import('../../../lib/model').State,r:typeof invoiceLinks.$inferSelect){try{return withInvoiceMessage(invoiceSnapshot(state,r.leaseId,r.period,r.id,r.createdAt),JSON.parse(r.data));}catch{return {...JSON.parse(r.data),status:'Annulée'};}}
function summaryData(d:ReturnType<typeof invoiceSnapshot>){return {...d,issuer:{...d.issuer,signature:''}};}
async function usedExports(userId:string){const rows=await getDb().select({used:sql<number>`count(*)`}).from(invoiceLinks).where(and(eq(invoiceLinks.userId,userId),inArray(invoiceLinks.publication,['free','legacy'])));return Number(rows[0]?.used||0);}
export async function GET(request:Request){const user=await getCurrentUser();if(!user)return json({error:'Connexion nécessaire.'},401);try{const {spaceId,row}=await getWorkspace(user,new URL(request.url).searchParams.get('space')||undefined);const rows=await getDb().select().from(invoiceLinks).where(and(eq(invoiceLinks.userId,user.userId),eq(invoiceLinks.spaceId,spaceId))).orderBy(desc(invoiceLinks.createdAt)).limit(500);const state=JSON.parse(row.data);return json({invoices:rows.map(r=>({id:r.id,leaseId:r.leaseId,period:r.period,token:r.publication==='draft'?'':r.token,released:r.publication!=='draft',data:summaryData(liveData(state,r))})),usage:{exportsUsed:await usedExports(user.userId),limit:await freeInvoiceLimit(user.userId)}});}catch{return json({error:'Chargement impossible.'},503);}}
export async function POST(request:Request){
 const user=await getCurrentUser();if(!user)return json({error:'Connexion nécessaire.'},401);if(user.status==='restricted')return json({error:'Votre compte est en cours de vérification : la création de documents est temporairement bloquée.'},403);if(request.headers.get('origin')&&request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Origine non autorisée.'},403);
 try{
  const body=z.object({spaceId:z.string().max(100),leaseId:z.string().max(100),period:z.string().regex(/^20\d{2}-(0[1-9]|1[0-2])$/),message:z.string().trim().max(6000).optional(),intent:z.enum(['save','export']).default('save'),freeStyle:z.boolean().optional()}).strict().parse(await request.json());
  const {row,spaceId}=await getWorkspace(user,body.spaceId),state=JSON.parse(row.data);const db=getDb();const key=and(eq(invoiceLinks.userId,user.userId),eq(invoiceLinks.spaceId,spaceId),eq(invoiceLinks.leaseId,body.leaseId),eq(invoiceLinks.period,body.period));
  const old=(await db.select().from(invoiceLinks).where(key).limit(1))[0],id=old?.id||crypto.randomUUID(),createdAt=old?.createdAt||new Date().toISOString();const message=body.message!==undefined?body.message:old?JSON.parse(old.data).reminderMessage:undefined;
  const snapshot=withInvoiceMessage(invoiceSnapshot(state,body.leaseId,body.period,id,createdAt),{reminderMessage:message});
  if(old)await db.update(invoiceLinks).set({data:JSON.stringify(summaryData(snapshot))}).where(and(eq(invoiceLinks.id,id),eq(invoiceLinks.userId,user.userId)));else await db.insert(invoiceLinks).values({id,userId:user.userId,spaceId,leaseId:body.leaseId,period:body.period,token:crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-',''),data:JSON.stringify(summaryData(snapshot)),createdAt,publication:'draft'}).onConflictDoNothing();
  let canonical=(await db.select().from(invoiceLinks).where(key).limit(1))[0];if(!canonical)throw Error('Le document n’a pas pu être enregistré.');
  const subscription=await subscriptionFor(user.userId);
  // Modèle Pro ou signature choisis sans abonnement : on montre le vrai document (flouté côté écran) et on propose Pro ou la version gratuite.
  if(body.intent==='export'&&!subscription.isPro&&!body.freeStyle&&usesProStyle(state.profile))return json({error:'Ce document utilise un modèle ou une signature Pro.',code:'PRO_REQUIRED',feature:'invoiceTemplates'},402);
  if(body.intent==='export'&&canonical.publication==='draft'){
   // One atomic statement reserves a free export, including simultaneous requests.
   const withinLimit=subscription.isPro?sql`1=1`:sql`(SELECT count(*) FROM yombal_invoice_links WHERE user_id=${user.userId} AND publication IN ('free','legacy'))<${await freeInvoiceLimit(user.userId)}`;
   await db.update(invoiceLinks).set({publication:subscription.isPro?'pro':'free'}).where(and(eq(invoiceLinks.id,canonical.id),eq(invoiceLinks.userId,user.userId),eq(invoiceLinks.publication,'draft'),withinLimit)).returning({id:invoiceLinks.id});
   canonical=(await db.select().from(invoiceLinks).where(key).limit(1))[0];
   if(canonical.publication==='draft')return json({error:'Vos 3 factures gratuites sont utilisées. Le brouillon est enregistré ; passez à Pro pour l’envoyer ou le télécharger.',code:'PRO_REQUIRED',feature:'invoices'},402);
  }
  const full=withInvoiceMessage(invoiceSnapshot(state,body.leaseId,body.period,canonical.id,canonical.createdAt),{reminderMessage:message}),data=subscription.isPro?full:freeStyled(full),released=canonical.publication!=='draft';
  return json({invoice:{id:canonical.id,leaseId:body.leaseId,period:body.period,token:released?canonical.token:'',released,data:summaryData(full)},...(body.intent==='export'&&released?{html:await serverDocument(invoiceHtml(data),user.userId)}:{}),usage:{exportsUsed:await usedExports(user.userId),limit:await freeInvoiceLimit(user.userId)}});
 }catch(e){return json({error:e instanceof Error&&!/D1|SQL|database/i.test(e.message)?e.message:'Création impossible.'},400);}
}
