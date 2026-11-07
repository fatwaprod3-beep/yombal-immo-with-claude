// Centre d’aide Yombal : guides détaillés, utilisés dans l’application, sur /aide et par l’assistant.
export type HelpTopic={id:string;title:string;intro:string;icon:'start'|'rent'|'invoice'|'home'|'pro'|'shield'|'calendar'|'settings';items:[string,string][]};
export const helpTopics:HelpTopic[]=[
 {id:'demarrer',icon:'start',title:'Bien démarrer',intro:'Votre espace prêt en cinq minutes.',items:[
  ['Par où commencer ?','1. Ouvrez Paramètres → Profil : nom de votre agence ou de votre patrimoine, téléphone, ville et logo. 2. Ajoutez votre premier bien (Mes biens → Ajouter un bien). 3. Ajoutez le locataire avec son loyer, ses charges et son jour de paiement. 4. Les échéances de chaque mois se préparent ensuite automatiquement.'],
  ['Essayer sans rien saisir','Le bouton « Voir la démo » ouvre un espace d’exemple rempli (biens, locataires, paiements). Vous pouvez tout explorer : rien n’est enregistré dans votre compte. « Revenir à mon espace » vous ramène à vos vraies données.'],
  ['Agence ou propriétaire ?','Au premier lancement, choisissez « Propriétaire » si vous gérez vos propres biens, ou « Agence » si vous gérez pour le compte d’autres propriétaires (commissions, reversements, relevés par propriétaire). Vous pouvez le modifier dans Paramètres.'],
  ['Installer Yombal sur mon téléphone','Sur Android (Chrome) : menu ⋮ → « Installer l’application ». Sur iPhone (Safari) : bouton Partager → « Sur l’écran d’accueil ». Yombal s’ouvre ensuite comme une application.'],
 ]},
 {id:'biens',icon:'home',title:'Biens & locataires',intro:'Immeubles, appartements, chambres, villas.',items:[
  ['Ajouter un immeuble avec plusieurs logements','Créez le bâtiment, puis « Diviser en logements » : RDC, R+1, appartement gauche/droite, chambre… Chaque logement a sa référence, son locataire et son propre bail. Un bâtiment déjà loué peut être divisé : le bail existant est rattaché au logement choisi.'],
  ['Ajouter un locataire','Locataires → Ajouter : nom, téléphone, e-mail (facultatif), logement, loyer, charges, caution, date d’entrée et jour de paiement. La photo et la pièce d’identité sont facultatives et restent privées.'],
  ['Photos et logo','Cliquez sur la zone d’image, choisissez une photo, puis recadrez-la : zoom avec le curseur, déplacement en faisant glisser. L’image est compressée et stockée de façon privée.'],
  ['Fin de bail ou départ','Ouvrez la location et indiquez la date de fin. L’historique des paiements est conservé ; le logement redevient « À louer ».'],
 ]},
 {id:'loyers',icon:'rent',title:'Loyers & paiements',intro:'Encaissements, paiements partiels et retards.',items:[
  ['Encaisser un loyer','Loyers & paiements → bouton « Encaisser » sur l’échéance. Indiquez le montant reçu, la date, le mode (espèces, Wave, Orange Money, virement…) et une référence si besoin.'],
  ['Paiement partiel','Saisissez simplement le montant réellement reçu. L’échéance passe en « Partiel » et le reste à payer est recalculé. Vous pouvez enregistrer plusieurs versements pour un même mois.'],
  ['Loyers en retard et relances','Une échéance non soldée après sa date passe en rouge « En retard ». « Suivi / relancer » prépare un message poli (WhatsApp ou e-mail) avec le montant et la date, que vous vérifiez et envoyez vous-même.'],
  ['Couleurs des statuts','Vert : payé. Orange ou corail : à venir, partiel ou à surveiller. Rouge : en retard. Prune : information ou conseil.'],
 ]},
 {id:'factures',icon:'invoice',title:'Factures, reçus & contrats',intro:'Des documents professionnels en PDF.',items:[
  ['Créer une facture ou un appel de loyer','Factures & contrats → Ajouter une facture : choisissez le locataire, la situation (à payer, déjà payée, plusieurs mois impayés), vérifiez le récapitulatif puis enregistrez. « Envoyer / télécharger » génère le PDF.'],
  ['Contrats de location','Factures & contrats → Contrats → Créer un contrat. Choisissez le type (bail d’habitation, location meublée ou bail commercial / professionnel) et le locataire : les noms, le logement, le loyer en chiffres et en lettres, le dépôt et les dates se remplissent seuls. Chaque article est modifiable, vous pouvez en ajouter, en supprimer ou les réordonner, puis enregistrer votre version comme modèle. « Envoyer » partage le PDF par WhatsApp.'],
  ['Envoyer une facture en PDF sur WhatsApp','Sur téléphone, « Envoyer le PDF » ouvre le menu de partage avec le fichier joint : choisissez WhatsApp puis le contact. Sur ordinateur, le PDF se télécharge et WhatsApp s’ouvre avec le message : joignez le fichier avec le trombone.'],
  ['Reçu après paiement','Chaque paiement enregistré permet d’éditer un reçu : icône imprimante dans l’historique des paiements, ou « Suivi / reçu ».'],
  ['Modèles de facture','Paramètres → Factures : Classique et Essentiel (gratuits), plus 7 modèles Pro — Studio, Prestige, Émeraude, Horizon, Sahel, Atlantique, Ardoise. L’aperçu se met à jour immédiatement.'],
  ['Signature, NINEA et RCCM','Ajoutez votre signature (Pro) et vos identifiants légaux dans Paramètres → Profil et Factures ; ils apparaissent sur les documents.'],
 ]},
 {id:'agenda',icon:'calendar',title:'Calendrier & rappels',intro:'Ne plus rien oublier.',items:[
  ['Ajouter un rendez-vous','Calendrier → cliquez sur un jour : visite, remise de clés, intervention, rappel. Les fins de bail et échéances y apparaissent automatiquement.'],
  ['Notifications','La cloche en haut regroupe vos rappels. Activez les notifications de l’appareil dans Paramètres pour être prévenu des échéances.'],
 ]},
 {id:'pro',icon:'pro',title:'Abonnement Pro',intro:'Plus de biens, documents illimités, outils avancés.',items:[
  ['Que comprend la version gratuite ?','Par espace : 6 biens ou logements et 7 locataires. Par compte : 3 documents de loyer exportés. Les paiements, rappels et brouillons restent illimités.'],
  ['Que débloque Pro ?','Biens et locataires illimités, factures et reçus sans quota, 7 modèles de facture supplémentaires, signature, deuxième espace, contrats, rapports avancés, imports et reversements propriétaires. Les fonctions sont identiques en mensuel, trimestriel et annuel.'],
  ['Comment payer ?','Bouton « Découvrir Yombal Pro » ou « Abonnement » : choisissez la durée, puis payez sur SasPay (Orange Money, Wave, carte) dans un nouvel onglet. L’accès Pro s’active automatiquement dès la confirmation.'],
  ['Renouvellement','Aucun prélèvement automatique. Pour prolonger, choisissez une nouvelle durée : elle s’ajoute à la suite de votre date de fin actuelle.'],
 ]},
 {id:'securite',icon:'shield',title:'Compte & sécurité',intro:'Vos données restent à vous.',items:[
  ['Mot de passe oublié ou compte bloqué','Écrivez-nous via le formulaire de contact ou à fatwaprod3@gmail.com avec l’e-mail du compte. Un compte peut être temporairement limité ou suspendu pour vérification en cas d’activité suspecte : un message vous l’indique alors à la connexion.'],
  ['Sauvegarder mes données','Paramètres → Préférences → Exporter : téléchargez une sauvegarde complète de votre espace.'],
  ['Qui voit mes données ?','Seul votre compte accède à votre espace. Les fichiers sont privés. Yombal ne vend aucune donnée et n’affiche aucune publicité.'],
 ]},
];
export function helpKnowledge(){return helpTopics.map(t=>`## ${t.title}\n`+t.items.map(([q,a])=>`- ${q} : ${a}`).join('\n')).join('\n');}
