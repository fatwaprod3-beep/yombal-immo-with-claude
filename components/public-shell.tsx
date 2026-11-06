import type {ReactNode} from 'react';
/** Habillage des pages publiques (aide, contact, conditions) aux couleurs de la page de présentation. */
export default function PublicShell({eyebrow,title,intro,children}:{eyebrow:string;title:string;intro?:string;children:ReactNode}){
 return <div className="lp lp-doc">
  <header className="lp-nav"><a href="/presentation" className="lp-brand"><img src="/yombal-logo.png" alt=""/><span>yombal<em>.immo</em></span></a>
   <nav><a href="/presentation#fonctions">Fonctionnalités</a><a href="/presentation#tarifs">Tarifs</a><a href="/guide">Guide</a><a href="/aide">Aide</a><a href="/contact">Contact</a></nav>
   <div className="lp-nav-actions"><a className="lp-link" href="/connexion">Se connecter</a><a className="lp-btn" href="/connexion?mode=inscription">Commencer gratuitement</a></div></header>
  <section className="lp-doc-hero"><span className="lp-eyebrow">{eyebrow}</span><h1>{title}</h1>{intro&&<p>{intro}</p>}</section>
  <main className="lp-doc-body">{children}</main>
  <footer className="lp-footer"><span>© {new Date().getFullYear()} Yombal.immo</span><nav className="lp-footer-links"><a href="/guide">Guide illustré</a><a href="/aide">Aide</a><a href="/contact">Contact</a><a href="/conditions">Conditions d’utilisation</a><a href="/confidentialite">Confidentialité</a></nav><a href="/connexion">Se connecter</a></footer>
 </div>;
}
