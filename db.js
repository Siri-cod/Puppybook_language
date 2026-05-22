import * as cloud from './sync.js';
import { getVaultId } from './vault.js';
import { isMetaId } from './collections.js';

const DB_NAME = 'deutsch-audio';
const DB_VERSION = 1;
const STORE = 'entries';

/** @returns {Promise<IDBDatabase>} */
function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('text', 'text', { unique: false });
      }
    };
  });
}

function belongsToCurrentVault(entry) {
  const vaultId = getVaultId();
  if (!vaultId) return false;
  if (isMetaId(entry?.id)) return entry.id.endsWith(vaultId);
  return entry.vaultId === vaultId;
}

function withVaultId(entry) {
  const vaultId = getVaultId();
  if (!vaultId) throw new Error('Vault locked');
  return { ...entry, vaultId };
}

/** @returns {Promise<object[]>} */
export async function getAllEntriesLocal() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => {
      const list = (req.result || []).filter(belongsToCurrentVault);
      list.sort((a, b) => b.createdAt - a.createdAt);
      resolve(list);
    };
    req.onerror = () => reject(req.error);
  });
}

/** @returns {Promise<object[]>} */
export async function getAllEntries() {
  if (cloud.isEnabled() && cloud.getSyncStatus().ready) {
    return cloud.getAllEntries();
  }
  return getAllEntriesLocal();
}

/** @param {string} id */
export async function getEntry(id) {
  if (cloud.isEnabled() && cloud.getSyncStatus().ready) {
    const row = await cloud.getEntry(id);
    if (!row || !belongsToCurrentVault(row)) return null;
    return row;
  }
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => {
      const row = req.result ?? null;
      resolve(row && belongsToCurrentVault(row) ? row : null);
    };
    req.onerror = () => reject(req.error);
  });
}

/** @param {object} entry */
export async function putEntry(entry) {
  const stored = withVaultId(entry);
  if (cloud.isEnabled() && cloud.getSyncStatus().ready) {
    return cloud.putEntry(stored);
  }
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const req = tx.objectStore(STORE).put(stored);
    req.onsuccess = () => resolve(stored);
    req.onerror = () => reject(req.error);
  });
}

/** @param {string} id */
export async function deleteEntry(id) {
  if (cloud.isEnabled() && cloud.getSyncStatus().ready) {
    return cloud.deleteEntry(id);
  }
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const req = tx.objectStore(STORE).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/** @param {Blob} blob */
export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const base64 = String(dataUrl).split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/** @param {string} base64 @param {string} mime */
export function base64ToBlob(base64, mime) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}
