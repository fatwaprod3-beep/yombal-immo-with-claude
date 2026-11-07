// Modèles de contrat Yombal : trois baux prêts à l’emploi, rédigés article par article.
// Les champs entre doubles accolades ({{loyer}}, {{locataire}}…) sont remplis automatiquement depuis la location.
import type {ContractData} from './contracts';

export type ContractKind='habitation'|'meuble'|'commercial';
export const contractKinds:{id:ContractKind;label:string;title:string;usage:string;detail:string}[]=[
 {id:'habitation',label:'Bail d’habitation',title:'Contrat de bail à usage d’habitation',usage:'Habitation principale',detail:'Appartement, maison ou chambre non meublée, loué à l’année.'},
 {id:'meuble',label:'Location meublée',title:'Contrat de location meublée',usage:'Habitation meublée',detail:'Logement équipé, courte ou moyenne durée, avec inventaire du mobilier.'},
 {id:'commercial',label:'Bail commercial / professionnel',title:'Contrat de bail à usage professionnel',usage:'Activité commerciale',detail:'Boutique, bureau, magasin ou atelier (Acte uniforme OHADA).'},
];
export const contractTokens:[string,string][]=[['bailleur','Nom du bailleur'],['locataire','Nom du locataire'],['logement','Logement'],['adresse','Adresse'],['usage','Usage / activité'],['loyer','Loyer (chiffres et lettres)'],['charges','Charges'],['total','Total mensuel'],['depot','Dépôt de garantie'],['jour','Jour de paiement'],['debut','Date de début'],['fin','Date de fin'],['duree','Durée'],['ville','Ville']];

const habitation=`## Objet du contrat
Le bailleur donne en location au locataire, qui accepte, le logement désigné aux conditions particulières : {{logement}}, situé {{adresse}}. Le logement est loué à usage exclusif d’habitation principale du locataire et des personnes vivant habituellement avec lui. Aucune activité commerciale ou professionnelle ne peut y être exercée sans l’accord écrit du bailleur.

## Durée du bail
Le présent bail est consenti pour {{duree}}. À défaut de congé donné dans les conditions prévues au présent contrat, il se renouvelle par tacite reconduction pour des périodes successives d’un (1) an.

## Loyer et charges
Le loyer mensuel est fixé à {{loyer}}. S’y ajoutent des charges de {{charges}}, soit un total mensuel de {{total}}.
Le loyer et les charges sont payables d’avance, au plus tard le {{jour}} de chaque mois, en espèces contre reçu, par virement ou par paiement mobile (Wave, Orange Money). Chaque paiement donne lieu à la remise d’une quittance.

## Dépôt de garantie
À la signature, le locataire verse un dépôt de garantie de {{depot}}, non productif d’intérêts. Conformément à la réglementation en vigueur, le dépôt de garantie et l’avance de loyer réunis ne peuvent excéder deux (2) mois de loyer.
Le dépôt est restitué dans un délai maximum de deux (2) mois après la remise des clés, déduction faite des sommes restant dues et du coût justifié des réparations locatives. Il ne peut pas servir au paiement du dernier mois de loyer.

## État des lieux
Un état des lieux contradictoire est établi et signé par les deux parties lors de la remise des clés, puis lors de leur restitution. À défaut d’état des lieux d’entrée, le logement est présumé avoir été remis en bon état d’usage.

## Obligations du bailleur
Le bailleur s’engage à :
- délivrer un logement décent, en bon état d’usage et de réparation ;
- assurer au locataire la jouissance paisible des lieux pendant toute la durée du bail ;
- prendre en charge les grosses réparations (toiture, murs porteurs, gros œuvre, canalisations encastrées) ;
- remettre une quittance pour chaque paiement reçu.

## Obligations du locataire
Le locataire s’engage à :
- payer le loyer et les charges aux échéances convenues ;
- user paisiblement des lieux suivant leur destination et respecter la tranquillité du voisinage ;
- entretenir le logement et assurer les menues réparations et réparations locatives ;
- répondre des dégradations et pertes survenues pendant la location ;
- ne pas transformer les lieux sans l’accord écrit du bailleur ;
- ne pas céder le bail ni sous-louer, même partiellement, sans l’accord écrit du bailleur ;
- permettre l’accès au logement pour les travaux nécessaires et, sur rendez-vous, pour les visites.

## Eau, électricité et abonnements
Les consommations d’eau et d’électricité (Senelec, compteur Woyofal ou abonnement) ainsi que les abonnements souscrits par le locataire sont à sa charge, sauf s’ils sont expressément inclus dans les charges convenues.

## Révision du loyer
Le loyer peut être révisé d’un commun accord entre les parties, dans le respect de la réglementation en vigueur sur les loyers. Toute révision fait l’objet d’un avenant écrit et signé.

## Congé
Le locataire peut mettre fin au bail à tout moment en respectant un préavis d’un (1) mois. Le bailleur peut donner congé pour la fin du bail en respectant un préavis de trois (3) mois, pour un motif légitime et sérieux. Le congé est donné par écrit, remis contre décharge ou signifié par exploit d’huissier.

## Clause résolutoire
À défaut de paiement d’un terme de loyer ou de charges à son échéance, ou en cas d’inexécution de l’une des obligations du présent bail, et un (1) mois après une mise en demeure restée sans effet, le bail pourra être résilié, sous réserve de l’appréciation de la juridiction compétente.

## Enregistrement, domicile et litiges
Le présent bail est soumis à la formalité de l’enregistrement ; les frais sont supportés par le locataire, sauf accord contraire. Pour l’exécution des présentes, le bailleur élit domicile à l’adresse indiquée en tête du contrat et le locataire dans les lieux loués. Tout litige relève des juridictions compétentes du lieu de situation du logement.`;

