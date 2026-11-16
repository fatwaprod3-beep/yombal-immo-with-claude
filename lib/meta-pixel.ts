'use client';
// Pixel Meta (Facebook / Instagram) : mesure des inscriptions et abonnements venus des publicités.
// Aucun nom, e-mail ou téléphone n’est transmis : seulement le type d’événement et, pour un achat, le montant.
type Fbq=(...args:unknown[])=>void;
export const metaPixelId=process.env.NEXT_PUBLIC_META_PIXEL_ID||'';
export function track(event:'Lead'|'CompleteRegistration'|'InitiateCheckout'|'Purchase'|'Subscribe'|'ViewContent'|'Contact',params?:Record<string,string|number>,eventID?:string){
 try{const f=(window as unknown as {fbq?:Fbq}).fbq;if(f){if(eventID)f('track',event,params||{},{eventID});else f('track',event,params||{});}}catch{}
}
export function markSignup(){try{sessionStorage.setItem('yombal-new-signup','1');}catch{}}

/** Achat Pro confirmé : envoyé une seule fois par paiement (même référence = Meta ne compte qu'un achat). */
export function trackPurchase(p:{id:string;amount:number;planId:string}){
 const key='yombal-purchase-tracked:'+p.id;
 try{if(localStorage.getItem(key))return;localStorage.setItem(key,'1');}catch{}
 track('Purchase',{value:p.amount,currency:'XOF',content_name:p.planId,content_type:'product'},'purchase-'+p.id);
}
