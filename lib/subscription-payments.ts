import {and,desc,eq,lt,sql} from 'drizzle-orm';
import {getDb} from '../db';
import {billingCheckouts,billingPayments,subscriptionRequests,subscriptions} from '../db/schema';
import {plans,type PlanId} from './billing';
import {paymentCredentials} from './payment-config';
import {object,providerId,sasPayRequest,trustedCheckoutUrl,unwrap,xofAmount} from './saspay';

type Checkout=typeof billingCheckouts.$inferSelect;
type Credentials=NonNullable<Awaited<ReturnType<typeof paymentCredentials>>>;
type Customer={userId:string;email:string;fullName:string|null};
export type PaymentCheck={state:'idle'|'pending'|'active'|'test_paid';checked:number};
const planFor=(id:string)=>{const plan=plans.find(p=>p.id===id);if(!plan)throw Error('Offre inconnue.');return plan;};
export const checkoutDescription=(id:string,planId:PlanId)=>'Yombal '+planFor(planId).name+' [YOMBAL:'+id+']';

export function addCalendarMonths(iso:string,months:number){
 const date=new Date(iso);if(!Number.isFinite(date.valueOf())||!Number.isInteger(months)||months<1)throw Error('Durée invalide.');
 const day=date.getUTCDate();date.setUTCDate(1);date.setUTCMonth(date.getUTCMonth()+months);
 const last=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).getUTCDate();date.setUTCDate(Math.min(day,last));return date.toISOString();
}

