# Yombal.immo

Application de gestion immobilière pour propriétaires et agences : biens, locataires, baux, loyers et paiements partiels, séjours courts, entretien, dépenses, agenda, factures, documents et rapports. Abonnement Pro payé par SasPay (Orange Money, Wave, carte).

Version : voir [VERSION](VERSION) et [le journal des versions](docs/versions.md).

## Technologies

| Rôle | Service |
| --- | --- |
| Application | Next.js (App Router), React, Tailwind |
| Hébergement | Vercel |
| Base de données | Supabase (PostgreSQL) via Drizzle ORM |
| Fichiers privés | Vercel Blob |
| Connexion | Comptes Yombal (e-mail + mot de passe) |
| Paiements | SasPay (clé saisie dans `/administration`, chiffrée en base) |

Aucune dépendance à ChatGPT, Sites ou Cloudflare.

## Mise en ligne sur Vercel (une seule fois)

1. **Base de données Supabase**
   - Sur https://supabase.com, créez un projet dédié **yombal-immo** (région Europe).
   - *Project Settings → Database → Connection string* : copiez l’URL **Transaction pooler** (port 6543) et l’URL **Session/Direct** (port 5432), avec le mot de passe de la base.
2. **Projet Vercel**
   - Sur https://vercel.com : *Add New → Project*, importez le dépôt GitHub de Yombal (ou ouvrez le projet `yombal-immo` existant et reliez-le au dépôt dans *Settings → Git*).
   - Framework : **Next.js** (détecté automatiquement). Ne changez pas les commandes.
3. **Stockage des fichiers** : dans le projet Vercel, onglet *Storage → Create → Blob*, puis reliez-le au projet. La variable `BLOB_READ_WRITE_TOKEN` est ajoutée automatiquement.
4. **Variables d’environnement** (*Settings → Environment Variables*), voir [.env.example](.env.example) :
   - `DATABASE_URL` (pooler, port 6543) et `DATABASE_URL_DIRECT` (port 5432) — étape 1
   - `AUTH_SECRET` : une longue valeur aléatoire (64 caractères), par ex. générée sur https://generate-secret.vercel.app/64
   - `YOMBAL_ADMIN_EMAIL` : l’e-mail de **votre** compte Yombal (propriétaire)
   - `YOMBAL_ADMIN_PASSWORD_HASH`, `YOMBAL_ADMIN_PASSWORD_SALT`, `YOMBAL_ADMIN_SESSION_SECRET` : générés par `npm run admin:password -- "votre-mot-de-passe-admin"`
5. **Déployer** : *Deployments → Redeploy*. Les migrations de la base sont appliquées automatiquement avant chaque build.
6. **Premier compte** : ouvrez le site, cliquez sur *Se connecter → Créer un compte* avec l’e-mail indiqué dans `YOMBAL_ADMIN_EMAIL`.

Ensuite, chaque modification poussée sur GitHub est déployée automatiquement par Vercel.

## Activer les paiements SasPay

1. Connectez-vous, puis ouvrez `https://<votre-domaine>/administration` et saisissez le mot de passe administrateur.
2. *Connecter SasPay* : collez votre clé API SasPay (`sk_test_…` pour tester, `sk_live_…` pour les vrais paiements). Ne l’envoyez jamais par chat ni dans Git.
3. *Webhooks* : copiez l’URL `https://<votre-domaine>/api/payments/saspay/webhook` et le secret affiché dans le tableau de bord SasPay, événement `transaction.success`.
4. Faites un paiement réel de 4 900 F depuis un autre compte et vérifiez l’activation de Pro.

Détails : [docs/saspay-integration.md](docs/saspay-integration.md).

## Développement local

```bash
npm install
cp .env.example .env.local   # renseignez DATABASE_URL (Supabase)
npm run db:migrate
npm run dev
```

Tests : `npm test`.

## Structure

- `app/` : pages et API (connexion, espace, factures, abonnements, paiements).
- `components/` : interface responsive et formulaires.
- `lib/model.ts`, `lib/validation.ts` : modèle, calculs et validation.
- `lib/saspay.ts`, `lib/subscription-payments.ts` : paiements et abonnements.
- `db/` et `drizzle/` : schéma et migrations.
- `public/` : logo, manifeste et service worker.
- `tests/` : tests automatisés.
