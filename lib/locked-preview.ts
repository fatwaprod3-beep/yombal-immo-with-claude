import {usesProStyle} from './billing';
import {freeLimits} from './free-limits';
import type {Profile} from './model';

// Aperçu à l'écran d'un document qui ne peut pas encore être émis gratuitement :
// le haut reste lisible, les montants et la suite sont floutés, pour qu'une capture d'écran ne remplace pas le document.
const css='<style id="yb-locked">main.sheet>table,main.sheet>table~*{filter:blur(7px)!important;user-select:none!important;pointer-events:none!important}.print{display:none!important}body::after{content:"APERÇU · YOMBAL PRO";position:fixed;left:50%;top:58%;transform:translate(-50%,-50%) rotate(-24deg);font:800 42px/1 sans-serif;letter-spacing:2px;color:rgba(103,69,128,.2);white-space:nowrap;pointer-events:none;z-index:9}</style>';
export function lockedPreview(html:string){return html.includes('yb-locked')?html:html.includes('</head>')?html.replace('</head>',css+'</head>'):css+html;}
/** Vrai si, sans Pro, ce document ne peut pas être émis tel quel (modèle/signature Pro, ou quota gratuit épuisé). */
export function previewLocked({canPro,demo,profile,used}:{canPro:boolean;demo:boolean;profile:Profile;used?:number}){return !canPro&&!demo&&(usesProStyle(profile)||(used??0)>=freeLimits.invoices);}
