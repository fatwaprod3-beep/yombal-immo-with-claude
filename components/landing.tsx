import {ArrowRight,Bell,Bot,Building2,CalendarDays,Check,FileText,LineChart,ShieldCheck,Smartphone,Sparkles,Wallet} from 'lucide-react';
import {plans} from '../lib/billing';

const fmt=(n:number)=>new Intl.NumberFormat('fr-FR').format(n).replace(/ | /g,' ')+' F';
const features=[
 {Icon:Wallet,title:'Loyers sans oubli',text:'Échéances préparées chaque mois, paiements partiels, retards signalés en rouge et relances prêtes à envoyer.',tone:'g'},
 {Icon:FileText,title:'Factures & reçus',text:'Appels de loyer, reçus et contrats en PDF à vos couleurs, avec signature, en quelques secondes.',tone:'p'},
 {Icon:Building2,title:'Tous vos biens',text:'Immeubles, appartements, chambres, villas : chaque logement, son locataire et son historique.',tone:'c'},
 {Icon:LineChart,title:'Une vraie analyse',text:'Recouvrement, occupation, revenu net et rentabilité par bien, mois après mois.',tone:'g'},
 {Icon:CalendarDays,title:'Calendrier & rappels',text:'Entrées, fins de bail, visites et interventions réunies dans un seul agenda.',tone:'p'},
 {Icon:Bot,title:'Assistant Yombal',text:'Une question sur la gestion ou l’application ? L’assistant vous répond à tout moment.',tone:'c'},
];
const steps=[
 {n:'1',title:'Créez votre espace',text:'Gratuit, en une minute, avec votre e-mail.'},
 {n:'2',title:'Ajoutez biens et locataires',text:'Le loyer, l’échéance et le dépôt de garantie, une seule fois.'},
 {n:'3',title:'Laissez Yombal suivre',text:'Échéances, retards, reçus et bilans se préparent tout seuls.'},
];

