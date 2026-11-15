'use client';
import {useEffect,useState} from 'react';
import {ArrowRight,Eye} from 'lucide-react';

// Démonstration : bien dire que ce sont des exemples, et proposer de créer son vrai espace.
// Masquée dans les petits téléphones de la page d'accueil (iframes du guide illustré).
export default function DemoBanner({authenticated,onExit}:{authenticated:boolean;onExit:()=>void}){
 const [framed,setFramed]=useState(true);
 useEffect(()=>{try{setFramed(window.self!==window.top);}catch{setFramed(true);}},[]);
 if(framed)return null;
 return <div className="demo-banner" role="note">
  <Eye size={18} aria-hidden="true"/>
  <div><b>Vous visitez une démonstration</b><small>Logements, locataires et paiements sont des exemples inventés. Rien n’est enregistré.</small></div>
  {authenticated?<button type="button" className="demo-banner-go" onClick={onExit}>Revenir à mon espace<ArrowRight size={16}/></button>
  :<a className="demo-banner-go" href="/connexion?mode=inscription">Créer mon espace gratuit<ArrowRight size={16}/></a>}
 </div>;
}
