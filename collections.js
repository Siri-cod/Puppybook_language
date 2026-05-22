import { getEntry, putEntry } from './db.js';
import { getVaultId } from './vault.js';

export const COLLECTIONS_META_PREFIX = '__meta:collections:';

const DEFAULT_COLLECTIONS = [
  { id: 'puppy', name: 'Puppy', emoji: '🐶', createdAt: 1 },
  { id: 'flower', name: 'Flower', emoji: '🌸', createdAt: 2 },
];

export const SUGGESTED_EMOJIS = [
  '🐶', '🌸', '⭐', '❤️', '📚', '🎵',
  '🍎', '🍰', '🏆', '🌈', '✨', '🔥',
  '🎯', '📝', '💡', '🌟', '🍀', '🎨',
];

export function collectionsMetaId(vaultId) {
  return `${COLLECTIONS_META_PREFIX}${vaultId || ''}`;
}

export function isMetaId(id) {
  return typeof id === 'string' && id.startsWith('__meta:');
}

function normalizeCollection(raw, idx = 0) {
  return {
    id: String(raw?.id || crypto.randomUUID()),
    name: String(raw?.name || '').trim() || 'Untitled',
    emoji: (raw?.emoji && String(raw.emoji)) || '⭐',
    createdAt: Number(raw?.createdAt) || Date.now() + idx,
  };
}

function dedupeById(list) {
  const seen = new Set();
  const out = [];
  for (const c of list) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    out.push(c);
  }
  return out;
}

/** @returns {Promise<Array<{id:string,name:string,emoji:string,createdAt:number}>>} */
export async function loadCollections() {
  const vaultId = getVaultId();
  if (!vaultId) return DEFAULT_COLLECTIONS.map((c) => ({ ...c }));

  try {
    const meta = await getEntry(collectionsMetaId(vaultId));
    if (meta && Array.isArray(meta.collections)) {
      return dedupeById(meta.collections.map(normalizeCollection));
    }
  } catch (err) {
    console.warn('Failed to load collections metadata:', err);
  }
  return DEFAULT_COLLECTIONS.map((c) => ({ ...c }));
}

/** @param {Array<{id:string,name:string,emoji:string,createdAt?:number}>} list */
export async function saveCollections(list) {
  const vaultId = getVaultId();
  if (!vaultId) throw new Error('Vault locked');

  const normalized = dedupeById(list.map(normalizeCollection));
  const meta = {
    id: collectionsMetaId(vaultId),
    vaultId,
    collections: normalized,
    updatedAt: Date.now(),
  };
  await putEntry(meta);
  return normalized;
}

export function newCollectionId() {
  return crypto.randomUUID();
}