const meuble=`## Objet du contrat
Le bailleur donne en location au locataire, qui accepte, le logement meublé désigné aux conditions particulières : {{logement}}, situé {{adresse}}. Le logement est loué à usage d’habitation, avec le mobilier et les équipements décrits dans l’inventaire annexé au présent contrat.

## Durée
La location est consentie pour {{duree}}. Elle ne se renouvelle pas automatiquement : toute prolongation fait l’objet d’un accord écrit entre les parties.

## Loyer et charges
Le loyer mensuel est fixé à {{loyer}}. S’y ajoutent des charges de {{charges}}, soit un total mensuel de {{total}}, payable d’avance au plus tard le {{jour}} de chaque mois.
Sauf précision contraire, les charges couvrent l’entretien des parties communes et les prestations convenues entre les parties (eau, électricité, internet, gardiennage). Toute consommation excessive peut être refacturée sur justificatif.

## Dépôt de garantie
À la signature, le locataire verse un dépôt de garantie de {{depot}}. Le dépôt de garantie et l’avance de loyer réunis ne peuvent excéder deux (2) mois de loyer. Le dépôt est restitué dans un délai d’un (1) mois après le départ, déduction faite des objets manquants ou détériorés, des réparations et des sommes restant dues.

## Inventaire et état des lieux
Un inventaire détaillé du mobilier, de la vaisselle, du linge et des équipements, ainsi qu’un état des lieux, sont établis et signés à l’entrée. Ils sont vérifiés contradictoirement au départ. Tout objet manquant, cassé ou détérioré par le locataire est remplacé ou remboursé à sa valeur de remplacement.

## Occupation et usage des lieux
Le logement est occupé par le locataire et les personnes déclarées au bailleur. Le locataire s’engage à respecter la tranquillité du voisinage et le règlement de la résidence, à ne pas sous-louer ni prêter le logement, et à ne pas y introduire d’animaux sans accord du bailleur.

## Entretien
Le locataire maintient le logement et les équipements en bon état de propreté et de fonctionnement. Il signale sans délai au bailleur tout dysfonctionnement ou sinistre. Le bailleur prend en charge les réparations dues à l’usure normale ou à la vétusté.

## Départ anticipé et remise des clés
Le locataire peut quitter le logement avant la fin prévue en respectant un préavis de quinze (15) jours, donné par écrit. Les clés et badges sont restitués au bailleur le jour du départ, après la vérification de l’inventaire.

## Résiliation
À défaut de paiement du loyer à son échéance, ou en cas de manquement grave aux obligations du présent contrat, et huit (8) jours après une mise en demeure restée sans effet, la location pourra être résiliée, sous réserve de l’appréciation de la juridiction compétente.

## Domicile et litiges
Pour l’exécution des présentes, le bailleur élit domicile à l’adresse indiquée en tête du contrat et le locataire dans les lieux loués. Tout litige relève des juridictions compétentes du lieu de situation du logement.`;

