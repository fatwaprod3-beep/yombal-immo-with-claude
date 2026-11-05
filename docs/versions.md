# Versions de Yombal.immo

## 0.23.0 — 5 novembre 2026

- Paiement : la page SasPay s’ouvre dans un nouvel onglet ; Yombal reste ouvert avec le bouton « Actualiser mon accès ».
- Administration : bouton « Payer 200 F pour tester », réservé au compte propriétaire, pour vérifier toute la chaîne (SasPay, webhook, activation Pro 1 mois).

## 0.22.1 — 5 novembre 2026

- Webhook SasPay : journal de diagnostic (reçu, signature refusée, rapproché, erreur), sans secret ni données de paiement.

## 0.22.0 — 5 novembre 2026

- Administration : champ pour coller le secret de signature fourni par SasPay à la création du webhook, et affichage de la date du dernier webhook reçu.
- Clé API SasPay connectée en mode réel par le propriétaire.

## 0.21.1 — 5 novembre 2026

- Documentation : recherche sur l’automatisation SasPay (`docs/saspay-automatisation.md`) — durées gérées par Yombal, webhooks, deux modes de paiement.
- Règle de numérotation : chaque commit commence par son numéro de version.

## 0.21.0 — 4 novembre 2026

- Abonnements : tant que la clé API SasPay n’est pas connectée, « Continuer au paiement » enregistre la demande et redirige vers le lien SasPay de l’offre (mensuel, trimestriel, annuel).
- Administration : liste des demandes faites via ces liens, avec activation de l’accès Pro après vérification du paiement dans SasPay (cumul des durées, une seule activation par demande).
- Connexion à l’administration avec le mot de passe du compte propriétaire.

## 0.20.0 — 4 novembre 2026

- Base de données : passage de Turso à Supabase (PostgreSQL), projet dédié. Schéma identique, migration unique `0000_yombal_supabase`, RLS activée sur toutes les tables.
- Paiements : les écritures atomiques passent par des transactions PostgreSQL avec verrou par compte ; même règle de prolongation (mois calendaires, cumul des renouvellements, aucune double activation).
- Mode test sans connexion (`YOMBAL_TEST_MODE=1`) : données gardées dans le navigateur, fonctions Pro débloquées pour les essais.

## 0.19.0 — 4 novembre 2026

Indépendance vis-à-vis de ChatGPT : l’application devient un projet Next.js standard, déployable sur Vercel depuis GitHub.

- Connexion : remplacement de la connexion ChatGPT par des comptes Yombal (e-mail + mot de passe). Mots de passe dérivés en PBKDF2-SHA256 (100 000 itérations, sel aléatoire), session signée HMAC dans un cookie HttpOnly/Secure de 30 jours, limitation des tentatives. Pages `/connexion` (connexion et inscription) et routes `/api/auth/*`.
- Base de données : Cloudflare D1 remplacé par Turso (libSQL, compatible SQLite). Schéma, requêtes et batchs atomiques inchangés ; nouvelle migration `0005_yombal_users`. Les migrations sont appliquées automatiquement avant chaque build.
- Fichiers : Cloudflare R2 remplacé par Vercel Blob, toujours servis uniquement au propriétaire via `/api/files`.
- Administration : le propriétaire est désigné par `YOMBAL_ADMIN_EMAIL` ; mot de passe administrateur généré avec `npm run admin:password`.
- Paiements : le webhook SasPay devient joignable publiquement à `https://<domaine>/api/payments/saspay/webhook`.
- Suppression du socle Sites/Vinext/Wrangler.

Les données de l’ancien site ChatGPT (base D1 et fichiers R2) ne sont pas transférées : la nouvelle base démarre vide.

## 0.18.1 — 4 novembre 2026

SasPay : correction d’un blocage reproduit dans le moteur Cloudflare Workers. Le mode fetch redirect:error provoquait un TypeError avant toute requête vers SasPay ; les tentatives observées renvoyaient 503 en 2 à 4 ms. Le mode devient manual et les réponses 3xx restent refusées, sans transmettre la clé à une destination de redirection. La vérification de clé, la création de session et les lectures de confirmation réutilisent le transport corrigé.

Administration : diagnostics distincts pour clé refusée (401), accès restreint (403), limite de demandes (429), réponse invalide, délai, réseau et enregistrement local. Les journaux contiennent uniquement une étape, un code prédéfini et éventuellement un statut HTTP ; aucun corps de réponse prestataire ni clé. La configuration antérieure est conservée après échec.

Validation : TypeScript et 235 tests, dont cinq cas exécutant le vrai module SasPay dans workerd via Miniflare, sans appeler le prestataire réel. Vérification des options acceptées, réponses vides/paginées, redirections refusées, codes HTTP et absence de secret dans les erreurs. Compilation de production. Aucune migration, aucun changement des données ou de l’audience ; aucune clé complète reçue dans le chat et aucun encaissement réel effectué. Le propriétaire doit relancer Vérifier et connecter avec sa clé pour confirmer l’accès SasPay réel. Raccordement demandé : projet Vercel yombal-immo créé dans tes-9ce1, sans déploiement ; dépôt GitHub privé encore à créer après connexion sécurisée. Publication mise en pause pendant ce raccordement. État des cibles conservé dans docs/project-targets.json ; copie source et historique Git préparés pour récupération indépendante.

## 0.18.0 — 4 novembre 2026

Paiements : connexion SasPay dans l’administration privée du propriétaire, après son mot de passe existant. Vérification de clé par une lecture sans encaissement ; stockage chiffré AES-GCM/HKDF côté serveur, sans clé API dans le dépôt ni réponse client. Indication explicite du mode test ou réel et copie du secret webhook réservée à l’administration. Aucun secret de production complet n’a été fourni lors de cette livraison.

Abonnements : sessions par compte aux prix 4 900, 9 900 et 25 000 XOF, avec référence immuable, préparation protégée contre les doubles clics et vérification automatique au retour. Montants, devise, marchand, métadonnées et transaction confirmés auprès de SasPay. Registre de paiements et prolongation de 1/3/12 mois calendaires dans un batch D1 atomique ; répétitions sans double activation et renouvellements concurrents cumulés. Expiration contrôlée côté serveur et conservation des données. Aucun prélèvement récurrent ajouté ; les essais ne donnent pas un abonnement réel.

Webhook signé préparé avec HMAC sur le corps exact, horodatage et rapprochement avec une session vérifiée. Le site conserve son audience privée : la couche d’accès bloque encore les notifications externes SasPay. La vérification au retour et Actualiser mon accès sont indépendantes du webhook. Le propriétaire doit connecter sa clé, puis un paiement prestataire réel reste à tester ; aucune activation ou réception live n’est annoncée comme déjà validée. Les anciens liens partagés sont conservés comme références, mais ne servent plus de checkout sans association au compte. L’aide et la notice de transmission des informations à SasPay sont actualisées.

Validation : 227 tests, dont routes réelles sur Drizzle/SQLite, chiffrement, séparation des comptes, signatures, prix et devises, test/live, fins de mois, renouvellements, concurrence et rollback. TypeScript, rendu statique et compilation de production. Contrôle visuel navigateur non renouvelé après le blocage de l’aperçu local par l’approbation automatique. Migration additive limitée aux trois tables de configuration, commandes et paiements ; aucune réinitialisation des données. Sauvegarde Git Sites ; dépôt GitHub toujours indisponible avec l’accès actuel.

