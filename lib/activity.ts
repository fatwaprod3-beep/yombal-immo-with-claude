export const activities = ['realestate', 'equipment', 'animals', 'other'] as const;
export type Activity = typeof activities[number];
export function activityOf(profile: {activity?: Activity}) { return profile.activity || 'realestate'; }
export const activityNames: Record<Activity, string> = {
  realestate: 'Immobilier', equipment: 'Matériel & bagages', animals: 'Animaux', other: 'Autres biens',
};
export function spaceLabel(space: {activity?: Activity; mode: 'owner' | 'agency'}) {
  return activityOf(space) === 'realestate' ? space.mode === 'agency' ? 'Agence immobilière' : 'Mes logements personnels' : activityNames[activityOf(space)];
}
export function allowedPages(profile: {activity?: Activity; mode: 'owner' | 'agency'}) {
  const common = ['accueil', 'parametres', 'notifications', 'aide'];
  return activityOf(profile) === 'realestate'
    ? [...common, 'biens', 'locataires', 'locations', 'loyers', 'sejours', 'factures', 'documents', 'agenda', 'entretien', 'rapports', ...(profile.mode === 'agency' ? ['proprietaires'] : [])]
    : [...common, 'inventaire', 'mouvements', 'depenses', 'rappels'];
}
