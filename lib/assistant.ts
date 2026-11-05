import {helpDocuments} from './help-documents';
import {plans} from './billing';
import {decryptPaymentSecret} from './payment-config';
import {getSetting} from './app-settings';
import {money} from './model';

// Assistant IA de Yombal. Fournisseur compatible OpenAI (Groq gratuit par défaut, xAI Grok, OpenAI ou Google Gemini).
export type AiProvider='groq'|'xai'|'openai'|'gemini';
export const aiProviders:Record<AiProvider,{label:string;base:string;model:string;keyUrl:string;free:boolean}>={
 groq:{label:'Groq (gratuit)',base:'https://api.groq.com/openai/v1',model:'llama-3.3-70b-versatile',keyUrl:'https://console.groq.com/keys',free:true},
 gemini:{label:'Google Gemini (gratuit)',base:'https://generativelanguage.googleapis.com/v1beta/openai',model:'gemini-2.0-flash',keyUrl:'https://aistudio.google.com/apikey',free:true},
 xai:{label:'xAI Grok',base:'https://api.x.ai/v1',model:'grok-3-mini',keyUrl:'https://console.x.ai',free:false},
 openai:{label:'OpenAI',base:'https://api.openai.com/v1',model:'gpt-4o-mini',keyUrl:'https://platform.openai.com/api-keys',free:false},
};
export async function assistantConfig(){
 const raw=await getSetting('assistant_config');if(!raw)return null;
 try{const c=JSON.parse(raw) as {provider:AiProvider;model:string;key:string};if(!c.key||!aiProviders[c.provider])return null;return {provider:c.provider,model:c.model||aiProviders[c.provider].model,apiKey:await decryptPaymentSecret(c.key,'ai-key')};}
 catch{return null;}
}

// Mots signalant une discussion à vérifier par l'administrateur (violence, détresse, fraude, piratage, insultes graves).
const dangerous:[RegExp,string][]=[
 [/\b(suicid|me tuer|en finir avec (ma|la) vie|me faire du mal)/i,'Détresse / risque pour la personne'],
 [/\b(tuer|assassin|égorger|frapper|menac(er|e)|arme|fusil|couteau|bombe|explos)/i,'Violence ou menace'],
 [/\b(pirat|hack|mot de passe d'un autre|voler (un )?compte|injection sql|ddos|phishing|hameçonn)/i,'Piratage ou fraude informatique'],
 [/\b(arnaqu|escroqu|blanchi|faux (reçu|papiers|document)|falsifi|fraude)/i,'Fraude ou faux documents'],
 [/\b(expuls(er|ion) (de force|sans)|couper l'eau|couper l'électricité|changer la serrure)/i,'Pratique locative illégale possible'],
 [/\b(connard|salope|pute|enculé|fils de)/i,'Insultes graves'],
];
export function moderate(text:string){for(const [re,reason] of dangerous)if(re.test(text))return reason;return null;}

function knowledge(){
 const sections=Object.values(helpDocuments).flatMap(doc=>[`## ${doc.title}`,...doc.sections.map(([t,c])=>`- ${t} : ${c}`)]).join('\n');
 return sections.slice(0,9000);
}
export function systemPrompt(user:{name:string;plan:string;prices:Record<string,number>}){
 const offers=plans.map(p=>`${p.name} : ${money(user.prices[p.id]??p.price)} pour ${p.period}`).join(' ; ');
 return `Tu es « Yombal Assistant », l'assistant officiel de Yombal.immo, une application de gestion immobilière pour propriétaires et agences au Sénégal et en Afrique de l'Ouest (monnaie : franc CFA, XOF, noté « F »).
Ton rôle : aider les clients à utiliser Yombal et à gérer leurs locations (loyers, locataires, baux, factures, reçus, dépenses, entretien, séjours courts, calendrier, analyses).

RÈGLES
- Réponds toujours en français simple, chaleureux et professionnel, en 2 à 8 phrases ou une courte liste d'étapes. Vouvoie toujours le client.
- Explique où cliquer dans Yombal (menu de gauche : Accueil, Mes biens, Locataires, Locations, Loyers & paiements, Factures, Calendrier, Analyse, Entretien & dépenses, Documents, Aide, Paramètres).
- N'invente jamais une fonction, un prix ou une règle. Si tu ne sais pas, dis-le et propose « Aide → Contacter le support » ou l'e-mail fatwaprod3@gmail.com.
- Tu n'as pas accès aux données du client ni à son compte : tu ne peux rien modifier, rien payer, rien supprimer.
- Ne donne jamais de conseil juridique définitif : pour un litige, une expulsion ou un contrat, recommande un professionnel (avocat, huissier, notaire). Refuse d'aider à une pratique illégale (expulsion de force, couper l'eau, faux documents, discrimination).
- Ne demande jamais de mot de passe, de code de paiement ni de numéro de carte. Signale toute demande suspecte.
- Si la personne exprime une détresse ou un danger, réponds avec bienveillance et conseille de contacter immédiatement les secours ou une personne de confiance.
- Reste sur Yombal et la gestion locative ; pour un autre sujet, réponds brièvement puis ramène poliment à Yombal.

CLIENT : ${user.name||'client'} · formule actuelle : ${user.plan}.
OFFRES PRO (prix actuels SasPay) : ${offers}. Paiement par Orange Money, Wave ou carte via SasPay, dans un nouvel onglet ; l'accès Pro s'active automatiquement après le paiement. Gratuit : 6 biens, 7 locataires, 3 exports de documents.

GUIDE RAPIDE
- Ajouter un bien : bouton « + Ajouter un bien » sur l'accueil ou menu Mes biens.
- Ajouter un locataire : menu Locataires → Ajouter. Puis créer une location (Locations → Créer une location) en reliant bien + locataire, loyer, charges, jour d'échéance et caution.
- Encaisser un loyer : Loyers & paiements → Encaisser (paiement partiel possible). Un reçu est préparé automatiquement.
- Relancer un locataire : Loyers & paiements → Suivi / relancer (message à partager par WhatsApp, SMS ou e-mail).
- Factures : menu Factures → Créer. Dépenses et réparations : Entretien & dépenses.
- Analyse : recouvrement, occupation, revenu net et performance par bien sur 12 mois.
- Abonnement : bouton Mon abonnement / Découvrir Yombal Pro en bas du menu.

DOCUMENTATION OFFICIELLE
${knowledge()}`;
}

export async function askModel(config:{provider:AiProvider;model:string;apiKey:string},messages:{role:'system'|'user'|'assistant';content:string}[]){
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),25000);
 try{
  const r=await fetch(aiProviders[config.provider].base+'/chat/completions',{method:'POST',signal:controller.signal,headers:{'Content-Type':'application/json',Authorization:'Bearer '+config.apiKey},body:JSON.stringify({model:config.model,messages,temperature:0.4,max_tokens:700})});
  const data=await r.json().catch(()=>({})) as {choices?:{message?:{content?:string}}[];error?:{message?:string}};
  if(!r.ok){console.error('assistant_provider_error',r.status,(data.error?.message||'').slice(0,200));throw Error(r.status===401?'Clé de l’assistant invalide.':r.status===429?'L’assistant est très sollicité. Réessayez dans une minute.':'L’assistant ne répond pas pour le moment.');}
  const text=data.choices?.[0]?.message?.content?.trim();if(!text)throw Error('Réponse vide de l’assistant.');return text.slice(0,4000);
 }finally{clearTimeout(timer);}
}
