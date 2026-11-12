// Contact humain de Yombal (WhatsApp). Numéro public, affiché aux clients pour les rassurer.
export const supportWhatsApp={number:'447445510315',label:'+44 7445 510315'};
export function supportLink(message='Bonjour Yombal, j’ai une question.'){return `https://wa.me/${supportWhatsApp.number}?text=${encodeURIComponent(message)}`;}
