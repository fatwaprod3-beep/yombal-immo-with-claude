# SasPay : automatisation des abonnements Yombal Pro

Recherche du 5 novembre 2026 dans la documentation officielle (https://docs.saspay.me).

## Ce que SasPay fait et ne fait pas

- SasPay encaisse des paiements uniques (Mobile Money, carte) : sessions de checkout, softpay, liens de paiement.
- **Aucune fonction d’abonnement ou de prélèvement récurrent** n’est documentée dans l’API.
- **Les durées (1, 3, 12 mois) sont donc gérées par Yombal** : à chaque paiement confirmé, Yombal prolonge l’accès de la durée de l’offre (mois calendaires, cumul si l’accès est encore actif). À l’expiration, l’accès Pro se ferme côté serveur ; le client repaie pour renouveler.

## Détecter un paiement

Webhook `transaction.success` (envoi en temps réel) :
- enveloppe `{"event": "...", "data": {...}}` ; champs documentés : `id`, `reference`, `type`, `status`, `amount`, `fee`, `charged`, `net_amount`, `currency`, `country`, `network`, `msisdn`.
- en-têtes `X-Webhook-Signature` (HMAC-SHA256 hexadécimal de `timestamp + "." + corps brut`), `X-Webhook-Timestamp`, `X-Webhook-Event` ; rejet au-delà de 5 minutes d’écart.
- 5 tentatives (immédiat, +30 s, +5 min, +30 min, +2 h), puis échec définitif (renvoi manuel possible dans le tableau de bord).
- Création des webhooks uniquement dans le tableau de bord app.saspay.me ; le secret n’est affiché qu’une fois.
- Le webhook ne contient **ni e-mail client, ni métadonnées, ni lien de paiement** : il ne suffit pas à savoir quel compte Yombal a payé.

## Deux modes dans Yombal

1. **Sessions de checkout par compte (automatique, recommandé)** — nécessite la clé API (`sk_live_…`).
   Yombal crée une session `POST /checkout-sessions/` avec `customer_email`, `metadata` (référence Yombal + offre) et `return_url`. Au webhook ou au retour du client, Yombal relit la session et la transaction (`/checkout-sessions/{id}/`, `/payments/{id}/verify/`), vérifie montant, devise, référence, puis active Pro une seule fois. Déjà implémenté.
2. **Liens de paiement partagés (actuel, semi-automatique)** — sans clé API.
   Le lien est le même pour tous : SasPay ne dit pas quel compte a payé. Yombal enregistre la demande, redirige vers le lien, et le propriétaire active l’accès dans /administration après vérification dans SasPay.

## Pistes d’amélioration

- Connecter la clé API pour passer en mode 1 (aucune action manuelle).
- En attendant : ajouter au lien de paiement un champ personnalisé « E-mail de votre compte Yombal » (`custom_fields`) ; la réponse est stockée dans `Transaction.metadata` et la liste des transactions est recherchable par e-mail client. La présence de ces champs dans `GET /transactions/{id}/` n’est pas confirmée par la documentation : à vérifier avec un vrai paiement.
- Envoyer `return_url` vers `https://<domaine>/?paiement=retour&commande=<référence>` (seulement après succès, redirection au bout de 3 s).

Sources : https://docs.saspay.me/api-reference/webhooks, https://docs.saspay.me/api-reference/payments, https://docs.saspay.me/api-reference/payment-links/create, https://docs.saspay.me/api-reference/payments/checkout-create, https://docs.saspay.me/api-reference/transactions
