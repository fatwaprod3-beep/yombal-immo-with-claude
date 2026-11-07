import type { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: '*', allow: ['/', '/ressources', '/guide', '/aide', '/conditions', '/confidentialite', '/contact', '/media/', '/og-yombal.jpg'], disallow: ['/api/', '/administration', '/paiement', '/r/'] }], sitemap: 'https://yombal-immo.pro/sitemap.xml', host: 'https://yombal-immo.pro' };
}
