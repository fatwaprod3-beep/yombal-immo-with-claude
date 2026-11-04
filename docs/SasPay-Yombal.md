# Encaissement des abonnements Yombal — vérification du 21 octobre 2026

Le service identifié est **SasPay**, sur https://saspay.me/. Il peut servir de passerelle technique pour nos abonnements. Les éléments publics ne permettent pas de le présenter comme le meilleur choix ou le moins cher. Aucun compte marchand ni encaissement réel n’a été créé pendant cette vérification.

## Tarifs et choix au Sénégal

| Élément | SasPay | PayTech, offre Web & API |
| --- | --- | --- |
| Mobile Money | Sénégal annoncé à 2,25 %, pour le moyen local le moins cher | 2 % au premier palier de chiffre d’affaires |
| Carte | 5 % annoncé | 2,50 % HT au premier palier |
| Part fixe | La tarification générale affiche aussi 100 F par transaction ; montant exact par réseau à confirmer dans le compte | À confirmer dans le contrat de l’offre choisie |
| Réseaux annoncés au Sénégal | Orange Money, Wave, YAS, carte | Orange Money, Wave et autres réseaux locaux, cartes |

Les tarifs SasPay effectifs, disponibilités, minima, plafonds et modalités sont accessibles via l’endpoint authentifié `pricing/my-rates/`. Les taux marketing ne remplacent pas ces conditions. Vérifier également si les frais sont déduits du montant reçu ou ajoutés au prix payé par le client. Notre tarif client reste 4 900 F, 12 000 F ou 45 000 F : tout supplément doit être explicitement décidé et affiché.

**Choix proposé :** poursuivre SasPay si son parcours et ses retraits conviennent après un test marchand ; comparer son coût total avec PayTech avant de généraliser. Pour minimiser les frais publiés, PayTech paraît plus intéressant. C’est une conclusion de comparaison, pas une validation de fiabilité obtenue par un paiement réel.

## Mise en service concrète

1. Ouvrir le compte SasPay, vérifier l’e-mail et faire valider le marchand/KYC. Le type de dossier et les pièces exigées pour Modou au Sénégal sont à confirmer dans le compte. La documentation prévoit identité, selfie et pièces d’entreprise selon le dossier.
2. Créer une clé **de test PAYIN**, conservée uniquement dans les secrets du serveur. Ne jamais placer une clé dans Git ou dans un message de chat.
3. Créer le checkout hébergé avec le plan et son prix déterminés par Yombal côté serveur, en XOF, pays SN. Associer session, utilisateur, demande d’abonnement et plan dans la base.
4. Fournir une URL de notification accessible à SasPay. Yombal étant actuellement privé, il faut prévoir l’accès externe à ce seul service ou un relais séparé ; une URL interne privée ne suffit pas.
5. Vérifier la notification `transaction.success` : signature HMAC SHA256 sur l’horodatage et le corps brut, délai maximal 300 secondes ; vérifier aussi le paiement auprès de l’API, son montant, sa devise et sa correspondance avec la commande attendue.
6. Activer Pro une seule fois, avec expiration calculée selon le plan. Un rechargement, une notification en double ou une simple URL de retour ne doit jamais accorder de droits supplémentaires.
7. Tester réussite, attente, échec, annulation, doublons, paiement tardif et retrait. Passer ensuite aux clés de production et effectuer un test réel maîtrisé.

La récurrence est annoncée sur le site commercial, mais aucun flux client de mandat et prélèvement périodique n’a été identifié dans l’index API consulté. Ne pas annoncer de débit Mobile Money automatique. On peut commencer par une échéance et un nouveau paiement à chaque renouvellement.

Les délais garantis, frais de retrait sénégalais, remboursement et contestation restent à confirmer auprès du service. Le retrait API exige une IP serveur autorisée ; la documentation précise que le retrait depuis le tableau de bord suit un autre accès. Les CGU présentent SasPay comme un intermédiaire technique et renvoient aux prestataires tiers pour le traitement des fonds : clarifier le prestataire effectif et les conditions du marchand avant mise en production.

## État dans Yombal

Les offres Pro existantes et l’accès administrateur de développement restent inchangés. Le choix d’une formule enregistre une demande, sans débit et sans activation payante automatique. L’intégration marchande SasPay n’est pas activée : aucun secret marchand n’a été fourni, aucun webhook public n’a été raccordé et aucun paiement n’a été testé.

## Sources officielles consultées

- Tarifs, couverture et présentation : https://saspay.me/
- CGU : https://www.saspay.me/conditions-utilisation
- Compte, KYC et clés : https://docs.saspay.me/account-setup
- Tarifs réels : https://docs.saspay.me/api-reference/reference/my-rates
- Checkout : https://docs.saspay.me/api-reference/payments/checkout-create
- Signature et événements : https://docs.saspay.me/api-reference/webhooks
- Retraits : https://docs.saspay.me/api-reference/payouts
- Index API : https://docs.saspay.me/llms.txt
- PayTech, rubrique Web & API et FAQ : https://paytech.sn/
