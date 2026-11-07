import type { MetadataRoute } from 'next';
import { seoArticles } from '../lib/seo-articles';
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://yombal-immo.pro', now = new Date();
  return [
    { url: base + '/', lastModified: now, changeFrequency: 'weekly', priority: 1, images: [base + '/og-yombal.jpg'], videos: [{ title: 'Yombal.immo en 1 minute', description: 'Guide de démarrage : biens, locataires, loyers, factures et analyses.', thumbnail_loc: base + '/media/yombal-guide-poster.jpg', content_loc: base + '/media/yombal-guide.mp4' }] },
    { url: base + '/ressources', lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    ...seoArticles.map(a => ({ url: base + '/ressources/' + a.slug, lastModified: new Date(a.updated + 'T12:00:00Z'), changeFrequency: 'monthly' as const, priority: 0.8 })),
    { url: base + '/guide', lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: base + '/aide', lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: base + '/contact', lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: base + '/conditions', lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: base + '/confidentialite', lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
