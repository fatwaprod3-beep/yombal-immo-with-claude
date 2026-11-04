// Génère les valeurs à copier dans Vercel pour l'administration privée.
// Usage : npm run admin:password -- "votre-mot-de-passe-admin"
import { randomBytes, pbkdf2Sync } from 'node:crypto';
const password = process.argv[2];
if (!password || password.length < 12) {
  console.error('Donnez un mot de passe administrateur d’au moins 12 caractères.');
  process.exit(1);
}
const salt = randomBytes(16).toString('hex');
const hash = pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex');
console.log('YOMBAL_ADMIN_PASSWORD_SALT=' + salt);
console.log('YOMBAL_ADMIN_PASSWORD_HASH=' + hash);
console.log('YOMBAL_ADMIN_SESSION_SECRET=' + randomBytes(32).toString('hex'));
