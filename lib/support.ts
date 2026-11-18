// Contact humain de Yombal. Le numéro WhatsApp n'est plus disponible : les boutons d'aide ouvrent
// maintenant un e-mail vers l'équipe. Pour changer l'adresse, modifier seulement supportEmail.
export const supportEmail='contactyombal@gmail.com';
export function supportLink(){return `mailto:${supportEmail}?subject=${encodeURIComponent('Aide Yombal')}`;}
