/** Session vault id (derived from two passwords, never store the passwords). */
let currentVaultId = null;

const REMEMBER_KEY = 'puppy-book:vault-remember';
const REMEMBER_VAULT_KEY = 'puppy-book:vault-id';

export function getVaultId() {
  return currentVaultId;
}

export function setVaultId(id) {
  currentVaultId = id ? String(id) : null;
}

export function clearVaultId() {
  currentVaultId = null;
}

export function isVaultUnlocked() {
  return !!currentVaultId;
}

/**
 * Derive a stable vault id from two passwords (SHA-256 hex).
 * Same pair → same vault; wrong pair → different vault (usually empty).
 */
export async function deriveVaultId(pass1, pass2) {
  const p1 = String(pass1 ?? '').trim();
  const p2 = String(pass2 ?? '').trim();
  if (!p1 || !p2) {
    throw new Error('Enter both passwords');
  }
  const payload = new TextEncoder().encode(`puppy-book:v1\0${p1}\0${p2}`);
  const hash = await crypto.subtle.digest('SHA-256', payload);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function readRememberedVaultId() {
  try {
    if (localStorage.getItem(REMEMBER_KEY) !== '1') return null;
    const id = localStorage.getItem(REMEMBER_VAULT_KEY);
    return id ? id.trim() : null;
  } catch {
    return null;
  }
}

export function writeRememberedVaultId(vaultId) {
  try {
    localStorage.setItem(REMEMBER_KEY, '1');
    localStorage.setItem(REMEMBER_VAULT_KEY, vaultId);
  } catch {}
}

export function clearRememberedVaultId() {
  try {
    localStorage.removeItem(REMEMBER_KEY);
    localStorage.removeItem(REMEMBER_VAULT_KEY);
  } catch {}
}
