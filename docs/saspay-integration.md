# SasPay — Yombal Pro

État au 4 novembre 2026, version 0.18.1 : intégration implémentée et testée avec des réponses simulées conformes à la documentation officielle. Aucune clé de production complète n’a été fournie et aucun paiement réel n’a été effectué pendant cette livraison. Le site conserve son audience privée.

## Connexion du propriétaire

1. Ouvrir /administration, connecté avec le compte Yombal dont l’e-mail est YOMBAL_ADMIN_EMAIL, puis saisir le mot de passe administrateur.
2. Dans Connecter SasPay, coller la clé API complète reçue dans le tableau de bord SasPay. La portée Encaissement suffit ; aucun retrait n’est effectué par cette intégration.
3. Vérifier et connecter effectue uniquement une lecture authentifiée de la liste des sessions. Une clé refusée ne remplace pas l’ancienne configuration.
4. La clé est chiffrée par AES-GCM, avec une clé dérivée par HKDF du secret serveur existant et une séparation de domaine. Elle reste en base (Turso), hors Git, et n’est jamais renvoyée au navigateur. Ne pas la transmettre dans le chat. Une rotation du secret maître d’administration exige de reconfigurer ces identifiants.
5. Une clé sk_test_ est identifiée comme test. Ses transactions peuvent être confirmées, mais ne donnent jamais un abonnement réel. Utiliser une clé sk_live_ pour les encaissements réels.

## Offres et sessions liées au compte

| Offre | Identifiant | Prix XOF | Mois calendaires |
| --- | --- | ---: | ---: |
| Pro mensuel | monthly | 4 900 | 1 |
| Pro trimestriel | quarterly | 9 900 | 3 |
| Pro annuel | annual | 25 000 | 12 |

Le serveur fixe montant, devise et durée. Il crée une session privée à chaque commande en associant un identifiant aléatoire au compte authentifié. Les métadonnées portent la référence et l’offre, sans identifiant de compte. Le nom et l’e-mail du compte sont transmis à SasPay pour le checkout. Le choix du pays et du moyen de paiement reste dans le checkout prestataire.

Les liens partagés antérieurement créés par le propriétaire restent documentés dans lib/billing.ts : mensuel https://link.saspay.me/rq9ukd8p6j4, trimestre https://link.saspay.me/b5mk93gecf0 et annuel https://link.saspay.me/jeultha48me. Ils ne suffisent pas à relier fiablement un paiement à un compte. Le nouveau bouton prépare donc une session par compte, au même tarif, et n’envoie plus un client vers un lien partagé non associé. Sans configuration API valide, il affiche que la connexion doit être terminée.

La session créée expire au bout de 24 heures. Un double clic réutilise la session en attente ; la contrainte d’unicité de préparation empêche les créations concurrentes pour le même compte et la même offre. Changer d’offre crée une commande distincte et conserve le tarif de l’ancienne. La redirection du navigateur n’est autorisée que vers https://pay.saspay.me/checkout/ et les montants/devise sont contrôlés dans le navigateur.

## Vérification et durée d’accès

Le retour /?paiement=retour&commande=… ouvre un suivi et lance des vérifications bornées. Actualiser mon accès utilise le même traitement. La référence fournie doit appartenir au compte connecté ; un paramètre paid=true n’accorde aucun droit.

Le serveur exige PAID et transaction SUCCESS, puis relit le détail de la session et vérifie la transaction. Il contrôle références, métadonnées, marchand, paiement entrant, montant demandé canonique et XOF. Les frais, montant débité ou revenu net ne remplacent pas le prix demandé. Les appels utilisent une origine API fixe, utilisent le mode manual accepté par Workers et refusent explicitement les réponses 3xx, expirent en 8 secondes et ne renvoient jamais les erreurs prestataire brutes. Les lectures indépendantes sont parallélisées et chaque commande est limitée à une vérification toutes les 15 secondes.

