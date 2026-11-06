import type { MetadataRoute } from 'next';
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://yombal-immo.pro', now = new Date();
  return [
    { url: base + '/', lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: base + '/presentation', lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: base + '/connexion?mode=inscription', lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: base + '/aide', lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: base + '/contact', lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: base + '/conditions', lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: base + '/confidentialite', lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
