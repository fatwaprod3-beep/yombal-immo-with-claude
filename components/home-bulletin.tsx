'use client';
import {useEffect,useState} from 'react';
import {CircleAlert,TriangleAlert,PartyPopper,Lightbulb,ArrowRight} from 'lucide-react';
import {type State,type Alert,money,today} from '../lib/model';

// Bandeau d’accueil, toujours présent. Code couleur Yombal :
// rouge = impayé / en retard · orange = alerte à surveiller · vert = bonne nouvelle · prune = conseil.
type Tone='danger'|'warning'|'success'|'tip';
type Bulletin={tone:Tone;title:string;detail:string;cta:string;page:string;progress?:number};
const tips:{title:string;detail:string;cta:string;page:string}[]=[
 {title:'Conseil du jour : relancez avant l’échéance',detail:'Un rappel envoyé 3 jours avant la date de paiement réduit fortement les retards.',cta:'Voir le suivi',page:'loyers'},
 {title:'Conseil du jour : gardez vos baux à portée de main',detail:'Ajoutez le contrat et l’état des lieux dans les documents de chaque location.',cta:'Mes documents',page:'documents'},
 {title:'Conseil du jour : notez chaque dépense',detail:'Réparations, factures, entretien : votre bilan mensuel devient exact en un coup d’œil.',cta:'Ajouter une dépense',page:'depenses'},
 {title:'Conseil du jour : planifiez l’entretien',detail:'Une petite intervention prévue évite souvent une grosse réparation urgente.',cta:'Voir l’entretien',page:'entretien'},
 {title:'Conseil du jour : vos logements libres comptent',detail:'Un logement vide coûte chaque mois. Mettez à jour ses photos et son loyer pour le relouer vite.',cta:'Mes biens',page:'biens'},
 {title:'Conseil du jour : envoyez des reçus',detail:'Un reçu après chaque paiement rassure vos locataires et vos propriétaires.',cta:'Voir les loyers',page:'loyers'},
 {title:'Conseil du jour : utilisez le calendrier',detail:'Visites, remises de clés, fins de bail : tout au même endroit, avec rappels.',cta:'Ouvrir le calendrier',page:'agenda'},
];
// Tous les messages utiles, du plus important au conseil du jour.
export function bulletinsFor(state:State,notifications:Alert[],metrics:{expected:number;collected:number}):Bulletin[]{
 const out:Bulletin[]=[];
 const late=notifications.filter(n=>n.kind==='danger'&&n.leaseId);
 if(late.length)out.push({tone:'danger',title:late.length+' loyer'+(late.length>1?'s':'')+' en retard',detail:'Ouvrez le suivi pour préparer une relance polie et suivre les paiements.',cta:'Relancer',page:'loyers'});
 const urgent=notifications.filter(n=>n.kind==='danger'&&!n.leaseId);
 if(urgent.length)out.push({tone:'danger',title:urgent.length+' point'+(urgent.length>1?'s':'')+' urgent'+(urgent.length>1?'s':''),detail:urgent[0].title+' · '+urgent[0].detail,cta:'Voir',page:urgent[0].page});
 const watch=notifications.filter(n=>n.kind==='warning');
 if(watch.length)out.push({tone:'warning',title:watch.length+' alerte'+(watch.length>1?'s':'')+' à surveiller',detail:watch[0].title+' · '+watch[0].detail,cta:'Voir',page:watch[0].page});
 const soon=notifications.filter(n=>n.leaseId&&n.kind==='info');
 if(soon.length)out.push({tone:'warning',title:soon.length+' échéance'+(soon.length>1?'s':'')+' de loyer à venir',detail:'Pensez à prévenir vos locataires avant la date de paiement.',cta:'Voir le suivi',page:'loyers'});
 if(metrics.expected>0&&metrics.collected>=metrics.expected)out.push({tone:'success',title:'Bravo, tous les loyers du mois sont encaissés',detail:money(metrics.collected)+' reçus. Votre suivi est parfaitement à jour.',cta:'Voir le bilan',page:'rapports',progress:100});
 else if(metrics.expected>0&&metrics.collected>0){const p=Math.min(99,Math.round(metrics.collected/metrics.expected*100));out.push({tone:'success',title:'Bonne nouvelle : '+p+' % des loyers déjà encaissés',detail:money(metrics.collected)+' reçus sur '+money(metrics.expected)+' attendus.',cta:'Voir le suivi',page:'loyers',progress:p});}
 // Nouveaux comptes : conseils de configuration avant les conseils de gestion.
 const p=state.profile;
 if(!p.company||!p.phone)out.push({tone:'tip',title:'Premier pas : complétez votre profil',detail:'Nom, téléphone et ville apparaissent sur vos factures et reçus. Deux minutes dans Paramètres.',cta:'Ouvrir les paramètres',page:'parametres'});
 if(!p.image)out.push({tone:'tip',title:'Conseil : ajoutez votre logo',detail:'Vos documents deviennent professionnels et vos locataires vous reconnaissent tout de suite.',cta:'Ajouter mon logo',page:'parametres'});
 if(!state.properties.length)out.push({tone:'tip',title:'Commencez par votre premier bien',detail:'Appartement, villa, chambre ou immeuble entier : ajoutez-le, puis son locataire et son loyer.',cta:'Mes biens',page:'biens'});
 if(state.properties.length&&!state.leases.length)out.push({tone:'tip',title:'Étape suivante : ajoutez un locataire',detail:'Avec son loyer et son jour de paiement, les échéances de chaque mois se préparent seules.',cta:'Locataires',page:'locataires'});
 if(!p.paymentInstructions)out.push({tone:'tip',title:'Conseil : indiquez comment vous payer',detail:'Votre numéro Wave ou Orange Money s’affichera sur chaque facture. Paramètres → Factures.',cta:'Régler mes factures',page:'parametres'});
 const day=Math.floor(Date.parse(today()+'T12:00:00Z')/86400000);
 out.push({tone:'tip',...tips[day%tips.length]},{tone:'tip',...tips[(day+1)%tips.length]});
 return out;
}
export function bulletinFor(state:State,notifications:Alert[],metrics:{expected:number;collected:number}):Bulletin{return bulletinsFor(state,notifications,metrics)[0];}
const icons={danger:CircleAlert,warning:TriangleAlert,success:PartyPopper,tip:Lightbulb};
// Un message à la fois : toutes les 15 s, il sort en glissant et le suivant entre.
export default function HomeBulletin({state,notifications,metrics,go}:{state:State;notifications:Alert[];metrics:{expected:number;collected:number};go:(page:string)=>void}){
 const list=bulletinsFor(state,notifications,metrics);const key=list.map(b=>b.title).join('|');
 const [index,setIndex]=useState(0),[leaving,setLeaving]=useState(false);
 useEffect(()=>{setIndex(0);setLeaving(false);},[key]);
 useEffect(()=>{if(list.length<2)return;let swap:ReturnType<typeof setTimeout>|undefined;
  const timer=setInterval(()=>{setLeaving(true);swap=setTimeout(()=>{setIndex(i=>(i+1)%list.length);setLeaving(false);},450);},15000);
  return()=>{clearInterval(timer);clearTimeout(swap);};},[key,list.length]);
 const b=list[Math.min(index,list.length-1)];const Icon=icons[b.tone];
 return <div className={'home-bulletin-wrap tone-'+b.tone}>
  <button type="button" key={b.title} className={'overview-late home-bulletin tone-'+b.tone+(leaving?' is-leaving':' is-entering')} onClick={()=>go(b.page)}>
   <span className="bulletin-icon"><Icon size={18}/></span><span><strong>{b.title}</strong><small>{b.detail}</small></span>{list.length>1&&<span className="bulletin-dots" aria-hidden="true">{list.map((x,i)=><i key={i} className={i===index?'on':''}/>)}</span>}<ArrowRight size={17}/>
  </button>
 </div>;
}