Chaque livraison fonctionnelle dispose d’un numéro dans `VERSION`, d’une entrée dans ce journal et d’un commit source enregistré par Sites. La version Sites garde la correspondance avec le commit exact et l’archive déployable. Ne pas confondre cette sauvegarde avec une copie GitHub, qui reste à raccorder.

## 0.17.1 — 31 octobre 2026

Paramètres : les identifiants de l’agence (NINEA, RCCM et référence) sont affichés directement dans Profil, sans volet fermé. La signature est ouverte sur PC et mobile, y compris pour un compte gratuit : le dessin et l’import servent à essayer le résultat avant achat. Les modèles Pro peuvent être sélectionnés dans le brouillon du formulaire. L’abonnement est demandé au clic sur Enregistrer ; les choix locaux sont conservés lorsque la fenêtre Pro est ouverte. Les contrôles de droits restent appliqués au serveur, sans accorder gratuitement l’enregistrement d’une signature ou d’un modèle Pro.

Factures : Créer son reçu / Créer sa facture ouvre immédiatement un aperçu dédié, même sans autorisation d’export. Cette première création à l’écran ne publie pas le document et n’utilise aucun export gratuit. Enregistrer et Envoyer / télécharger sont disponibles en bas de cet aperçu. L’enregistrement retrouve la référence canonique du document ; l’envoi conserve le quota et les contrôles serveur existants. Les actions de partage et de PDF deviennent disponibles après émission. Retour au suivi conserve le texte saisi, et l’aperçu revient en haut à son ouverture et après préparation de l’envoi.

Validation : TypeScript, 23 tests ciblés (droits Pro, signatures, modèles, documents, brouillons et exports), rendu statique des paramètres, de la signature gratuite sur PC/mobile et de la facture avant enregistrement/export ; compilation de production. Contrôle visuel navigateur non renouvelé : l’aperçu local reste bloqué par l’approbation automatique. Aucune migration ni modification des données utilisateurs. Source sauvegardée dans Git Sites ; GitHub reste à raccorder.

## 0.17.0 — 31 octobre 2026

Offres : chaque sélection met à jour les avantages et la durée, avec les économies du trimestre (4 800 XOF) et de l’année (33 800 XOF). Un seul bouton Continuer au paiement enregistre le choix puis ouvre le lien SasPay canonique. L’étape de récapitulatif et le bouton public de déblocage administrateur sont supprimés. Les choix issus de l’aide préselectionnent la bonne durée. L’activation automatique après paiement reste à raccorder aux confirmations du prestataire.

Gratuit : 6 biens ou logements et 7 locataires par espace, 3 documents exportables par compte. Le serveur compare l’état validé avant/après toute mutation, y compris installation de locataire, logements d’un bâtiment et restauration. Les fiches existantes au-dessus d’une limite restent modifiables ; leur nombre ne peut plus augmenter sans Pro. Un deuxième espace, la signature et les autres fonctions avancées gardent leurs contrôles Pro côté serveur.

Factures : enregistrement des brouillons distinct de l’export. Le brouillon ne délivre ni URL client ni HTML imprimable dans l’API ; le cadre d’aperçu est sans script et sans bouton d’impression. Envoyer / télécharger réserve atomiquement l’un des 3 exports gratuits ; ouvrir de nouveau le même document n’en consomme pas un autre. Le quatrième reste enregistré mais son émission demande Pro. Les documents existants restent accessibles après migration. Les reçus et les anciennes actions d’impression passent par ce même parcours. Boutons Enregistrer et Envoyer / télécharger au pied des fenêtres ; statut payé, partiel, en attente ou impayé toujours calculé depuis les règlements réels.

Administration : l’ancien statut de développement ne suffit plus à donner Pro. /administration exige la connexion ChatGPT du propriétaire et un mot de passe dédié dont seul le dérivé PBKDF2 et les secrets de session sont configurés hors dépôt. Cookie signé lié au propriétaire, HttpOnly/Secure/SameSite, expiration à 4 heures ; limitation persistante des tentatives à 5 sur 15 minutes. L’adresse du compte existant est réutilisée ; aucune boîte Gmail n’est créée. Les secrets et le mot de passe ne figurent pas dans la source.

Aide : Contact ouvert en premier, Bien démarrer en deuxième, puis Tarifs, Conditions et Confidentialité pour le pilote. Informations réelles sur quotas, prix, paiement SasPay, connexion, hébergement, données, partage, exercice des droits et contact du responsable. Pas de numéro légal, de certification ou d’activation automatique inventés. Notifications : la cloche ouvre une fenêtre au-dessus de la page courante et conserve les actions de lecture et de suivi.

Validation : TypeScript, 198 tests dont quotas, accès privé, cookie lié au propriétaire, expiration, tentatives persistantes, refus des anciens déblocages, brouillons privés, quota atomique et répétition d’export. Routes testées avec Drizzle et SQLite sur les migrations réelles. Rendu statique des offres et avantages, aide, politiques, factures et accès privé ; compilation de production. Contrôle visuel navigateur non renouvelé : l’accès à l’aperçu local reste bloqué par l’approbation automatique. Migration limitée au schéma (état de publication et tentatives administrateur), sans réinitialiser les données. Source poussée dans Git Sites. Le dépôt GitHub demandé renvoie toujours 404 avec la connexion actuelle.

## 0.16.1 — 31 octobre 2026

Paiements SasPay : les trois pages publiques fournies ont été ouvertes et leurs montants vérifiés dans le navigateur sans effectuer de règlement : mensuel 4 900 XOF, trimestre 9 900 XOF, annuel 25 000 XOF. Les deux derniers montants remplacent les anciens tarifs de 12 000 et 45 000. Les économies affichées sont recalculées par rapport au mensuel : 4 800 et 33 800 XOF.

Le bouton Payer avec SasPay enregistre le choix authentifié puis ouvre la page exacte de l’offre, dans le même onglet pour éviter un blocage de popup. Le serveur choisit le lien, le prix et la devise depuis sa liste d’offres ; les montants, devises ou liens injectés par le client sont ignorés. Le navigateur vérifie la cohérence de la réponse avant redirection. Le mode administrateur conserve un lien direct d’aperçu explicite vers une vraie page SasPay, sans créer de demande ni changer son accès. Actualisation de l’accès disponible lorsqu’un choix est en attente.

La redirection et le retour sur Yombal n’accordent jamais Pro. Le raccordement de l’API et des webhooks, avec association fiable entre règlement et compte et contrôle de durée, reste nécessaire pour l’activation automatique. Aucun webhook fictif ni confirmation de paiement n’a été créé.

Validation : TypeScript, 181 tests dont six nouveaux cas de prix/liens, anti-CSRF, authentification, refus d’un accès administrateur public, mise à jour du choix et échec de base de données. Les pages SasPay ont été vérifiées visuellement ; l’ouverture de l’aperçu local a été refusée par l’approbation automatique, cette origine ayant déjà été bloquée. Rendu de l’interface contrôlé hors navigateur et compilation de production. Code sauvegardé dans Git Sites ; GitHub reste à raccorder.

## 0.16.0 — 31 octobre 2026

Paramètres PC : les trois onglets sont conservés ; Profil devient un formulaire simple, avec logo en haut, coordonnées sur deux colonnes, profil de gestion dans un sélecteur et identifiants facultatifs dans un volet. Les grandes cartes agence/propriétaire et la colonne latérale sont retirées. Le bouton Enregistrer garde le contrôle des modifications.

Navigation : flèche Retour à gauche des fenêtres. Dans les paramètres et l’historique d’un bien, elle revient à la rubrique précédente ; dans le récapitulatif Pro, aux offres ; dans la facture, à l’étape précédente. Les panneaux Voir plus ont aussi un Retour à la liste, y compris quand une recherche a ouvert un bâtiment automatiquement. Les boutons Fermer et le comportement historique des fenêtres restent disponibles.