Un règlement live confirmé écrit un registre unique et l’abonnement dans un même batch D1 atomique. Une transaction ne peut créditer qu’un compte et une commande ; les répétitions webhook/retour ne prolongent pas deux fois l’accès. Deux paiements distincts peuvent être cumulés sans écraser la durée de l’autre. Un renouvellement actif part de l’expiration future ; sinon il part de la confirmation serveur. Les fins de mois sont ramenées au dernier jour du mois cible, heure UTC conservée. L’accès expire côté serveur et les données ne sont pas supprimées.

Le renouvellement payant demeure manuel. Aucun prélèvement périodique, remboursement automatique ni traitement automatique des litiges n’est ajouté. Ces opérations demandent un suivi commercial distinct.

## Webhook

Adresse : https://<domaine-vercel>/api/payments/saspay/webhook

Depuis la version 0.19.0 (hébergement Vercel), cette adresse est publique : SasPay peut l’appeler directement. Elle n’accorde aucun droit sans signature HMAC valide.

Dans le volet Webhooks de l’administration, le propriétaire peut afficher et copier le secret dédié chiffré. Dans SasPay : URL ci-dessus, description Yombal Pro, même secret de signature et abonnement à transaction.success. La création des endpoints et abonnements est gérée dans le tableau de bord SasPay, pas avec une API de création inventée.

Le récepteur vérifie HMAC-SHA256 sur timestamp + "." + corps brut, X-Webhook-Signature en hexadécimal, X-Webhook-Timestamp et X-Webhook-Event. Il refuse plus de 300 secondes d’écart, y compris dans le futur. Les événements test, échec, annulation ou création n’accordent aucun droit. L’événement success est revérifié par l’API. La description de transaction porte une référence de rapprochement : ce n’est qu’un indice de recherche, jamais une preuve d’accès ; seule la session liée et confirmée peut créditer le compte. Une transaction issue d’un ancien lien partagé reste non associée et n’accorde aucun abonnement automatiquement. Si un événement ne peut pas encore être rapproché, la vérification au retour reste disponible.

## Vérifications et lancement restant

- Tests des routes réelles avec Drizzle, SQLite et toutes les migrations : contrôle du propriétaire, CSRF, chiffrement, prix, liaison au compte, test/live, mois calendaires, répétitions, concurrence et rollback.
- Tests HMAC sur corps exact, altération, horodatage expiré/futur et concordance de l’événement.
- Contrôle TypeScript, rendu serveur des composants et compilation de production. Aucun navigateur d’aperçu local réessayé après le refus de l’approbation automatique.
- Après connexion : exécuter un essai prestataire puis un paiement live autorisé depuis un compte sans session administrateur ; vérifier le statut et la date de fin. Aucun encaissement réel n’est déclaré testé à ce stade.
- Avant lancement public : rendre le webhook accessible au prestataire selon une décision explicite du propriétaire, puis tester signature, livraison et répétition dans le journal SasPay.

## Sources officielles

- https://docs.saspay.me/llms.txt
- https://docs.saspay.me/api-reference/payments/checkout-create
- https://docs.saspay.me/api-reference/payments/checkout-get
- https://docs.saspay.me/api-reference/payments/checkout-status
- https://docs.saspay.me/api-reference/payments/verify
- https://docs.saspay.me/api-reference/webhooks

## Incident de connexion corrigé en 0.18.1

Les premiers clics de vérification retournaient 503 avant tout appel réseau. Reproduction dans workerd et confirmation par la documentation Cloudflare : redirect:error est rejeté à la construction de Request. Le transport utilise maintenant redirect:manual et refuse les réponses 3xx. Les tests de transport exécutent le module réel dans le moteur Workers avec un service amont simulé ; ils auraient détecté le défaut de 0.18.0. La correction ne confirme pas à elle seule la validité de la clé marchande : le propriétaire doit refaire la vérification sur son écran privé.

Référence : https://developers.cloudflare.com/workers/runtime-apis/request/