const commercial=`## Objet et destination des lieux
Le bailleur donne à bail au preneur, qui accepte, le local désigné aux conditions particulières : {{logement}}, situé {{adresse}}. Le local est exclusivement destiné à l’activité suivante : {{usage}}. Toute modification ou extension de l’activité nécessite l’accord écrit du bailleur.

## Régime juridique
Le présent bail est un bail à usage professionnel régi par les dispositions de l’Acte uniforme OHADA portant sur le droit commercial général et par les clauses du présent contrat.

## Durée et renouvellement
Le bail est consenti pour {{duree}}. Le preneur qui a exploité son activité dans les lieux conformément au bail bénéficie d’un droit au renouvellement dans les conditions, formes et délais prévus par l’Acte uniforme.

## Loyer
Le loyer mensuel est fixé à {{loyer}}, hors taxes s’il y a lieu. S’y ajoutent des charges de {{charges}}, soit un total mensuel de {{total}}, payable d’avance au plus tard le {{jour}} de chaque mois, par virement, chèque, espèces contre reçu ou paiement mobile.

## Révision du loyer
Le loyer peut être révisé d’un commun accord à l’expiration de chaque période triennale. À défaut d’accord écrit, la révision est fixée dans les conditions prévues par l’Acte uniforme.

## Dépôt de garantie
À la signature, le preneur verse un dépôt de garantie de {{depot}}, non productif d’intérêts, restitué en fin de bail après la remise des clés, déduction faite des sommes restant dues et du coût des réparations à la charge du preneur.

## Charges, impôts et taxes
Le preneur supporte les consommations (eau, électricité, téléphone, internet), les taxes et contributions liées à son activité, ainsi que les charges convenues. L’impôt foncier reste à la charge du bailleur, sauf accord contraire.

## Entretien et réparations
Le preneur entretient les lieux en bon état et assure les réparations locatives. Le bailleur prend en charge les grosses réparations, notamment celles touchant au gros œuvre, à la toiture et aux murs porteurs.

## Travaux et aménagements
Le preneur ne peut réaliser de travaux modifiant la structure ou la distribution des lieux sans l’accord écrit du bailleur. Les aménagements réalisés restent acquis au bailleur en fin de bail sans indemnité, sauf accord contraire ou remise en état demandée par le bailleur.

## Cession et sous-location
La sous-location, totale ou partielle, est interdite sans l’accord écrit du bailleur. La cession du bail n’est possible que dans les conditions prévues par l’Acte uniforme, notamment avec le fonds de commerce, et doit être portée à la connaissance du bailleur.

## Assurance
Le preneur assure les lieux loués, son matériel et sa responsabilité civile contre l’incendie, les dégâts des eaux et les risques liés à son activité. Il justifie de cette assurance à première demande du bailleur.

## Congé et résiliation
Pour un bail à durée indéterminée, chaque partie peut y mettre fin en respectant un préavis d’au moins six (6) mois. En cas de non-paiement du loyer ou d’inexécution d’une clause du bail, le bailleur peut demander la résiliation à la juridiction compétente après une mise en demeure d’un (1) mois restée sans effet, dans les formes prévues par l’Acte uniforme.

## Domicile et litiges
Pour l’exécution des présentes, le bailleur élit domicile à l’adresse indiquée en tête du contrat et le preneur dans les lieux loués. Tout litige relève de la juridiction compétente du lieu de situation du local.`;

export const defaultClauses:Record<ContractKind,string>={habitation,meuble,commercial};
export const contractAnnexes:Record<ContractKind,string[]>={
 habitation:['État des lieux d’entrée','Copie des pièces d’identité des parties','Reçu du dépôt de garantie'],
 meuble:['Inventaire du mobilier et des équipements','État des lieux d’entrée','Copie des pièces d’identité des parties'],
 commercial:['État des lieux d’entrée','Copie des pièces d’identité / registre de commerce (RCCM) du preneur','Attestation d’assurance du preneur'],
};

