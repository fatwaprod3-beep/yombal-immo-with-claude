import {plans,findPlan} from './billing';
import {object,sasPayRequest,unwrap,xofAmount} from './saspay';
import {getSetting} from './app-settings';

// Les prix des offres sont fixés dans SasPay, sur les liens de paiement du propriétaire.
// Yombal lit ces liens (par leur slug) et utilise leur montant pour afficher le prix
// et créer la session de paiement de chaque client. Le prix inscrit dans le code
// ne sert que de secours si SasPay est injoignable.
type Prices=Record<string,number>;
let cache:{at:number;prices:Prices}|null=null;
const slugOf=(url:string)=>{try{return new URL(url).pathname.replace(/\//g,'');}catch{return '';}};

export function defaultPrices():Prices{return Object.fromEntries(plans.map(p=>[p.id,p.price]));}

export async function sasPayLinkPrices(apiKey:string|null):Promise<{prices:Prices;source:'saspay'|'default'}>{
 if(!apiKey)return {prices:defaultPrices(),source:'default'};
 if(cache&&Date.now()-cache.at<60_000)return {prices:cache.prices,source:'saspay'};
 try{
  const wanted=new Map(plans.map(p=>[slugOf(p.checkoutUrl),p.id]));const prices=defaultPrices();let found=0;
  for(let page=1;page<=5&&found<wanted.size;page++){
   const data=unwrap(await sasPayRequest(apiKey,'/payment-links/',undefined,{page:String(page),page_size:'100'}));
   const results=Array.isArray(data.results)?data.results:[];
   for(const item of results){const link=object(item);const planId=wanted.get(String(link.slug||''));const amount=xofAmount(link.amount);
    if(planId&&amount&&amount>=100&&link.currency==='XOF'&&link.is_active!==false&&(link.amount_type??'FIXED')==='FIXED'){prices[planId]=amount;found++;}}
   if(!data.next)break;
  }
  if(!found)return {prices:defaultPrices(),source:'default'};
  cache={at:Date.now(),prices};return {prices,source:'saspay'};
 }catch(error){console.warn(JSON.stringify({event:'saspay_prices_failed',message:error instanceof Error?error.message.slice(0,120):'unknown'}));return {prices:cache?.prices||defaultPrices(),source:'default'};}
}

export async function priceFor(planId:string,apiKey:string|null){
 const plan=findPlan(planId);if(!plan)throw Error('Offre inconnue.');
 if(plan.id==='test')return plan.price;
 return (await sasPayPrices(apiKey)).prices[plan.id]??plan.price;
}

// Prix fixés depuis l’administration : ils passent avant ceux des liens SasPay.
export async function adminPrices():Promise<Prices>{
 try{const raw=await getSetting('plan_prices');if(!raw)return {};const data=JSON.parse(raw) as Record<string,unknown>;
  return Object.fromEntries(plans.map(p=>[p.id,Number(data[p.id])]).filter(([,v])=>Number.isInteger(v)&&(v as number)>=100&&(v as number)<=10_000_000)) as Prices;}catch{return {};}
}
export async function sasPayPrices(apiKey:string|null):Promise<{prices:Prices;source:'saspay'|'default'|'admin'}>{
 const [base,custom]=await Promise.all([sasPayLinkPrices(apiKey),adminPrices()]);
 if(!Object.keys(custom).length)return base;
 return {prices:{...base.prices,...custom},source:'admin'};
}
