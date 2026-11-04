import {today, type State} from './model';
export type Asset = {
  id: string; name: string; category: string; reference: string; quantity: number;
  location: string; value: number; acquiredDate: string; image: string; note: string;
  birthDate?: string; sex?: '' | 'male' | 'female';
};
export type AssetMovement = {
  id: string; assetId: string; type: 'out' | 'return' | 'sold' | 'retired'; quantity: number;
  person: string; date: string; note: string; createdAt: string;
  cancelledAt?: string; cancellationNote?: string;
};
export type AssetCost = {id: string; assetId: string; amount: number; date: string; category: string; note: string};
export function assetBalance(state: Pick<State, 'assetMovements'>, asset: Asset) {
  let entrusted = 0, removed = 0;
  for (const m of state.assetMovements || []) if (m.assetId === asset.id && !m.cancelledAt) {
    if (m.type === 'out') entrusted += m.quantity;
    else if (m.type === 'return') entrusted -= m.quantity;
    else removed += m.quantity;
  }
  return {entrusted, removed, available: asset.quantity - entrusted - removed};
}
export function validateInventory(state: State) {
  const assets = state.assets || [], movements = state.assetMovements || [], costs = state.assetCosts || [];
  for (const list of [assets, movements, costs]) if (new Set(list.map(v => v.id)).size !== list.length) throw new Error('Un identifiant existe plusieurs fois dans cet inventaire.');
  const refs = assets.filter(a => a.reference).map(a => a.reference.toLocaleLowerCase('fr'));
  if (new Set(refs).size !== refs.length) throw new Error('Cette référence est déjà utilisée dans cet espace.');
  for (const a of assets) {
    if (a.acquiredDate > today() || a.birthDate && a.birthDate > today()) throw new Error('La date ne peut pas être future.');
  }
  for (const m of movements) {
    if (!assets.some(a => a.id === m.assetId)) throw new Error('Le bien de ce mouvement est introuvable.');
    if (m.date > today()) throw new Error('Enregistrez uniquement un mouvement déjà effectué.');
    if (m.cancelledAt && !m.cancellationNote) throw new Error('Indiquez pourquoi ce mouvement est annulé.');
    if ((m.type === 'out' || m.type === 'return') && !m.person.trim()) throw new Error('Indiquez la personne concernée.');
  }
  for (const asset of assets) {
    let available = asset.quantity;
    const people = new Map<string, number>();
    const ledger = movements.filter(m => m.assetId === asset.id && !m.cancelledAt).sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));
    for (const m of ledger) {
      const person = m.person.trim().toLocaleLowerCase('fr'), held = people.get(person) || 0;
      if (m.type === 'return') {
        if (held < m.quantity) throw new Error('Ce retour dépasse la quantité confiée à cette personne à cette date.');
        people.set(person, held - m.quantity); available += m.quantity;
      } else {
        if (available < m.quantity) throw new Error('La quantité dépasse les biens disponibles à cette date.');
        available -= m.quantity;
        if (m.type === 'out') people.set(person, held + m.quantity);
      }
    }
  }
  for (const c of costs) {
    if (c.assetId && !assets.some(a => a.id === c.assetId)) throw new Error('Le bien de cette dépense est introuvable.');
    if (c.date > today()) throw new Error('Enregistrez uniquement une dépense déjà effectuée.');
  }
  for (const t of state.tasks) if (t.assetId && !assets.some(a => a.id === t.assetId)) throw new Error('Le bien de ce rappel est introuvable.');
}
