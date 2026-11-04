# Yombal.immo — règles permanentes du projet

- Projet Next.js standard, hébergé sur Vercel, sans dépendance à ChatGPT, Sites ou Cloudflare.
- Dépôt GitHub : compte `fatwaprod3-beep`. Chaque livraison est poussée sur GitHub ; Vercel déploie automatiquement la branche `main`.
- Données : Turso (libSQL). Fichiers : Vercel Blob. Connexion : comptes Yombal (e-mail + mot de passe).
- Ne jamais mettre de secret, de clé SasPay, de jeton ou de donnée utilisateur dans le dépôt. Les secrets vont dans les variables d’environnement Vercel (voir `.env.example`).

## Ordre de livraison

1. Modifier uniquement ce qui est demandé et examiner le diff.
2. Exécuter les vérifications adaptées (`npm test`, `npx tsc --noEmit`, `npm run build`).
3. Mettre à jour `VERSION` et `docs/versions.md` pour chaque livraison fonctionnelle (correction : dernier nombre ; ajout : deuxième nombre).
4. Toute modification du schéma passe par une nouvelle migration dans `drizzle/` ; ne jamais réinitialiser la base.
5. Pousser sur GitHub, attendre un déploiement Vercel réussi, puis donner le numéro de version et le lien.

## À préserver

- Le design validé est le premier design simple, prune et corail.
- Préserver les fonctions et les données existantes lors des modifications d’apparence.
