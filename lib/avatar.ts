import type {CSSProperties} from 'react';
// Avatars sans photo : la première lettre du nom sur une couleur propre à chaque personne (comme Google).
const palette=['#6d4fc2','#3f51b5','#00897b','#e0533d','#c2185b','#8e24aa','#1e88e5','#43a047','#d98200','#6d4c41','#00838f','#546e7a','#7b1fa2','#2e7d32','#0277bd','#ad1457'];
export function avatarLetter(name:string){const clean=(name||'').trim().normalize('NFD').replace(/[̀-ͯ]/g,'');const m=/[A-Za-z0-9]/.exec(clean);return m?m[0].toUpperCase():'?';}
export function avatarColor(name:string){const key=(name||'').trim().toLowerCase();let h=0;for(let i=0;i<key.length;i++)h=(h*31+key.charCodeAt(i))>>>0;return palette[h%palette.length];}
export function avatarStyle(name:string){return {'--av':avatarColor(name)} as CSSProperties;}
