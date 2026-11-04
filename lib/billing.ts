export const plans=[
 {id:'monthly',name:'Pro mensuel',price:4900,currency:'XOF',checkoutUrl:'https://link.saspay.me/rq9ukd8p6j4',months:1,period:'1 mois',detail:'Pour avancer à votre rythme.'},
 {id:'quarterly',name:'Pro trimestriel',price:9900,currency:'XOF',checkoutUrl:'https://link.saspay.me/b5mk93gecf0',months:3,period:'3 mois',detail:'4 800 F économisés sur 3 mois.'},
 {id:'annual',name:'Pro annuel',price:25000,currency:'XOF',checkoutUrl:'https://link.saspay.me/jeultha48me',months:12,period:'12 mois',detail:'33 800 F économisés sur un an.'},
] as const;
export type PlanId=typeof plans[number]['id'];
// Liens de paiement SasPay créés par le propriétaire (utilisés tant que la clé API n’est pas connectée).
export function isSasPayPaymentLink(value:unknown):value is string {
 if(typeof value!=='string'||value.length>300)return false;
 try{const url=new URL(value);return url.protocol==='https:'&&url.hostname==='link.saspay.me'&&!url.port&&!url.username&&!url.password&&/^\/[A-Za-z0-9]+\/?$/.test(url.pathname)&&!url.search&&!url.hash;}catch{return false;}
}
export function isSasPayCheckoutUrl(value:unknown):value is string {
 if(typeof value!=='string'||value.length>1000)return false;
 try{const url=new URL(value);return url.protocol==='https:'&&url.hostname==='pay.saspay.me'&&!url.port&&!url.username&&!url.password&&/^\/checkout\/[^/]+\/?$/.test(url.pathname)&&!url.search&&!url.hash;}catch{return false;}
}
export type ProFeature='discover'|'reports'|'contracts'|'bulk'|'spaces'|'owners'|'import'|'signature'|'invoiceTemplates'|'properties'|'tenants'|'invoices';
export const proFeatures:Record<ProFeature,{title:string;description:string}>={
 properties:{title:'Continuez à ajouter vos biens.',description:'Le gratuit comprend 6 biens ou logements par espace. Passez à Pro pour en gérer davantage.'},
 tenants:{title:'Accueillez vos prochains locataires.',description:'Le gratuit comprend 7 locataires par espace. Pro permet de continuer vos ajouts.'},
 invoices:{title:'Continuez à envoyer vos factures.',description:'Le gratuit comprend 3 factures ou reçus téléchargeables et partageables par compte. Vos brouillons restent disponibles ; Pro débloque les exports suivants.'},
 signature:{title:'Signez vos documents avec Yombal Pro.',description:'Dessinez ou importez la signature de votre agence pour la retrouver sur vos factures et reçus.'},
 invoiceTemplates:{title:'Des factures à l’image de votre agence.',description:'Choisissez parmi trois modèles supplémentaires et gardez les mêmes informations et le même suivi.'},
 discover:{title:'Votre gestion gagne en liberté.',description:'Gardez l’essentiel gratuitement. Passez à Pro pour les fonctions qui accompagnent le développement de votre activité.'},
 reports:{title:'Voyez plus loin avec vos analyses Pro.',description:'Comparez vos résultats, préparez vos rapports et exportez vos bilans pour piloter votre activité.'},
 contracts:{title:'Préparez vos contrats en quelques instants.',description:'Vos contrats préremplis et leurs copies signées restent associés au bon locataire et à son logement.'},
 bulk:{title:'Plusieurs mois, une seule préparation.',description:'Créez vos appels de loyer et reçus sur plusieurs mois sans refaire chaque document.'},
 spaces:{title:'Une agence, plusieurs activités.',description:'Ajoutez un deuxième espace pour vos biens personnels, une autre agence ou un inventaire séparé.'},
 owners:{title:'Des reversements propriétaires bien suivis.',description:'Enregistrez les versements effectués aux propriétaires et conservez leur historique de gestion.'},
 import:{title:'Retrouvez tous vos biens plus vite.',description:'Importez un fichier de biens en une fois. La saisie individuelle reste gratuite.'},
};
export type Subscription={isAdmin?:boolean;development?:boolean;isPro:boolean;status:'free'|'active'|'pending';planId:string|null;expiresAt:string|null;requestId?:string};
export const freeSubscription:Subscription={isPro:false,status:'free',planId:null,expiresAt:null};
export function activeSubscription(row:{status:string;expiresAt:string|null}|undefined,at=Date.now()){return !!row&&row.status==='active'&&!!row.expiresAt&&Date.parse(row.expiresAt)>at;}
export function requiredProFeature(m:{action?:string;data?:unknown},current?:{signature?:string;invoiceTemplate?:string}):ProFeature|null{
 if(m.action==='profile'||m.action==='restore'){const data=m.data as {signature?:string;invoiceTemplate?:string;profile?:{signature?:string;invoiceTemplate?:string}}|undefined;const p=m.action==='restore'?data?.profile:data;if(p?.signature&&p.signature!==current?.signature)return 'signature';if(p?.invoiceTemplate&&p.invoiceTemplate!=='classic'&&p.invoiceTemplate!==current?.invoiceTemplate)return 'invoiceTemplates';}
 if(m.action==='createContract'||m.action==='signContract')return 'contracts';
 if(m.action==='ownerTransfer'||m.action==='cancelOwnerTransfer')return 'owners';
 if(m.action==='import')return 'import';
 if(m.action==='prepareBills'){const d=m.data as {from?:string;to?:string}|undefined;if(d?.from&&d?.to&&d.from!==d.to)return 'bulk';}
 return null;
}