Abonnements : entrée visible dans la barre PC et dans Préférences, libellé du menu clarifié. Les trois offres sont affichées même si l’accès administrateur ou Pro est actif. Choix de durée, récapitulatif, montant et étapes de paiement préparés. L’aperçu administrateur ne crée aucun paiement ; les autres comptes peuvent seulement enregistrer un choix en attente via l’API existante. Aucun encaissement SasPay ni activation automatique n’est annoncé comme connecté. Préparation du raccordement dans docs/saspay-integration.md, avec les trois prix et les données nécessaires.

Validation : TypeScript, 175 tests existants, rendu des paramètres et des offres en administrateur, récapitulatif sans débit et analyse CSS. Compilation de production. Contrôle visuel navigateur non renouvelé après le précédent blocage par limite d’utilisation. Code sauvegardé dans Git Sites ; GitHub reste à raccorder.

## 0.15.0 — 30 octobre 2026

PC — Paramètres regroupés en trois rubriques : Profil rassemble coordonnées, photo/logo et rôle agence/propriétaire ; Factures conserve modèles, relances et signature ; Préférences rassemble application, notifications, sauvegarde et compte. Le bouton d’enregistrement des paramètres et du profil est désactivé tant qu’aucune donnée éditable n’a changé ; le retour aux valeurs d’origine le désactive de nouveau. Les notifications déjà appliquées ne créent pas de modification fictive. Une sauvegarde réussie met à jour la référence de comparaison.

PC — Calendrier compact, aligné en haut et indépendant de la hauteur de la liste. Mois limité à une petite grille lisible, contrôles de mois regroupés, actions de pied séparées. Les événements se filtrent entre À traiter, Tout et Terminés et s’affichent par pages de six ; aucun événement n’est supprimé. Rappels, paiements, locations et rendez-vous existants conservés.

PC — Chaque bien dispose du même bouton Voir plus / Réduire, y compris les maisons sans sous-logement. Le panneau sur place montre charges, entrée, échéances à régulariser, dernier versement et caution prévue au bail, puis les logements s’il s’agit d’un bâtiment. Les trois points proposent Analyses et historique : fiche complète, occupation actuelle, anciens locataires, tous les versements, dépenses, contrats, documents, interventions et rappels rattachés. Le périmètre comprend les logements du bâtiment et ses anciennes locations directes, sans inclure d’autres biens. Calculs de commissions et échéances réutilisés depuis le modèle existant ; cautions distinctes des encaissements. Lecture seule jusqu’à l’ouverture explicite d’une action existante.

Validation : TypeScript, 175 tests dont six cas supplémentaires couvrant l’état modifié du profil, les périmètres d’un bâtiment et d’un logement, les reçus, commissions, échéances et documents. Comparaison du rendu mobile en tenant compte de la désactivation initiale des boutons Enregistrer et compilation de production. Vérification visuelle navigateur non renouvelée après le précédent blocage par limite d’utilisation. Source sauvegardée dans Git Sites ; GitHub reste à raccorder.

## 0.14.7 — 30 octobre 2026

PC — Locataires : liste compacte avec colonnes alignées pour la personne, son logement, le loyer et le suivi. Les couleurs de paiement et les prochaines échéances restent visibles sans grands encarts répétés. Un locataire ayant plusieurs locations garde une ligne par logement ; recherche locale par nom, téléphone ou logement et filtres actifs/sans location active. Fiche, paiement, relance, modification et suppression utilisent les actions existantes.

PC — Biens : tous les biens, maisons seules comme bâtiments, suivent le même format de ligne avec petite photo, référence, propriétaire, occupation et loyer. Les logements d’un bâtiment se développent à la demande ; une recherche qui trouve un logement les révèle automatiquement. Étages, occupants, ajout de logements et accès aux fiches conservés. Recherche et filtres existants réutilisés ; fonds blancs avec un repère pastel par bien.

PC — Paramètres : le menu ouvre une vraie fenêtre sur la page actuelle. Onglets visibles pour les coordonnées, la photo/logo, les factures/relances/signature, le rôle, l’application et les données. Tous les champs restent montés pendant le changement d’onglet. Pied fixe pour fermer/enregistrer, révélation des champs invalides et fermeture après sauvegarde réussie. Recadrage, NINEA/RCCM, modèles de facture, signature, restrictions Pro, notifications et sauvegardes conservés. Préservation du choix des notifications lors de l’enregistrement des autres préférences. La fermeture via retour s’appuie sur le gestionnaire de fenêtres existant. Les règles de style de cette livraison sont réservées au PC ; présentation mobile conservée.

Validation : TypeScript, tests existants, comparaison du rendu mobile avec 0.14.6 et compilation de production. Contrôle visuel navigateur non renouvelé après le précédent blocage de prévisualisation par limite d’utilisation. Source numérotée dans Git Sites ; GitHub toujours à raccorder.

## 0.14.6 — 30 octobre 2026

Accueil PC : le bandeau des loyers en retard apparaît sur une ligne continue, sur toute la largeur immédiatement après les quatre indicateurs et avant les graphiques. Le nombre et l’action d’ouverture du suivi utilisent les données existantes ; aucun bandeau vide lorsqu’il n’y a pas de retard.

Alignement de la partie basse : propriétaires sur une ligne entière, puis rappels, aperçu des biens et derniers mouvements dans une même grille à colonnes égales. Les en-têtes et les bords des cartes sont alignés ; sur les écrans PC plus étroits, deux colonnes et les mouvements sur toute la largeur. Le vide sous le petit bloc propriétaires disparaît. Graphiques, couleurs, calculs et actions existants préservés. Les nouvelles règles CSS concernent exclusivement les largeurs de 851 px ou plus, sans modification de la présentation mobile.

Validation : TypeScript, compilation de production, contrôle du diff et comparaison du rendu mobile avec 0.14.5. Contrôle visuel navigateur non renouvelé après le précédent blocage par limite d’utilisation. Source numérotée dans Git Sites ; GitHub toujours à raccorder.

## 0.14.5 — 30 octobre 2026

Mobile : paramètres organisés en onglets alignés avec les coordonnées ouvertes automatiquement. Les champs restent montés et conservent leur saisie ; la validation révèle le panneau concerné. Fond de formulaire et arrière-plan des fenêtres mieux différenciés. Bouton d’enregistrement toujours visible.

Accueil mobile : retrait du raccourci propriétaires, conservation des quatre indicateurs et des retards. Bonjour animé et disparition après sept secondes avec repli progressif de son espace. Les deux graphiques ronds partagent une seule carte d’aperçu ; sélection tactile des parts distincte du survol, montants et pourcentages lisibles, lien vers le menu Analyses. Les analyses détaillées commencent par le graphique, puis les indicateurs et répartitions. Aucune modification des calculs ni des données ; présentation PC conservée.

Validation : TypeScript, tests existants et compilation de production. Contrôle navigateur non renouvelé après le précédent blocage de prévisualisation par limite d’utilisation. Source numérotée dans Git Sites ; GitHub reste à raccorder.

## 0.14.4 — 30 octobre 2026

Ajustements réservés au mobile : loyers en retard et propriétaires occupent chacun une ligne complète, juste sous les indicateurs. Les deux graphiques ronds d’occupation et de répartition sont de nouveau affichés directement. Le tracé principal passe de 160 à 112 px ; le lien de suivi répété sous son résumé est retiré, tandis que le tableau mensuel et les réglages restent disponibles.

