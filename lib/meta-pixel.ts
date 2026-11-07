'use client';
// Pixel Meta (Facebook / Instagram) : mesure des inscriptions et abonnements venus des publicités.
// Aucun nom, e-mail ou téléphone n’est transmis : seulement le type d’événement et, pour un achat, le montant.
type Fbq=(...args:unknown[])=>void;
export const metaPixelId=process.env.NEXT_PUBLIC_META_PIXEL_ID||'';
export function track(event:'Lead'|'CompleteRegistration'|'InitiateCheckout'|'Purchase'|'Subscribe'|'ViewContent'|'Contact',params?:Record<string,string|number>){
 try{const f=(window as unknown as {fbq?:Fbq}).fbq;if(f)f('track',event,params||{});}catch{}
}
export function markSignup(){try{sessionStorage.setItem('yombal-new-signup','1');}catch{}}
