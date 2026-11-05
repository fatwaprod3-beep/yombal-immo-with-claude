import {Building2,FileText,Layers3,PenTool,BarChart3,HandCoins,type LucideIcon} from 'lucide-react';
// Avantages Pro communs à la fenêtre des offres, à l’espace abonné et au message de bienvenue.
export const proBenefits:{Icon:LucideIcon;title:string;text:string}[]=[
 {Icon:Building2,title:'Biens et locataires illimités',text:'Au-delà de 6 biens et 7 locataires, sans limite.'},
 {Icon:FileText,title:'Factures et reçus sans quota',text:'Envoyez et téléchargez tous vos documents.'},
 {Icon:Layers3,title:'Espaces et profils multiples',text:'Séparez vos activités ou vos agences.'},
 {Icon:PenTool,title:'Signature et modèles Pro',text:'Des documents à votre image, signés.'},
 {Icon:BarChart3,title:'Contrats, rapports et imports',text:'Pilotez votre activité en détail.'},
 {Icon:HandCoins,title:'Reversements propriétaires',text:'Suivez ce que vous devez à chaque propriétaire.'},
];
export function ProBenefitGrid({compact=false}:{compact?:boolean}){
 return <div className={'pro-benefit-grid'+(compact?' compact':'')}>{proBenefits.map(({Icon,title,text})=><div key={title} className="pro-benefit"><span><Icon size={18}/></span><div><strong>{title}</strong>{!compact&&<p>{text}</p>}</div></div>)}</div>;
}
