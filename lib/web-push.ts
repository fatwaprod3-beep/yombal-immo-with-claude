import {and,eq,lt,sql} from 'drizzle-orm';
import {getDb} from '../db';
import {appSettings,pushSubscriptions} from '../db/schema';
import {encryptPaymentSecret,decryptPaymentSecret} from './payment-config';
import {alerts,type State} from './model';
import {freeLimits} from './free-limits';

// Notifications Web Push sans dépendance externe.
// Les envois ne contiennent aucune donnée : le téléphone se réveille, puis demande à Yombal (connecté) le message à afficher.
const b64url=(bytes:Uint8Array)=>Buffer.from(bytes).toString('base64url');
type Vapid={publicKey:string;privateJwk:JsonWebKey};
let cached:Vapid|null=null;

/** Clés VAPID : créées une seule fois, chiffrées dans les réglages (jamais dans le dépôt). */
export async function vapidKeys():Promise<Vapid>{
 if(cached)return cached;
 const db=getDb();
 const read=async()=>{const row=(await db.select().from(appSettings).where(eq(appSettings.key,'vapid_keys')).limit(1))[0];return row?JSON.parse(await decryptPaymentSecret(row.value,'vapid')) as Vapid:null;};
 let keys=await read();
 if(!keys){
  const pair=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']) as CryptoKeyPair;
  const publicKey=b64url(new Uint8Array(await crypto.subtle.exportKey('raw',pair.publicKey)));
  const privateJwk=await crypto.subtle.exportKey('jwk',pair.privateKey);
  const value=await encryptPaymentSecret(JSON.stringify({publicKey,privateJwk}),'vapid');
  await db.insert(appSettings).values({key:'vapid_keys',value,updatedAt:new Date().toISOString()}).onConflictDoNothing();
  keys=await read();
 }
 if(!keys)throw Error('Clés de notification indisponibles.');
 cached=keys;return keys;
}

async function vapidHeader(endpoint:string){
 const {publicKey,privateJwk}=await vapidKeys();
 const key=await crypto.subtle.importKey('jwk',privateJwk,{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
 const enc=(o:object)=>b64url(new TextEncoder().encode(JSON.stringify(o)));
 const unsigned=enc({typ:'JWT',alg:'ES256'})+'.'+enc({aud:new URL(endpoint).origin,exp:Math.floor(Date.now()/1000)+12*3600,sub:'mailto:contact@yombal-immo.pro'});
 const signature=new Uint8Array(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key,new TextEncoder().encode(unsigned)));
 return `vapid t=${unsigned}.${b64url(signature)}, k=${publicKey}`;
}

/** Réveille un téléphone. Renvoie false si l'abonnement n'existe plus (il est alors supprimé). */
export async function sendPush(sub:{id:string;endpoint:string}):Promise<boolean>{
 const db=getDb();
 try{
  const r=await fetch(sub.endpoint,{method:'POST',headers:{Authorization:await vapidHeader(sub.endpoint),TTL:'43200',Urgency:'normal','Content-Length':'0'}});
  if(r.status===404||r.status===410){await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id,sub.id));return false;}
  if(!r.ok){await db.update(pushSubscriptions).set({failures:sql`${pushSubscriptions.failures}+1`}).where(eq(pushSubscriptions.id,sub.id));return false;}
  await db.update(pushSubscriptions).set({lastSentAt:new Date().toISOString(),failures:0}).where(eq(pushSubscriptions.id,sub.id));
  return true;
 }catch{await db.update(pushSubscriptions).set({failures:sql`${pushSubscriptions.failures}+1`}).where(eq(pushSubscriptions.id,sub.id));return false;}
}

export type PushMessage={title:string;body:string;url:string;tag:string};
const plural=(n:number,one:string,many:string)=>n+' '+(n>1?many:one);