export type Article={title:string;body:string};
export function parseArticles(text:string):Article[]{
 if(!/^##\s/m.test(text))return text.trim()?[{title:'Conditions convenues',body:text.trim()}]:[];
 return text.split(/^##\s+/m).map(s=>s.trim()).filter(Boolean).map(block=>{const [first,...rest]=block.split('\n');return {title:first.trim(),body:rest.join('\n').trim()};});
}
export function serializeArticles(list:Article[]){return list.filter(a=>a.title.trim()||a.body.trim()).map(a=>'## '+(a.title.trim()||'Article')+'\n'+a.body.trim()).join('\n\n');}

// Montants en lettres (francs CFA), comme dans un vrai contrat.
const units=['zéro','un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix','onze','douze','treize','quatorze','quinze','seize'];
const tens=['','','vingt','trente','quarante','cinquante','soixante'];
function below100(n:number):string{
 if(n<17)return units[n];if(n<20)return 'dix-'+units[n-10];
 if(n<70){const t=Math.floor(n/10),u=n%10;return tens[t]+(u===0?'':u===1?' et un':'-'+units[u]);}
 if(n<80)return 'soixante'+(n===71?' et onze':'-'+below100(n-60));
 if(n===80)return 'quatre-vingts';return 'quatre-vingt-'+below100(n-80);
}
function below1000(n:number):string{const h=Math.floor(n/100),r=n%100;let s='';if(h)s=(h===1?'cent':units[h]+' cent'+(r===0?'s':''));if(r)s+=(s?' ':'')+below100(r);return s||'zéro';}
export function numberToWords(value:number):string{
 const n=Math.round(Math.abs(value));if(n===0)return 'zéro';
 const parts:[number,string,string][]=[[1e9,'milliard','milliards'],[1e6,'million','millions'],[1e3,'mille','mille']];
 let rest=n,out:string[]=[];
 for(const [size,one,many] of parts){const q=Math.floor(rest/size);rest%=size;if(!q)continue;if(size===1e3)out.push(q===1?'mille':below1000(q).replace(/(cent|vingt)s$/,'$1')+' mille');else out.push(below1000(q)+' '+(q>1?many:one));}
 if(rest)out.push(below1000(rest));return out.join(' ');
}
const fmt=(n:number)=>new Intl.NumberFormat('fr-FR').format(Math.round(n)).replace(/ | /g,' ');
export const amountText=(n:number)=>`${fmt(n)} F CFA (${numberToWords(n)} francs CFA)`;
const longDate=(v:string)=>{if(!v)return '____________';const d=new Date(v+'T12:00:00');if(isNaN(+d))return v;const s=d.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});return d.getDate()===1?s.replace(/^1 /,'1er '):s;};
function monthsBetween(a:string,b:string){const s=new Date(a+'T12:00:00'),e=new Date(b+'T12:00:00');if(isNaN(+s)||isNaN(+e)||e<=s)return 0;return Math.max(1,Math.round((+e-+s)/(1000*60*60*24*30.44)));}
export function durationText(kind:ContractKind,start:string,end:string){
 const m=end?monthsBetween(start,end):0;
 if(m){const label=m%12===0?(m/12===1?'un (1) an':numberToWords(m/12)+' ('+m/12+') ans'):numberToWords(m)+' ('+m+') mois';return `une durée ${/^[aeiouyhéè]/i.test(label)?'d’':'de '}${label}, du ${longDate(start)} au ${longDate(end)}`;}
 return kind==='commercial'?`une durée indéterminée à compter du ${longDate(start)}`:kind==='meuble'?`la durée convenue entre les parties, à compter du ${longDate(start)}`:`une durée d’un (1) an à compter du ${longDate(start)}`;
}
export function fillContract(text:string,d:ContractData,kind:ContractKind,usage:string){
 const values:Record<string,string>={bailleur:d.owner,locataire:d.tenant,logement:d.property,adresse:d.address||'à l’adresse indiquée',usage,loyer:amountText(d.rent),charges:d.charges?amountText(d.charges):'0 F CFA (aucune charge)',total:amountText(d.rent+d.charges),depot:amountText(d.deposit),jour:String(d.dueDay||1),debut:longDate(d.start),fin:d.end?longDate(d.end):'durée indéterminée',duree:durationText(kind,d.start,d.end),ville:(d.issuerAddress.split(',').pop()||'').trim()||'Dakar'};
 return text.replace(/\{\{\s*([a-z_]+)\s*\}\}/g,(m,k:string)=>values[k]??m);
}
export const kindOf=(k?:string):ContractKind=>k==='meuble'||k==='commercial'?k:'habitation';
