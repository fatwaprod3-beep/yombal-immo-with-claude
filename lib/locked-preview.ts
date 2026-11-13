import {usesProStyle} from './billing';
import {freeLimits} from './free-limits';
import type {Profile} from './model';

// Aperçu à l'écran d'un document qui ne peut pas encore être émis gratuitement :
// le haut reste lisible, les montants et la suite sont floutés, pour qu'une capture d'écran ne remplace pas le document.
const css='<style id="yb-locked">main.sheet>.parties~*{filter:blur(7px)!important;user-select:none!important;pointer-events:none!important}.print{display:none!important}body::after{content:"APERÇU · YOMBAL PRO";position:fixed;left:50%;top:58%;transform:translate(-50%,-50%) rotate(-24deg);font:800 clamp(22px,8vw,42px)/1 sans-serif;letter-spacing:2px;color:rgba(103,69,128,.2);white-space:nowrap;pointer-events:none;z-index:9}</style>';
const card='<div class="yb-lock-card" style="position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:10;max-width:88%;padding:12px 18px;border-radius:14px;background:#352341;color:#fff;font:600 13px/1.4 sans-serif;text-align:center;box-shadow:0 10px 30px rgba(33,21,46,.35)">🔒 Aperçu flouté · la suite du document est réservée à <b style="color:#f3c8bd">Yombal Pro</b></div>';
export function lockedPreview(html:string){if(html.includes('yb-locked'))return html;const withCss=html.includes('</head>')?html.replace('</head>',css+'</head>'):css+html;return withCss.includes('</body>')?withCss.replace('</body>',card+'</body>'):withCss+card;}
/** Vrai si, sans Pro, ce document ne peut pas être émis tel quel (modèle/signature Pro, ou quota gratuit épuisé). */
export function previewLocked({canPro,demo,profile,used,limit=freeLimits.invoices}:{canPro:boolean;demo:boolean;profile:Profile;used?:number;limit?:number}){return !canPro&&!demo&&(usesProStyle(profile)||(used??0)>=limit);}
/** Pourquoi l'aperçu est verrouillé : quota gratuit épuisé (prioritaire) ou style Pro choisi. */
export function lockReason({profile,used,limit=freeLimits.invoices}:{profile:Profile;used?:number;limit?:number}):'quota'|'style'{return (used??0)>=limit?'quota':usesProStyle(profile)?'style':'quota';}