/** Le message le plus utile pour cette personne aujourd'hui, ou null s'il n'y a rien d'utile à dire. */
export function pushMessageFor(state:State,{createdAt,lastSeenAt,isPro,documents}:{createdAt:string;lastSeenAt:string|null;isPro:boolean;documents:number},now=new Date()):PushMessage|null{
 const day=now.toISOString().slice(0,10),dom=now.getUTCDate();
 const sinceSignup=(now.getTime()-Date.parse(createdAt))/864e5;
 const away=lastSeenAt?(now.getTime()-Date.parse(lastSeenAt))/864e5:sinceSignup;
 const rentals=state.leases.filter(l=>l.status==='active').length;
 const rent=alerts(state,day).filter(a=>a.id.startsWith('rent-'));
 const late=rent.filter(a=>a.kind==='danger');
 // 1. Loyers en retard : le plus important.
 if(late.length)return {title:late.length>1?`⏰ ${plural(late.length,'loyer','loyers')} à relancer`:'⏰ Un loyer est en retard',body:late.length>1?`${late.slice(0,2).map(a=>a.detail.split(' · ')[0]).join(', ')}${late.length>2?'…':''} — voyez qui doit encore et envoyez un rappel en 1 geste.`:`${late[0].detail} — envoyez un rappel poli sur WhatsApp en 1 geste.`,url:'/#loyers',tag:'late-'+day.slice(0,7)};
 // 2. Début de mois : le moment d'encaisser.
 if(rentals&&dom<=6)return {title:'📅 C’est le mois des loyers',body:`Suivez ${plural(rentals,'locataire','locataires')} d’un coup d’œil : qui a payé, qui doit encore, et le reçu envoyé tout de suite.`,url:'/#loyers',tag:'month-'+day.slice(0,7)};
 // 3. Aucun logement : aider à démarrer.
 if(!state.properties.length&&sinceSignup>=0.8)return {title:'🏠 Votre premier logement en 1 minute',body:'Ajoutez-le maintenant : chaque mois, Yombal vous montre qui a payé et prépare les reçus.',url:'/',tag:'first-property'};
 // 4. Logement sans locataire.
 if(state.properties.length&&!state.tenants.length)return {title:'👤 Ajoutez votre locataire',body:'Encore une étape : avec le locataire, Yombal suit le loyer et prépare le reçu pour WhatsApp.',url:'/#locataires',tag:'first-tenant'};
 // 5. Paiement enregistré mais jamais de reçu envoyé.
 if(state.payments.length&&!documents&&sinceSignup<30)return {title:'🧾 Envoyez votre premier reçu',body:'Un reçu PDF propre, envoyé sur WhatsApp en un geste. Vos locataires vont apprécier.',url:'/#loyers',tag:'first-receipt'};
 // 6. Proche de la limite gratuite.
 if(!isPro&&state.properties.length>=freeLimits.properties-1)return {title:`⭐ ${state.properties.length} biens sur ${freeLimits.properties} en gratuit`,body:'Votre patrimoine grandit. Avec Pro, ajoutez autant de biens et de documents que vous voulez.',url:'/',tag:'near-limit'};
 // 7. Plus revenu depuis une semaine.
 if(away>=7)return {title:'👋 Vos loyers vous attendent',body:rentals?'Faites le point en 30 secondes : paiements reçus, retards, reçus à envoyer.':'Reprenez où vous en étiez : votre espace Yombal est prêt.',url:'/',tag:'comeback'};
 return null;
}

/** Message de bienvenue Pro : après le paiement, la personne est souvent restée sur la page de paiement. */
export const proWelcomeMessage:PushMessage={title:'👑 Bienvenue dans Yombal Pro !',body:'Votre paiement est confirmé, tout est débloqué. Touchez ici pour revenir dans Yombal.',url:'/?pro=1',tag:'pro-welcome'};
/** Réveille tous les téléphones abonnés d'une personne (sans contenu : le texte est demandé ensuite). */
export async function pushToUser(userId:string){
 try{const subs=await getDb().select({id:pushSubscriptions.id,endpoint:pushSubscriptions.endpoint}).from(pushSubscriptions).where(and(eq(pushSubscriptions.userId,userId),lt(pushSubscriptions.failures,5)));let ok=false;for(const s of subs)ok=(await sendPush(s))||ok;return ok;}
 catch{return false;}
}