Paramètres et profil : rubriques repliables pour le type d’espace, les coordonnées, la photo/logo et les documents. Les relances, la signature et l’aperçu de facture ont leurs propres volets. Les champs restent montés et conservent leur saisie quand un volet se ferme. Une validation incorrecte ouvre les volets concernés avant de placer le curseur sur le champ. Le bouton d’enregistrement des paramètres reste visible au-dessus du menu mobile ; les actions du profil restent fixes pendant que son contenu défile. Les enregistrements, le recadrage et les restrictions Pro utilisent les traitements existants.

Propriétaires : cartes séparées par des espaces, fonds alternés, bordures colorées, nom plus lisible et statut placé sur une ligne distincte. Les logements et actions de chaque personne restent dans sa propre carte. Aucune modification des données ni des calculs.

Validation : TypeScript, 169 tests existants, analyse du CSS et compilation de production ; comparaison du HTML de l’accueil PC avec 0.14.3 après normalisation des identifiants React. Les règles ajoutées restent dans la limite de 850 px. Le contrôle visuel dans le navigateur n’a pas été renouvelé après son blocage par la limite d’utilisation. Source versionnée dans Git Sites ; GitHub toujours à raccorder.

## 0.14.3 — 30 octobre 2026

Lisibilité mobile : surfaces blanches, textes gris foncé et prune plus contrastés, libellés et boutons agrandis, champs à 16 px. Le thème système mobile et le lancement de l’application utilisent le blanc au lieu du violet sombre ; la couleur de thème du PC reste prune. Le site déclare explicitement un schéma clair. Les nouvelles règles de présentation sont intégralement limitées aux écrans de 850 px ou moins.

Accueil mobile : les quatre indicateurs sont suivis immédiatement du nombre réel de loyers en retard et de propriétaires, avant les analyses. Les deux raccourcis restent cliquables, sans leurs longs textes secondaires. Le graphique garde les mois, les montants réels et le tableau détaillé ; ses réglages de séries et de courbe/barres sont regroupés sous « Options ». Le résumé d’un mois est réduit à son encaissement lorsque ces options sont fermées. Les statistiques d’occupation et de répartition restent accessibles dans un volet repliable. Les doublons de progression et les instructions de survol sont masqués sur mobile.

Fenêtres mobiles : marges plus nettes, hauteur limitée à 84 % de l’écran, titres et descriptions plus lisibles, actions de fermeture et de validation mieux dimensionnées. Le défilement existant des formulaires et les calendriers personnalisés sont conservés. Aucun changement des données ni des calculs financiers.

Validation : 169 tests existants, TypeScript, analyse CSS et compilation de production. Les 277 déclarations du nouveau fichier CSS sont toutes dans la limite mobile. Comparaison du HTML réellement rendu côté serveur de l’accueil PC avec 0.14.2 : contenu identique après normalisation des identifiants React ; structure et présentation de bureau conservées. La vérification visuelle dans le navigateur n’a pas été possible : l’approbation automatique a bloqué l’ouverture de la prévisualisation en raison d’une limite d’utilisation. Les outils temporaires de contrôle ont été retirés avant compilation. Source versionnée dans Git Sites ; GitHub reste à raccorder.

## 0.14.2 — 30 octobre 2026

Installation mobile : capture anticipée de la demande native avant le démarrage de React et reprise de cette demande par le bouton, utilisé une seule fois. Le manifeste demande les identifiants du même site, nécessaires lorsque son accès exige une connexion. Enregistrement du service worker sans réutiliser une ancienne version en cache ; traitement des navigations avec priorité au réseau et page de reconnexion générique si le réseau tombe. Aucune page personnelle, donnée métier ni pièce privée n’est conservée hors ligne.

Le guide d’installation détecte Android, iPhone/iPad et ordinateur, avec choix manuel possible. Sur Android, lien explicite pour ouvrir Chrome, retour vers le guide et copie du lien du site en secours ; seuls l’origine du site et le paramètre d’installation sont transmis. La demande native peut devenir disponible pendant que le guide est ouvert : le bouton « Installer maintenant » apparaît alors sans rouvrir de fenêtre. La réussite n’est annoncée qu’à la réception de `appinstalled` ; l’acceptation de la demande reste un état distinct.

Une tentative d’installation n’est plus traitée comme « Plus tard ». Le délai de sept jours est réservé au refus explicite, avec une nouvelle clé pour ne pas conserver les blocages erronés de la version précédente. L’ancienne marque permanente d’installation n’empêche plus une réinstallation. Une ouverture manuelle du guide ou une tentative suspend la proposition automatique pour le reste de la session ; correction d’un cas observé où le popup revenait immédiatement après acceptation. L’accueil PC conserve exactement les sources visuelles de 0.14.1 ; aucune nouvelle modification de son agencement, des montants ou des graphiques.

Validation : 169 tests dont dix nouveaux cas de capture anticipée, service worker, reconnexion, non-interception des API/fichiers, identification de l’appareil et lien Chrome sans données privées ; TypeScript, analyse CSS et compilation de production. Contrôles navigateur du véritable tableau de bord à 320, 390 et 1280 px, guide Android et iPhone, lien du manifeste avec identifiants, pied de fenêtre accessible et absence de débordement. Le branchement du bouton et le traitement de l’acceptation ont été vérifiés avec une demande de navigateur simulée dans un outil local, retiré avant publication : une seule invocation, aucun popup réouvert après le délai. L’installation native complète sur un téléphone physique reste à vérifier. Source versionnée dans Git Sites ; GitHub toujours à raccorder.

