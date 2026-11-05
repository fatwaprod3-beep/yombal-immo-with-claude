import {getCurrentUser} from '../../auth';
import {findPlan} from '../../../lib/billing';
import {isDevelopmentAdmin} from '../../../lib/development-admin';
import {getDb} from '../../../db';
import {subscriptionRequests} from '../../../db/schema';
import {subscriptionFor} from '../../../lib/subscription-server';
import {paymentCredentials} from '../../../lib/payment-config';
import {createSasPayCheckout,reconcilePayments} from '../../../lib/subscription-payments';

const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(request?:Request){
 const user=await getCurrentUser();if(!user)return json({error:'Connexion nécessaire.'},401);
 try{
  const checkoutId=request?new URL(request.url).searchParams.get('commande')||undefined:undefined;
  const payment=await reconcilePayments(user.userId,checkoutId);
  return json({subscription:await subscriptionFor(user.userId),payment});
 }catch{return json({error:'La vérification du paiement n’a pas abouti. Réessayez dans un instant.'},503);}
}
export async function POST(request:Request){
 const user=await getCurrentUser();if(!user)return json({error:'Connectez-vous pour choisir votre abonnement.'},401);
 if(request.headers.get('origin')&&request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Origine non autorisée.'},403);
 try{
  const raw=await request.text();if(raw.length>1024)return json({error:'Demande trop longue.'},413);
  const body=JSON.parse(raw) as {planId?:string;action?:string};if(body.action)return json({error:'Cette action est indisponible.'},403);
  const plan=findPlan(body.planId);if(!plan)return json({error:'Choisissez une durée valide.'},400);
  if(plan.id==='test'&&!await isDevelopmentAdmin(user.userId))return json({error:'Offre réservée au propriétaire.'},403);
  const credentials=await paymentCredentials();
  if(plan.id==='test'&&!credentials)return json({error:'Connectez d’abord la clé SasPay pour tester un paiement.'},400);
  if(!credentials){
   // Clé API pas encore connectée : on enregistre la demande et on envoie vers le lien SasPay de l’offre.
   // L’accès Pro est alors activé par le propriétaire après vérification du paiement.
   const id=crypto.randomUUID();
   await getDb().insert(subscriptionRequests).values({id,userId:user.userId,planId:plan.id,amount:plan.price,status:'link_pending',createdAt:new Date().toISOString()});
   return json({subscription:await subscriptionFor(user.userId),reference:id,checkoutUrl:plan.checkoutUrl,amount:plan.price,currency:plan.currency,mode:'link',message:'Après le paiement, votre accès Pro sera activé par l’équipe Yombal.'});
  }
  const checkout=await createSasPayCheckout(user,plan.id,new URL(request.url).origin,credentials);
  return json({subscription:await subscriptionFor(user.userId),reference:checkout.id,checkoutUrl:checkout.checkoutUrl,amount:checkout.amount,currency:plan.currency,mode:credentials.mode,message:'Votre accès sera activé après confirmation du paiement par SasPay.'});
 }catch{return json({error:'Le paiement n’a pas pu être préparé. Réessayez dans un instant.'},503);}
}
