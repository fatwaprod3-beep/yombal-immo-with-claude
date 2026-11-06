import PublicShell from '../../components/public-shell';
import VisualGuide from '../../components/visual-guide';
export const metadata={title:'Guide illustré',description:'Guide illustré de Yombal.immo : accueil, biens, locataires, loyers et paiements, factures, calendrier, analyses et paramètres, avec aperçus en direct.',alternates:{canonical:'/guide'}};
export default function Guide(){return <PublicShell eyebrow="GUIDE ILLUSTRÉ" title="Yombal, menu par menu" intro="Chaque écran en direct (données d’exemple), avec les gestes essentiels. Faites défiler : l’aperçu suit votre lecture."><VisualGuide/></PublicShell>;}
