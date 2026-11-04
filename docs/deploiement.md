# Sauvegardes et déploiements

| Élément | État |
| --- | --- |
| Code source | GitHub, compte `fatwaprod3-beep` |
| Hébergement | Vercel, projet `yombal-immo` (équipe `tes-9ce1`) |
| Base de données | Supabase (PostgreSQL), projet dédié `yombal-immo`, variables `DATABASE_URL` / `DATABASE_URL_DIRECT` |
| Fichiers privés | Vercel Blob, variable `BLOB_READ_WRITE_TOKEN` |
| Connexion | Comptes Yombal, variable `AUTH_SECRET` |

La procédure complète de mise en ligne est dans le [README](../README.md).

## Règle pour toute nouvelle version

Modification ciblée → vérifications → numéro de version et journal → push GitHub → déploiement automatique Vercel → contrôle du statut → lien de livraison.

## Base de données

- Après modification de `db/schema.ts`, `npm run db:generate` crée une migration dans `drizzle/`.
- Les migrations s’appliquent automatiquement au build (`scripts/migrate.mjs`).
- La sécurité au niveau des lignes (RLS) est activée sur toutes les tables : seules les routes serveur de Yombal y accèdent.
- Sauvegardes : tableau de bord Supabase → *Database → Backups*.

## Retours arrière

Sur Vercel, *Deployments → … → Promote to Production* remet en ligne une version précédente. Côté code, un retour se fait par un nouveau commit, jamais en réécrivant l’historique.
