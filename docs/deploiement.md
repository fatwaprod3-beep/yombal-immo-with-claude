# Sauvegardes et déploiements

| Élément | État |
| --- | --- |
| Code source | GitHub, compte `fatwaprod3-beep` |
| Hébergement | Vercel, projet `yombal-immo` (équipe `tes-9ce1`) |
| Base de données | Turso (libSQL), variables `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` |
| Fichiers privés | Vercel Blob, variable `BLOB_READ_WRITE_TOKEN` |
| Connexion | Comptes Yombal, variable `AUTH_SECRET` |

La procédure complète de mise en ligne est dans le [README](../README.md).

## Règle pour toute nouvelle version

Modification ciblée → vérifications → numéro de version et journal → push GitHub → déploiement automatique Vercel → contrôle du statut → lien de livraison.

## Base de données

- `npm run db:generate` crée une migration après modification de `db/schema.ts`. La migration `0005_yombal_users` a été écrite à la main : avant la prochaine génération, lancez `npx drizzle-kit generate` une fois et vérifiez qu’aucune table `yombal_users` en double n’est proposée.
- Les migrations s’appliquent automatiquement au build (`scripts/migrate.mjs`).
- Sauvegardes : Turso conserve un historique ; un export peut être fait avec `turso db shell yombal .dump`.

## Retours arrière

Sur Vercel, *Deployments → … → Promote to Production* remet en ligne une version précédente. Côté code, un retour se fait par un nouveau commit, jamais en réécrivant l’historique.