// The next expiry is computed inside the same transaction as the
// unique payment ledger. Concurrent renewals never overwrite one another.
async function applyVerifiedPayment(row:Checkout,paymentId:string,at=Date.now()){
 const plan=planFor(row.planId);if(row.mode!=='live'||row.currency!=='XOF'||row.amount!==plan.price)throw Error('Règlement incohérent.');
 const db=getDb(),now=new Date(at).toISOString();
 const guard=and(eq(billingPayments.providerPaymentId,paymentId),eq(billingPayments.checkoutId,row.id),eq(billingPayments.userId,row.userId),eq(billingPayments.applied,0))!;
 // Transaction PostgreSQL : verrou par compte pour que deux renouvellements simultanés se cumulent.
 await db.transaction(async tx=>{
  await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${'yombal-billing:'+row.userId}))`);
  await tx.insert(billingPayments).values({providerPaymentId:paymentId,checkoutId:row.id,userId:row.userId,planId:plan.id,amount:plan.price,currency:'XOF',createdAt:now,applied:0}).onConflictDoNothing();
  const pending=(await tx.select().from(billingPayments).where(guard).for('update').limit(1))[0];
  if(!pending)return;
  const current=(await tx.select().from(subscriptions).where(eq(subscriptions.userId,row.userId)).limit(1))[0];
  const base=current&&current.status==='active'&&current.expiresAt&&Date.parse(current.expiresAt)>Date.parse(now)?current.expiresAt:now;
  const expiresAt=addCalendarMonths(base,plan.months);
  await tx.insert(subscriptions).values({userId:row.userId,planId:plan.id,status:'active',expiresAt,updatedAt:now}).onConflictDoUpdate({target:subscriptions.userId,set:{planId:plan.id,status:'active',expiresAt,updatedAt:now}});
  await tx.update(billingCheckouts).set({status:'paid',activeSlot:null,providerPaymentId:paymentId,updatedAt:now}).where(eq(billingCheckouts.id,row.id));
  await tx.update(subscriptionRequests).set({status:'paid'}).where(eq(subscriptionRequests.id,row.id));
  await tx.update(billingPayments).set({applied:1}).where(guard);
 });
 const ledger=(await db.select().from(billingPayments).where(eq(billingPayments.providerPaymentId,paymentId)).limit(1))[0];
 if(!ledger||ledger.checkoutId!==row.id||ledger.userId!==row.userId||ledger.applied!==1)throw Error('Règlement déjà associé ou incomplet.');
}

export async function createSasPayCheckout(user:Customer,planId:PlanId,origin:string,credentials:Credentials){
 const db=getDb(),plan=planFor(planId),now=Date.now(),stamp=new Date(now).toISOString(),slot=user.userId+':'+plan.id;
 const previous=(await db.select().from(billingCheckouts).where(eq(billingCheckouts.activeSlot,slot)).limit(1))[0];
 if(previous){
  if(previous.mode===credentials.mode&&previous.status==='pending'&&Date.parse(previous.expiresAt)>now&&trustedCheckoutUrl(previous.checkoutUrl))return previous;
  if(previous.status==='creating'&&now-Date.parse(previous.createdAt)<120_000)throw Error('Votre paiement est en cours de préparation. Réessayez dans un instant.');
  await db.update(billingCheckouts).set({activeSlot:null,updatedAt:stamp}).where(and(eq(billingCheckouts.id,previous.id),eq(billingCheckouts.activeSlot,slot)));
 }
 const id=crypto.randomUUID(),expiresAt=new Date(now+24*60*60*1000).toISOString();
 const inserted=await db.insert(billingCheckouts).values({id,userId:user.userId,planId:plan.id,amount:plan.price,currency:'XOF',mode:credentials.mode,status:'creating',activeSlot:slot,createdAt:stamp,updatedAt:stamp,expiresAt}).onConflictDoNothing().returning({id:billingCheckouts.id});
 if(!inserted.length)throw Error('Un paiement est déjà en cours de préparation. Réessayez dans un instant.');
 try{
  const session=unwrap(await sasPayRequest(credentials.apiKey,'/checkout-sessions/',{
   amount:plan.price+'.00',currency:'XOF',customer_email:user.email,customer_name:user.fullName||user.email.split('@')[0],
   description:checkoutDescription(id,plan.id),return_url:origin+'/?paiement=retour&commande='+id,
   metadata:{yombal_checkout_id:id,yombal_plan:plan.id},expires_at:expiresAt,
  }));
  const sessionId=providerId(session.id);
  if(!sessionId||!trustedCheckoutUrl(session.checkout_url)||xofAmount(session.amount)!==plan.price||session.currency!=='XOF')throw Error('Session de paiement incohérente.');
  await db.transaction(async tx=>{
   await tx.update(billingCheckouts).set({providerSessionId:sessionId,checkoutUrl:String(session.checkout_url),status:'pending',updatedAt:stamp}).where(eq(billingCheckouts.id,id));
   await tx.insert(subscriptionRequests).values({id,userId:user.userId,planId:plan.id,amount:plan.price,status:'pending',createdAt:stamp});
  });
  return {...inserted[0],checkoutUrl:String(session.checkout_url)};
 }catch{
  await db.update(billingCheckouts).set({status:'failed',activeSlot:null,updatedAt:new Date().toISOString()}).where(eq(billingCheckouts.id,id));
  throw Error('Le paiement SasPay n’a pas pu être préparé. Réessayez ; aucun accès n’a été modifié.');
 }
}

export async function verifyCheckout(row:Checkout,credentials:Credentials):Promise<PaymentCheck['state']>{
 if(row.status==='paid')return 'active';if(row.status==='test_paid')return 'test_paid';
 if(!row.providerSessionId||row.mode!==credentials.mode)return 'pending';
 const plan=planFor(row.planId),sessionId=providerId(row.providerSessionId);if(!sessionId)throw Error('Session invalide.');
 const status=unwrap(await sasPayRequest(credentials.apiKey,'/checkout-sessions/'+sessionId+'/status/'));
 if(status.id!==sessionId)throw Error('La session ne correspond pas.');
 if(status.status!=='PAID'||status.transaction_status!=='SUCCESS')return 'pending';
 const paymentId=providerId(status.transaction_id);if(!paymentId)throw Error('Transaction absente.');
 if(row.providerPaymentId&&row.providerPaymentId!==paymentId)throw Error('Transaction différente.');
 const [detailRaw,paymentRaw]=await Promise.all([
  sasPayRequest(credentials.apiKey,'/checkout-sessions/'+sessionId+'/'),
  sasPayRequest(credentials.apiKey,'/payments/'+paymentId+'/verify/'),
 ]);
 const detail=unwrap(detailRaw);
 const metadata=object(detail.metadata),detailTransaction=providerId(detail.transaction)||providerId(object(detail.transaction).id),merchant=providerId(detail.merchant);
 if(detail.id!==sessionId||detail.status!=='PAID'||detailTransaction!==paymentId||!merchant||xofAmount(detail.amount)!==row.amount||detail.currency!==row.currency||metadata.yombal_checkout_id!==row.id||metadata.yombal_plan!==row.planId||row.amount!==plan.price||row.currency!=='XOF')throw Error('Le règlement ne correspond pas à cette offre.');
 const payment=unwrap(paymentRaw);
 if(payment.id!==paymentId||payment.merchant!==merchant||payment.status!=='SUCCESS'||payment.transaction_type!=='PAIEMENT'||payment.flow_direction!=='INBOUND'||xofAmount(payment.requested_amount)!==plan.price||payment.currency!=='XOF')throw Error('Règlement non confirmé.');
 if(row.mode!=='live'){
  await getDb().transaction(async tx=>{
   await tx.update(billingCheckouts).set({status:'test_paid',activeSlot:null,providerPaymentId:paymentId,updatedAt:new Date().toISOString()}).where(eq(billingCheckouts.id,row.id));
   await tx.update(subscriptionRequests).set({status:'test_paid'}).where(eq(subscriptionRequests.id,row.id));
  });return 'test_paid';
 }
 await applyVerifiedPayment(row,paymentId);return 'active';
}

export async function reconcilePayments(userId:string,checkoutId?:string):Promise<PaymentCheck>{
 const credentials=await paymentCredentials();if(!credentials)return {state:'idle',checked:0};
 const db=getDb();let rows:Checkout[];
 if(checkoutId){
  if(!providerId(checkoutId))throw Error('Référence invalide.');
  rows=await db.select().from(billingCheckouts).where(and(eq(billingCheckouts.userId,userId),eq(billingCheckouts.id,checkoutId))).limit(1);
  if(!rows.length)throw Error('Ce paiement est introuvable dans votre compte.');
 }else rows=await db.select().from(billingCheckouts).where(and(eq(billingCheckouts.userId,userId),eq(billingCheckouts.status,'pending'))).orderBy(desc(billingCheckouts.createdAt)).limit(6);
 const results=await Promise.allSettled(rows.map(async row=>{
  if(row.status==='paid'||row.status==='test_paid')return {state:row.status==='paid'?'active' as const:'test_paid' as const,checked:0};
  const claim=await db.update(billingCheckouts).set({lastCheckedAt:Date.now()}).where(and(eq(billingCheckouts.id,row.id),lt(billingCheckouts.lastCheckedAt,Date.now()-15_000))).returning({id:billingCheckouts.id});
  if(!claim.length)return {state:'pending' as const,checked:0};
  return {state:await verifyCheckout(row,credentials),checked:1};
 }));
 let state:PaymentCheck['state']=rows.length?'pending':'idle',checked=0,failures=0;
 for(const result of results){if(result.status==='rejected'){failures++;continue;}checked+=result.value.checked;if(result.value.state==='active')state='active';else if(result.value.state==='test_paid'&&state!=='active')state='test_paid';}
 if(failures&&failures===results.length)throw Error('Vérification temporairement indisponible.');
 return {state,checked};
}

// A webhook contains a transaction, not an authenticated Yombal user. Its
// description is only a lookup hint: the bound checkout is re-read from SasPay
// and fully verified before any entitlement is granted.
export async function reconcileWebhook(paymentId:string,credentials:Credentials){
 const db=getDb();let row=(await db.select().from(billingCheckouts).where(eq(billingCheckouts.providerPaymentId,paymentId)).limit(1))[0];
 if(!row){
  const payment=unwrap(await sasPayRequest(credentials.apiKey,'/payments/'+paymentId+'/verify/'));
  if(payment.id!==paymentId||payment.status!=='SUCCESS')throw Error('Confirmation en attente.');
  const match=typeof payment.description==='string'?payment.description.match(/\[YOMBAL:([0-9a-f-]{36})\]/i):null;
  if(!match)return 'unmatched';
  row=(await db.select().from(billingCheckouts).where(eq(billingCheckouts.id,match[1])).limit(1))[0];
  if(!row)throw Error('Session en attente de rapprochement.');
 }
 if(row.providerPaymentId&&row.providerPaymentId!==paymentId)throw Error('Transaction différente.');
 if(row.status==='paid'||row.status==='test_paid')return 'duplicate';
 // Verify that this event's payment, and not a different payment, belongs here.
 const status=unwrap(await sasPayRequest(credentials.apiKey,'/checkout-sessions/'+row.providerSessionId+'/status/'));
 if(status.transaction_id!==paymentId)throw Error('Transaction non associée.');
 const state=await verifyCheckout(row,credentials);if(state==='pending')throw Error('Confirmation en attente.');return state;
}
