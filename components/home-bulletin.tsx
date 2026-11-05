'use client';
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
export function bulletinFor(state:State,notifications:Alert[],metrics:{expected:number;collected:number}):Bulletin{
 const late=notifications.filter(n=>n.kind==='danger'&&n.leaseId);
 if(late.length)return {tone:'danger',title:late.length+' loyer'+(late.length>1?'s':'')+' en retard',detail:'Ouvrez le suivi pour préparer une relance polie et suivre les paiements.',cta:'Relancer',page:'loyers'};
 const urgent=notifications.filter(n=>n.kind==='danger');
 if(urgent.length)return {tone:'danger',title:urgent.length+' point'+(urgent.length>1?'s':'')+' urgent'+(urgent.length>1?'s':''),detail:urgent[0].title+' · '+urgent[0].detail,cta:'Voir',page:urgent[0].page};
 const watch=notifications.filter(n=>n.kind==='warning');
 if(watch.length)return {tone:'warning',title:watch.length+' alerte'+(watch.length>1?'s':'')+' à surveiller',detail:watch[0].title+' · '+watch[0].detail,cta:'Voir',page:watch[0].page};
 const soon=notifications.filter(n=>n.leaseId&&n.kind==='info');
 if(soon.length)return {tone:'warning',title:soon.length+' échéance'+(soon.length>1?'s':'')+' de loyer à venir',detail:'Pensez à prévenir vos locataires avant la date de paiement.',cta:'Voir le suivi',page:'loyers'};
 if(metrics.expected>0&&metrics.collected>=metrics.expected)return {tone:'success',title:'Bravo, tous les loyers du mois sont encaissés',detail:money(metrics.collected)+' reçus. Votre suivi est parfaitement à jour.',cta:'Voir le bilan',page:'rapports',progress:100};
 if(metrics.expected>0&&metrics.collected>0){const p=Math.min(99,Math.round(metrics.collected/metrics.expected*100));return {tone:'success',title:'Bonne nouvelle : '+p+' % des loyers déjà encaissés',detail:money(metrics.collected)+' reçus sur '+money(metrics.expected)+' attendus, sans aucun retard.',cta:'Voir le suivi',page:'loyers',progress:p};}
 const day=Math.floor(Date.parse(today()+'T12:00:00Z')/86400000);return {tone:'tip',...tips[day%tips.length]};
}
const icons={danger:CircleAlert,warning:TriangleAlert,success:PartyPopper,tip:Lightbulb};
export default function HomeBulletin({state,notifications,metrics,go}:{state:State;notifications:Alert[];metrics:{expected:number;collected:number};go:(page:string)=>void}){
 const b=bulletinFor(state,notifications,metrics);const Icon=icons[b.tone];
 return <button type="button" className={'overview-late home-bulletin tone-'+b.tone} onClick={()=>go(b.page)}>
  <Icon size={18}/><span><strong>{b.title}</strong><small>{b.detail}</small></span><ArrowRight size={17}/>
 </button>;
}
