# Mise à jour Yombal.immo — 17 octobre 2026

Version 0.2.0 : code préparé et vérifié localement. Le propriétaire a clarifié son instruction : la publication est autorisée automatiquement, sans attendre le dépôt GitHub. La source conserve son historique dans le dépôt géré par Sites ; aucune copie GitHub n’est encore vérifiée.

## Comportements ajoutés

- Les fenêtres de formulaire restent ouvertes après un clic à l’extérieur ou la touche Échap. La croix et les boutons explicites permettent de les quitter. Les erreurs sont affichées dans Yombal et la saisie est conservée après un refus d’enregistrement.
- Les choix de formulaire reprennent le style de l’application. Des pictogrammes identifient les types de biens et des repères W / OM identifient Wave et Orange Money ; ce ne sont pas leurs logos officiels. Les doublons de biens et de références de règlement sont contrôlés.
- Le sélecteur en haut du menu permet de créer et changer d’espace agence ou propriétaire. Chaque espace possède ses biens, locataires, baux, règlements et préférences. L’espace initial conserve sa clé de stockage et ses données. Les nouveaux espaces sont isolés par utilisateur authentifié et identifiant d’espace.
- Le menu Factures & reçus crée un document par bail et par mois. Il reprend le client, le bien, l’échéance, le loyer, les charges, les règlements, le solde et les coordonnées publiques de l’espace. Le statut passe de En attente à Partiellement payée puis Payée selon les règlements réellement enregistrés. Aucun paiement n’est déclenché chez Wave, Orange Money ou une banque.
- Les documents peuvent être prévisualisés, imprimés ou enregistrés en PDF. Un lien à jeton est disponible et son contenu est recalculé à la consultation. Les boutons WhatsApp et e-mail préparent un message ; ils ne prouvent pas sa livraison. Le site restant privé, un client extérieur ne peut pas encore consulter ce lien : envoyer le PDF en attendant la configuration de son accès.
- Paramètres permet de modifier les coordonnées de contact, les instructions de paiement et la signature. Celle-ci peut être dessinée, importée, remplacée ou retirée. Les documents actualisés reprennent la signature et les coordonnées actuelles de l’espace.
- Le menu Propriétaires propose l’ajout d’un bien pour le propriétaire concerné. Les nouveaux baux de biens personnels démarrent avec une commission de gestion nulle. Les relevés restent filtrables par propriétaire ou biens personnels.
- Le menu est plus contrasté et compact, avec une zone défilante pour garder Paramètres et le profil accessibles. La palette prune et corail validée est conservée.
- Aide & Yombal regroupe le guide, la démonstration, les demandes par sujet et les informations de fonctionnement de la version pilote. Les demandes sont enregistrées et visibles dans leur historique.

## Validation effectuée avant livraison

- 26 tests métier réussis : soldes et trop-perçus, doublons, relations, périodes, signatures, échappement HTML, statut des documents et clés de stockage des espaces.
- Vérification TypeScript sans erreur.
- Compilation de production réussie, avec les API workspace, spaces, invoices, invoices/:token, support et files.
- Migration appliquée dans une base SQLite temporaire : les données et la révision de l’espace antérieur sont conservées ; un document mensuel est unique par utilisateur, espace et bail.
- Diff contrôlé. Aucun contrôle interactif dans un navigateur n’a été possible dans cet environnement ; les parcours visuels et mobiles restent à vérifier avant lancement. Les contrôles locaux ne modifient pas la base de production ; les migrations hébergées sont appliquées par Sites au déploiement.

## Configuration nécessaire avant ouverture aux clients

1. Raccorder un dépôt GitHub Yombal dédié et accessible pour la copie de sauvegarde demandée. Cette étape ne bloque plus les mises à jour du site autorisées par le propriétaire.
2. Configurer l’accès client aux liens de documents. Le site est actuellement privé ; son audience n’a pas été changée.
3. Raccorder les demandes d’assistance à l’équipe : aucune notification ni adresse de support n’a été inventée.
4. Compléter les coordonnées de l’éditeur, les conditions commerciales et la notice de confidentialité avant l’ouverture publique.

La migration `drizzle/0001_panoramic_randall_flagg.sql` ajoute uniquement les répertoires d’espaces, les liens de documents et les demandes d’assistance. Elle ne supprime ni ne déplace les données existantes.
