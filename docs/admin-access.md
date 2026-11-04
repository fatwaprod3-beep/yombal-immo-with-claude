# Administration privée — Yombal.immo

La page `/administration` est réservée au compte Yombal dont l’e-mail correspond à `YOMBAL_ADMIN_EMAIL`. Après la connexion normale, un second mot de passe administrateur est demandé.

Variables Vercel (toutes secrètes), générées avec `npm run admin:password -- "mot-de-passe"` :

- `YOMBAL_ADMIN_EMAIL`
- `YOMBAL_ADMIN_PASSWORD_HASH` : PBKDF2 SHA-256, 100 000 itérations, 256 bits.
- `YOMBAL_ADMIN_PASSWORD_SALT`
- `YOMBAL_ADMIN_SESSION_SECRET` : clé HMAC indépendante.

La session administrateur est signée, valable 4 heures au maximum, dans un cookie `__Host-` HttpOnly, Secure et SameSite=Strict. Cinq tentatives au plus par quart d’heure. Pour changer le mot de passe : regénérer les trois valeurs, les remplacer dans Vercel et redéployer.

Cette page ouvre les droits Pro du propriétaire et la configuration SasPay ; elle ne donne pas accès aux données des autres utilisateurs.