Références consultées : [manifestes et identifiants](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest), [critères de proposition d’installation](https://web.dev/articles/install-criteria), [limites des navigateurs intégrés](https://web.dev/learn/pwa/progressive-web-apps), [liens Android vers Chrome](https://developer.chrome.com/docs/android/intents).

## 0.14.1 — 30 octobre 2026

Correction limitée à l’accueil : sur ordinateur, la salutation reste visible et sans animation comme en 0.13.1. L’animation et la disparition après sept secondes sont réservées aux écrans de 850 px ou moins. Un changement de taille d’écran rétablit immédiatement la salutation sur PC. Aucun changement des autres pages ni de la disposition actuelle sur mobile.

Validation : TypeScript et compilation de production ; contrôle navigateur avec données d’exemple à 390, 851 et 1280 px. La salutation disparaît sur mobile, reste visible sur PC après le délai, et revient lors du passage du mobile au PC. Outils temporaires de contrôle retirés avant publication. Source sauvegardée dans Git Sites ; GitHub toujours à raccorder.

## 0.14.0 — 30 octobre 2026

Biens : liste compacte sur téléphone, fonds pastel distincts et informations détaillées ouvertes par « Voir plus ». Les photos, occupants, logements d’un bâtiment et actions restent accessibles dans la vue développée. Recherche locale par nom, référence, adresse, logement, étage ou locataire, combinée aux filtres d’occupation. Les compteurs sont regroupés sur une ligne mobile et la présentation complète reste disponible sur ordinateur.

Calendrier : grille du mois et sélecteurs plus courts sur mobile, actions rapides regroupées dans un volet repliable. Le dessin du calendrier approuvé est conservé. Factures : onglets courts Factures / Contrats / Reçus / Fichiers, recherche et choix du mois ou de l’ensemble des documents. L’ajout reprend le mois affiché. La fenêtre de facture garde son en-tête et ses boutons visibles pendant que le contenu défile ; les situations utilisent des boutons adaptés au toucher. Correction du calendrier invisible dans les formulaires : les calendriers et listes s’ouvrent dans un portail contenu dans la fenêtre native, hors de la zone défilante, avec limites de collision adaptées. Les parcours À payer et Déjà payée ont été vérifiés jusqu’à la demande finale, dont Orange Money et un changement de mois.

Accueil : salutation animée pendant sept secondes puis retrait de son espace ; animation désactivée si le système demande moins de mouvements. Installation : proposition mobile après vingt secondes, différée lorsqu’un formulaire ou une sélection est ouvert, détection du mode application et de l’événement d’installation, rappel suspendu sept jours après refus. Le bouton utilise la confirmation native quand le navigateur la propose ; une aide reste disponible autrement. Icônes 192/512 et manifeste complétés. L’installation ne contourne pas la confirmation du système.

Retour : suivi des fenêtres, listes et menus mobiles dans l’historique ; Retour ferme d’abord le panneau actif et conserve la page, puis rejoint le menu précédent. La navigation depuis une fenêtre et le remplacement d’un assistant par son aperçu n’ajoutent pas de fermeture tardive. Six tests couvrent les fenêtres simples, imbriquées, remplacées et les transitions de page.

Validation : 159 tests métier, documents, fichiers, accès Pro et navigation ; TypeScript, analyse CSS et compilation de production. Contrôles navigateur à 320, 390, 430 et 1280 px, recherche et développement d’un bien, formulaires de facture avec leurs calendriers et listes, retour depuis une fiche, retour du menu, disparition de la salutation et proposition d’installation différée. Les demandes de facture ont été vérifiées avec un récepteur local de test ; ni l’enregistrement sur un compte réel ni une installation native complète sur un téléphone physique n’ont été réalisés. Outils de contrôle retirés avant compilation. Données et protections existantes conservées. Sauvegarde Git Sites numérotée ; dépôt GitHub Yombal toujours à raccorder.

## 0.13.1 — 29 octobre 2026

Tableau de bord réorganisé : salutation, ligne mobile unique avec le mois à gauche et « Ajouter un bien » à droite, quatre indicateurs, puis analyses immédiatement après les montants. Le graphique d’évolution et les statistiques d’occupation/répartition forment un même ensemble ; les alertes, propriétaires et rappels viennent ensuite. Les commandes 6/12 mois et Courbe/Barres sont regroupées sur mobile ; le total cumulé supplémentaire du graphique est masqué uniquement sur l’accueil mobile pour éviter sa répétition avec les montants du mois, tout en conservant les montants détaillés et le tableau mensuel.

Le bloc propriétaires est une seule ligne cliquable avec nombre de propriétaires et commissions du mois. Il utilise sa propre grille, sans le bouton intérieur qui comprimait le texte sur mobile. Suppression des anciennes règles d’ordre des rappels et des anciens styles d’en-tête plutôt qu’un empilement d’exceptions.

Validation : TypeScript, analyse CSS et compilation de production. Contrôle navigateur avec données d’exemple en mode agence aux largeurs 320, 360, 390, 430 et 1280 px ; aucun débordement horizontal observé, date et ajout alignés à 44 px de hauteur, bloc propriétaires lisible. Bascule vers les barres et changement du mois vérifiés dans la prévisualisation. Outils locaux de contrôle supprimés avant compilation. Aucune modification des données, schémas ou règles métier. Configuration de prévisualisation locale réparée après récupération du dépôt ; audience privée conservée. Sauvegarde dans le Git Sites ; le dépôt GitHub Yombal reste à raccorder.

## 0.13.0 — 22 octobre 2026

Accueil mobile : en-tête allégé, salutation et action d’ajout sur une seule ligne, mois compact à côté du contexte, suppression de la ligne de synchronisation normale sur l’accueil connecté (les attentes et erreurs restent visibles). Les quatre indicateurs sont regroupés en cartes plus courtes avec leurs montants exacts. Une alerte de loyers en retard ouvre le suivi ; les rappels précèdent le grand graphique sur téléphone. Les graphiques et statistiques restent disponibles, sans réintroduire les trois raccourcis numérotés précédemment retirés. La présentation de bureau est conservée.

Photo et logo : choix explicite « Photo ronde » ou « Logo entier » dans l’éditeur, aperçu du rendu, glissement, pincement, curseur de zoom, recentrage et changement d’image. Le choix est enregistré dans le profil et utilisé dans l’en-tête, le menu latéral et la fenêtre de profil. Correction du bouton d’avatar qui réduisait l’image par son espacement interne ; un logo garde ses coins et la photo remplit le cercle. Suppression d’un ancien style fixe qui recouvrait le zoom. Les images restent privées et le formulaire principal conserve la validation du recadrage en cours.

Validation : 153 tests métier, documents, accès et persistance du choix photo/logo ; vérification TypeScript, analyse CSS et compilation de production. Contrôle dans le navigateur local aux formats 360, 390 et 430 px, sans débordement horizontal observé sur l’accueil d’exemple ; contrôle des deux présentations d’image et du zoom. Les outils temporaires de vérification sont supprimés avant la publication. L’import et la sauvegarde sur un compte authentifié réel ne sont pas vérifiés dans cette prévisualisation. Le dépôt GitHub Yombal n’est toujours pas accessible : sauvegarde numérotée dans le Git Sites.

## 0.12.0 — 21 octobre 2026

Recadrage : fenêtre dédiée inspirée de la capture fournie, repère circulaire pour les photos carrées, coins de réglage du zoom, glissement, pincement, curseur, recentrage et conservation de l’image entière. Validation explicite et fermeture protégée, avec les mêmes règles de stockage privé. La forme circulaire reste un repère ; le fichier carré est conservé pour ne pas couper le logo sur les documents.

Documents Pro : signature dessinée ou importée et trois modèles supplémentaires (Studio, Prestige et Essentiel), avec le modèle Classique gratuit conservé. Les modèles sont prévisualisables dans les paramètres ; leur application et les nouvelles signatures sont vérifiées côté serveur, y compris lors d’une restauration. Une signature ou un modèle déjà enregistré ne bloque pas la modification des coordonnées ; suppression de signature et retour au modèle gratuit restent possibles.

Relances : les factures impayées affichent automatiquement un avertissement explicite, les jours de retard et le solde exact, sans frais inventés. Le message général de l’agence se règle dans les paramètres avec un aperçu à côté. Un message particulier peut être enregistré sur chaque facture depuis le suivi, également avec aperçu immédiat ; il est conservé lors des lectures et actualisations, y compris un paiement partiel. Un loyer entièrement réglé ou un document annulé n’affiche plus de relance. Les envois WhatsApp/e-mail restent préparés puis déclenchés par le gestionnaire.

SasPay : étude des sources officielles, tarifs publiés, compte marchand, clés test/production, checkout et notifications signées, comparaison PayTech et étapes d’intégration dans `docs/SasPay-Yombal.md`. Aucun compte ouvert, secret créé ou paiement réel initié. Le paiement en ligne et la confirmation automatique des abonnements restent à raccorder au marchand validé.

Validation : 152 tests de non-régression métier, documents et accès Pro ; TypeScript, analyse CSS et compilation de production. Vérification dans le navigateur local de la sélection de modèles, du message reflété dans l’aperçu, de la fenêtre de recadrage et du zoom. Les enregistrements authentifiés et les paiements réels ne sont pas vérifiés dans cette prévisualisation. Audience privée et données existantes conservées. Source numérotée dans le Git Sites ; copie GitHub toujours à raccorder.

## 0.11.0 — 21 octobre 2026

Partage : les actions WhatsApp et e-mail restent disponibles sans coordonnées enregistrées. WhatsApp ouvre alors le choix du contact ; l’e-mail ouvre une rédaction Gmail avec destinataire modifiable et propose aussi l’application de messagerie. Les messages sont préremplis, jamais annoncés comme envoyés automatiquement. Ils ne contiennent plus le lien privé inutilisable par un client extérieur. Le PDF complet se prépare avec l’action PDF puis s’ajoute au message depuis la messagerie ; le partage de texte ne prétend pas joindre un fichier.

Profil et logo : le bouton Enregistrer valide et envoie aussi le recadrage en cours avant de sauvegarder le profil, avec une seule opération image partagée en cas de clic simultané sur sa validation. Les erreurs précises sont remontées, l’attente et les boutons sont libérés en cas d’échec. Les deux anciens curseurs de déplacement sont remplacés par le glissement direct à la souris ou au doigt, avec zoom à deux doigts, curseur de zoom, recentrage et déplacement au clavier.

Suivi et navigation : grand bouton de création de reçu en tête du suivi, avec accès PDF dès que le document est prêt. Les trois raccourcis numérotés de la capture sont supprimés de l’accueil. Le bas de la barre latérale est limité à Pro / administrateur, Aide et Paramètres groupés, puis le profil ; l’installation reste dans les paramètres et les explications d’abonnement dans la fenêtre Pro.

Situation des biens : choix Libre / recherche de locataire, Occupé ou Réservé dans l’ajout et la modification. Une occupation déclarée ne crée ni personne, ni bail, ni revenus fictifs. Une location active garde la priorité ; elle doit être terminée avant de déclarer le logement libre. L’installation d’un locataire remplace la déclaration manuelle par le suivi réel du bail. Les logements ajoutés à un bâtiment n’héritent pas d’une occupation manuelle de leur parent.

Commissions : choix entre pourcentage et montant fixe mensuel en FCFA. Le montant fixe est réparti au prorata du loyer reçu, hors charges, avec arrondis cumulés sans dépassement. Les conditions sont figées lors des encaissements et conservent l’historique en cas de modification du bail ; les périodes suivantes prennent les nouvelles conditions. Le fixe ne peut pas dépasser le loyer.

Accès de développement : bouton « Je suis administrateur · tout débloquer » réservé au compte du propriétaire vérifié côté serveur par une empreinte d’identité. L’accès persiste dans le statut distinct `development`, ne correspond à aucun paiement et peut être désactivé pour tester le gratuit. Aucun indicateur envoyé par le navigateur ne suffit à accorder cet accès. Les offres clients et les blocages Pro restent en place.

Graphique : correction du titre SVG rendu en plusieurs fragments, qui provoquait une erreur d’hydratation React à l’ouverture du tableau de bord.

Validation : 145 tests métier, commissions partielles et historique, partage, fichiers privés et règles Pro ; typage TypeScript, analyse CSS et compilation de production. Contrôle du tableau de bord et de la fenêtre de profil dans le navigateur local. Les enregistrements authentifiés et l’ouverture effective des messageries restent à vérifier avec la session réelle ; la prévisualisation locale HTTP ne fournit pas crypto.randomUUID, utilisé par les créations sur le site HTTPS. Audience privée conservée ; source sauvegardée et numérotée via Sites, copie GitHub toujours à raccorder.

## 0.10.0 — 20 octobre 2026

Correction ciblée des images dans les factures et contrats : le logo privé est désormais intégré au HTML sous forme d’image embarquée, côté serveur pour les liens et côté client pour les aperçus et fenêtres PDF. Les documents ne dépendent plus des cookies d’un iframe opaque ni d’une URL privée refusée par la politique `img-src data:`. Les clés de fichiers restent contrôlées par compte et aucune image privée ne devient publique.

Les champs numériques affichent une case vide à la place du zéro initial et sélectionnent leur contenu au focus. L’ajout de locataire garde le parcours bâtiment/logement/étage/côté avec des intitulés plus directs. Après l’enregistrement ou la modification d’un paiement, le suivi s’ouvre et prépare automatiquement son document actualisé. La feuille imprimée des factures est compactée en A4 ; les longs historiques peuvent se poursuivre sur une autre page.

Introduction de Yombal Pro avec trois durées donnant les mêmes droits : 4 900 F / mois, 12 000 F / trois mois et 45 000 F / an. Le gratuit conserve les fiches, locations, paiements, reçus simples, rappels et données déjà enregistrées. Pro réserve la création d’espaces supplémentaires, les rapports avancés, les contrats, les documents sur plusieurs mois, l’import CSV et l’enregistrement des reversements propriétaires. Les mutations concernées et la création d’espace sont vérifiées côté serveur à partir d’un abonnement actif non expiré, hors des données de profil modifiables par l’utilisateur.

Fenêtre responsive adaptée à la fonction demandée, prix sélectionnables, statut du compte, et accès « Pourquoi s’abonner ? » expliquant l’entretien du service, l’hébergement et la protection des données. Deux tables distinctes stockent les droits confirmés et les demandes d’abonnement. Le choix d’un plan enregistre une demande sans débit et sans accorder Pro. Le paiement marchand et sa confirmation ne sont pas configurés : aucun paiement réel ni activation automatique n’est annoncé.

Validation : 133 tests métier, fichiers, délais réseau, images embarquées et règles Pro ; typage TypeScript, analyse des feuilles CSS et compilation de production. Vérification visuelle interactive non disponible dans cette session. Migration additive des deux tables d’abonnement ; données immobilières et accès privé conservés. Source numérotée sauvegardée via Sites ; copie GitHub toujours en attente d’un dépôt Yombal accessible.

## 0.9.0 — 20 octobre 2026

Photos et logos : transport authentifié des images privées en JSON/base64, conservation des URL existantes et réponse binaire complète avec type MIME explicite pour les pièces et documents. Les erreurs de chargement disposent d’un état visible ; le recadrage réouvre l’image via le même transport. Les fichiers restent dans R2 et leur lecture vérifie toujours le compte propriétaire. Les journaux consultés confirmaient une lecture d’image en HTTP 200 ; l’affichage des anciens fichiers avec la session réelle du propriétaire reste à vérifier dans le navigateur.

Analyses : courbes lissées avec dégradé et points, montants par mois au survol, au toucher et au clavier ; présentation en barres conservée, choix de 6 ou 12 mois, séries activables et tableau des chiffres. Deux graphiques circulaires sur l’accueil et les rapports : occupation actuelle des logements et répartition des loyers du mois entre encaissés, en retard et à venir. Les graphiques reposent sur les données enregistrées, sans valeurs d’exemple dans l’espace réel. Les bâtiments parents sont exclus du décompte de leurs logements.

Ajout d’un locataire : sélection du bien principal, puis d’un logement existant ou création directe d’une partie avec étage (RDC, R+1 à R+30 ou emplacement libre), côté et numéro/repère. Le loyer, les dates et la personne sont enregistrés ensemble. Si le bien comporte déjà une location directe, le formulaire demande quelle partie reprend cette location ; les baux, réservations et paiements sont préservés. L’héritage du propriétaire et de l’adresse et les contrôles de chevauchement restent appliqués côté serveur.

Enregistrements : attente réseau limitée à 25 secondes pour les formulaires, messages de connexion et libération des boutons en cas d’échec. Une photo en cours de recadrage explique l’action attendue ; le bouton d’enregistrement permet d’afficher cette explication. Le curseur d’attente n’est plus appliqué à tous les boutons désactivés. La proposition de notifications bloquées permet de revérifier l’autorisation.

Validation : 127 tests de non-régression métier, fichiers privés et requêtes, typage TypeScript, analyse CSS et compilation de production. Vérification visuelle interactive non disponible dans cette session. Audience privée conservée. Sauvegarde source numérotée via Sites ; aucun dépôt Yombal accessible sur GitHub au moment de la livraison.

## 0.8.2 — 20 octobre 2026

Accueil allégé : suppression du sélecteur permanent « Mon espace / Démonstration ». L’accès à l’exemple reste dans Aide & Yombal ; seul un bouton de retour est affiché lorsqu’une démonstration est réellement ouverte. L’état de synchronisation reste une ligne discrète.

Sur téléphone et tablette, la grande recherche en tête de contenu est remplacée par une loupe dans la barre supérieure. Un appui ouvre une fenêtre compacte avec clavier, champ, résultats et fermeture explicite. Les résultats mènent à la fiche du bien ou du locataire, ou à l’inventaire concerné. Une recherche qui filtre une liste reste identifiable et effaçable par une petite pastille. Les changements d’espace et la navigation ferment la recherche ; aucune donnée métier n’est modifiée.

Validation : typage TypeScript, analyse CSS et compilation de production. Vérification visuelle interactive non disponible dans la session ; le propriétaire a confirmé le bon fonctionnement de l’affichage mobile après désactivation du mode ordinateur de son navigateur. Accès privé conservé. Source sauvegardée et numérotée ; copie GitHub toujours en attente d’un dépôt Yombal accessible.

## 0.8.1 — 19 octobre 2026

Correction de la présentation mobile. Les tableaux de locations, loyers, paiements, séjours, dépenses, factures, contrats, reçus et pièces jointes deviennent des fiches avec un libellé pour chaque valeur à partir de 850 px, tout en conservant les colonnes et la sémantique des tableaux sur ordinateur. Les actions et états restent accessibles dans chaque fiche. Le tableau comparatif des analyses conserve son défilement local.

En-tête mobile simplifié avec le nom de l’espace, changement d’espace, menu, notifications et profil ; la période affichée a sa propre ligne. Les boutons de mode retrouvent une taille lisible. Empilement des logements d’un bâtiment, commandes, onglets de documents, informations de profil, formulaires et fenêtres sur petits écrans. Configuration explicite du viewport, des zones de sécurité et du redimensionnement du clavier. Aucun changement dans les données ni les calculs métier.

Vérification : cinq tests de rendu couvrent les libellés par cellule, les colonnes conditionnelles, les commandes, l’échappement du texte et la sémantique accessible. Analyse CSS, typage et compilation de production contrôlés avant publication. Le HTML du site publié avant correction répondait bien avec le viewport appareil ; l’absence de viewport n’était donc pas la cause. La vérification visuelle dans un navigateur mobile reste indisponible dans cette session ; ne pas présenter ces contrôles de rendu HTML comme un test sur appareil réel. Accès privé conservé. Copie GitHub toujours en attente d’un dépôt Yombal accessible.

## 0.8.0 — 18 octobre 2026

Adaptation des mises en page mobiles : menu tactile, recherche accessible sur téléphone, formulaires et fenêtres ajustés à la hauteur disponible, calendrier Yombal conservé, tableaux et graphiques avec défilement local, textes et montants adaptatifs. Le nom du bien reste principal ; ville et adresse sont secondaires, y compris dans les sélecteurs de logement. La ville principale des réglages préremplit les nouveaux biens.

Menus agence et propriétaire différenciés : les comptes propriétaires, commissions et reversements relèvent de l’agence. Ajout de « Mes espaces » avec cinq choix : agence immobilière, logements personnels, matériel et bagages, animaux, autres biens. Chaque activité conserve son propre état et ses propres menus ; les espaces existants restent immobiliers par défaut.

Les espaces d’inventaire proposent fiches et photos recadrables, références, quantités, lieu, notes, mouvements confiés / retournés / vendus / retirés, dépenses et rappels liés. Les retours sont contrôlés par personne et les quantités disponibles par date ; les annulations conservent un historique et protègent les opérations qui en dépendent. Les animaux disposent aussi de champs naissance et sexe. Export CSV et sauvegarde/restauration de l’espace incluent ces données. Aucun paiement ni soin n’est exécuté automatiquement.

Validation : 104 tests métier réussis, typage TypeScript réussi et CSS analysé sans erreur de syntaxe. Compilation de production requise par le workflow avant publication. La vérification visuelle interactive sur mobile reste à effectuer : aucun navigateur de contrôle compatible n’est disponible dans cette session. Accès privé conservé. Le dépôt GitHub Yombal du compte lié n’est toujours pas accessible ; la source est versionnée via Sites.

## 0.7.0 — 18 octobre 2026

Menus courts Propriétaires et Factures & contrats. Propriétaires simplifié en une liste avec nombre de biens/logements, coordonnées et statut. Dans chaque fiche, deux onglets distincts : Ses biens & logements et Compte & reversements. Calculs, historique et fonctionnalités financières de 0.6 conservés.

Contrats : client existant ou nouveau client avec création du locataire et de la location, puis retour au contrat prérempli. Création de projets imprimables avec parties, logement, dates, loyer, charges, dépôt et clauses éditables. Snapshot des informations conservé à la création. Copie réellement signée à importer avec date avant de déclarer Signé ; aucune signature électronique ni validation juridique automatique prétendue. Projet préparé à partir des données saisies et à vérifier selon le régime applicable, notamment la durée du bail. Source de contexte : [COCC, ministère sénégalais de la Justice](https://justice.sec.gouv.sn/wp-content/uploads/2021/01/COCC.pdf).

Identité : photo de profil ou logo demandé avant enregistrement du profil et des paramètres ; données antérieures toujours lisibles. NINEA, RCCM et numéro d’agence facultatifs dans le profil, les factures, les relevés propriétaires et les contrats. Logo/photo affiché dans le compte. Import et recadrage commun pour profil/logo, locataires et biens : aperçu exact, zoom, déplacement horizontal/vertical, option Conserver toute l’image pour les logos rectangulaires. Recadrage appliqué au fichier enregistré en PNG.

Analyses : barres de hauteur proportionnelle aux montants réels, rendu responsive sans dépendance à une mesure initiale SVG, détail au survol ou au toucher, comparaison 6/12 mois, filtres de séries, réinitialisation des barres, tableau et ouverture des suivis conservés. Aucune donnée fictive ajoutée.

Notifications : proposition simple après enregistrement d’une location/client ou d’un rendez-vous. Un seul accord pour les types de rappels sur cet appareil ; Plus tard limite la répétition à sept jours. Demande native uniquement au clic explicite. Confirmation d’enregistrement dans l’application conservée. Les notifications de cette version nécessitent que Yombal soit ouvert ; les envois serveur en arrière-plan restent à configurer.

Validation : 83 tests métier et géométrie d’image, typage et compilation de production avant publication. Vérification visuelle interactive indisponible. Accès privé et sauvegarde source versionnée conservés ; copie GitHub toujours à raccorder.

## 0.6.0 — 18 octobre 2026

Propriétaires & reversements : un propriétaire peut regrouper plusieurs biens et logements, statut actif/inactif modifiable sans effacer l’historique. Compte mensuel consolidé : loyers reçus hors charges, commission contractuelle, dépenses propriétaire, reports antérieurs, reversements effectués et solde restant. Versements partiels avec date, mode, référence et confirmation du transfert déjà réalisé. Aucun mouvement d’argent déclenché par l’application. Annulations motivées conservées dans l’historique. Relevé professionnel imprimable avec coordonnées et signature de l’agence.

Calcul contrôlé côté serveur : aucun reversement au-delà du disponible, impossibilité de réutiliser des fonds déjà reversés sur une période ultérieure, doublons de référence refusés. Taux et propriétaire capturés lors de l’enregistrement des encaissements pour préserver l’historique après changement de contrat. Allocation des règlements au loyer puis aux charges, arrondi cumulatif en FCFA. Pas de taux légal supposé : nouveaux contrats à 0 %, à renseigner selon l’accord ; les contrats existants gardent leur taux. Charges, cautions et courts séjours suivis séparément du reversement des loyers mensuels.

Logements d’un même étage explicités : RDC gauche / RDC droite, même étage et baux indépendants. Calendrier personnalisé avec grille des jours conservé pour tous les sélecteurs, y compris les champs de mois. Ajout de facture : choix de situation par boutons radio accessibles, Continuer répond et affiche une explication précise si une information manque ; impayés du mois actuel admis si l’échéance est déjà passée. Factures, historique des reçus et pièces jointes regroupés dans un seul menu. Clic sur le profil ouvre une grande fenêtre de modification, signature et changement d’espace.

Graphiques : marges intérieures, montants adaptatifs, infobulle stable et contenue dans le panneau, données par mois et séries identifiées. Bouton Voir les montants par mois agrandi et contrasté.

Validation : 70 tests métier, typage et compilation de production avant publication. Contrôle visuel interactif indisponible dans cet environnement. Publication privée et sauvegarde source versionnée ; copie GitHub toujours à raccorder.

Recherche fonctionnelle : [MAN Properties Sénégal](https://man-properties.sn/), [Immo Azur Sénégal](https://immoazur.sn/nos-services/), [Samay Këur](https://samaykeur.com/agences). Le suivi applique le contrat saisi ; aucune règle fiscale ou commission réglementaire n’est déduite de ces sources.

## 0.5.0 — 18 octobre 2026

Calendrier & rendez-vous remplace Mon agenda : sujets Visite, Remise de clés, Intervention et Rendez-vous propriétaire, heure et contact facultatifs, modification et clôture. Les loyers mensuels, arrivées, départs et fins de bail apparaissent automatiquement. Le sélecteur personnalisé et sa grille restent utilisés dans tous les champs de date.

Patrimoine organisé par bâtiment et logements indépendants (RDC, R+1, appartement, chambre). Références stables B-001…, compteurs séparant biens et logements, occupant explicitement nommé. Un bâtiment déjà loué peut être divisé en rattachant le bail existant au logement choisi ; paiements et identifiants conservés. Les autres logements reçoivent chacun leur propre bail. Contrôles contre les doublons, les bâtiments imbriqués et la location directe d’un bâtiment déjà divisé.

Accueil allégé sans grand bandeau, chiffres agrandis et cartes cliquables avec effets de survol. Analyses réelles sur 6/12 mois, séries affichables/masquables, détail au survol et tableau par mois ouvrant les loyers. Statuts locataires placés dans une colonne distincte du nom, avec adaptation mobile.

Validation : 56 tests métier réussis et typage validé. Compilation de production vérifiée avant publication. Vérification visuelle interactive non disponible dans cet environnement. Accès privé conservé ; sauvegarde source Sites ; copie GitHub toujours à raccorder.

## 0.4.0 — 18 octobre 2026

Assistant Ajouter une facture en trois étapes : locataire recherché par nom/téléphone/bien, situation à payer/déjà payée/plusieurs mois impayés, récapitulatif. Reprise de périodes antérieures au suivi uniquement à l’intérieur du bail. Un règlement déjà reçu exige confirmation, date et mode ; les sommes déjà enregistrées sont déduites, y compris lors d’une reprise après erreur. Un document reste unique par bail/mois.

Fiche locataire cliquable avec photo et numéro d’identité facultatifs, logements, dates et montant. Le numéro d’identité reste privé et n’est pas reproduit dans les factures partagées. Les documents reprennent les coordonnées du locataire et ses dates de location. Calendriers aux couleurs de Yombal avec saisie manuelle et grille jour/mois/année, y compris dans les formulaires. Première échéance explicite. Compte à rebours vert au-delà de 10 jours, jaune de 4 à 10, orange de 1 à 3, rouge à l’échéance ou en retard. Statuts agrandis avec icônes et contraste renforcé sur ordinateur et mobile. Suivi vertical inspiré de la capture fournie, avec étapes réelles et historique détaillé. Navigation entre menus conservée dans l’historique du navigateur et bouton Retour.

L’ouverture de WhatsApp ou e-mail ne prouve pas l’envoi ni la lecture : confirmation d’envoi manuelle conservée. L’accès du site reste privé. La copie GitHub reste à raccorder.

## 0.3.1 — 17 octobre 2026

La préparation d’un document de loyer impayé est également inscrite dans le suivi des rappels. Après avoir transmis le PDF, l’utilisateur peut confirmer son envoi dans ce même suivi. La création d’un document ne déclare jamais un paiement reçu. La première échéance ne précède jamais l’entrée du locataire, et sa date apparaît avant l’enregistrement.

## 0.3.0 — 17 octobre 2026

Ajout d’un locataire, de son logement existant ou nouveau, et de ses conditions de paiement en un seul enregistrement atomique. Possibilité de rattacher un locataire existant. Ajout d’un propriétaire avec son bien confié à l’agence. Fiches locataires avec bien, échéance, solde, alerte de retard et accès direct au suivi. Biens en recherche de locataire, occupés ou avec entrée prévue ; badge Nouveau et identité du propriétaire. Suivi des rappels préparés puis confirmés envoyés par l’utilisateur, et des paiements réellement reçus. Document de loyer directement depuis le suivi. Survols, focus clavier et animations discrets, avec respect du réglage de réduction des animations.

Les états ne prouvent ni la livraison ni la lecture de WhatsApp ou d’e-mail. Les liens restent privés ; utiliser le PDF pour un client extérieur. Les données antérieures restent compatibles, sans migration destructive. L’accès privé est conservé.

## 0.2.0 — 17 octobre 2026

Espaces agence et propriétaire séparés ; formulaires protégés des fermetures accidentelles ; choix de formulaire au style Yombal ; contrôles des doublons ; appels de loyer et reçus actualisés ; signature ; préférences de documents ; navigation plus lisible ; menu Aide & Yombal. Détails dans [la note de mise à jour](mise-a-jour-2026-10-17.md).

Validation : 26 tests métier, typage et compilation de production réussis. Le contrôle interactif dans un navigateur reste à effectuer. Publication automatique autorisée par le propriétaire ; accès privé conservé. L’accès extérieur aux liens, la transmission des demandes au support et les informations légales restent à configurer avant ouverture publique.

## Repères antérieurs conservés

| Repère | Commit source |
| --- | --- |
| Première application | `7734d05cff8d738829c1ea1a00681fc021321938` |
| Variante de couleurs | `92736a7605139908171921c6b54de8ab7d00ec4d` |
| Retour au design initial validé | `b37031060a2da6cf16dc5e0c7e7a61f49b5e70a0` |
| Ajouts fonctionnels préparés | `f87d017e116264cb55a39fc27bf1d7ea8aa54402` |

Ces repères correspondent à des étapes conservées dans Git ; aucun numéro de version antérieur n’est inventé. Un retour arrière se fait par un nouveau commit et une nouvelle livraison, en préservant les données métier et l’historique.