export default function Landing({prices}:{prices:Record<string,number>}){
 const priceOf=(id:string,fallback:number)=>prices[id]??fallback;
 const ld={'@context':'https://schema.org','@type':'SoftwareApplication',name:'Yombal.immo',alternateName:['Yombal','Yombal immo'],applicationCategory:'BusinessApplication',operatingSystem:'Web, Android, iOS',url:'https://yombal-immo.pro',description:'Logiciel de gestion locative pour propriétaires et agences : loyers, paiements partiels, retards, quittances, factures, baux et bilans.',inLanguage:'fr',offers:[{'@type':'Offer',price:'0',priceCurrency:'XOF',name:'Gratuit'},...plans.map(p=>({'@type':'Offer',price:String(priceOf(p.id,p.price)),priceCurrency:'XOF',name:p.name}))],publisher:{'@type':'Organization',name:'Yombal.immo',url:'https://yombal-immo.pro',logo:'https://yombal-immo.pro/icons/yombal-512.png'}};
 return <div className="lp"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(ld).replace(/</g,'\\u003c')}}/>
  <header className="lp-nav"><a href="/" className="lp-brand"><img src="/yombal-logo.png" alt=""/><span>yombal<em>.immo</em></span></a>
   <nav><a href="#fonctions">Fonctionnalités</a><a href="#comment">Comment ça marche</a><a href="#tarifs">Tarifs</a></nav>
   <div className="lp-nav-actions"><a className="lp-link" href="/connexion">Se connecter</a><a className="lp-btn" href="/connexion?mode=inscription">Commencer gratuitement</a></div></header>

  <section className="lp-hero">
   <div className="lp-hero-copy">
    <span className="lp-pill"><Sparkles size={14}/>La gestion locative, enfin simple</span>
    <h1>Vos loyers encaissés.<br/><span>Votre esprit libre.</span></h1>
    <p>Yombal suit vos biens, vos locataires et chaque franc encaissé. Retards, reçus, factures et bilans : tout est prêt, sur ordinateur comme sur téléphone.</p>
    <div className="lp-cta"><a className="lp-btn lp-btn-lg" href="/connexion?mode=inscription">Créer mon espace gratuit<ArrowRight size={18}/></a><a className="lp-btn-ghost" href="/?demo=1">Voir la démo</a></div>
    <ul className="lp-trust"><li><Check size={15}/>Gratuit jusqu’à 6 biens</li><li><Check size={15}/>Sans carte bancaire</li><li><Check size={15}/>Orange Money, Wave, carte</li></ul>
   </div>
   <div className="lp-hero-visual" aria-hidden="true">
    <div className="lp-window">
     <div className="lp-window-bar"><i/><i/><i/></div>
     <div className="lp-mock">
      <p className="lp-mock-hello">Bonjour, Aïssatou<b>.</b></p>
      <div className="lp-mock-stats">
       <div className="g"><small>Loyers encaissés</small><strong>1 250 000 F</strong><span><i style={{width:'78%'}}/></span></div>
       <div className="c"><small>À recevoir</small><strong>350 000 F</strong><em>2 échéances</em></div>
       <div className="p"><small>Occupés</small><strong>7 / 8</strong><em>88 %</em></div>
      </div>
      <div className="lp-mock-chart"><svg viewBox="0 0 300 90" preserveAspectRatio="none"><defs><linearGradient id="lpg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#9a6fb3" stopOpacity=".35"/><stop offset="1" stopColor="#9a6fb3" stopOpacity="0"/></linearGradient></defs><path d="M0 70 C40 66 70 58 110 52 S180 30 220 26 S270 14 300 10" fill="none" stroke="#d8c8e3" strokeWidth="2" strokeDasharray="5 5"/><path d="M0 78 C40 74 80 66 120 60 S190 40 230 36 S275 26 300 22 L300 90 L0 90Z" fill="url(#lpg)"/><path d="M0 78 C40 74 80 66 120 60 S190 40 230 36 S275 26 300 22" fill="none" stroke="#674580" strokeWidth="2.6"/></svg></div>
      <div className="lp-mock-row"><span className="dot g">✓</span><div><b>Moussa Diop a payé</b><small>Villa Noflaye · 175 000 F</small></div></div>
      <div className="lp-mock-row"><span className="dot c">!</span><div><b>Loyer de Fatou dans 2 jours</b><small>Relance prête à envoyer</small></div></div>
     </div>
    </div>
    <div className="lp-float lp-float-a"><Bell size={16}/><div><b>Loyer reçu</b><small>+ 200 000 F · Wave</small></div></div>
    <div className="lp-float lp-float-b"><ShieldCheck size={16}/><div><b>Reçu PDF prêt</b><small>Envoyé par WhatsApp</small></div></div>
   </div>
  </section>

  <section className="lp-band"><div><strong>100 %</strong><span>de vos échéances préparées</span></div><div><strong>3 s</strong><span>pour éditer un reçu</span></div><div><strong>24 h/24</strong><span>sur ordinateur et mobile</span></div><div><strong>0 F</strong><span>pour commencer</span></div></section>

  <section className="lp-section" id="fonctions"><span className="lp-eyebrow">FONCTIONNALITÉS</span><h2>Tout ce qu’il faut pour gérer, rien de compliqué.</h2>
   <div className="lp-grid">{features.map(({Icon,title,text,tone})=><article key={title} className={'lp-card t-'+tone}><span className="lp-icon"><Icon size={22}/></span><h3>{title}</h3><p>{text}</p></article>)}</div></section>

  <section className="lp-section lp-steps-wrap" id="comment"><span className="lp-eyebrow">COMMENT ÇA MARCHE</span><h2>Prêt en trois étapes.</h2>
   <div className="lp-steps">{steps.map(s=><div key={s.n} className="lp-step"><span>{s.n}</span><h3>{s.title}</h3><p>{s.text}</p></div>)}</div></section>

  <section className="lp-section" id="tarifs"><span className="lp-eyebrow">TARIFS</span><h2>Commencez gratuitement, passez Pro quand vous grandissez.</h2>
   <div className="lp-prices">
    <article className="lp-price"><h3>Gratuit</h3><strong>0 F</strong><p>Pour démarrer sereinement.</p><ul><li><Check size={15}/>6 biens, 7 locataires</li><li><Check size={15}/>Suivi des loyers et rappels</li><li><Check size={15}/>3 factures exportées</li></ul><a className="lp-btn-ghost" href="/connexion?mode=inscription">Créer mon espace</a></article>
    {plans.map(p=><article key={p.id} className={'lp-price'+(p.id==='quarterly'?' featured':'')}>{p.id==='quarterly'&&<span className="lp-badge">Le bon équilibre</span>}<h3>{p.name}</h3><strong>{fmt(priceOf(p.id,p.price))}</strong><p>pour {p.period} · {p.detail}</p><ul><li><Check size={15}/>Biens et locataires illimités</li><li><Check size={15}/>Factures et reçus sans limite</li><li><Check size={15}/>Contrats, rapports, signature</li></ul><a className={p.id==='quarterly'?'lp-btn':'lp-btn-ghost'} href="/connexion?mode=inscription">Choisir</a></article>)}
   </div><p className="lp-note"><Smartphone size={15}/>Paiement sécurisé par SasPay : Orange Money, Wave ou carte. Aucun renouvellement automatique.</p></section>

  <section className="lp-final"><h2>Votre immobilier mérite d’être simple.</h2><p>Rejoignez les propriétaires et agences qui gèrent avec Yombal.</p><a className="lp-btn lp-btn-lg lp-btn-light" href="/connexion?mode=inscription">Commencer gratuitement<ArrowRight size={18}/></a></section>

  <footer className="lp-footer"><span>© {new Date().getFullYear()} Yombal.immo</span><nav className="lp-footer-links"><a href="/aide">Aide</a><a href="/contact">Contact</a><a href="/conditions">Conditions d’utilisation</a><a href="/confidentialite">Confidentialité</a></nav><a href="/connexion">Se connecter</a></footer>
 </div>;
}
